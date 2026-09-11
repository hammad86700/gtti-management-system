<?php

namespace Tests\Feature;

use App\Domains\Attendance\Models\FacultyAttendance;
use App\Domains\Attendance\Models\FacultyLeave;
use App\Domains\Identity\Models\Role;
use App\Domains\Identity\Models\User;
use App\Domains\Organization\Models\Batch;
use App\Domains\Organization\Models\Course;
use App\Domains\Organization\Models\Department;
use App\Domains\Organization\Models\Institute;
use App\Domains\Organization\Models\Program;
use App\Domains\Organization\Models\Trade;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FacultyAttendanceTest extends TestCase
{
    use RefreshDatabase;

    protected User $teacher;
    protected User $principal;
    protected Institute $institute;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        // Create roles
        $teacherRole = Role::firstOrCreate(['slug' => 'teacher'], ['name' => 'Teacher']);
        $principalRole = Role::firstOrCreate(['slug' => 'principal'], ['name' => 'Principal']);
        Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);

        // Institute & trade setup
        $this->institute = Institute::create([
            'name' => 'GTTI Rahim Yar Khan',
            'code' => 'GTTI-RYK',
            'is_active' => true,
        ]);

        $dept = Department::create(['institute_id' => $this->institute->id, 'name' => 'Computer Department', 'code' => 'CS']);
        $prog = Program::create(['department_id' => $dept->id, 'name' => 'IT Fundamentals', 'type' => 'short_course', 'duration_months' => 6]);
        $trade = Trade::create(['program_id' => $prog->id, 'name' => 'Web Development', 'code' => 'WEB']);
        $course = Course::create(['trade_id' => $trade->id, 'name' => 'Full Stack Web Dev', 'entry_level' => 'Matric', 'is_active' => true]);
        $batch = Batch::create(['course_id' => $course->id, 'name' => 'WEB-2026-M1', 'session_year' => '2026-2027', 'shift' => 'morning', 'start_date' => now()]);

        // Principal
        $this->principal = User::factory()->create([
            'institute_id' => $this->institute->id,
            'name' => 'Engr. Muhammad Asif (Principal)',
            'email' => 'principal@gtti.edu.pk',
        ]);
        $this->principal->roles()->attach($principalRole);

        // Teacher
        $this->teacher = User::factory()->create([
            'institute_id' => $this->institute->id,
            'name' => 'Engr. Hammad Tariq',
            'email' => 'hammad.teacher@gtti.edu.pk',
        ]);
        $this->teacher->roles()->attach($teacherRole);
        $this->teacher->batches()->attach($batch);
    }

    public function test_teacher_can_record_daily_attendance_with_valid_proof_photo_and_subnet_verification(): void
    {
        Carbon::setTestNow(Carbon::today()->setTime(8, 15, 0)); // 08:15 AM (On-Time)

        $fakePhoto = UploadedFile::fake()->image('classroom_snap.jpg', 800, 600);

        $response = $this->actingAs($this->teacher)
            ->withServerVariables(['REMOTE_ADDR' => '192.168.1.55']) // Institutional IP
            ->post(route('teacher.faculty-attendance.store'), [
                'proof_image' => $fakePhoto,
                'remarks' => 'Practical Lab 2, Full Attendance',
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertDatabaseHas('faculty_attendances', [
            'user_id' => $this->teacher->id,
            'attendance_date' => Carbon::today()->toDateString(),
            'is_ip_verified' => true,
            'status' => 'present',
            'remarks' => 'Practical Lab 2, Full Attendance',
            'ip_address' => '192.168.1.55',
        ]);

        $attendance = FacultyAttendance::where('user_id', $this->teacher->id)->first();
        $this->assertNotNull($attendance);
        Storage::disk('public')->assertExists($attendance->proof_image_path);

        Carbon::setTestNow(); // Reset
    }

    public function test_teacher_check_in_from_external_ip_is_marked_unverified(): void
    {
        Carbon::setTestNow(Carbon::today()->setTime(8, 20, 0));

        $fakePhoto = UploadedFile::fake()->image('remote_snap.jpg', 640, 480);

        $response = $this->actingAs($this->teacher)
            ->withServerVariables(['REMOTE_ADDR' => '203.135.45.88']) // External IP
            ->post(route('teacher.faculty-attendance.store'), [
                'proof_image' => $fakePhoto,
                'remarks' => 'Remote Check-in Test',
            ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('faculty_attendances', [
            'user_id' => $this->teacher->id,
            'attendance_date' => Carbon::today()->toDateString(),
            'is_ip_verified' => false,
            'ip_address' => '203.135.45.88',
        ]);

        Carbon::setTestNow();
    }

    public function test_check_in_past_cutoff_is_marked_late(): void
    {
        Carbon::setTestNow(Carbon::today()->setTime(9, 10, 0)); // 09:10 AM (> 08:30)

        $fakePhoto = UploadedFile::fake()->image('late_snap.jpg');

        $response = $this->actingAs($this->teacher)
            ->withServerVariables(['REMOTE_ADDR' => '127.0.0.1'])
            ->post(route('teacher.faculty-attendance.store'), [
                'proof_image' => $fakePhoto,
                'remarks' => 'Late arrival due to railway gate closure',
            ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('faculty_attendances', [
            'user_id' => $this->teacher->id,
            'status' => 'late',
        ]);

        Carbon::setTestNow();
    }

    public function test_double_submission_on_same_calendar_day_is_rejected(): void
    {
        Carbon::setTestNow(Carbon::today()->setTime(8, 10, 0));

        // First check-in
        $fakePhoto1 = UploadedFile::fake()->image('snap1.jpg');
        $this->actingAs($this->teacher)
            ->withServerVariables(['REMOTE_ADDR' => '127.0.0.1'])
            ->post(route('teacher.faculty-attendance.store'), [
                'proof_image' => $fakePhoto1,
            ]);

        $this->assertEquals(1, FacultyAttendance::where('user_id', $this->teacher->id)->count());

        // Second check-in on the same day -> Must fail validation
        $fakePhoto2 = UploadedFile::fake()->image('snap2.jpg');
        $response = $this->actingAs($this->teacher)
            ->withServerVariables(['REMOTE_ADDR' => '127.0.0.1'])
            ->post(route('teacher.faculty-attendance.store'), [
                'proof_image' => $fakePhoto2,
            ]);

        $response->assertSessionHasErrors(['proof_image']);
        $this->assertEquals(1, FacultyAttendance::where('user_id', $this->teacher->id)->count());

        Carbon::setTestNow();
    }

    public function test_teacher_can_submit_leave_application(): void
    {
        $startDate = Carbon::today()->toDateString();
        $endDate = Carbon::today()->addDays(2)->toDateString();
        $fakeCert = UploadedFile::fake()->create('medical_certificate.pdf', 500, 'application/pdf');

        $response = $this->actingAs($this->teacher)
            ->post(route('teacher.faculty-leaves.store'), [
                'leave_type' => 'medical',
                'start_date' => $startDate,
                'end_date' => $endDate,
                'reason' => 'Acute respiratory infection diagnosed by THQ Hospital physician.',
                'attachment' => $fakeCert,
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertDatabaseHas('faculty_leaves', [
            'user_id' => $this->teacher->id,
            'leave_type' => 'medical',
            'status' => 'pending',
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);

        $leave = FacultyLeave::where('user_id', $this->teacher->id)->first();
        $this->assertNotNull($leave);
        Storage::disk('public')->assertExists($leave->attachment_path);
    }

    public function test_principal_daily_roster_dynamically_lists_approved_leaves_and_attendances(): void
    {
        $today = Carbon::today()->toDateString();
        $teacherRole = Role::where('slug', 'teacher')->first();

        // Teacher 2: Has Approved Leave
        $teacher2 = User::factory()->create([
            'institute_id' => $this->institute->id,
            'name' => 'Instructor B (On Leave)',
            'email' => 'teacher_b@gtti.edu.pk',
        ]);
        $teacher2->roles()->attach($teacherRole);

        FacultyLeave::create([
            'user_id' => $teacher2->id,
            'leave_type' => 'casual',
            'start_date' => $today,
            'end_date' => $today,
            'reason' => 'Family event',
            'status' => 'approved',
            'actioned_by' => $this->principal->id,
            'actioned_at' => now(),
        ]);

        // Teacher 3: Unexcused Absent (No record, no leave)
        $teacher3 = User::factory()->create([
            'institute_id' => $this->institute->id,
            'name' => 'Instructor C (Absent)',
            'email' => 'teacher_c@gtti.edu.pk',
        ]);
        $teacher3->roles()->attach($teacherRole);

        // Teacher 1: Checked In
        FacultyAttendance::create([
            'user_id' => $this->teacher->id,
            'attendance_date' => $today,
            'check_in_time' => '08:14:00',
            'proof_image_path' => 'faculty_proofs/2026-09/test.jpg',
            'ip_address' => '192.168.1.100',
            'is_ip_verified' => true,
            'status' => 'present',
        ]);

        // Principal requests daily roster
        $response = $this->actingAs($this->principal)
            ->get(route('admin.faculty-attendance.index', ['date' => $today]));

        $response->assertOk();
        $response->assertInertia(function ($page) use ($today) {
            $page->component('Admin/FacultyAttendance')
                ->where('counters.total_faculty', 3)
                ->where('counters.present_today', 1)
                ->where('counters.on_leave', 1)
                ->where('counters.unexcused_absent', 1)
                ->has('roster', 3);
        });
    }

    public function test_principal_can_approve_faculty_leave(): void
    {
        $leave = FacultyLeave::create([
            'user_id' => $this->teacher->id,
            'leave_type' => 'casual',
            'start_date' => Carbon::today()->addDay()->toDateString(),
            'end_date' => Carbon::today()->addDay()->toDateString(),
            'reason' => 'Need 1 day casual leave for domestic affairs.',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->principal)
            ->post(route('admin.faculty-leaves.approve', $leave->id));

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertDatabaseHas('faculty_leaves', [
            'id' => $leave->id,
            'status' => 'approved',
            'actioned_by' => $this->principal->id,
        ]);
    }

    public function test_principal_can_reject_faculty_leave_with_notes(): void
    {
        $leave = FacultyLeave::create([
            'user_id' => $this->teacher->id,
            'leave_type' => 'official_duty',
            'start_date' => Carbon::today()->addDays(2)->toDateString(),
            'end_date' => Carbon::today()->addDays(3)->toDateString(),
            'reason' => 'Attending external seminar',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->principal)
            ->post(route('admin.faculty-leaves.reject', $leave->id), [
                'rejection_reason' => 'Midterm examination assessment week requires full faculty presence.',
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertDatabaseHas('faculty_leaves', [
            'id' => $leave->id,
            'status' => 'rejected',
            'actioned_by' => $this->principal->id,
            'rejection_reason' => 'Midterm examination assessment week requires full faculty presence.',
        ]);
    }

    public function test_teacher_dashboard_and_self_attendance_pages_render_with_props(): void
    {
        // 1. Check teacher dashboard
        $dashResponse = $this->actingAs($this->teacher)
            ->get(route('teacher.dashboard'));

        $dashResponse->assertOk();
        $dashResponse->assertInertia(function ($page) {
            $page->component('Teacher/Dashboard')
                ->has('facultyAttendanceSummary')
                ->has('facultyLeaves')
                ->has('isCampusIp')
                ->has('lateCutoff');
        });

        // 2. Check dedicated self-attendance page
        $selfAttResponse = $this->actingAs($this->teacher)
            ->get(route('teacher.faculty-attendance.index'));

        $selfAttResponse->assertOk();
        $selfAttResponse->assertInertia(function ($page) {
            $page->component('Teacher/Attendance/SelfAttendance')
                ->has('summary')
                ->has('recentLeaves')
                ->has('monthAttendances')
                ->has('clientIp')
                ->has('isCampusIp');
        });
    }
}
