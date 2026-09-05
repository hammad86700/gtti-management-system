<?php

namespace Tests\Feature;

use App\Domains\Admissions\Models\AdmissionCampaign;
use App\Domains\Admissions\Models\Application;
use App\Domains\Admissions\Models\MeritList;
use App\Domains\Finance\Models\FeeChallan;
use App\Domains\Identity\Models\Role;
use App\Domains\Identity\Models\User;
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

class Phase33TwoTrackAdmissionTest extends TestCase
{
    use RefreshDatabase;

    protected User $clerk;
    protected User $studentUser;
    protected StudentProfile $studentProfile;
    protected Trade $trade;
    protected AdmissionCampaign $campaign;

    protected function setUp(): void
    {
        parent::setUp();

        $clerkRole = Role::firstOrCreate(['slug' => 'clerk'], ['name' => 'Admission Clerk']);
        $studentRole = Role::firstOrCreate(['slug' => 'student'], ['name' => 'Student']);

        $institute = Institute::create([
            'name' => 'GTTI Rahim Yar Khan',
            'code' => 'GTTI-RYK',
            'is_active' => true,
        ]);

        $dept = Department::create(['institute_id' => $institute->id, 'name' => 'Automotive & Mechanical', 'code' => 'AUTO']);
        $prog = Program::create(['department_id' => $dept->id, 'name' => 'Vocational Diploma', 'type' => 'diploma', 'duration_months' => 6]);
        $this->trade = Trade::create(['program_id' => $prog->id, 'name' => 'Auto Cad & CNC', 'code' => 'CNC']);

        $this->campaign = AdmissionCampaign::create([
            'institute_id' => $institute->id,
            'name' => 'Fall 2026 Admissions',
            'start_date' => now()->subDays(5),
            'end_date' => now()->addDays(30),
            'is_active' => true,
        ]);

        $this->clerk = User::factory()->create(['name' => 'Admission Clerk', 'email' => 'clerk@gtti.edu.pk', 'email_verified_at' => now()]);
        $this->clerk->roles()->attach($clerkRole);

        $this->studentUser = User::factory()->create(['name' => 'Trainee One', 'email' => 'trainee1@gtti.edu.pk', 'cnic' => '31202-1111111-1', 'email_verified_at' => now()]);
        $this->studentUser->roles()->attach($studentRole);

        $this->studentProfile = StudentProfile::create([
            'user_id' => $this->studentUser->id,
            'father_name' => 'Father One',
            'status' => 'applicant',
        ]);
    }

    public function test_fcfs_lifecycle_from_pending_to_admitted_with_capacity_autolock(): void
    {
        Storage::fake('public');

        // Course with capacity = 1 to test auto-locking
        $fcfsCourse = Course::create([
            'trade_id' => $this->trade->id,
            'name' => 'Rapid CNC Milling (FCFS)',
            'entry_level' => 'Matric',
            'admission_type' => 'first_come_first_served',
            'requires_entrance_test' => false,
            'capacity' => 1,
            'intake_capacity' => 1,
            'is_admission_open' => true,
            'is_active' => true,
        ]);

        // 1. Student applies: initial status must be pending
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
        $this->assertEquals('pending', $app->status);

        // 2. Clerk verifies & issues challan with 5-day deadline
        $verifyResponse = $this->actingAs($this->clerk)->post(route('clerk.applications.verify', $app->id));
        $verifyResponse->assertRedirect();

        $app->refresh();
        $this->assertEquals('challan_issued', $app->status);

        $challan = FeeChallan::where('application_id', $app->id)->first();
        $this->assertNotNull($challan);
        $this->assertNotNull($challan->payment_deadline);
        $this->assertEquals('unpaid', $challan->status);

        // 3. Student uploads stamped receipt
        $receipt = UploadedFile::fake()->create('paid_bank_slip.png', 300, 'image/png');
        $uploadResp = $this->actingAs($this->studentUser)->post(route('student.application.upload-challan', $app->id), [
            'challan_receipt' => $receipt,
            'bank_reference' => 'NBP-TXN-101010',
            'deposit_date' => now()->toDateString(),
        ]);
        $uploadResp->assertRedirect();

        $app->refresh();
        $this->assertEquals('receipt_submitted', $app->status);
        $this->assertEquals('pending_verification', $app->fee_status);

        // 4. Clerk confirms admission & enrolls trainee
        $confirmResp = $this->actingAs($this->clerk)->post(route('clerk.applications.verify-challan', $app->id));
        $confirmResp->assertRedirect();

        $app->refresh();
        $this->assertEquals('admitted', $app->status);
        $this->assertEquals('paid', $app->fee_status);
        $this->assertNotNull($app->institutional_roll_number);

        // Active enrollment with LMS unlocked
        $enrollment = Enrollment::where('student_profile_id', $this->studentProfile->id)->first();
        $this->assertNotNull($enrollment);
        $this->assertTrue((bool) $enrollment->is_lms_active);

        // Course capacity reached (1/1) -> auto-lock is_admission_open
        $fcfsCourse->refresh();
        $this->assertFalse((bool) $fcfsCourse->is_admission_open);
        $this->assertTrue($fcfsCourse->isAdmissionFull());
    }

