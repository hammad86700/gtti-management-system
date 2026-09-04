<?php

namespace Tests\Feature;

use App\Domains\Admissions\Models\AdmissionCampaign;
use App\Domains\Admissions\Models\Application;
use App\Domains\Finance\Models\FeeChallan;
use App\Domains\Identity\Models\Role;
use App\Domains\Identity\Models\User;
use App\Domains\Organization\Models\Batch;
use App\Domains\Organization\Models\Course;
use App\Domains\Organization\Models\Department;
use App\Domains\Organization\Models\Institute;
use App\Domains\Organization\Models\Program;
use App\Domains\Organization\Models\Trade;
use App\Domains\Student\Models\Enrollment;
use App\Domains\Student\Models\StudentProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DualTrackAdmissionAndLmsActivationTest extends TestCase
{
    use RefreshDatabase;

    protected User $clerk;
    protected User $teacher;
    protected User $studentUser;
    protected StudentProfile $studentProfile;
    protected Trade $trade;
    protected AdmissionCampaign $campaign;

    protected function setUp(): void
    {
        parent::setUp();

        $clerkRole = Role::firstOrCreate(['slug' => 'clerk'], ['name' => 'Admission Clerk']);
        $teacherRole = Role::firstOrCreate(['slug' => 'teacher'], ['name' => 'Teacher']);
        $studentRole = Role::firstOrCreate(['slug' => 'student'], ['name' => 'Student']);

        $institute = Institute::create([
            'name' => 'GTTI Rahim Yar Khan',
            'code' => 'GTTI-RYK',
            'is_active' => true,
        ]);

        $dept = Department::create(['institute_id' => $institute->id, 'name' => 'Mechanical Dept', 'code' => 'MECH']);
        $prog = Program::create(['department_id' => $dept->id, 'name' => 'Vocational Diploma', 'type' => 'diploma', 'duration_months' => 6]);
        $this->trade = Trade::create(['program_id' => $prog->id, 'name' => 'Machinist & CNC', 'code' => 'CNC']);

        $this->campaign = AdmissionCampaign::create([
            'institute_id' => $institute->id,
            'name' => 'Fall 2026 Admissions',
            'start_date' => now()->subDays(5),
            'end_date' => now()->addDays(30),
            'is_active' => true,
        ]);

        $this->clerk = User::factory()->create(['name' => 'Admission Clerk', 'email' => 'clerk@gtti.edu.pk', 'email_verified_at' => now()]);
        $this->clerk->roles()->attach($clerkRole);

        $this->teacher = User::factory()->create(['name' => 'Trade Teacher', 'email' => 'teacher@gtti.edu.pk', 'email_verified_at' => now()]);
        $this->teacher->roles()->attach($teacherRole);

        $this->studentUser = User::factory()->create(['name' => 'Candidate Trainee', 'email' => 'trainee@gtti.edu.pk', 'cnic' => '31202-1234567-1', 'email_verified_at' => now()]);
        $this->studentUser->roles()->attach($studentRole);

        $this->studentProfile = StudentProfile::create([
            'user_id' => $this->studentUser->id,
            'father_name' => 'Trainee Father',
            'date_of_birth' => '2005-01-01',
            'gender' => 'male',
            'domicile_district' => 'Rahim Yar Khan',
            'address' => 'GTTI Campus Town',
            'status' => 'applicant',
        ]);
    }

    public function test_clerk_can_create_dual_track_courses(): void
    {
        // Track A: With Entrance Test
        $responseA = $this->actingAs($this->clerk)
            ->from(route('clerk.courses.index'))
            ->post(route('clerk.courses.store'), [
                'trade_id' => $this->trade->id,
                'name' => 'CNC Precision Milling',
                'category' => 'Mechanical & Manufacturing',
                'duration_type' => 'months',
                'duration_value' => 6,
                'total_academic_days' => 90,
                'entry_level' => 'Matric',
                'admission_type' => 'merit_based',
                'requires_entrance_test' => true,
                'intake_capacity' => 45,
                'classes_start_date' => '2026-10-01',
                'is_published' => true,
                'is_active' => true,
            ]);

        $responseA->assertRedirect(route('clerk.courses.index'));
        $courseA = Course::where('name', 'CNC Precision Milling')->first();
        $this->assertNotNull($courseA);
        $this->assertTrue((bool) $courseA->requires_entrance_test);
        $this->assertEquals(45, $courseA->intake_capacity);
        $this->assertEquals('2026-10-01', $courseA->classes_start_date?->format('Y-m-d'));

        // Track B: Direct Admission / FCFS
        $responseB = $this->actingAs($this->clerk)
            ->from(route('clerk.courses.index'))
            ->post(route('clerk.courses.store'), [
                'trade_id' => $this->trade->id,
                'name' => 'Basic Fitting & Lathe Turning',
                'category' => 'Vocational Short Course',
                'duration_type' => 'months',
                'duration_value' => 3,
                'total_academic_days' => 45,
                'entry_level' => 'Middle',
                'admission_type' => 'first_come_first_served',
                'requires_entrance_test' => false,
                'intake_capacity' => 20,
                'classes_start_date' => '2026-10-15',
                'is_published' => true,
                'is_active' => true,
            ]);

        $responseB->assertRedirect(route('clerk.courses.index'));
        $courseB = Course::where('name', 'Basic Fitting & Lathe Turning')->first();
        $this->assertNotNull($courseB);
        $this->assertFalse((bool) $courseB->requires_entrance_test);
        $this->assertEquals(20, $courseB->intake_capacity);
        $this->assertEquals('2026-10-15', $courseB->classes_start_date?->format('Y-m-d'));
    }

    public function test_fcfs_course_generates_instant_fee_challan_on_application(): void
    {
        Storage::fake('public');

        $fcfsCourse = Course::create([
            'trade_id' => $this->trade->id,
            'name' => 'Auto Electrician Direct Track',
            'entry_level' => 'Matric',
            'admission_type' => 'first_come_first_served',
            'requires_entrance_test' => false,
            'intake_capacity' => 25,
            'classes_start_date' => '2026-10-10',
            'is_active' => true,
        ]);

        $fileCnic = UploadedFile::fake()->create('cnic.pdf', 100, 'application/pdf');
        $fileAcademic = UploadedFile::fake()->create('matric.pdf', 100, 'application/pdf');

        $response = $this->actingAs($this->studentUser)->post(route('student.application.store'), [
            'course_id' => $fcfsCourse->id,
            'cnic_document' => $fileCnic,
            'academic_document' => $fileAcademic,
        ]);

        $response->assertRedirect(route('dashboard'));

        $app = Application::where('student_profile_id', $this->studentProfile->id)
            ->where('course_id', $fcfsCourse->id)
            ->first();

        $this->assertNotNull($app);
        $this->assertEquals('submitted', $app->status);

        // Challan must exist immediately
        $challan = FeeChallan::where('application_id', $app->id)->first();
        $this->assertNotNull($challan);
        $this->assertEquals(2500.00, (float) $challan->amount);
    }

    public function test_quota_enforcement_blocks_application_when_seats_are_full(): void
    {
        Storage::fake('public');

        $quotaCourse = Course::create([
            'trade_id' => $this->trade->id,
            'name' => 'Limited Solar Installation',
            'entry_level' => 'Matric',
            'admission_type' => 'first_come_first_served',
            'requires_entrance_test' => false,
            'intake_capacity' => 1,
            'is_active' => true,
        ]);

        // 1st applicant consumes the seat
        Application::create([
            'student_profile_id' => $this->studentProfile->id,
            'course_id' => $quotaCourse->id,
            'admission_campaign_id' => $this->campaign->id,
            'application_number' => 'APP-EXISTING-1',
            'status' => 'confirmed',
            'fee_status' => 'paid',
        ]);

        $this->assertTrue($quotaCourse->isAdmissionFull());
        $this->assertEquals(0, $quotaCourse->remainingSeats());

        // 2nd candidate tries to apply
        $secondUser = User::factory()->create(['name' => 'Second Applicant', 'email' => 'second@gtti.edu.pk', 'email_verified_at' => now()]);
        $secondProfile = StudentProfile::create([
            'user_id' => $secondUser->id,
            'father_name' => 'Second Father',
            'status' => 'applicant',
        ]);

        $fileCnic = UploadedFile::fake()->create('cnic2.pdf', 100, 'application/pdf');
        $fileAcademic = UploadedFile::fake()->create('matric2.pdf', 100, 'application/pdf');

        $response = $this->actingAs($secondUser)->post(route('student.application.store'), [
            'course_id' => $quotaCourse->id,
            'cnic_document' => $fileCnic,
            'academic_document' => $fileAcademic,
        ]);

        $response->assertSessionHas('error');
        $this->assertDatabaseMissing('applications', [
            'student_profile_id' => $secondProfile->id,
            'course_id' => $quotaCourse->id,
        ]);
    }

    public function test_student_can_upload_paid_challan_receipt(): void
    {
        Storage::fake('public');

        $course = Course::create([
            'trade_id' => $this->trade->id,
            'name' => 'Refrigeration & AC',
            'entry_level' => 'Matric',
            'admission_type' => 'first_come_first_served',
            'requires_entrance_test' => false,
            'intake_capacity' => 30,
            'is_active' => true,
        ]);

        $app = Application::create([
            'student_profile_id' => $this->studentProfile->id,
            'course_id' => $course->id,
            'admission_campaign_id' => $this->campaign->id,
            'application_number' => 'APP-RAC-101',
            'status' => 'submitted',
            'fee_status' => 'issued',
        ]);

        $file = UploadedFile::fake()->create('bank_receipt.pdf', 500, 'application/pdf');

        $response = $this->actingAs($this->studentUser)->post(route('student.application.upload-challan', $app->id), [
            'challan_receipt' => $file,
            'bank_reference' => 'NBP-RYK-998231',
            'deposit_date' => '2026-09-04',
        ]);

        $response->assertRedirect();

        $app->refresh();
        $this->assertNotNull($app->challan_receipt_path);
        $this->assertEquals('NBP-RYK-998231', $app->challan_bank_reference);
        $this->assertEquals('pending_verification', $app->fee_status);
        Storage::disk('public')->assertExists($app->challan_receipt_path);
    }

    public function test_clerk_can_verify_challan_receipt_and_confirm_admission(): void
    {
        Storage::fake('public');

        $course = Course::create([
            'trade_id' => $this->trade->id,
            'name' => 'Industrial Electrician',
            'entry_level' => 'Matric',
            'admission_type' => 'first_come_first_served',
            'requires_entrance_test' => false,
            'intake_capacity' => 30,
            'classes_start_date' => '2026-10-01',
            'is_active' => true,
        ]);

        $app = Application::create([
            'student_profile_id' => $this->studentProfile->id,
            'course_id' => $course->id,
            'admission_campaign_id' => $this->campaign->id,
            'application_number' => 'APP-ELE-500',
            'status' => 'submitted',
            'fee_status' => 'pending_verification',
            'challan_receipt_path' => 'challan_receipts/dummy.png',
            'challan_bank_reference' => 'BOP-RYK-4421',
            'challan_deposit_date' => '2026-09-04',
        ]);

        $challan = FeeChallan::create([
            'application_id' => $app->id,
            'student_profile_id' => $this->studentProfile->id,
            'challan_number' => 'FCFS-ELE-500',
            'challan_type' => 'admission',
            'amount' => 3500,
            'due_date' => now()->addDays(7),
            'status' => 'unpaid',
        ]);

        $response = $this->actingAs($this->clerk)->post(route('clerk.applications.verify-challan', $app->id));
        $response->assertRedirect();
        $response->assertSessionHas('success');

        $app->refresh();
        $this->assertEquals('confirmed', $app->status);
        $this->assertEquals('paid', $app->fee_status);
        $this->assertNotNull($app->classes_commencement_notice);

        $challan->refresh();
        $this->assertEquals('paid', $challan->status);

        // Trainee Enrollment must be created with LMS locked
        $enrollment = Enrollment::where('student_profile_id', $this->studentProfile->id)
            ->where('course_id' , $course->id)
            ->first();

        $this->assertNotNull($enrollment);
        $this->assertFalse((bool) $enrollment->is_lms_active);
    }

    public function test_teacher_can_gatekeep_and_activate_trainee_lms_access(): void
    {
        $course = Course::create([
            'trade_id' => $this->trade->id,
            'name' => 'Civil Draftsman',
            'entry_level' => 'Matric',
            'admission_type' => 'merit_based',
            'requires_entrance_test' => true,
            'is_active' => true,
        ]);

        $batch = Batch::create([
            'course_id' => $course->id,
            'name' => 'Civil-2026-Morning',
            'session_year' => '2026-2027',
            'shift' => 'morning',
        ]);
        $batch->teachers()->attach($this->teacher);

        $enrollment = Enrollment::create([
            'student_profile_id' => $this->studentProfile->id,
            'course_id' => $course->id,
            'batch_id' => $batch->id,
            'enrollment_number' => 'GTTI-CIV-001',
            'status' => 'active',
            'enrollment_date' => now()->toDateString(),
            'is_lms_active' => false,
        ]);

        $this->assertFalse((bool) $enrollment->is_lms_active);

        // Teacher activates LMS after class orientation
        $response = $this->actingAs($this->teacher)->post(route('teacher.enrollments.toggle-lms', $enrollment->id));
        $response->assertRedirect();

        $enrollment->refresh();
        $this->assertTrue((bool) $enrollment->is_lms_active);
        $this->assertEquals($this->teacher->id, $enrollment->lms_activated_by);
        $this->assertNotNull($enrollment->lms_activated_at);

        // Teacher toggles back to inactive
        $response2 = $this->actingAs($this->teacher)->post(route('teacher.enrollments.toggle-lms', $enrollment->id));
        $response2->assertRedirect();

        $enrollment->refresh();
        $this->assertFalse((bool) $enrollment->is_lms_active);
    }

    public function test_teacher_can_bulk_activate_lms_for_entire_batch(): void
    {
        $course = Course::create([
            'trade_id' => $this->trade->id,
            'name' => 'Welding Technology',
            'entry_level' => 'Middle',
            'admission_type' => 'first_come_first_served',
            'requires_entrance_test' => false,
            'is_active' => true,
        ]);

        $batch = Batch::create([
            'course_id' => $course->id,
            'name' => 'Weld-2026-Batch',
            'session_year' => '2026-2027',
            'shift' => 'morning',
        ]);
        $batch->teachers()->attach($this->teacher);

        // Create 2 enrollments
        $enr1 = Enrollment::create([
            'student_profile_id' => $this->studentProfile->id,
            'course_id' => $course->id,
            'batch_id' => $batch->id,
            'enrollment_number' => 'GTTI-WLD-001',
            'status' => 'active',
            'enrollment_date' => now()->toDateString(),
            'is_lms_active' => false,
        ]);

        $secondUser = User::factory()->create(['name' => 'Second Welder', 'email' => 'weld2@gtti.edu.pk']);
        $secondProfile = StudentProfile::create(['user_id' => $secondUser->id, 'father_name' => 'Dad']);
        $enr2 = Enrollment::create([
            'student_profile_id' => $secondProfile->id,
            'course_id' => $course->id,
            'batch_id' => $batch->id,
            'enrollment_number' => 'GTTI-WLD-002',
            'status' => 'active',
            'enrollment_date' => now()->toDateString(),
            'is_lms_active' => false,
        ]);

        $response = $this->actingAs($this->teacher)->post(route('teacher.batches.activate-lms', $batch->id));
        $response->assertRedirect();

        $enr1->refresh();
        $enr2->refresh();
        $this->assertTrue((bool) $enr1->is_lms_active);
        $this->assertTrue((bool) $enr2->is_lms_active);
    }
}

