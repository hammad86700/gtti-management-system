<?php

namespace Tests\Feature;

use App\Domains\Identity\Models\Role;
use App\Domains\Identity\Models\User;
use App\Domains\Operations\Models\DisciplineRecord;
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

class DisciplinaryStatusEngineTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $studentUser;
    protected StudentProfile $studentProfile;
    protected Course $course;
    protected Batch $batch;
    protected Enrollment $enrollment;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['slug' => 'super-admin'], ['name' => 'Super Administrator']);
        $studentRole = Role::firstOrCreate(['slug' => 'student'], ['name' => 'Student']);

        $institute = Institute::create([
            'name' => 'Govt Technical Training Institute RYK',
            'code' => 'GTTI-RYK',
            'is_active' => true,
        ]);

        $dept = Department::create(['institute_id' => $institute->id, 'name' => 'Information Technology', 'code' => 'IT']);
        $prog = Program::create(['department_id' => $dept->id, 'name' => 'DAE IT', 'type' => 'diploma', 'duration_months' => 36]);
        $trade = Trade::create(['program_id' => $prog->id, 'name' => 'Software Dev', 'code' => 'SD']);
        $this->course = Course::create(['trade_id' => $trade->id, 'name' => 'Web Development', 'entry_level' => 'Matric']);

        $this->batch = Batch::create([
            'course_id' => $this->course->id,
            'name' => 'WD-2026-A',
            'session_year' => '2026-2027',
            'shift' => 'morning',
            'start_date' => now()->subMonth(),
            'end_date' => now()->addMonths(5),
        ]);

        $this->admin = User::factory()->create(['name' => 'Principal Office']);
        $this->admin->roles()->attach($adminRole);

        $this->studentUser = User::factory()->create([
            'name' => 'Ali Raza',
            'email' => 'ali.raza@example.com',
            'cnic' => '31201-9988776-1',
        ]);
        $this->studentUser->roles()->attach($studentRole);

        $this->studentProfile = StudentProfile::create([
            'user_id' => $this->studentUser->id,
            'registration_number' => 'GTTI-2026-0042',
            'father_name' => 'Muhammad Raza',
            'status' => 'active',
        ]);

        $this->enrollment = Enrollment::create([
            'student_profile_id' => $this->studentProfile->id,
            'course_id' => $this->course->id,
            'batch_id' => $this->batch->id,
            'enrollment_number' => 'ENR-2026-0042',
            'enrollment_date' => now()->subWeeks(2),
            'status' => 'active',
        ]);
    }

    public function test_admin_can_strike_off_student_enrollment(): void
    {
        $response = $this->actingAs($this->admin)
            ->post(route('admin.discipline.enrollments.strike-off', $this->enrollment->id), [
                'days' => 14,
                'reason' => 'Severe uniform violation and consecutive unexcused absence.',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->enrollment->refresh();
        $this->studentProfile->refresh();

        $this->assertEquals('struck_off', $this->enrollment->status);
        $this->assertEquals(14, $this->enrollment->struck_off_days);
        $this->assertNotNull($this->enrollment->struck_off_at);
        $this->assertNotNull($this->enrollment->struck_off_until);
        $this->assertEquals('Severe uniform violation and consecutive unexcused absence.', $this->enrollment->disciplinary_reason);
        $this->assertEquals($this->admin->id, $this->enrollment->disciplined_by);

        // Profile sync
        $this->assertEquals('struck_off', $this->studentProfile->status);
        $this->assertEquals(14, $this->studentProfile->struck_off_days);

        // Discipline record logged
        $this->assertDatabaseHas('discipline_records', [
            'student_profile_id' => $this->studentProfile->id,
            'reported_by' => $this->admin->id,
            'severity' => 'major',
        ]);
    }

    public function test_admin_can_terminate_student_enrollment(): void
    {
        $response = $this->actingAs($this->admin)
            ->post(route('admin.discipline.enrollments.terminate', $this->enrollment->id), [
                'reason' => 'Violent conduct in workshop and destruction of public machinery.',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->enrollment->refresh();
        $this->studentProfile->refresh();

        $this->assertEquals('terminated', $this->enrollment->status);
        $this->assertNull($this->enrollment->struck_off_until);
        $this->assertEquals('Violent conduct in workshop and destruction of public machinery.', $this->enrollment->disciplinary_reason);
        $this->assertEquals($this->admin->id, $this->enrollment->disciplined_by);

        // Profile sync
        $this->assertEquals('terminated', $this->studentProfile->status);

        // Discipline record logged
        $this->assertDatabaseHas('discipline_records', [
            'student_profile_id' => $this->studentProfile->id,
            'reported_by' => $this->admin->id,
            'severity' => 'critical',
        ]);
    }

    public function test_admin_can_reinstate_sanctioned_student(): void
    {
        // First strike off
        $this->enrollment->update([
            'status' => 'struck_off',
            'struck_off_days' => 10,
            'struck_off_until' => now()->addDays(10),
            'disciplinary_reason' => 'Absence',
            'disciplined_by' => $this->admin->id,
        ]);
        $this->studentProfile->update(['status' => 'struck_off']);

        $response = $this->actingAs($this->admin)
            ->post(route('admin.discipline.enrollments.reinstate', $this->enrollment->id));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->enrollment->refresh();
        $this->studentProfile->refresh();

        $this->assertEquals('active', $this->enrollment->status);
        $this->assertNull($this->enrollment->struck_off_days);
        $this->assertNull($this->enrollment->struck_off_until);
        $this->assertNull($this->enrollment->disciplinary_reason);

        $this->assertEquals('active', $this->studentProfile->status);

        $this->assertDatabaseHas('discipline_records', [
            'student_profile_id' => $this->studentProfile->id,
            'severity' => 'minor',
            'title' => 'Official Disciplinary Reinstatement',
        ]);
    }

    public function test_admin_can_fetch_course_trainees_roster(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson(route('admin.organization.courses.students', $this->course->id));

        $response->assertOk();
        $response->assertJsonStructure([
            'target_type',
            'target_id',
            'target_name',
            'department_name',
            'trade_name',
            'students' => [
                '*' => [
                    'id',
                    'enrollment_number',
                    'status',
                    'name',
                    'father_name',
                    'cnic',
                    'roll_number',
                    'batch_name',
                ],
            ],
        ]);

        $this->assertCount(1, $response->json('students'));
        $this->assertEquals('Ali Raza', $response->json('students.0.name'));
    }

    public function test_admin_can_fetch_batch_trainees_roster(): void
    {
        $response = $this->actingAs($this->admin)
            ->getJson(route('admin.organization.batches.students', $this->batch->id));

        $response->assertOk();
        $response->assertJsonStructure([
            'target_type',
            'target_id',
            'target_name',
            'course_name',
            'students',
        ]);

        $this->assertCount(1, $response->json('students'));
        $this->assertEquals('Ali Raza', $response->json('students.0.name'));
    }

    public function test_struck_off_student_is_locked_out_of_functional_modules(): void
    {
        $this->enrollment->update([
            'status' => 'struck_off',
            'struck_off_days' => 7,
            'struck_off_until' => now()->addDays(7),
        ]);
        $this->studentProfile->update([
            'status' => 'struck_off',
            'struck_off_days' => 7,
            'struck_off_until' => now()->addDays(7),
        ]);

        $response = $this->actingAs($this->studentUser)
            ->get(route('student.lms.index'));

        $response->assertRedirect(route('dashboard'));
        $response->assertSessionHas('warning');

        $cbtResponse = $this->actingAs($this->studentUser)
            ->get(route('student.online-tests.index'));

        $cbtResponse->assertRedirect(route('dashboard'));
    }

    public function test_expired_struck_off_auto_reinstates(): void
    {
        // Set suspension that expired 1 hour ago
        $this->enrollment->update([
            'status' => 'struck_off',
            'struck_off_days' => 5,
            'struck_off_at' => now()->subDays(6),
            'struck_off_until' => now()->subHour(),
        ]);
        $this->studentProfile->update([
            'status' => 'struck_off',
            'struck_off_days' => 5,
            'struck_off_at' => now()->subDays(6),
            'struck_off_until' => now()->subHour(),
        ]);

        // Student accesses dashboard
        $response = $this->actingAs($this->studentUser)
            ->get(route('dashboard'));

        $response->assertOk();

        $this->enrollment->refresh();
        $this->studentProfile->refresh();

        $this->assertEquals('active', $this->enrollment->status);
        $this->assertEquals('active', $this->studentProfile->status);
    }
}
