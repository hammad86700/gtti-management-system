<?php

namespace Tests\Feature;

use App\Domains\Attendance\Models\AttendanceSession;
use App\Domains\Attendance\Models\ClassAttendance;
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

class SelfAttendanceTest extends TestCase
{
    use RefreshDatabase;

    protected Institute $institute;
    protected User $teacher;
    protected User $student;
    protected StudentProfile $studentProfile;
    protected Batch $batch;

    protected function setUp(): void
    {
        parent::setUp();

        $teacherRole = Role::firstOrCreate(['slug' => 'teacher'], ['name' => 'Teacher', 'is_system' => false]);
        $studentRole = Role::firstOrCreate(['slug' => 'student'], ['name' => 'Student', 'is_system' => false]);

        $this->institute = Institute::create(['name' => 'Govt Technical Training Institute', 'code' => 'GTTI', 'is_active' => true]);

        $dept = Department::create(['institute_id' => $this->institute->id, 'name' => 'IT Department', 'code' => 'IT']);
        $prog = Program::create(['department_id' => $dept->id, 'name' => 'Vocational G-II', 'type' => 'vocational', 'duration_months' => 6]);
        $trade = Trade::create(['program_id' => $prog->id, 'name' => 'Computer Applications', 'code' => 'CIT']);
        $course = Course::create(['trade_id' => $trade->id, 'name' => 'Web Development', 'entry_level' => 'Matric']);
        $this->batch = Batch::create(['course_id' => $course->id, 'name' => 'Morning Batch A', 'session_year' => '2026-2027', 'shift' => 'Morning', 'start_date' => '2026-09-01', 'end_date' => '2027-08-31']);

        $this->teacher = User::factory()->create(['institute_id' => $this->institute->id]);
        $this->teacher->roles()->attach($teacherRole->id);
        $this->teacher->batches()->attach($this->batch->id);

        $this->student = User::factory()->create(['institute_id' => $this->institute->id]);
        $this->student->roles()->attach($studentRole->id);

        $this->studentProfile = StudentProfile::create([
            'user_id' => $this->student->id,
            'father_name' => 'Muhammad Ali',
            'domicile_district' => 'Rahim Yar Khan',
        ]);

        Enrollment::create([
            'student_profile_id' => $this->studentProfile->id,
            'course_id' => $course->id,
            'batch_id' => $this->batch->id,
            'enrollment_number' => 'GTTI-2026-001',
            'status' => 'active',
            'enrollment_date' => now(),
        ]);
    }

    public function test_teacher_can_generate_daily_pin_for_attendance_session(): void
    {
        $session = AttendanceSession::create([
            'batch_id' => $this->batch->id,
            'user_id' => $this->teacher->id,
            'session_date' => today(),
            'start_time' => now()->format('H:i:s'),
            'status' => 'active',
        ]);

        $response = $this
            ->actingAs($this->teacher)
            ->post(route('teacher.attendance.generate-pin', $session->id));

        $response->assertSessionHasNoErrors();
        $response->assertSessionHas('success');

        $session->refresh();
        $this->assertNotNull($session->daily_pin);
        $this->assertSame(4, strlen($session->daily_pin));
        $this->assertMatchesRegularExpression('/^[0-9]{4}$/', $session->daily_pin);
    }

    public function test_teacher_can_generate_batch_pin_directly(): void
    {
        $response = $this
            ->actingAs($this->teacher)
            ->post(route('teacher.attendance.generate-batch-pin', $this->batch->id));

        $response->assertSessionHasNoErrors();
        $response->assertSessionHas('success');

        $session = AttendanceSession::where('batch_id', $this->batch->id)
            ->whereDate('session_date', today())
            ->first();

        $this->assertNotNull($session);
        $this->assertNotNull($session->daily_pin);
        $this->assertSame(4, strlen($session->daily_pin));
        $this->assertMatchesRegularExpression('/^[0-9]{4}$/', $session->daily_pin);
    }