    public function test_merit_based_lifecycle_with_selective_challans_and_public_merit_list(): void
    {
        Storage::fake('public');

        $meritCourse = Course::create([
            'trade_id' => $this->trade->id,
            'name' => 'Advanced Robotics & Automation (Merit)',
            'entry_level' => 'Matric',
            'admission_type' => 'merit_based',
            'requires_entrance_test' => true,
            'capacity' => 25,
            'intake_capacity' => 25,
            'is_admission_open' => true,
            'is_active' => true,
        ]);

        // Student applies
        $fileCnic = UploadedFile::fake()->create('cnic_m.pdf', 100, 'application/pdf');
        $fileAcademic = UploadedFile::fake()->create('matric_m.pdf', 100, 'application/pdf');

        $this->actingAs($this->studentUser)->post(route('student.application.store'), [
            'course_id' => $meritCourse->id,
            'cnic_document' => $fileCnic,
            'academic_document' => $fileAcademic,
        ]);

        $app = Application::where('student_profile_id', $this->studentProfile->id)->first();
        $this->assertEquals('pending', $app->status);

        // 1. Clerk verifies document -> assigns entrance roll number
        $this->actingAs($this->clerk)->post(route('clerk.applications.verify', $app->id));
        $app->refresh();
        $this->assertEquals('verified', $app->status);
        $this->assertNotNull($app->entrance_roll_number);

        // 2. Clerk issues roll number slips via BulkNotificationController
        $this->actingAs($this->clerk)->post(route('clerk.scheduler.broadcast'), [
            'course_id' => $meritCourse->id,
            'test_date' => now()->addDays(2)->format('Y-m-d'),
            'test_time' => '10:00 AM',
            'test_venue' => 'Main Auditorium Hall A',
            'clerk_notice' => 'Bring original CNIC and Roll No Slip',
        ]);

        $app->refresh();
        $this->assertEquals('slip_issued', $app->status);

        // 3. Clerk publishes merit list -> is_publicly_visible is set to true
        $meritList = MeritList::create([
            'admission_campaign_id' => $this->campaign->id,
            'course_id' => $meritCourse->id,
            'title' => 'First Open Merit List 2026',
            'status' => 'draft',
            'is_publicly_visible' => false,
        ]);

        // Clerk publishes the merit list
        $pubResp = $this->actingAs($this->clerk)->post(route('clerk.merit-lists.toggle-publish', $meritList->id));
        $pubResp->assertRedirect();

        $meritList->refresh();
        $this->assertEquals('published', $meritList->status);
        $this->assertTrue((bool) $meritList->is_publicly_visible);

        // 4. Selective Fee Challan Issuance with deadline
        $deadline = now()->addDays(5)->format('Y-m-d');
        $issueChallanResp = $this->actingAs($this->clerk)->post(route('clerk.applications.issue-challan', $app->id), [
            'payment_deadline' => $deadline,
        ]);
        $issueChallanResp->assertRedirect();

        $app->refresh();
        $this->assertEquals('challan_issued', $app->status);
        $challan = FeeChallan::where('application_id', $app->id)->first();
        $this->assertNotNull($challan);
        $this->assertEquals($deadline, $challan->payment_deadline?->format('Y-m-d'));

        // 5. Student uploads receipt
        $receipt = UploadedFile::fake()->create('merit_paid_slip.png', 300, 'image/png');
        $this->actingAs($this->studentUser)->post(route('student.application.upload-challan', $app->id), [
            'challan_receipt' => $receipt,
            'bank_reference' => 'NBP-MERIT-888',
            'deposit_date' => now()->toDateString(),
        ]);

        $app->refresh();
        $this->assertEquals('receipt_submitted', $app->status);

        // 6. Clerk confirms admission
        $this->actingAs($this->clerk)->post(route('clerk.applications.verify-challan', $app->id));

        $app->refresh();
        $this->assertEquals('admitted', $app->status);
        $this->assertNotNull($app->institutional_roll_number);

        $enrollment = Enrollment::where('student_profile_id', $this->studentProfile->id)->first();
        $this->assertNotNull($enrollment);
        $this->assertTrue((bool) $enrollment->is_lms_active);
    }

