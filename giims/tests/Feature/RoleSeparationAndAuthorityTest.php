<?php

namespace Tests\Feature;

use App\Domains\Identity\Models\Role;
use App\Domains\Identity\Models\User;
use App\Domains\Organization\Models\Institute;
use App\Domains\Student\Models\StudentProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleSeparationAndAuthorityTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $clerk;
    protected User $teacher;
    protected User $student;

    protected function setUp(): void
    {
        parent::setUp();

        $institute = Institute::create([
            'name' => 'Government Technical Training Institute',
            'code' => 'GTTI-RYK',
            'is_active' => true,
        ]);

        $superAdminRole = Role::firstOrCreate(['slug' => 'super-admin'], ['name' => 'Super Admin', 'is_system' => true]);
        $clerkRole = Role::firstOrCreate(['slug' => 'clerk'], ['name' => 'Clerk / Admission Officer', 'is_system' => false]);
        $teacherRole = Role::firstOrCreate(['slug' => 'teacher'], ['name' => 'Teacher / Examiner', 'is_system' => false]);
        $studentRole = Role::firstOrCreate(['slug' => 'student'], ['name' => 'Student / Trainee', 'is_system' => false]);

        $this->superAdmin = User::factory()->create([
            'email' => 'admin@gtti.edu.pk',
            'name' => 'Principal / Super Admin',
            'institute_id' => $institute->id,
        ]);
        $this->superAdmin->roles()->attach($superAdminRole);

        $this->clerk = User::factory()->create([
            'email' => 'clerk@gtti.edu.pk',
            'name' => 'Admissions Clerk Officer',
            'institute_id' => $institute->id,
        ]);
        $this->clerk->roles()->attach($clerkRole);

        $this->teacher = User::factory()->create([
            'email' => 'teacher@gtti.edu.pk',
            'name' => 'Engr. Tariq Mehmood',
            'institute_id' => $institute->id,
        ]);
        $this->teacher->roles()->attach($teacherRole);

        $this->student = User::factory()->create([
            'email' => 'student@gtti.edu.pk',
            'name' => 'Muhammad Usman Tariq',
            'institute_id' => $institute->id,
        ]);
        $this->student->roles()->attach($studentRole);
        StudentProfile::create([
            'user_id' => $this->student->id,
            'registration_number' => 'STU-2026-001',
            'status' => 'enrolled',
        ]);
    }

    public function test_super_admin_login_redirects_to_admin_dashboard(): void
    {
        $response = $this->post(route('login'), [
            'email' => $this->superAdmin->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('admin.dashboard'));
    }

    public function test_super_admin_visiting_root_dashboard_redirects_to_admin_dashboard(): void
    {
        $response = $this->actingAs($this->superAdmin)->get(route('dashboard'));
        $response->assertRedirect(route('admin.dashboard'));
    }

    public function test_clerk_login_redirects_to_clerk_dashboard(): void
    {
        $response = $this->post(route('login'), [
            'email' => $this->clerk->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('clerk.dashboard'));
    }

    public function test_clerk_visiting_root_dashboard_redirects_to_clerk_dashboard(): void
    {
        $response = $this->actingAs($this->clerk)->get(route('dashboard'));
        $response->assertRedirect(route('clerk.dashboard'));
    }

    public function test_clerk_is_blocked_from_admin_dashboard(): void
    {
        $response = $this->actingAs($this->clerk)->get(route('admin.dashboard'));
        $response->assertStatus(403);
    }

    public function test_super_admin_has_overarching_authority_to_inspect_clerk_dashboard(): void
    {
        $response = $this->actingAs($this->superAdmin)->get(route('clerk.dashboard'));
        $response->assertOk();
    }

    public function test_teacher_login_redirects_to_teacher_dashboard(): void
    {
        $response = $this->post(route('login'), [
            'email' => $this->teacher->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('teacher.dashboard'));
    }

    public function test_teacher_visiting_root_dashboard_redirects_to_teacher_dashboard(): void
    {
        $response = $this->actingAs($this->teacher)->get(route('dashboard'));
        $response->assertRedirect(route('teacher.dashboard'));
    }

    public function test_student_visiting_root_dashboard_renders_student_dashboard(): void
    {
        $response = $this->actingAs($this->student)->get(route('dashboard'));
        $response->assertOk();
    }
}
