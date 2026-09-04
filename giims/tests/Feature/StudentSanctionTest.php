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
use App\Domains\Student\Models\StudentStatusRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentSanctionTest extends TestCase
{
    use RefreshDatabase;

    protected User $teacher;
    protected User $admin;
    protected User $studentUser;
    protected StudentProfile $studentProfile;
    protected Enrollment $enrollment;
    protected Batch $batch;
    protected Course $course;
    protected Institute $institute;

    protected function setUp(): void
    {
        parent::setUp();

        $teacherRole = Role::firstOrCreate(['slug' => 'teacher'], ['name' => 'Teacher']);
        $adminRole = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        $principalRole = Role::firstOrCreate(['slug' => 'principal'], ['name' => 'Principal']);
        $studentRole = Role::firstOrCreate(['slug' => 'student'], ['name' => 'Student']);

        $this->institute = Institute::create([
            'name' => 'Govt Technical Training Institute RYK',
            'code' => 'GTTI-RYK',
            'is_active' => true,
        ]);

        $dept = Department::create(['institute_id' => $this->institute->id, 'name' => 'IT Dept', 'code' => 'IT']);
        $prog = Program::create(['department_id' => $dept->id, 'name' => 'Short Courses', 'type' => 'diploma', 'duration_months' => 6]);
        $trade = Trade::create(['program_id' => $prog->id, 'name' => 'Computer Applications', 'code' => 'CA']);
        $this->course = Course::create(['trade_id' => $trade->id, 'name' => 'Web Development', 'entry_level' => 'Matric']);

        $this->batch = Batch::create([
            'course_id' => $this->course->id,
            'name' => 'WD-2026-A',
            'session_year' => '2026-2027',
            'shift' => 'morning',
            'start_date' => now()->subMonth(),
            'end_date' => now()->addMonths(5),
        ]);

        // Teacher
        $this->teacher = User::factory()->create([
            'name' => 'Instructor Aslam',
            'institute_id' => $this->institute->id,
        ]);
        $this->teacher->roles()->attach($teacherRole);
        $this->teacher->batches()->attach($this->batch->id);

        // Admin / Principal
        $this->admin = User::factory()->create([
            'name' => 'Principal GTTI',
            'institute_id' => $this->institute->id,
        ]);
        $this->admin->roles()->attach([$adminRole->id, $principalRole->id]);

        // Student
        $this->studentUser = User::factory()->create([
            'name' => 'Ali Raza',
            'cnic' => '31202-1111111-1',
            'phone' => '03001234567',
            'institute_id' => $this->institute->id,
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
            'enrollment_number' => 'GTTI-2026-0042',
            'enrollment_date' => now()->subMonth()->toDateString(),
            'status' => 'active',
        ]);
    }

    public function test_teacher_can_view_discipline_portal_and_students(): void
    {
        $response = $this->actingAs($this->teacher)->get(route('teacher.discipline.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Teacher/Discipline/Index')
            ->has('students')
            ->has('requests')
        );
    }

    public function test_teacher_can_submit_struck_off_request(): void
    {
        $response = $this->actingAs($this->teacher)->post(route('teacher.discipline.store'), [
            'student_profile_id' => $this->studentProfile->id,
            'batch_id' => $this->batch->id,
            'request_type' => 'struck_off',
            'struck_off_days' => 7,
            'reason_category' => 'absenteeism',
            'reason' => 'Continuous 6 days unexcused absence',
            'evidence_notes' => 'Trainee was verbally warned twice on Monday and Thursday.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('student_status_requests', [
            'student_profile_id' => $this->studentProfile->id,
            'requested_by' => $this->teacher->id,
            'request_type' => 'struck_off',
            'struck_off_days' => 7,
            'status' => 'pending',
            'reason' => 'Continuous 6 days unexcused absence',
        ]);
    }

    public function test_teacher_cannot_submit_request_for_student_outside_batch(): void
    {
        // Another batch not assigned to teacher
        $otherBatch = Batch::create([
            'course_id' => $this->course->id,
            'name' => 'WD-2026-B',
            'session_year' => '2026-2027',
            'shift' => 'evening',
            'start_date' => now()->subMonth(),
            'end_date' => now()->addMonths(5),
        ]);

        $otherStudentUser = User::factory()->create(['institute_id' => $this->institute->id]);
        $otherProfile = StudentProfile::create(['user_id' => $otherStudentUser->id]);
        Enrollment::create([
            'student_profile_id' => $otherProfile->id,
            'course_id' => $this->course->id,
            'batch_id' => $otherBatch->id,
            'enrollment_number' => 'GTTI-2026-9999',
            'enrollment_date' => now()->toDateString(),
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->teacher)->post(route('teacher.discipline.store'), [
            'student_profile_id' => $otherProfile->id,
            'batch_id' => $otherBatch->id,
            'request_type' => 'struck_off',
            'struck_off_days' => 7,
            'reason_category' => 'misconduct',
            'reason' => 'Violation outside batch',
        ]);

        $response->assertSessionHasErrors('student_profile_id');
        $this->assertDatabaseMissing('student_status_requests', [
            'student_profile_id' => $otherProfile->id,
        ]);
    }

    public function test_admin_can_approve_teacher_struck_off_request(): void
    {
        $req = StudentStatusRequest::create([
            'student_profile_id' => $this->studentProfile->id,
            'batch_id' => $this->batch->id,
            'requested_by' => $this->teacher->id,
            'request_type' => 'struck_off',
            'struck_off_days' => 10,
            'reason_category' => 'absenteeism',
            'reason' => 'Absent for 10 days',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.discipline.requests.approve', $req->id), [
            'action_type' => 'struck_off',
            'struck_off_days' => 10,
            'admin_remarks' => 'Approved by Principal Office. Trainee suspended for 10 days.',
            'order_reference' => 'GTTI/ORD/2026/042',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Check request status
        $req->refresh();
        $this->assertEquals('approved', $req->status);
        $this->assertEquals($this->admin->id, $req->reviewed_by);
        $this->assertEquals('GTTI/ORD/2026/042', $req->order_reference);

        // Check student profile status
        $this->studentProfile->refresh();
        $this->assertEquals('struck_off', $this->studentProfile->status);
        $this->assertEquals(10, $this->studentProfile->struck_off_days);
        $this->assertNotNull($this->studentProfile->struck_off_until);
        $this->assertTrue(now()->addDays(9)->lessThan($this->studentProfile->struck_off_until));

        // Check enrollment status
        $this->enrollment->refresh();
        $this->assertEquals('suspended', $this->enrollment->status);

        // Check auto-created DisciplineRecord
        $this->assertDatabaseHas('discipline_records', [
            'student_profile_id' => $this->studentProfile->id,
            'severity' => 'critical',
            'status' => 'resolved',
        ]);
    }

    public function test_admin_can_approve_termination_request(): void
    {
        $req = StudentStatusRequest::create([
            'student_profile_id' => $this->studentProfile->id,
            'batch_id' => $this->batch->id,
            'requested_by' => $this->teacher->id,
            'request_type' => 'terminate',
            'reason_category' => 'misconduct',
            'reason' => 'Physical altercation in workshop',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.discipline.requests.approve', $req->id), [
            'action_type' => 'terminate',
            'admin_remarks' => 'Permanently expelled under TEVTA Code Section 9.',
            'order_reference' => 'GTTI/ORD/2026/099',
        ]);

        $response->assertRedirect();

        $this->studentProfile->refresh();
        $this->assertEquals('terminated', $this->studentProfile->status);
        $this->assertNull($this->studentProfile->struck_off_until);

        $this->enrollment->refresh();
        $this->assertEquals('dropped', $this->enrollment->status);
    }

    public function test_admin_can_reject_request(): void
    {
        $req = StudentStatusRequest::create([
            'student_profile_id' => $this->studentProfile->id,
            'batch_id' => $this->batch->id,
            'requested_by' => $this->teacher->id,
            'request_type' => 'struck_off',
            'struck_off_days' => 7,
            'reason_category' => 'absenteeism',
            'reason' => 'Absenteeism',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.discipline.requests.reject', $req->id), [
            'admin_remarks' => 'Trainee submitted medical certificate. Pardoned by Principal.',
        ]);

        $response->assertRedirect();
        $req->refresh();
        $this->assertEquals('rejected', $req->status);

        // Student remains active
        $this->studentProfile->refresh();
        $this->assertEquals('active', $this->studentProfile->status);
        $this->enrollment->refresh();
        $this->assertEquals('active', $this->enrollment->status);
    }

    public function test_admin_can_directly_sanction_student(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.discipline.direct-sanction'), [
            'student_profile_id' => $this->studentProfile->id,
            'sanction_type' => 'struck_off',
            'struck_off_days' => 14,
            'reason' => 'Direct Executive Sanction by Principal',
            'admin_remarks' => 'Placed on suspension for two weeks.',
        ]);

        $response->assertRedirect();
        $this->studentProfile->refresh();
        $this->assertEquals('struck_off', $this->studentProfile->status);
        $this->assertEquals(14, $this->studentProfile->struck_off_days);
        $this->enrollment->refresh();
        $this->assertEquals('suspended', $this->enrollment->status);
    }

    public function test_admin_can_reinstate_student(): void
    {
        $this->studentProfile->update([
            'status' => 'struck_off',
            'struck_off_at' => now(),
            'struck_off_until' => now()->addDays(7),
            'struck_off_days' => 7,
            'termination_reason' => 'Misconduct',
        ]);
        $this->enrollment->update(['status' => 'suspended']);

        $response = $this->actingAs($this->admin)->post(route('admin.discipline.reinstate', $this->studentProfile->id));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->studentProfile->refresh();
        $this->assertEquals('active', $this->studentProfile->status);
        $this->assertNull($this->studentProfile->struck_off_until);

        $this->enrollment->refresh();
        $this->assertEquals('active', $this->enrollment->status);
    }

    public function test_struck_off_student_dashboard_passes_sanction_prop(): void
    {
        $this->studentProfile->update([
            'status' => 'struck_off',
            'struck_off_at' => now(),
            'struck_off_until' => now()->addDays(5),
            'struck_off_days' => 5,
            'termination_reason' => 'Violation of Workshop Rules',
            'order_reference' => 'GTTI/ORD/2026/055',
        ]);

        $response = $this->actingAs($this->studentUser)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Student/Dashboard')
            ->has('sanction', fn ($s) => $s
                ->where('status', 'struck_off')
                ->where('type', 'struck_off')
                ->where('struck_off_days', 5)
                ->where('order_reference', 'GTTI/ORD/2026/055')
                ->etc()
            )
        );
    }

    public function test_struck_off_student_blocked_from_functional_routes(): void
    {
        $this->studentProfile->update([
            'status' => 'struck_off',
            'struck_off_at' => now(),
            'struck_off_until' => now()->addDays(5),
            'struck_off_days' => 5,
            'termination_reason' => 'Disciplinary sanction',
        ]);

        $response = $this->actingAs($this->studentUser)->get(route('student.online-tests.index'));

        // Should be redirected to dashboard
        $response->assertRedirect(route('dashboard'));
    }

    public function test_expired_struck_off_auto_reinstates_on_dashboard_access(): void
    {
        // Struck-off date in the past
        $this->studentProfile->update([
            'status' => 'struck_off',
            'struck_off_at' => now()->subDays(8),
            'struck_off_until' => now()->subDay(),
            'struck_off_days' => 7,
            'termination_reason' => 'Old sanction',
        ]);
        $this->enrollment->update(['status' => 'suspended']);

        $response = $this->actingAs($this->studentUser)->get(route('dashboard'));

        $response->assertOk();

        // Profile and enrollment should be auto-reinstated to active
        $this->studentProfile->refresh();
        $this->assertEquals('active', $this->studentProfile->status);
        $this->assertNull($this->studentProfile->struck_off_until);

        $this->enrollment->refresh();
        $this->assertEquals('active', $this->enrollment->status);
    }

    public function test_gate_verification_detects_struck_off_and_terminated_students(): void
    {
        $securityUser = User::factory()->create(['institute_id' => $this->institute->id]);
        $secRole = Role::firstOrCreate(['slug' => 'security'], ['name' => 'Security']);
        $securityUser->roles()->attach($secRole);

        // Active student
        $res = $this->actingAs($securityUser)->postJson(route('security.gate.verify'), [
            'identifier' => 'GTTI-2026-0042',
        ]);
        $res->assertOk();
        $res->assertJsonPath('student.is_active', true);

        // Sanction student
        $this->studentProfile->update([
            'status' => 'struck_off',
            'struck_off_at' => now(),
            'struck_off_until' => now()->addDays(7),
            'struck_off_days' => 7,
        ]);
        $this->enrollment->update(['status' => 'suspended']);

        $res2 = $this->actingAs($securityUser)->postJson(route('security.gate.verify'), [
            'identifier' => 'GTTI-2026-0042',
        ]);
        $res2->assertOk();
        $res2->assertJsonPath('student.is_active', false);
        $res2->assertJsonPath('student.status', 'struck_off');
    }
}