    public function test_merit_lists_are_strictly_isolated_and_hidden_for_fcfs_applicants(): void
    {
        Storage::fake('public');

        // Course A: FCFS (No entrance test, no merit list)
        $fcfsCourse = Course::create([
            'trade_id' => $this->trade->id,
            'name' => 'Web Design & Development (FCFS)',
            'entry_level' => 'Matric',
            'admission_type' => 'first_come_first_served',
            'requires_entrance_test' => false,
            'capacity' => 25,
            'is_admission_open' => true,
            'is_active' => true,
        ]);

        // Course B: Merit-based
        $meritCourse = Course::create([
            'trade_id' => $this->trade->id,
            'name' => 'Computer Operator (Merit)',
            'entry_level' => 'Matric',
            'admission_type' => 'merit_based',
            'requires_entrance_test' => true,
            'capacity' => 25,
            'is_admission_open' => true,
            'is_active' => true,
        ]);

        // Published merit list exists for Course B (Computer Operator)
        $meritListB = MeritList::create([
            'admission_campaign_id' => $this->campaign->id,
            'course_id' => $meritCourse->id,
            'title' => '1st Provisional Merit List - Computer Operator',
            'status' => 'published',
            'is_publicly_visible' => true,
            'published_at' => now(),
        ]);

        // Student applies for Course A (FCFS)
        $fileCnic = UploadedFile::fake()->create('cnic_a.pdf', 100, 'application/pdf');
        $fileAcademic = UploadedFile::fake()->create('matric_a.pdf', 100, 'application/pdf');

        $this->actingAs($this->studentUser)->post(route('student.application.store'), [
            'course_id' => $fcfsCourse->id,
            'cnic_document' => $fileCnic,
            'academic_document' => $fileAcademic,
        ]);

        // When visiting dashboard, FCFS applicant must receive 0 merit lists (hidden completely)
        $dashResponse = $this->actingAs($this->studentUser)->get(route('dashboard'));
        $dashResponse->assertOk();

        $meritListsProp = $dashResponse->original->getData()['page']['props']['meritLists'];
        $this->assertCount(0, $meritListsProp, 'FCFS applicants must NOT receive any merit lists on their dashboard.');

        // Course C: Another Merit Course
        $meritCourseC = Course::create([
            'trade_id' => $this->trade->id,
            'name' => 'Machinist (Merit)',
            'entry_level' => 'Matric',
            'admission_type' => 'merit_based',
            'requires_entrance_test' => true,
            'capacity' => 25,
            'is_admission_open' => true,
            'is_active' => true,
        ]);

        MeritList::create([
            'admission_campaign_id' => $this->campaign->id,
            'course_id' => $meritCourseC->id,
            'title' => '1st Merit List - Machinist',
            'status' => 'published',
            'is_publicly_visible' => true,
            'published_at' => now(),
        ]);

        // Merit student applies for Course B (Computer Operator)
        $meritUser = User::factory()->create(['email' => 'merit_student@gtti.edu.pk']);
        StudentProfile::create(['user_id' => $meritUser->id, 'father_name' => 'Father M', 'status' => 'applicant']);

        $this->actingAs($meritUser)->post(route('student.application.store'), [
            'course_id' => $meritCourse->id,
            'cnic_document' => UploadedFile::fake()->create('cnic_m.pdf', 100, 'application/pdf'),
            'academic_document' => UploadedFile::fake()->create('matric_m.pdf', 100, 'application/pdf'),
        ]);

        $meritDashResp = $this->actingAs($meritUser)->get(route('dashboard'));
        $meritDashResp->assertOk();

        $meritUserLists = $meritDashResp->original->getData()['page']['props']['meritLists'];
        $this->assertCount(1, $meritUserLists, 'Merit applicants must only receive merit lists for their applied trade.');
        $this->assertEquals($meritCourse->id, $meritUserLists[0]['course_id']);
        $this->assertEquals('1st Provisional Merit List - Computer Operator', $meritUserLists[0]['title']);
    }
}
