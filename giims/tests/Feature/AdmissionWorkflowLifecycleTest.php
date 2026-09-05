<?php

namespace Tests\Feature;

use App\Domains\Admissions\Models\AdmissionCampaign;
use App\Domains\Admissions\Models\Application;
use App\Domains\Admissions\Models\MeritList;
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

class AdmissionWorkflowLifecycleTest extends TestCase
{
    use RefreshDatabase;

    protected User $clerk;
    protected User $teacher;
    protected User $studentUser;
    protected StudentProfile $studentProfile;
    protected Course $testRequiredCourse;
    protected Course $nonTestCourse;
    protected AdmissionCampaign $campaign;
    protected Batch $batch;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $clerkRole = Role::firstOrCreate(['slug' => 'clerk'], ['name' => 'Admission Clerk']);
        $teacherRole = Role::firstOrCreate(['slug' => 'teacher'], ['name' => 'Teacher']);
        $studentRole = Role::firstOrCreate(['slug' => 'student'], ['name' => 'Student']);

        $institute = Institute::create([
            'name' => 'GTTI Rahim Yar Khan',
            'code' => 'GTTI-RYK',
            'is_active' => true,
        ]);

        $dept = Department::create(['institute_id' => $institute->id, 'name' => 'Electrical Dept', 'code' => 'ELEC']);
        $prog = Program::create(['department_id' => $dept->id, 'name' => 'Vocational Diploma', 'type' => 'diploma', 'duration_months' => 6]);
        $trade = Trade::create(['program_id' => $prog->id, 'name' => 'Electrician & Solar', 'code' => 'ELEC-SOLAR']);

        $this->campaign = AdmissionCampaign::create([
            'institute_id' => $institute->id,
            'name' => 'Fall 2026 Admissions',
            'start_date' => now()->subDays(5),
            'end_date' => now()->addDays(30),
            'is_active' => true,
        ]);

        // Course 1: Requires Entrance Test (Merit-Based)
        $this->testRequiredCourse = Course::create([
            'trade_id' => $trade->id,
            'name' => 'Electrician (Pre-Test Required)',
            'entry_level' => 'Matric',
            'admission_type' => 'merit_based',
            'requires_entrance_test' => true,
            'duration_type' => 'months',
            'duration_value' => 6,
            'intake_capacity' => 50,
            'is_active' => true,
            'classes_start_date' => now()->addDays(20),
        ]);

        // Course 2: Does NOT Require Entrance Test (FCFS)
        $this->nonTestCourse = Course::create([
            'trade_id' => $trade->id,
            'name' => 'Plumber & Pipe Fitting (Direct FCFS)',
            'entry_level' => 'Middle',
            'admission_type' => 'first_come_first_served',
            'requires_entrance_test' => false,
            'duration_type' => 'months',
            'duration_value' => 6,
            'intake_capacity' => 40,
            'is_active' => true,
            'classes_start_date' => now()->addDays(20),
        ]);

        $this->clerk = User::factory()->create(['name' => 'Admission Clerk', 'email' => 'clerk@gtti.edu.pk', 'email_verified_at' => now()]);
        $this->clerk->roles()->attach($clerkRole);

        $this->teacher = User::factory()->create(['name' => 'Class Teacher', 'email' => 'teacher@gtti.edu.pk', 'email_verified_at' => now()]);
        $this->teacher->roles()->attach($teacherRole);

        $this->batch = Batch::create([
            'course_id' => $this->testRequiredCourse->id,
            'name' => 'Electrician 2026 Batch A',
            'session_year' => '2026-2027',
            'shift' => 'morning',
        ]);
        $this->batch->teachers()->attach($this->teacher);

        $this->studentUser = User::factory()->create([
            'name' => 'Applicant Student',
            'email' => 'student@gtti.edu.pk',
            'cnic' => '31202-9988776-1',
            'email_verified_at' => now(),
        ]);
        $this->studentUser->roles()->attach($studentRole);

