<?php

namespace Tests\Feature;

use App\Domains\Identity\Models\Role;
use App\Domains\Identity\Models\User;
use App\Domains\Operations\Models\Announcement;
use App\Domains\Organization\Models\Institute;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAnnouncementBroadcastTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $clerk;
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

        $this->student = User::factory()->create([
            'email' => 'student@gtti.edu.pk',
            'name' => 'Muhammad Usman Tariq',
            'institute_id' => $institute->id,
        ]);
        $this->student->roles()->attach($studentRole);
    }

    public function test_admin_can_view_announcements_index_page(): void
    {
        Announcement::create([
            'created_by' => $this->superAdmin->id,
            'title' => 'Midterm Examination Schedule Notice',
            'message' => 'All students must report to examination hall on Monday.',
            'target_audience' => 'all',
        ]);

        $response = $this->actingAs($this->superAdmin)->get(route('admin.announcements.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Announcements/Index')
            ->has('announcements', 1)
        );
    }

    public function test_admin_can_publish_and_broadcast_announcement(): void
    {
        $response = $this->actingAs($this->superAdmin)->post(route('admin.announcements.store'), [
            'title' => 'Urgent Electrical Practical Session Notice',
            'message' => 'Bring safety goggles and insulated tools.',
            'target_audience' => 'students',
            'expires_at' => now()->addDays(7)->format('Y-m-d'),
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('announcements', [
            'title' => 'Urgent Electrical Practical Session Notice',
            'target_audience' => 'students',
            'created_by' => $this->superAdmin->id,
        ]);
    }

    public function test_admin_can_revoke_and_delete_announcement(): void
    {
        $announcement = Announcement::create([
            'created_by' => $this->superAdmin->id,
            'title' => 'Obsolete Notice to Revoke',
            'message' => 'This announcement will be revoked by the administrator.',
            'target_audience' => 'staff',
        ]);

        $response = $this->actingAs($this->superAdmin)->delete(route('admin.announcements.destroy', $announcement->id));

        $response->assertRedirect();
        $this->assertSoftDeleted('announcements', [
            'id' => $announcement->id,
        ]);
    }

    public function test_clerk_and_student_cannot_access_admin_announcements(): void
    {
        $clerkResponse = $this->actingAs($this->clerk)->get(route('admin.announcements.index'));
        $clerkResponse->assertForbidden();

        $studentResponse = $this->actingAs($this->student)->get(route('admin.announcements.index'));
        $studentResponse->assertForbidden();
    }
}
