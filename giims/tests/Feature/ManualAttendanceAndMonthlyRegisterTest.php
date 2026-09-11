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
use App\Domains\Student\Models\LeaveRequest;
use App\Domains\Student\Models\StudentProfile;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ManualAttendanceAndMonthlyRegisterTest extends TestCase
{
    use RefreshDatabase;

    protected Institute $institute;
    protected User $superAdmin;
    protected User $teacher;
    protected User $student1;
    protected User $student2;
    protected User $student3;
    protected StudentProfile $profile1;
    protected StudentProfile $profile2;
    protected StudentProfile $profile3;
    protected Batch $batch;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['slug' => 'super-admin'], ['name' => 'Super Admin', 'is_system' => true]);
        $teacherRole = Role::firstOrCreate(['slug' => 'teacher'], ['name' => 'Teacher', 'is_system' => false]);
        $studentRole = Role::firstOrCreate(['slug' => 'student'], ['name' => 'Student', 'is_system' => false]);

        $this->institute = Institute::create([
            'name' => 'Govt Technical Training Institute RYK',
            'code' => 'GTTI-RYK',
            'is_active' => true,
        ]);

        $dept = Department::create(['institute_id' => $this->institute->id, 'name' => 'Computer Department', 'code' => 'CS']);
        $prog = Program::create(['department_id' => $dept->id, 'name' => 'Vocational Diploma', 'type' => 'vocational', 'duration_months' => 6]);
        $trade = Trade::create(['program_id' => $prog->id, 'name' => 'Web Development', 'code' => 'WEB']);
        $course = Course::create(['trade_id' => $trade->id, 'name' => 'Full Stack Laravel', 'entry_level' => 'Matric']);
        $this->batch = Batch::create([
            'course_id' => $course->id,
            'name' => 'Morning Batch 2026',
            'session_year' => '2026-2027',
            'shift' => 'Morning',
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
        ]);

        // Principal / Super Admin
        $this->superAdmin = User::factory()->create(['institute_id' => $this->institute->id]);
        $this->superAdmin->roles()->attach($adminRole->id);

        // Teacher
        $this->teacher = User::factory()->create(['institute_id' => $this->institute->id, 'name' => 'Sir Tariq']);
        $this->teacher->roles()->attach($teacherRole->id);
        $this->teacher->batches()->attach($this->batch->id);

        // Student 1 (Present)
        $this->student1 = User::factory()->create(['institute_id' => $this->institute->id, 'name' => 'Ahmad Raza']);
        $this->student1->roles()->attach($studentRole->id);
        $this->profile1 = StudentProfile::create(['user_id' => $this->student1->id, 'father_name' => 'Raza Ali']);
        Enrollment::create([
            'student_profile_id' => $this->profile1->id,
            'course_id' => $course->id,
            'batch_id' => $this->batch->id,
            'enrollment_number' => 'GTTI-2026-001',
            'status' => 'active',
            'enrollment_date' => now(),
        ]);

        // Student 2 (Absent)
        $this->student2 = User::factory()->create(['institute_id' => $this->institute->id, 'name' => 'Bilal Khan']);
        $this->student2->roles()->attach($studentRole->id);
        $this->profile2 = StudentProfile::create(['user_id' => $this->student2->id, 'father_name' => 'Khan Muhammad']);
        Enrollment::create([
            'student_profile_id' => $this->profile2->id,
            'course_id' => $course->id,
            'batch_id' => $this->batch->id,
            'enrollment_number' => 'GTTI-2026-002',
            'status' => 'active',
            'enrollment_date' => now(),
        ]);

        // Student 3 (Leave)
        $this->student3 = User::factory()->create(['institute_id' => $this->institute->id, 'name' => 'Hamza Tariq']);
        $this->student3->roles()->attach($studentRole->id);
        $this->profile3 = StudentProfile::create(['user_id' => $this->student3->id, 'father_name' => 'Tariq Mehmood']);
        Enrollment::create([
            'student_profile_id' => $this->profile3->id,
            'course_id' => $course->id,
            'batch_id' => $this->batch->id,
            'enrollment_number' => 'GTTI-2026-003',
            'status' => 'active',
            'enrollment_date' => now(),
        ]);
    }

    public function test_teacher_can_view_attendance_create_page_with_auto_detected_approved_leaves(): void
    {
        // Approve leave for student 3 today
        LeaveRequest::create([
            'student_profile_id' => $this->profile3->id,
            'start_date' => today(),
            'end_date' => today()->addDays(2),
            'reason' => 'High medical fever',
            'status' => 'approved',
        ]);

        $response = $this
            ->actingAs($this->teacher)
            ->get(route('teacher.attendance.create', [
                'batchId' => $this->batch->id,
                'date' => today()->toDateString(),
            ]));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Teacher/Attendance/Create')
            ->has('trainees', 3)
            ->where('trainees.2.has_approved_leave', true)
            ->where('trainees.2.status', 'leave')
            ->where('trainees.2.leave_reason', 'High medical fever')
        );
    }

    public function test_teacher_can_submit_manual_roll_call_and_confirm_attendances(): void
    {
        $today = today()->toDateString();

        $payload = [
            'session_date' => $today,
            'start_time' => '08:30:00',
            'end_time' => '13:30:00',
            'location_name' => 'Room 101 / IT Lab',
            'attendances' => [
                [
                    'student_profile_id' => $this->profile1->id,
                    'status' => 'present',
                ],
                [
                    'student_profile_id' => $this->profile2->id,
                    'status' => 'absent',
                ],
                [
                    'student_profile_id' => $this->profile3->id,
                    'status' => 'leave',
                ],
            ],
        ];

        $response = $this
            ->actingAs($this->teacher)
            ->post(route('teacher.attendance.store', $this->batch->id), $payload);

        $response->assertRedirect(route('teacher.attendance.create', [
            'batchId' => $this->batch->id,
            'date' => $today,
        ]));

        // Check AttendanceSession created
        $session = AttendanceSession::where('batch_id', $this->batch->id)
            ->whereDate('session_date', $today)
            ->first();

        $this->assertNotNull($session);
        $this->assertEquals($this->teacher->id, $session->user_id);
        $this->assertEquals('closed', $session->status);

        // Check ClassAttendances created with manual flag and teacher confirmation
        $att1 = ClassAttendance::where('attendance_session_id', $session->id)
            ->where('student_profile_id', $this->profile1->id)
            ->first();
        $this->assertNotNull($att1);
        $this->assertEquals('present', $att1->status);
        $this->assertEquals('manual', $att1->method);
        $this->assertTrue((bool) $att1->is_confirmed_by_teacher);

        $att2 = ClassAttendance::where('attendance_session_id', $session->id)
            ->where('student_profile_id', $this->profile2->id)
            ->first();
        $this->assertNotNull($att2);
        $this->assertEquals('absent', $att2->status);

        $att3 = ClassAttendance::where('attendance_session_id', $session->id)
            ->where('student_profile_id', $this->profile3->id)
            ->first();
        $this->assertNotNull($att3);
        $this->assertEquals('leave', $att3->status);
    }

    public function test_student_dashboard_reflects_marked_attendance_status_today_without_pin_or_gps(): void
    {
        $today = today();
        $session = AttendanceSession::create([
            'batch_id' => $this->batch->id,
            'user_id' => $this->teacher->id,
            'session_date' => $today,
            'start_time' => '08:00:00',
            'status' => 'closed',
        ]);

        ClassAttendance::create([
            'attendance_session_id' => $session->id,
            'student_profile_id' => $this->profile1->id,
            'status' => 'present',
            'method' => 'manual',
            'is_confirmed_by_teacher' => true,
            'marked_at' => now(),
        ]);

        ClassAttendance::create([
            'attendance_session_id' => $session->id,
            'student_profile_id' => $this->profile2->id,
            'status' => 'absent',
            'method' => 'manual',
            'is_confirmed_by_teacher' => true,
            'marked_at' => now(),
        ]);

        // Student 1 check: Present
        $resp1 = $this
            ->actingAs($this->student1)
            ->get(route('dashboard'));

        $resp1->assertStatus(200);
        $resp1->assertInertia(fn (Assert $page) => $page
            ->component('Student/Dashboard')
            ->where('todayAttendance.status', 'present')
            ->where('todayAttendance.is_marked', true)
        );

        // Student 2 check: Absent
        $resp2 = $this
            ->actingAs($this->student2)
            ->get(route('dashboard'));

        $resp2->assertStatus(200);
        $resp2->assertInertia(fn (Assert $page) => $page
            ->component('Student/Dashboard')
            ->where('todayAttendance.status', 'absent')
            ->where('todayAttendance.is_marked', true)
        );
    }

    public function test_teacher_monthly_register_returns_accurate_day_by_day_matrix(): void
    {
        $year = now()->year;
        $month = now()->month;

        // Create a session for day 1
        $day1Date = Carbon::create($year, $month, 1)->toDateString();
        $session1 = AttendanceSession::create([
            'batch_id' => $this->batch->id,
            'user_id' => $this->teacher->id,
            'session_date' => $day1Date,
            'status' => 'closed',
        ]);
        ClassAttendance::create([
            'attendance_session_id' => $session1->id,
            'student_profile_id' => $this->profile1->id,
            'status' => 'present',
            'method' => 'manual',
        ]);
        ClassAttendance::create([
            'attendance_session_id' => $session1->id,
            'student_profile_id' => $this->profile2->id,
            'status' => 'absent',
            'method' => 'manual',
        ]);

        $response = $this
            ->actingAs($this->teacher)
            ->get(route('teacher.attendance.monthly', [
                'batchId' => $this->batch->id,
                'month' => $month,
                'year' => $year,
            ]));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Teacher/Attendance/Monthly')
            ->where('month', $month)
            ->where('year', $year)
            ->has('daysList')
            ->has('studentMatrix', 3)
            ->where('studentMatrix.0.days.1', 'present')
            ->where('studentMatrix.1.days.1', 'absent')
        );
    }

    public function test_student_dashboard_provides_day_by_day_monthly_history(): void
    {
        $year = now()->year;
        $month = now()->month;
        $day1Date = Carbon::create($year, $month, 1)->toDateString();

        $session = AttendanceSession::create([
            'batch_id' => $this->batch->id,
            'user_id' => $this->teacher->id,
            'session_date' => $day1Date,
            'status' => 'closed',
        ]);

        ClassAttendance::create([
            'attendance_session_id' => $session->id,
            'student_profile_id' => $this->profile1->id,
            'status' => 'present',
            'method' => 'manual',
            'marked_at' => now(),
        ]);

        $response = $this
            ->actingAs($this->student1)
            ->get(route('dashboard', ['month' => $month, 'year' => $year]));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Student/Dashboard')
            ->has('monthlyAttendance.days')
            ->where('monthlyAttendance.days.0.status', 'present')
            ->where('monthlyAttendance.present_count', 1)
        );
    }

    public function test_admin_principal_can_inspect_batch_monthly_attendance_register(): void
    {
        $year = now()->year;
        $month = now()->month;

        $response = $this
            ->actingAs($this->superAdmin)
            ->get(route('admin.attendance.index', [
                'view' => 'monthly',
                'batch_id' => $this->batch->id,
                'month' => $month,
                'year' => $year,
            ]));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Attendance/Index')
            ->where('viewMode', 'monthly')
            ->where('selectedBatchId', $this->batch->id)
            ->has('monthlyData.student_matrix', 3)
        );
    }
}
