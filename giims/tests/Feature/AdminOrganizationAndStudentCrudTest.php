<?php

namespace Tests\Feature;

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
use Tests\TestCase;

class AdminOrganizationAndStudentCrudTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $studentUser;
    protected Institute $institute;
    protected Department $department;
    protected Program $program;
    protected Trade $trade;
    protected Course $course;
    protected Batch $batch;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        $studentRole = Role::firstOrCreate(['slug' => 'student'], ['name' => 'Student']);

        $this->institute = Institute::create([
            'name' => 'Govt Technical Training Institute RYK',
            'code' => 'GTTI-RYK',
            'is_active' => true,
        ]);

        $this->admin = User::factory()->create([
            'name' => 'Principal Office',
            'institute_id' => $this->institute->id,
        ]);
        $this->admin->roles()->attach($adminRole);

        $this->department = Department::create([
            'institute_id' => $this->institute->id,
            'name' => 'Information Technology',
            'code' => 'IT',
            'is_active' => true,
        ]);

        $this->program = Program::create([
            'department_id' => $this->department->id,
            'name' => 'G-II Certificate',
            'type' => 'certificate',
            'duration_months' => 12,
        ]);

        $this->trade = Trade::create([
            'program_id' => $this->program->id,
            'name' => 'Computer Applications',
            'code' => 'CA',
        ]);

        $this->course = Course::create([
            'trade_id' => $this->trade->id,
            'name' => 'Web Development',
            'entry_level' => 'Matric',
            'is_active' => true,
        ]);

        $this->batch = Batch::create([
            'course_id' => $this->course->id,
            'name' => 'WD-2026-A',
            'session_year' => '2026-2027',
            'shift' => 'morning',
            'start_date' => now()->subMonth(),
            'end_date' => now()->addMonths(5),
        ]);

        $this->studentUser = User::factory()->create(['institute_id' => $this->institute->id]);
        $this->studentUser->roles()->attach($studentRole);
    }

    // =========================================================================
    // ORGANIZATION & COURSE CRUD TESTS
    // =========================================================================

    public function test_admin_can_view_organization_index(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.organization.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Organization/Index')
            ->has('departments')
            ->has('allDepartments')
            ->has('allPrograms')
            ->has('allTrades')
            ->has('allCourses')
        );
    }

    public function test_admin_can_create_new_course(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.organization.courses.store'), [
            'trade_id' => $this->trade->id,
            'name' => 'Python Programming & AI Basics',
            'entry_level' => 'Intermediate',
            'is_active' => true,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('courses', [
            'trade_id' => $this->trade->id,
            'name' => 'Python Programming & AI Basics',
            'entry_level' => 'Intermediate',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_update_course(): void
    {
        $response = $this->actingAs($this->admin)->patch(route('admin.organization.courses.update', $this->course->id), [
            'trade_id' => $this->trade->id,
            'name' => 'Advanced Full-Stack Web Development',
            'entry_level' => 'Matric (Science)',
            'is_active' => false,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->course->refresh();
        $this->assertEquals('Advanced Full-Stack Web Development', $this->course->name);
        $this->assertEquals('Matric (Science)', $this->course->entry_level);
        $this->assertFalse($this->course->is_active);
    }

    public function test_admin_can_delete_course(): void
    {
        $response = $this->actingAs($this->admin)->delete(route('admin.organization.courses.destroy', $this->course->id));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertSoftDeleted('courses', [
            'id' => $this->course->id,
        ]);
    }

    public function test_admin_can_create_department(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.organization.departments.store'), [
            'name' => 'Mechanical & Automotive Engineering',
            'code' => 'MECH',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('departments', [
            'name' => 'Mechanical & Automotive Engineering',
            'code' => 'MECH',
        ]);
    }

    public function test_admin_can_create_program_trade_and_batch(): void
    {
        // 1. Program
        $progRes = $this->actingAs($this->admin)->post(route('admin.organization.programs.store'), [
            'department_id' => $this->department->id,
            'name' => 'CBT&A Level 2 Certificate',
            'type' => 'certificate',
            'duration_months' => 6,
        ]);
        $progRes->assertRedirect();
        $this->assertDatabaseHas('programs', ['name' => 'CBT&A Level 2 Certificate']);

        $program = Program::where('name', 'CBT&A Level 2 Certificate')->first();

        // 2. Trade
        $tradeRes = $this->actingAs($this->admin)->post(route('admin.organization.trades.store'), [
            'program_id' => $program->id,
            'name' => 'Graphic Design',
            'code' => 'GD',
        ]);
        $tradeRes->assertRedirect();
        $this->assertDatabaseHas('trades', ['name' => 'Graphic Design']);

        // 3. Batch
        $batchRes = $this->actingAs($this->admin)->post(route('admin.organization.batches.store'), [
            'course_id' => $this->course->id,
            'name' => 'WD-2026-EVE',
            'session_year' => '2026-2027',
            'shift' => 'evening',
        ]);
        $batchRes->assertRedirect();
        $this->assertDatabaseHas('batches', ['name' => 'WD-2026-EVE', 'shift' => 'evening']);
    }

    // =========================================================================
    // MANUAL STUDENT CRUD TESTS
    // =========================================================================

    public function test_admin_can_manually_register_and_enroll_student(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.students.manual-store'), [
            'name' => 'Kashif Mehmood',
            'email' => 'kashif.student@test.gtti',
            'password' => 'pass1234',
            'phone' => '03009876543',
            'cnic' => '31202-9988776-1',
            'father_name' => 'Mehmood Ul Hassan',
            'date_of_birth' => '2005-04-12',
            'gender' => 'male',
            'domicile_district' => 'Rahim Yar Khan',
            'emergency_contact' => '03001122334',
            'address' => 'Model Town, RYK',
            'course_id' => $this->course->id,
            'batch_id' => $this->batch->id,
            'registration_number' => 'GTTI-2026-7777',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Check user identity created
        $user = User::where('email', 'kashif.student@test.gtti')->first();
        $this->assertNotNull($user);
        $this->assertEquals('Kashif Mehmood', $user->name);
        $this->assertTrue($user->roles->contains('slug', 'student'));

        // Check student profile created
        $profile = StudentProfile::where('user_id', $user->id)->first();
        $this->assertNotNull($profile);
        $this->assertEquals('GTTI-2026-7777', $profile->registration_number);
        $this->assertEquals('Mehmood Ul Hassan', $profile->father_name);

        // Check enrollment created
        $this->assertDatabaseHas('enrollments', [
            'student_profile_id' => $profile->id,
            'course_id' => $this->course->id,
            'batch_id' => $this->batch->id,
            'enrollment_number' => 'GTTI-2026-7777',
            'status' => 'active',
        ]);
    }

    public function test_admin_can_edit_student_record(): void
    {
        $profile = StudentProfile::create([
            'user_id' => $this->studentUser->id,
            'registration_number' => 'GTTI-2026-1234',
            'father_name' => 'Original Father Name',
            'status' => 'active',
        ]);

        $enrollment = Enrollment::create([
            'student_profile_id' => $profile->id,
            'course_id' => $this->course->id,
            'batch_id' => $this->batch->id,
            'enrollment_number' => 'GTTI-2026-1234',
            'enrollment_date' => now()->toDateString(),
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->admin)->patch(route('admin.students.update', $enrollment->id), [
            'name' => 'Updated Student Name',
            'email' => $this->studentUser->email,
            'phone' => '03001239999',
            'cnic' => '31202-0000000-1',
            'father_name' => 'Updated Father Name',
            'date_of_birth' => '2004-01-01',
            'gender' => 'male',
            'domicile_district' => 'Rahim Yar Khan',
            'emergency_contact' => '03009999999',
            'address' => 'Updated Address',
            'course_id' => $this->course->id,
            'batch_id' => $this->batch->id,
            'status' => 'suspended',
            'registration_number' => 'GTTI-2026-1234',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->studentUser->refresh();
        $this->assertEquals('Updated Student Name', $this->studentUser->name);

        $profile->refresh();
        $this->assertEquals('Updated Father Name', $profile->father_name);

        $enrollment->refresh();
        $this->assertEquals('suspended', $enrollment->status);
    }

    public function test_admin_can_delete_student_record(): void
    {
        $profile = StudentProfile::create([
            'user_id' => $this->studentUser->id,
            'registration_number' => 'GTTI-2026-5555',
            'father_name' => 'Father',
            'status' => 'active',
        ]);

        $enrollment = Enrollment::create([
            'student_profile_id' => $profile->id,
            'course_id' => $this->course->id,
            'batch_id' => $this->batch->id,
            'enrollment_number' => 'GTTI-2026-5555',
            'enrollment_date' => now()->toDateString(),
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->admin)->delete(route('admin.students.destroy', $enrollment->id));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertSoftDeleted('enrollments', ['id' => $enrollment->id]);
    }

    public function test_student_cannot_access_admin_organization_or_student_management(): void
    {
        $response = $this->actingAs($this->studentUser)->get(route('admin.organization.index'));
        $response->assertForbidden();

        $createRes = $this->actingAs($this->studentUser)->post(route('admin.organization.courses.store'), [
            'trade_id' => $this->trade->id,
            'name' => 'Unauthorized Course',
            'entry_level' => 'Matric',
        ]);
        $createRes->assertForbidden();

        $manualRes = $this->actingAs($this->studentUser)->post(route('admin.students.manual-store'), [
            'name' => 'Hacker Student',
            'email' => 'hacker@test.com',
            'father_name' => 'None',
            'course_id' => $this->course->id,
            'batch_id' => $this->batch->id,
        ]);
        $manualRes->assertForbidden();
    }
}