    public function test_student_can_mark_attendance_with_valid_pin(): void
    {
        $session = AttendanceSession::create([
            'batch_id' => $this->batch->id,
            'user_id' => $this->teacher->id,
            'session_date' => today(),
            'start_time' => now()->format('H:i:s'),
            'status' => 'active',
            'daily_pin' => '4782',
        ]);

        $response = $this
            ->actingAs($this->student)
            ->post(route('student.attendance.self-mark'), [
                'pin' => '4782',
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('class_attendances', [
            'attendance_session_id' => $session->id,
            'student_profile_id' => $this->studentProfile->id,
            'status' => 'present',
            'method' => 'pin',
        ]);
    }

    public function test_student_cannot_mark_attendance_with_invalid_pin(): void
    {
        $session = AttendanceSession::create([
            'batch_id' => $this->batch->id,
            'user_id' => $this->teacher->id,
            'session_date' => today(),
            'start_time' => now()->format('H:i:s'),
            'status' => 'active',
            'daily_pin' => '4782',
        ]);

        $response = $this
            ->actingAs($this->student)
            ->post(route('student.attendance.self-mark'), [
                'pin' => '9999',
            ]);

        $response->assertSessionHas('error');

        $this->assertDatabaseMissing('class_attendances', [
            'attendance_session_id' => $session->id,
            'student_profile_id' => $this->studentProfile->id,
        ]);
    }

    public function test_student_cannot_mark_attendance_if_session_has_no_pin(): void
    {
        $session = AttendanceSession::create([
            'batch_id' => $this->batch->id,
            'user_id' => $this->teacher->id,
            'session_date' => today(),
            'start_time' => now()->format('H:i:s'),
            'status' => 'active',
            'daily_pin' => null,
        ]);

        $response = $this
            ->actingAs($this->student)
            ->post(route('student.attendance.self-mark'), [
                'pin' => '1234',
            ]);

        $response->assertSessionHas('error');
    }

    public function test_student_already_marked_present_is_handled_gracefully(): void
    {
        $session = AttendanceSession::create([
            'batch_id' => $this->batch->id,
            'user_id' => $this->teacher->id,
            'session_date' => today(),
            'start_time' => now()->format('H:i:s'),
            'status' => 'active',
            'daily_pin' => '5555',
        ]);

        ClassAttendance::create([
            'attendance_session_id' => $session->id,
            'student_profile_id' => $this->studentProfile->id,
            'status' => 'present',
            'method' => 'gps',
            'marked_at' => now(),
        ]);

        $response = $this
            ->actingAs($this->student)
            ->post(route('student.attendance.self-mark'), [
                'pin' => '5555',
            ]);

        $response->assertSessionHas('info');
    }

    public function test_student_rejected_if_outside_classroom_gps_geofence(): void
    {
        $session = AttendanceSession::create([
            'batch_id' => $this->batch->id,
            'user_id' => $this->teacher->id,
            'session_date' => today(),
            'start_time' => now()->format('H:i:s'),
            'location_name' => 'Computer Lab 1 & 2 (IT Wing)',
            'latitude' => 28.4212000,
            'longitude' => 70.3023000,
            'radius_meters' => 120,
            'is_geofence_active' => true,
            'status' => 'active',
            'daily_pin' => '8899',
        ]);

        // Coordinates far outside campus
        $response = $this
            ->actingAs($this->student)
            ->post(route('student.attendance.self-mark'), [
                'pin' => '8899',
                'latitude' => 28.5000000,
                'longitude' => 70.4000000,
            ]);

        $response->assertSessionHas('error');

        $this->assertDatabaseMissing('class_attendances', [
            'attendance_session_id' => $session->id,
            'student_profile_id' => $this->studentProfile->id,
        ]);
    }

    public function test_student_accepted_with_pin_and_inside_gps_boundary(): void
    {
        $session = AttendanceSession::create([
            'batch_id' => $this->batch->id,
            'user_id' => $this->teacher->id,
            'session_date' => today(),
            'start_time' => now()->format('H:i:s'),
            'location_name' => 'Computer Lab 1 & 2 (IT Wing)',
            'latitude' => 28.4212000,
            'longitude' => 70.3023000,
            'radius_meters' => 150,
            'is_geofence_active' => true,
            'status' => 'active',
            'daily_pin' => '7733',
        ]);

        // Coordinates ~10 meters from center
        $response = $this
            ->actingAs($this->student)
            ->post(route('student.attendance.self-mark'), [
                'pin' => '7733',
                'latitude' => 28.4212500,
                'longitude' => 70.3023500,
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('class_attendances', [
            'attendance_session_id' => $session->id,
            'student_profile_id' => $this->studentProfile->id,
            'status' => 'present',
            'method' => 'pin_gps',
            'is_confirmed_by_teacher' => false,
        ]);
    }

    public function test_teacher_can_confirm_attendance_from_dashboard(): void
    {
        $session = AttendanceSession::create([
            'batch_id' => $this->batch->id,
            'user_id' => $this->teacher->id,
            'session_date' => today(),
            'start_time' => now()->format('H:i:s'),
            'status' => 'active',
            'daily_pin' => '6644',
        ]);

        $attendance = ClassAttendance::create([
            'attendance_session_id' => $session->id,
            'student_profile_id' => $this->studentProfile->id,
            'status' => 'present',
            'method' => 'pin_gps',
            'is_confirmed_by_teacher' => false,
            'marked_at' => now(),
        ]);

        $response = $this
            ->actingAs($this->teacher)
            ->post(route('teacher.attendance.confirm', $this->batch->id));

        $response->assertSessionHasNoErrors();
        $response->assertSessionHas('success');

        $attendance->refresh();
        $this->assertTrue($attendance->is_confirmed_by_teacher);
        $this->assertNotNull($attendance->teacher_confirmed_at);
        $this->assertEquals($this->teacher->id, $attendance->confirmed_by_user_id);
    }

    public function test_teacher_can_update_classroom_session_zone(): void
    {
        $response = $this
            ->actingAs($this->teacher)
            ->post(route('teacher.attendance.update-zone', $this->batch->id), [
                'location_name' => 'Electrical & RAC Workshop',
                'latitude' => 28.4215,
                'longitude' => 70.3026,
                'radius_meters' => 120,
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('attendance_sessions', [
            'batch_id' => $this->batch->id,
            'location_name' => 'Electrical & RAC Workshop',
            'radius_meters' => 120,
        ]);
    }
}
