<?php

namespace Tests\Feature;

use App\Domains\Admissions\Models\AdmissionCampaign;
use App\Domains\Admissions\Models\Application;
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

class ShiftSeparationAndBatchEnrollmentTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $clerk;
    protected User $student;
    protected Course $course;
    protected Batch $morningBatch;
    protected Batch $eveningBatch;
    protected AdmissionCampaign $campaign;

    protected function setUp(): void
    {
        parent::setUp();

        $superAdminRole = Role::firstOrCreate(['slug' => 'super-admin'], ['name' => 'Super Admin', 'is_system' => true]);
        $clerkRole = Role::firstOrCreate(['slug' => 'clerk'], ['name' => 'Clerk / Admission Officer', 'is_system' => false]);
        $studentRole = Role::firstOrCreate(['slug' => 'student'], ['name' => 'Student / Trainee', 'is_system' => false]);

        $institute = Institute::create([
            'name' => 'Government Technical Training Institute',
            'code' => 'GTTI-RYK',
            'is_active' => true,
        ]);

        $dept = Department::create(['institute_id' => $institute->id, 'name' => 'Computer Science & IT', 'code' => 'CSIT']);
        $prog = Program::create(['department_id' => $dept->id, 'name' => 'IT Certificate', 'type' => 'certificate', 'duration_months' => 6]);
        $trade = Trade::create(['program_id' => $prog->id, 'name' => 'Software Technology', 'code' => 'SWE']);

        $this->course = Course::create([
            'trade_id' => $trade->id,
            'name' => 'Full-Stack Web Development',
            'entry_level' => 'Matric',
            'admission_type' => 'first_come_first_served',
            'requires_entrance_test' => false,
            'intake_capacity' => 60,
            'is_published' => true,
            'is_active' => true,
        ]);

        $this->morningBatch = Batch::create([
            'course_id' => $this->course->id,
            'name' => 'Fall 2026 - Morning Batch',
            'shift' => 'Morning',
            'session_year' => '2026-2027',
            'start_date' => '2026-09-01',
            'end_date' => '2027-08-31',
        ]);

        $this->eveningBatch = Batch::create([
            'course_id' => $this->course->id,
            'name' => 'Fall 2026 - Evening Batch',
            'shift' => 'Evening',
            'session_year' => '2026-2027',
            'start_date' => '2026-09-01',
            'end_date' => '2027-08-31',
        ]);

        $this->campaign = AdmissionCampaign::create([
            'institute_id' => $institute->id,
            'name' => 'Fall 2026 Admissions',
            'start_date' => now()->subDays(2),
            'end_date' => now()->addDays(20),
            'is_active' => true,
        ]);

        $this->superAdmin = User::factory()->create([
            'name' => 'Principal SuperAdmin',
            'email' => 'principal@gtti.edu.pk',
            'institute_id' => $institute->id,
        ]);
        $this->superAdmin->roles()->attach($superAdminRole);

        $this->clerk = User::factory()->create([
            'name' => 'Admission Clerk Officer',
            'email' => 'clerk.shift@gtti.edu.pk',
            'institute_id' => $institute->id,
        ]);
        $this->clerk->roles()->attach($clerkRole);

        $this->student = User::factory()->create([
            'name' => 'Evening Candidate',
            'email' => 'evening.student@gtti.edu.pk',
            'cnic' => '31202-1234567-1',
            'institute_id' => $institute->id,
        ]);
        $this->student->roles()->attach($studentRole);

        StudentProfile::create([
            'user_id' => $this->student->id,
            'father_name' => 'Candidate Father',
            'status' => 'applicant',
        ]);
    }

    public function test_student_can_apply_specifying_morning_or_evening_shift_and_batch_is_resolved(): void
    {
        Storage::fake('local');

        $cnicFile = UploadedFile::fake()->create('cnic_front.jpg', 1024, 'image/jpeg');
        $matricFile = UploadedFile::fake()->create('matric_cert.pdf', 1024, 'application/pdf');

        $response = $this->actingAs($this->student)->post(route('student.application.store'), [
            'course_id' => $this->course->id,
            'shift' => 'Evening',
            'cnic' => '31202-1234567-1',
            'father_name' => 'Candidate Father',
            'matric_total_marks' => 1100,
            'matric_obtained_marks' => 880,
            'cnic_document' => $cnicFile,
            'academic_document' => $matricFile,
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('dashboard'));

        $this->assertDatabaseHas('applications', [
            'course_id' => $this->course->id,
            'shift' => 'Evening',
            'batch_id' => $this->eveningBatch->id,
        ]);
    }

    public function test_clerk_confirming_admission_assigns_student_to_selected_shift_batch(): void
    {
        $profile = StudentProfile::where('user_id', $this->student->id)->first();

        $application = Application::create([
            'student_profile_id' => $profile->id,
            'course_id' => $this->course->id,
            'admission_campaign_id' => $this->campaign->id,
            'application_number' => 'APP-EVENING-001',
            'status' => 'selected',
            'fee_status' => 'pending_verification',
            'shift' => 'Evening',
            'batch_id' => $this->eveningBatch->id,
        ]);

        $response = $this->actingAs($this->clerk)->post(route('clerk.applications.verify-challan', $application->id));

        $response->assertSessionHasNoErrors();

        // Verify Enrollment is created with Evening Batch
        $this->assertDatabaseHas('enrollments', [
            'student_profile_id' => $profile->id,
            'course_id' => $this->course->id,
            'batch_id' => $this->eveningBatch->id,
            'is_lms_active' => true,
        ]);

        $enrollment = Enrollment::where('student_profile_id', $profile->id)->first();
        $this->assertEquals('Evening', $enrollment->batch->shift);
    }

    public function test_admin_enrollment_index_isolates_morning_and_evening_rosters(): void
    {
        // Trainee 1 in Morning Batch
        $morningUser = User::factory()->create(['name' => 'Morning Trainee']);
        $morningProfile = StudentProfile::create(['user_id' => $morningUser->id, 'status' => 'enrolled', 'registration_number' => 'GTTI-M-01']);
        $morningEnrollment = Enrollment::create([
            'student_profile_id' => $morningProfile->id,
            'course_id' => $this->course->id,
            'batch_id' => $this->morningBatch->id,
            'enrollment_number' => 'ENR-M-01',
            'enrollment_date' => now(),
            'status' => 'active',
            'is_lms_active' => true,
        ]);

        // Trainee 2 in Evening Batch
        $eveningUser = User::factory()->create(['name' => 'Evening Trainee']);
        $eveningProfile = StudentProfile::create(['user_id' => $eveningUser->id, 'status' => 'enrolled', 'registration_number' => 'GTTI-E-01']);
        $eveningEnrollment = Enrollment::create([
            'student_profile_id' => $eveningProfile->id,
            'course_id' => $this->course->id,
            'batch_id' => $this->eveningBatch->id,
            'enrollment_number' => 'ENR-E-01',
            'enrollment_date' => now(),
            'status' => 'active',
            'is_lms_active' => true,
        ]);

        // Filter Morning
        $responseMorning = $this->actingAs($this->superAdmin)->get(route('admin.enrollments.index', ['shift' => 'Morning']));
        $responseMorning->assertOk();
        $responseMorning->assertInertia(fn ($page) => $page
            ->has('enrollments', 1)
            ->where('enrollments.0.id', $morningEnrollment->id)
            ->where('stats.morning_count', 1)
            ->where('stats.evening_count', 1)
        );

        // Filter Evening
        $responseEvening = $this->actingAs($this->superAdmin)->get(route('admin.enrollments.index', ['shift' => 'Evening']));
        $responseEvening->assertOk();
        $responseEvening->assertInertia(fn ($page) => $page
            ->has('enrollments', 1)
            ->where('enrollments.0.id', $eveningEnrollment->id)
        );
    }

    public function test_clerk_review_index_filters_applications_by_shift(): void
    {
        $morningUser = User::factory()->create(['name' => 'Morning Candidate']);
        $morningProfile = StudentProfile::create(['user_id' => $morningUser->id, 'status' => 'applicant']);
        $morningApp = Application::create([
            'student_profile_id' => $morningProfile->id,
            'course_id' => $this->course->id,
            'admission_campaign_id' => $this->campaign->id,
            'application_number' => 'APP-M-101',
            'status' => 'submitted',
            'shift' => 'Morning',
            'batch_id' => $this->morningBatch->id,
        ]);

        $eveningUser = User::factory()->create(['name' => 'Evening Candidate']);
        $eveningProfile = StudentProfile::create(['user_id' => $eveningUser->id, 'status' => 'applicant']);
        $eveningApp = Application::create([
            'student_profile_id' => $eveningProfile->id,
            'course_id' => $this->course->id,
            'admission_campaign_id' => $this->campaign->id,
            'application_number' => 'APP-E-202',
            'status' => 'submitted',
            'shift' => 'Evening',
            'batch_id' => $this->eveningBatch->id,
        ]);

        // Filter Evening
        $responseEvening = $this->actingAs($this->clerk)->get(route('clerk.applications.index', ['shift' => 'Evening']));
        $responseEvening->assertOk();
        $responseEvening->assertInertia(fn ($page) => $page
            ->has('applications.data', 1)
            ->where('applications.data.0.id', $eveningApp->id)
            ->where('shiftStats.morning', 1)
            ->where('shiftStats.evening', 1)
            ->where('shiftStats.total', 2)
        );

        // Filter Morning
        $responseMorning = $this->actingAs($this->clerk)->get(route('clerk.applications.index', ['shift' => 'Morning']));
        $responseMorning->assertOk();
        $responseMorning->assertInertia(fn ($page) => $page
            ->has('applications.data', 1)
            ->where('applications.data.0.id', $morningApp->id)
        );
    }

    public function test_admin_and_clerk_can_configure_course_offered_shifts(): void
    {
        // 1. Admin configures course to Morning only
        $responseAdmin = $this->actingAs($this->superAdmin)->post(route('admin.organization.courses.update', $this->course->id), [
            '_method' => 'patch',
            'trade_id' => $this->course->trade_id,
            'name' => 'Full-Stack Web Development',
            'entry_level' => 'Matric',
            'offered_shifts' => 'Morning',
        ]);
        $responseAdmin->assertSessionHasNoErrors();
        $this->course->refresh();
        $this->assertEquals('Morning', $this->course->offered_shifts);

        // 2. Clerk configures course to Evening only
        $responseClerk = $this->actingAs($this->clerk)->post(route('clerk.courses.update', $this->course->id), [
            '_method' => 'patch',
            'trade_id' => $this->course->trade_id,
            'name' => 'Full-Stack Web Development',
            'entry_level' => 'Matric',
            'admission_type' => 'first_come_first_served',
            'offered_shifts' => 'Evening',
        ]);
        $responseClerk->assertSessionHasNoErrors();
        $this->course->refresh();
        $this->assertEquals('Evening', $this->course->offered_shifts);
    }

    public function test_student_application_is_validated_against_course_offered_shifts(): void
    {
        Storage::fake('local');
        $cnicFile = UploadedFile::fake()->create('cnic_front.jpg', 1024, 'image/jpeg');
        $matricFile = UploadedFile::fake()->create('matric_cert.pdf', 1024, 'application/pdf');

        // Configure course as Morning only
        $this->course->update(['offered_shifts' => 'Morning']);

        // Student tries to submit for Evening shift
        $responseInvalid = $this->actingAs($this->student)->post(route('student.application.store'), [
            'course_id' => $this->course->id,
            'shift' => 'Evening',
            'cnic' => '31202-1234567-1',
            'father_name' => 'Candidate Father',
            'matric_total_marks' => 1100,
            'matric_obtained_marks' => 880,
            'cnic_document' => $cnicFile,
            'academic_document' => $matricFile,
        ]);
        $responseInvalid->assertSessionHasErrors(['shift']);

        // Student submits with valid Morning shift
        $responseValid = $this->actingAs($this->student)->post(route('student.application.store'), [
            'course_id' => $this->course->id,
            'shift' => 'Morning',
            'cnic' => '31202-1234567-1',
            'father_name' => 'Candidate Father',
            'matric_total_marks' => 1100,
            'matric_obtained_marks' => 880,
            'cnic_document' => $cnicFile,
            'academic_document' => $matricFile,
        ]);
        $responseValid->assertSessionHasNoErrors();
        $this->assertDatabaseHas('applications', [
            'course_id' => $this->course->id,
            'shift' => 'Morning',
            'batch_id' => $this->morningBatch->id,
        ]);
    }

    public function test_clerk_can_switch_applicant_shift_and_batch_is_reassigned(): void
    {
        $profile = StudentProfile::where('user_id', $this->student->id)->first();

        $application = Application::create([
            'student_profile_id' => $profile->id,
            'course_id' => $this->course->id,
            'admission_campaign_id' => $this->campaign->id,
            'application_number' => 'APP-SWITCH-001',
            'status' => 'submitted',
            'shift' => 'Morning',
            'batch_id' => $this->morningBatch->id,
        ]);

        // Clerk switches shift to Evening
        $response = $this->actingAs($this->clerk)->post(route('clerk.applications.switch-shift', $application->id), [
            'shift' => 'Evening',
        ]);

        $response->assertSessionHasNoErrors();
        $application->refresh();

        $this->assertEquals('Evening', $application->shift);
        $this->assertEquals($this->eveningBatch->id, $application->batch_id);
    }
}