        $this->studentProfile = StudentProfile::create([
            'user_id' => $this->studentUser->id,
            'father_name' => 'Father Name',
            'date_of_birth' => '2005-04-12',
            'gender' => 'male',
            'domicile_district' => 'Rahim Yar Khan',
            'address' => 'Model Town, RYK',
            'status' => 'applicant',
        ]);
    }

    public function test_test_required_applicant_cannot_access_roll_no_slip_until_verified(): void
    {
        $application = Application::create([
            'student_profile_id' => $this->studentProfile->id,
            'course_id' => $this->testRequiredCourse->id,
            'admission_campaign_id' => $this->campaign->id,
            'application_number' => 'APP-TEST-001',
            'status' => 'submitted',
        ]);

        // Attempting to print entrance slip when not verified should return 403
        $response = $this->actingAs($this->studentUser)
            ->get(route('admit-card.entrance-slip', $application->id));

        $response->assertStatus(403);
    }

    public function test_clerk_verifying_application_generates_entrance_roll_number_and_unlocks_slip(): void
    {
        $application = Application::create([
            'student_profile_id' => $this->studentProfile->id,
            'course_id' => $this->testRequiredCourse->id,
            'admission_campaign_id' => $this->campaign->id,
            'application_number' => 'APP-TEST-002',
            'status' => 'submitted',
        ]);

        // Clerk verifies application
        $response = $this->actingAs($this->clerk)
            ->post(route('clerk.applications.verify', $application->id));

        $response->assertSessionHas('success');

        $application->refresh();
        $this->assertEquals('verified', $application->status);
        $this->assertNotEmpty($application->entrance_roll_number);

        // Student can now access & print Entrance Test Roll No Slip
        $printResponse = $this->actingAs($this->studentUser)
            ->get(route('admit-card.entrance-slip', $application->id));

        $printResponse->assertOk();
        $printResponse->assertInertia(fn ($page) => 
            $page->component('Shared/PrintEntranceAdmitCard')
                ->has('card')
                ->where('card.roll_number', $application->entrance_roll_number)
                ->where('card.candidate_name', $this->studentUser->name)
        );
    }

    public function test_applicant_for_non_test_course_cannot_access_roll_no_slip(): void
    {
        $application = Application::create([
            'student_profile_id' => $this->studentProfile->id,
            'course_id' => $this->nonTestCourse->id,
            'admission_campaign_id' => $this->campaign->id,
            'application_number' => 'APP-NOTEST-003',
            'status' => 'verified',
        ]);

        // Non-test course must return 403 when trying to access entrance test slip
        $response = $this->actingAs($this->studentUser)
            ->get(route('admit-card.entrance-slip', $application->id));

        $response->assertStatus(403);
    }

    public function test_clerk_can_upload_and_publish_merit_list_visible_on_student_dashboard(): void
    {
        $file = UploadedFile::fake()->create('1st_merit_list_electrician.pdf', 500, 'application/pdf');

        // Clerk uploads merit list
        $uploadResponse = $this->actingAs($this->clerk)
            ->post(route('clerk.merit-lists.store'), [
                'course_id' => $this->testRequiredCourse->id,
                'title' => '1st Official Merit List - Electrician Morning',
                'merit_document' => $file,
                'classes_start_date' => now()->addDays(15)->format('Y-m-d'),
                'remarks' => 'Selected candidates must deposit fee within 3 working days.',
                'status' => 'published',
            ]);

        $uploadResponse->assertRedirect();
        $this->assertDatabaseHas('merit_lists', [
            'title' => '1st Official Merit List - Electrician Morning',
            'status' => 'published',
        ]);

        $meritList = MeritList::first();
        $this->assertNotNull($meritList->published_at);
        Storage::disk('public')->assertExists($meritList->file_path);

        // Student visits dashboard and receives published merit list
        $dashResponse = $this->actingAs($this->studentUser)
            ->get(route('dashboard'));

        $dashResponse->assertOk();
        $dashResponse->assertInertia(fn ($page) =>
            $page->component('Student/Dashboard')
                ->has('meritLists', 1)
                ->where('meritLists.0.title', '1st Official Merit List - Electrician Morning')
        );

        // Student can download the uploaded merit list PDF
        $downloadResponse = $this->actingAs($this->studentUser)
            ->get(route('clerk.merit-lists.download', $meritList->id));

        $downloadResponse->assertOk();
    }

    public function test_clerk_can_upload_custom_challan_and_student_can_download(): void
    {
        $application = Application::create([
            'student_profile_id' => $this->studentProfile->id,
            'course_id' => $this->testRequiredCourse->id,
            'admission_campaign_id' => $this->campaign->id,
            'application_number' => 'APP-CHALLAN-004',
            'status' => 'selected_for_admission',
        ]);

        $customChallan = UploadedFile::fake()->create('custom_bank_challan.pdf', 300, 'application/pdf');

        // Clerk uploads custom fee challan
        $uploadResponse = $this->actingAs($this->clerk)
            ->post(route('clerk.applications.upload-challan', $application->id), [
                'challan_file' => $customChallan,
            ]);

        $uploadResponse->assertSessionHas('success');
        $application->refresh();
        $this->assertNotNull($application->clerk_challan_path);
        Storage::disk('public')->assertExists($application->clerk_challan_path);

        // Student downloads custom challan
        $downloadResponse = $this->actingAs($this->studentUser)
            ->get(route('applications.challan-document', $application->id));

        $downloadResponse->assertOk();

        // Student accesses official printable 3-copy bank fee challan voucher
        $printResponse = $this->actingAs($this->studentUser)
            ->get(route('applications.print-challan', $application->id));

        $printResponse->assertOk();
        $printResponse->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
            ->component('Shared/PrintFeeChallan')
            ->has('voucher')
            ->where('voucher.id', $application->id)
            ->where('voucher.amount', 3500)
            ->where('voucher.due_date', fn ($date) => !empty($date))
        );

        // Clerk can also access the printable challan
        $clerkPrintResponse = $this->actingAs($this->clerk)
            ->get(route('applications.print-challan', $application->id));
        $clerkPrintResponse->assertOk();
    }

    public function test_complete_paid_challan_verification_and_manual_teacher_lms_activation(): void
    {
        $application = Application::create([
            'student_profile_id' => $this->studentProfile->id,
            'course_id' => $this->testRequiredCourse->id,
            'admission_campaign_id' => $this->campaign->id,
            'application_number' => 'APP-CONFIRM-005',
            'status' => 'selected_for_admission',
        ]);

        FeeChallan::create([
            'application_id' => $application->id,
            'student_profile_id' => $this->studentProfile->id,
            'challan_number' => 'CH-2026-005',
            'amount' => 3500.00,
            'status' => 'unpaid',
            'due_date' => now()->addDays(5),
        ]);

        // 1. Student uploads paid receipt
        $receipt = UploadedFile::fake()->image('paid_receipt.jpg');
        $uploadReceiptResponse = $this->actingAs($this->studentUser)
            ->post(route('student.application.upload-challan', $application->id), [
                'challan_receipt' => $receipt,
                'bank_reference' => 'NBP Main Branch Scroll #552',
                'deposit_date' => now()->format('Y-m-d'),
            ]);

        $uploadReceiptResponse->assertSessionHas('success');
        $application->refresh();
        $this->assertNotNull($application->challan_receipt_path);

        // 2. Clerk verifies challan and confirms admission
        $confirmResponse = $this->actingAs($this->clerk)
            ->post(route('clerk.applications.verify-challan', $application->id));

        $confirmResponse->assertSessionHas('success');
        $application->refresh();
        $this->assertEquals('confirmed', $application->status);

        // Verify Enrollment is created
        $enrollment = Enrollment::where('student_profile_id', $this->studentProfile->id)->first();
        $this->assertNotNull($enrollment);

        // LMS must remain locked/inactive until Class Teacher manually activates
        $enrollment->refresh();
        $this->assertFalse((bool) $enrollment->is_lms_active);

        // 3. Class Teacher manually activates student's portal / LMS
        $teacherActivateResponse = $this->actingAs($this->teacher)
            ->post(route('teacher.enrollments.toggle-lms', $enrollment->id));

        $teacherActivateResponse->assertSessionHas('success');
        $enrollment->refresh();
        $this->assertTrue((bool) $enrollment->is_lms_active);
    }
}
