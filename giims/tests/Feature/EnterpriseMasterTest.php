<?php

namespace Tests\Feature;

use App\Domains\Attendance\Models\AttendanceSession;
use App\Domains\Attendance\Models\ClassAttendance;
use App\Domains\Examination\Models\Exam;
use App\Domains\Examination\Models\OnlineTest;
use App\Domains\Examination\Models\TestAttempt;
use App\Domains\Examination\Models\TestQuestion;
use App\Domains\Identity\Models\Role;
use App\Domains\Operations\Models\ActivityLog;
use App\Domains\Operations\Models\SiteSetting;
use App\Domains\Organization\Models\Batch;
use App\Domains\Organization\Models\Course;
use App\Domains\Organization\Models\Department;
use App\Domains\Organization\Models\Institute;
use App\Domains\Organization\Models\Program;
use App\Domains\Academic\Models\Subject;
use App\Domains\Organization\Models\Trade;
use App\Domains\Identity\Models\User;
use App\Domains\Student\Models\Clearance;
use App\Domains\Student\Models\Enrollment;
use App\Domains\Student\Models\StudentProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnterpriseMasterTest extends TestCase
{
    use RefreshDatabase;

    protected Institute $institute;
    protected User $superAdmin;
    protected User $clerk;
    protected User $teacher;
    protected Batch $batch;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(["slug" => "super-admin"], ["name" => "Super Admin", "is_system" => true]);
        $clerkRole = Role::firstOrCreate(["slug" => "admission-clerk"], ["name" => "Admission Clerk", "is_system" => false]);
        $teacherRole = Role::firstOrCreate(["slug" => "teacher"], ["name" => "Teacher", "is_system" => false]);

        $this->institute = Institute::create(["name" => "Govt Technical Training Institute", "code" => "GTTI", "is_active" => true]);

        $this->superAdmin = User::factory()->create(["institute_id" => $this->institute->id]);
        $this->superAdmin->roles()->attach($adminRole->id);

        $this->clerk = User::factory()->create(["institute_id" => $this->institute->id]);
        $this->clerk->roles()->attach($clerkRole->id);

        $this->teacher = User::factory()->create(["institute_id" => $this->institute->id]);
        $this->teacher->roles()->attach($teacherRole->id);

        $dept = Department::create(["institute_id" => $this->institute->id, "name" => "Electrical", "code" => "EE"]);
        $prog = Program::create(["department_id" => $dept->id, "name" => "G-II", "type" => "vocational", "duration_months" => 12]);
        $trade = Trade::create(["program_id" => $prog->id, "name" => "Electrician", "code" => "ELEC"]);
        $course = Course::create(["trade_id" => $trade->id, "name" => "Electrician Course", "entry_level" => "Matric"]);
        $this->batch = Batch::create(["course_id" => $course->id, "name" => "ELEC-2026-A", "session_year" => "2026", "shift" => "morning"]);

        $this->teacher->batches()->attach($this->batch->id);
    }

    public function test_super_admin_can_view_and_update_site_settings(): void
    {
        $response = $this->actingAs($this->superAdmin)->get(route("admin.settings.index"));
        $response->assertStatus(200);

        $updateResponse = $this->actingAs($this->superAdmin)->post(route("admin.settings.update"), [
            "institute_name" => "Dynamic Polytechnic Training Institute",
            "institute_short_name" => "DPTI",
            "phone" => "068-9999999",
            "email" => "contact@dpti.edu.pk",
        ]);

        $updateResponse->assertRedirect();
        $this->assertEquals("Dynamic Polytechnic Training Institute", SiteSetting::get("institute_name"));
        $this->assertEquals("DPTI", SiteSetting::get("institute_short_name"));
    }

    public function test_clerk_cannot_access_site_settings(): void
    {
        $response = $this->actingAs($this->clerk)->get(route("admin.settings.index"));
        $response->assertStatus(403);
    }

    public function test_model_changes_create_activity_logs(): void
    {
        $studentUser = User::factory()->create();
        $profile = StudentProfile::create(["user_id" => $studentUser->id, "father_name" => "Ali"]);
        $enrollment = Enrollment::create([
            "student_profile_id" => $profile->id,
            "course_id" => $this->batch->course_id,
            "batch_id" => $this->batch->id,
            "enrollment_number" => "ENR-TEST-001",
            "enrollment_date" => now()->toDateString(),
            "status" => "active",
        ]);

        $clearance = Clearance::create([
            "student_profile_id" => $profile->id,
            "enrollment_id" => $enrollment->id,
            "fee_status" => "pending",
            "library_status" => "pending",
            "workshop_status" => "pending",
            "overall_status" => "in_progress",
        ]);

        // Login as clerk and update fee status
        $this->actingAs($this->clerk)->patch(route("admin.clearances.update", $clearance->id), [
            "fee_status" => "cleared",
            "library_status" => "pending",
            "workshop_status" => "pending",
        ]);

        $this->assertDatabaseHas("activity_logs", [
            "model_type" => Clearance::class,
            "model_id" => $clearance->id,
            "action" => "updated",
        ]);
    }

    public function test_teacher_can_force_submit_in_progress_cbt_attempt(): void
    {
        $test = OnlineTest::create([
            "batch_id" => $this->batch->id,
            "user_id" => $this->teacher->id,
            "title" => "Electrical Safety CBT",
            "duration_minutes" => 45,
            "status" => "published",
        ]);

        $q = TestQuestion::create([
            "online_test_id" => $test->id,
            "question_text" => "Current is measured in?",
            "option_a" => "Volts",
            "option_b" => "Amperes",
            "option_c" => "Watts",
            "option_d" => "Ohms",
            "correct_option" => "B",
            "marks" => 2,
        ]);

        $studentUser = User::factory()->create();
        $profile = StudentProfile::create(["user_id" => $studentUser->id, "father_name" => "Trainee Father"]);

        $attempt = TestAttempt::create([
            "online_test_id" => $test->id,
            "student_profile_id" => $profile->id,
            "start_time" => now()->subMinutes(10),
            "status" => "in_progress",
            "answers" => [$q->id => "B"],
        ]);

        $response = $this->actingAs($this->teacher)
            ->post(route("teacher.online-tests.force-submit", ["testId" => $test->id, "attemptId" => $attempt->id]));

        $response->assertRedirect();
        $attempt->refresh();
        $this->assertEquals("completed", $attempt->status);
        $this->assertEquals(2, $attempt->score);
    }

    public function test_admin_can_lock_and_unlock_exam_results(): void
    {
        $subject = Subject::create(["course_id" => $this->batch->course_id, "name" => "Circuit Analysis", "code" => "CA-101"]);
        $exam = Exam::create([
            "batch_id" => $this->batch->id,
            "subject_id" => $subject->id,
            "user_id" => $this->teacher->id,
            "title" => "Midterm Examination",
            "exam_date" => now()->toDateString(),
            "total_theory_marks" => 50,
            "total_practical_marks" => 50,
            "is_locked" => false,
        ]);

        // Lock exam
        $lockRes = $this->actingAs($this->superAdmin)->post(route("admin.result-approvals.lock", $exam->id));
        $lockRes->assertRedirect();
        $exam->refresh();
        $this->assertTrue((bool)$exam->is_locked);

        // Unlock exam
        $unlockRes = $this->actingAs($this->superAdmin)->post(route("admin.result-approvals.unlock", $exam->id));
        $unlockRes->assertRedirect();
        $exam->refresh();
        $this->assertFalse((bool)$exam->is_locked);
    }
}

