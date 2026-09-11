<?php

namespace Tests\Feature;

use App\Domains\Operations\Models\Announcement;
use App\Domains\Admissions\Models\AdmissionCampaign;
use App\Domains\Admissions\Models\Application;
use App\Domains\Identity\Models\Role;
use App\Domains\Identity\Models\User;
use App\Domains\Organization\Models\Course;
use App\Domains\Organization\Models\Department;
use App\Domains\Organization\Models\Institute;
use App\Domains\Organization\Models\Program;
use App\Domains\Organization\Models\Trade;
use App\Domains\Student\Models\StudentProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClerkAdmissionPortalTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $clerk;
    protected User $studentUser;
    protected StudentProfile $studentProfile;
    protected Course $course;
    protected AdmissionCampaign $campaign;
    protected Application $application;

    protected function setUp(): void
    {
        parent::setUp();

        $superAdminRole = Role::firstOrCreate(['slug' => 'super-admin'], ['name' => 'Super Admin', 'is_system' => true]);
        $clerkRole = Role::firstOrCreate(['slug' => 'clerk'], ['name' => 'Clerk / Admission Officer', 'is_system' => false]);
        $studentRole = Role::firstOrCreate(['slug' => 'student'], ['name' => 'Student', 'is_system' => false]);

        $institute = Institute::create([
            'name' => 'GTTI Rahim Yar Khan',
            'code' => 'GTTI-RYK',
            'is_active' => true,
        ]);

        $this->superAdmin = User::factory()->create(['name' => 'Super Administrator']);
        $this->superAdmin->roles()->attach($superAdminRole);

        $this->clerk = User::factory()->create(['name' => 'Muhammad Asif (Clerk)']);
        $this->clerk->roles()->attach($clerkRole);

        $this->studentUser = User::factory()->create([
            'name' => 'Bilal Ahmed',
            'cnic' => '31201-9988776-1',
        ]);
        $this->studentUser->roles()->attach($studentRole);

        $this->studentProfile = StudentProfile::create([
            'user_id' => $this->studentUser->id,
            'registration_number' => 'GTTI-APP-2026',
            'father_name' => 'Ahmed Khan',
            'status' => 'applicant',
        ]);

        $dept = Department::create(['institute_id' => $institute->id, 'name' => 'Information Technology', 'code' => 'IT']);
        $prog = Program::create(['department_id' => $dept->id, 'name' => 'DIT', 'type' => 'diploma', 'duration_months' => 24]);
        $trade = Trade::create(['program_id' => $prog->id, 'name' => 'Computer Applications', 'code' => 'CA']);

        $this->course = Course::create([
            'trade_id' => $trade->id,
            'name' => 'Computer Operator & IT',
            'entry_level' => 'Matric',
            'admission_type' => 'merit_based',
            'matric_weightage' => 50,
            'test_weightage' => 50,
            'is_active' => true,
        ]);

        $this->campaign = AdmissionCampaign::create([
            'institute_id' => $institute->id,
            'name' => 'Fall 2026 Admissions',
            'start_date' => now()->subMonth(),
            'end_date' => now()->addMonth(),
            'is_active' => true,
        ]);

        $this->application = Application::create([
            'admission_campaign_id' => $this->campaign->id,
            'student_profile_id' => $this->studentProfile->id,
            'course_id' => $this->course->id,
            'application_number' => 'APP-2026-0001',
            'status' => 'submitted',
        ]);
    }

    public function test_super_admin_can_assign_clerk_role_to_staff(): void
    {
        $clerkRole = Role::where('slug', 'clerk')->first();

        $response = $this->actingAs($this->superAdmin)->post(route('admin.staff.store'), [
            'name' => 'New Admission Clerk',
            'email' => 'newclerk@gtti.edu.pk',
            'password' => 'SecurePass123!',
            'role_id' => $clerkRole->id,
            'father_name' => 'Clerk Father',
            'cnic' => '31202-3344556-7',
            'phone' => '03001234567',
            'dob' => '1992-05-10',
            'gender' => 'male',
            'designation' => 'Admission Clerk',
            'employment_type' => 'regular',
            'joining_date' => '2023-01-15',
            'highest_qualification' => 'Bachelor of Commerce',
            'residential_address' => 'GTTI Staff Colony, Rahim Yar Khan',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['email' => 'newclerk@gtti.edu.pk']);

        $createdUser = User::where('email', 'newclerk@gtti.edu.pk')->first();
        $this->assertTrue($createdUser->roles->contains('slug', 'clerk'));
    }

    public function test_clerk_can_access_clerk_dashboard(): void
    {
        $response = $this->actingAs($this->clerk)->get(route('clerk.dashboard'));
        $response->assertOk();
    }

    public function test_unauthorized_student_blocked_from_clerk_portal(): void
    {
        $response = $this->actingAs($this->studentUser)->get(route('clerk.dashboard'));
        $response->assertForbidden();
    }

    public function test_clerk_can_create_and_update_courses(): void
    {
        $trade = Trade::first();

        // 1. Create Course
        $createRes = $this->actingAs($this->clerk)->post(route('clerk.courses.store'), [
            'trade_id' => $trade->id,
            'name' => 'AutoCAD & 3D Modeling',
            'entry_level' => 'Matric with Science',
            'admission_type' => 'merit_based',
            'matric_weightage' => 40,
            'test_weightage' => 60,
            'is_active' => true,
        ]);

        $createRes->assertRedirect();
        $this->assertDatabaseHas('courses', ['name' => 'AutoCAD & 3D Modeling']);

        $course = Course::where('name', 'AutoCAD & 3D Modeling')->first();

        // 2. Update Course
        $updateRes = $this->actingAs($this->clerk)->patch(route('clerk.courses.update', $course->id), [
            'trade_id' => $trade->id,
            'name' => 'AutoCAD & Architectural Drafting',
            'entry_level' => 'Matric',
            'admission_type' => 'first_come_first_served',
            'matric_weightage' => 50,
            'test_weightage' => 50,
            'is_active' => true,
        ]);

        $updateRes->assertRedirect();
        $course->refresh();
        $this->assertEquals('AutoCAD & Architectural Drafting', $course->name);
        $this->assertEquals('first_come_first_served', $course->admission_type);

        // 3. Update Course via POST (FormData method spoofing / multipart submission)
        $postUpdateRes = $this->actingAs($this->clerk)->post(route('clerk.courses.update', $course->id), [
            '_method' => 'patch',
            'trade_id' => $trade->id,
            'name' => 'AutoCAD & Architectural Drafting (Updated)',
            'entry_level' => 'Matric',
            'admission_type' => 'merit_based',
            'requires_entrance_test' => 'true',
            'intake_capacity' => 60,
            'is_published' => 'true',
            'is_active' => 'true',
        ]);

        $postUpdateRes->assertRedirect();
        $course->refresh();
        $this->assertEquals('AutoCAD & Architectural Drafting (Updated)', $course->name);
        $this->assertEquals(60, $course->intake_capacity);

        // 4. Test 1-click toggle publish
        $this->assertTrue($course->is_published);
        $toggleRes = $this->actingAs($this->clerk)->post(route('clerk.courses.toggle-publish', $course->id));
        $toggleRes->assertRedirect();
        $course->refresh();
        $this->assertFalse($course->is_published);

        // Toggle back to published
        $toggleBackRes = $this->actingAs($this->clerk)->post(route('clerk.courses.toggle-publish', $course->id));
        $toggleBackRes->assertRedirect();
        $course->refresh();
        $this->assertTrue($course->is_published);
    }

    public function test_clerk_can_verify_applicant_dossier(): void
    {
        $response = $this->actingAs($this->clerk)->post(route('clerk.applications.verify', $this->application->id));

        $response->assertRedirect();
        $this->application->refresh();

        $this->assertEquals('verified', $this->application->status);
        $this->assertEquals($this->clerk->id, $this->application->scrutinized_by);
        $this->assertNotNull($this->application->scrutinized_at);
        $this->assertNull($this->application->clerk_remarks);
    }

    public function test_clerk_can_reject_applicant_with_mandatory_remarks(): void
    {
        // Must reject without remarks
        $invalidRes = $this->actingAs($this->clerk)->post(route('clerk.applications.reject', $this->application->id), [
            'clerk_remarks' => '',
        ]);
        $invalidRes->assertSessionHasErrors('clerk_remarks');

        // Valid rejection
        $validRes = $this->actingAs($this->clerk)->post(route('clerk.applications.reject', $this->application->id), [
            'clerk_remarks' => 'Incomplete Matric marksheet and domicile certificate expired.',
        ]);

        $validRes->assertRedirect();
        $this->application->refresh();

        $this->assertEquals('rejected', $this->application->status);
        $this->assertEquals('Incomplete Matric marksheet and domicile certificate expired.', $this->application->clerk_remarks);
        $this->assertEquals($this->clerk->id, $this->application->scrutinized_by);
    }

    public function test_clerk_can_bulk_schedule_entrance_test_for_course_applicants(): void
    {
        $testDate = now()->addDays(5)->toDateString();

        $response = $this->actingAs($this->clerk)->post(route('clerk.scheduler.broadcast'), [
            'course_id' => $this->course->id,
            'test_date' => $testDate,
            'test_time' => '10:00 AM Sharp',
            'test_venue' => 'Main IT Lab 2',
            'clerk_notice' => 'Bring original CNIC and Matric certificate.',
        ]);

        $response->assertRedirect();
        $this->application->refresh();

        $this->assertEquals($testDate, $this->application->test_date->toDateString());
        $this->assertEquals('10:00 AM Sharp', $this->application->test_time);
        $this->assertEquals('Main IT Lab 2', $this->application->test_venue);
        $this->assertEquals('Bring original CNIC and Matric certificate.', $this->application->clerk_notice);

        // Assert broadcast announcement exists
        $this->assertDatabaseHas('announcements', [
            'created_by' => $this->clerk->id,
            'target_audience' => 'students',
        ]);
    }

    public function test_student_dashboard_displays_official_call_letter_when_test_scheduled(): void
    {
        $this->application->update([
            'test_date' => now()->addDays(3)->toDateString(),
            'test_time' => '09:00 AM',
            'test_venue' => 'Computer Lab 1',
            'clerk_notice' => 'Please arrive 15 minutes before test time.',
        ]);

        $response = $this->actingAs($this->studentUser)->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_admin_dashboard_displays_clerical_operations_audit_data(): void
    {
        // Create a rejected application with remarks
        $this->application->update([
            'status' => 'rejected',
            'clerk_remarks' => 'Invalid Matric result card',
            'scrutinized_by' => $this->clerk->id,
            'scrutinized_at' => now(),
        ]);

        $response = $this->actingAs($this->superAdmin)->get(route('admin.dashboard'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('stats.scrutinized_today')
            ->has('stats.tests_scheduled_by_clerk')
            ->has('recentRejectedApplications')
        );
    }

    public function test_clerk_login_redirects_to_clerk_dashboard(): void
    {
        $response = $this->post(route('login'), [
            'email' => $this->clerk->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('clerk.dashboard'));

        // Direct hit on /dashboard also redirects to clerk.dashboard
        $dashResponse = $this->actingAs($this->clerk)->get(route('dashboard'));
        $dashResponse->assertRedirect(route('clerk.dashboard'));
    }

    public function test_dashboard_accurately_counts_pending_scrutiny_and_excludes_approved_fee_challans(): void
    {
        // 1. App with approved challan & confirmed admission (should NOT be counted in pending_fee_verifications)
        $this->application->update([
            'status' => 'admitted',
            'fee_status' => 'paid',
            'challan_receipt_path' => 'challan_receipts/test_receipt.png',
        ]);

        // 2. Second application with status 'pending' (MUST be counted in pending_scrutiny)
        $secondStudent = User::factory()->create(['name' => 'Waqas Ahmed', 'cnic' => '31303-8443289-1']);
        $secondProfile = StudentProfile::create([
            'user_id' => $secondStudent->id,
            'registration_number' => 'GTTI-APP-2027',
            'father_name' => 'M Ahmed',
            'domicile_district' => 'Rahim Yar Khan',
            'gender' => 'Male',
        ]);
        $secondApp = Application::create([
            'admission_campaign_id' => $this->campaign->id,
            'student_profile_id' => $secondProfile->id,
            'course_id' => $this->course->id,
            'shift' => 'Evening',
            'application_number' => 'APP-2026-TWLZ0P',
            'status' => 'pending',
            'fee_status' => 'unpaid',
            'matric_total_marks' => 1100,
            'matric_obtained_marks' => 900,
        ]);

        // Verify Clerk Dashboard stats
        $response = $this->actingAs($this->clerk)->get(route('clerk.dashboard'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Clerk/Dashboard')
            ->where('stats.pending_scrutiny', 1)
            ->where('stats.pending_fee_verifications', 0)
            ->where('stats.admitted_applications', 1)
        );

        // Verify Application Review filter with status=submitted captures status='pending'
        $reviewResponse = $this->actingAs($this->clerk)->get(route('clerk.applications.index', ['status' => 'submitted']));
        $reviewResponse->assertOk();
        $reviewResponse->assertInertia(fn ($page) => $page
            ->component('Clerk/Applications/Index')
            ->where('pendingScrutinyCount', 1)
            ->where('pendingFeeCount', 0)
            ->has('applications.data', 1)
            ->where('applications.data.0.id', $secondApp->id)
        );

        // Verify Application Review filter with status=confirmed captures status='admitted'
        $confirmedResponse = $this->actingAs($this->clerk)->get(route('clerk.applications.index', ['status' => 'confirmed']));
        $confirmedResponse->assertOk();
        $confirmedResponse->assertInertia(fn ($page) => $page
            ->component('Clerk/Applications/Index')
            ->has('applications.data', 1)
            ->where('applications.data.0.id', $this->application->id)
        );
    }
}
