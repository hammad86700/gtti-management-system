<?php

namespace Tests\Feature;

use App\Domains\Identity\Models\Role;
use App\Domains\Organization\Models\Batch;
use App\Domains\Organization\Models\Course;
use App\Domains\Organization\Models\Department;
use App\Domains\Organization\Models\Institute;
use App\Domains\Organization\Models\Program;
use App\Domains\Organization\Models\Trade;
use App\Domains\Identity\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AcademicAllocationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $teacher;
    protected Batch $batch;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['slug' => 'super-admin'], ['name' => 'Super Admin', 'is_system' => true]);
        $teacherRole = Role::firstOrCreate(['slug' => 'teacher'], ['name' => 'Teacher', 'is_system' => false]);

        $institute = Institute::create([
            'name' => 'Govt Technical Training Institute',
            'code' => 'GTTI-RYK',
            'is_active' => true,
        ]);

        $this->admin = User::factory()->create(['institute_id' => $institute->id]);
        $this->admin->roles()->attach($adminRole->id);

        $this->teacher = User::factory()->create([
            'name' => 'Engr. Test Instructor',
            'email' => 'instructor@gtti.edu.pk',
            'institute_id' => $institute->id,
        ]);
        $this->teacher->roles()->attach($teacherRole->id);

        $department = Department::create([
            'institute_id' => $institute->id,
            'name' => 'Electrical Dept',
            'code' => 'EE',
        ]);

        $program = Program::create([
            'department_id' => $department->id,
            'name' => 'Diploma Program',
            'type' => 'G-II',
            'duration_months' => 24,
        ]);

        $trade = Trade::create([
            'program_id' => $program->id,
            'name' => 'Electrician Trade',
            'code' => 'ELEC',
        ]);

        $course = Course::create([
            'trade_id' => $trade->id,
            'name' => 'Electrician Certificate',
            'entry_level' => 'Matric',
            'is_active' => true,
        ]);

        $this->batch = Batch::create([
            'course_id' => $course->id,
            'name' => 'Fall 2026 Batch A',
            'session_year' => '2026-2027',
            'shift' => 'Morning',
            'start_date' => '2026-09-01',
            'end_date' => '2027-08-31',
        ]);
    }

    public function test_admin_can_view_allocations_index_page(): void
    {
        $response = $this->actingAs($this->admin)->get(route('allocations.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Allocations/Index')
            ->has('batches')
            ->has('teachers')
        );

        // Assert admin.allocations.index alias route also works
        $aliasResponse = $this->actingAs($this->admin)->get(route('admin.allocations.index'));
        $aliasResponse->assertStatus(200);
    }

    public function test_admin_can_assign_teacher_to_batch(): void
    {
        $payload = [
            'batch_id' => $this->batch->id,
            'user_id' => $this->teacher->id,
        ];

        $response = $this->actingAs($this->admin)->post(route('allocations.store'), $payload);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Check pivot table batch_user
        $this->assertDatabaseHas('batch_user', [
            'batch_id' => $this->batch->id,
            'user_id' => $this->teacher->id,
        ]);

        // Verify Batch model relationship
        $this->batch->refresh();
        $this->assertTrue($this->batch->users->contains($this->teacher->id));
        $this->assertTrue($this->batch->teachers->contains($this->teacher->id));
    }

    public function test_assigned_batch_appears_immediately_on_teacher_dashboard(): void
    {
        // Assign teacher to batch
        $this->batch->users()->syncWithoutDetaching([$this->teacher->id]);

        // Check user batches relation directly
        $this->assertTrue($this->teacher->batches->contains($this->batch->id));

        // Act as teacher and visit teacher.dashboard
        $response = $this->actingAs($this->teacher)->get(route('teacher.dashboard'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Teacher/Dashboard')
            ->has('batches', 1)
            ->where('batches.0.id', $this->batch->id)
            ->where('batches.0.name', 'Fall 2026 Batch A')
        );
    }

    public function test_assigning_same_teacher_twice_does_not_duplicate_entry(): void
    {
        $payload = [
            'batch_id' => $this->batch->id,
            'user_id' => $this->teacher->id,
        ];

        // First assignment
        $this->actingAs($this->admin)->post(route('allocations.store'), $payload);

        // Second assignment of the same teacher to the same batch
        $response = $this->actingAs($this->admin)->post(route('allocations.store'), $payload);
        $response->assertRedirect();

        $count = DB::table('batch_user')
            ->where('batch_id', $this->batch->id)
            ->where('user_id', $this->teacher->id)
            ->count();

        $this->assertEquals(1, $count);
    }

    public function test_admin_can_unassign_teacher_from_batch(): void
    {
        // Pre-assign teacher
        $this->batch->users()->syncWithoutDetaching([$this->teacher->id]);
        $this->assertDatabaseHas('batch_user', [
            'batch_id' => $this->batch->id,
            'user_id' => $this->teacher->id,
        ]);

        // Destroy allocation
        $response = $this->actingAs($this->admin)->delete(
            route('allocations.destroy', ['batch' => $this->batch->id, 'user' => $this->teacher->id])
        );

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('batch_user', [
            'batch_id' => $this->batch->id,
            'user_id' => $this->teacher->id,
        ]);

        $this->batch->refresh();
        $this->assertFalse($this->batch->users->contains($this->teacher->id));
    }

    public function test_allocation_store_validates_required_fields(): void
    {
        $response = $this->actingAs($this->admin)->post(route('allocations.store'), []);
        $response->assertSessionHasErrors(['batch_id', 'user_id']);

        $responseInvalid = $this->actingAs($this->admin)->post(route('allocations.store'), [
            'batch_id' => 999999,
            'user_id' => 999999,
        ]);
        $responseInvalid->assertSessionHasErrors(['batch_id', 'user_id']);
    }
}
