<?php

namespace Tests\Feature;

use App\Domains\Examination\Models\OnlineTest;
use App\Domains\Examination\Models\TestAttempt;
use App\Domains\Examination\Models\TestQuestion;
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

class GttiExamSystemTest extends TestCase
{
    use RefreshDatabase;

    protected User $teacher;
    protected User $studentUser;
    protected StudentProfile $studentProfile;
    protected Batch $batch;
    protected Course $course;
    protected OnlineTest $test;

    protected function setUp(): void
    {
        parent::setUp();

        $teacherRole = Role::firstOrCreate(['slug' => 'teacher'], ['name' => 'Teacher']);
        $studentRole = Role::firstOrCreate(['slug' => 'student'], ['name' => 'Student']);

        $institute = Institute::create([
            'name' => 'GTTI Rahim Yar Khan',
            'code' => 'GTTI-RYK',
            'is_active' => true,
        ]);

        $dept = Department::create(['institute_id' => $institute->id, 'name' => 'IT Department', 'code' => 'IT']);
        $prog = Program::create(['department_id' => $dept->id, 'name' => 'DIT', 'type' => 'diploma', 'duration_months' => 24]);
        $trade = Trade::create(['program_id' => $prog->id, 'name' => 'Computer Applications', 'code' => 'CA']);

        $this->course = Course::create([
            'trade_id' => $trade->id,
            'name' => 'Web Development & App Engineering',
            'entry_level' => 'Matric',
            'is_active' => true,
        ]);

        $this->batch = Batch::create([
            'course_id' => $this->course->id,
            'name' => 'Batch-2026-Morning',
            'session_year' => '2026-2027',
            'shift' => 'morning',
            'start_date' => now()->subMonth(),
            'end_date' => now()->addMonths(5),
        ]);

        $this->teacher = User::factory()->create(['name' => 'Engr. Tariq']);
        $this->teacher->roles()->attach($teacherRole);
        $this->teacher->batches()->attach($this->batch->id);

        $this->studentUser = User::factory()->create([
            'name' => 'Ali Raza',
            'email' => 'ali@example.com',
            'cnic' => '31201-7654321-1',
        ]);
        $this->studentUser->roles()->attach($studentRole);

        $this->studentProfile = StudentProfile::create([
            'user_id' => $this->studentUser->id,
            'registration_number' => 'GTTI-2026-0088',
            'father_name' => 'Raza Muhammad',
            'status' => 'active',
        ]);

        Enrollment::create([
            'student_profile_id' => $this->studentProfile->id,
            'course_id' => $this->course->id,
            'batch_id' => $this->batch->id,
            'enrollment_number' => 'ENR-2026-0088',
            'enrollment_date' => now()->subMonth()->toDateString(),
            'status' => 'active',
        ]);

        $this->test = OnlineTest::create([
            'batch_id' => $this->batch->id,
            'user_id' => $this->teacher->id,
            'title' => 'Midterm Technical Assessment',
            'duration_minutes' => 30,
            'question_pool_size' => 3, // Pick 3 from 5 questions
            'practical_marks' => 5,
            'passing_percentage' => 50,
            'is_live' => true,
            'status' => 'published',
        ]);

        // Add 5 questions to question bank
        for ($i = 1; $i <= 5; $i++) {
            TestQuestion::create([
                'online_test_id' => $this->test->id,
                'question_text' => "Question Number {$i} problem statement",
                'option_a' => "Option A {$i}",
                'option_b' => "Option B {$i}",
                'option_c' => "Option C {$i}",
                'option_d' => "Option D {$i}",
                'correct_option' => 'A',
                'marks' => 1,
            ]);
        }
    }

    public function test_frictionless_cnic_verification(): void
    {
        $response = $this->post(route('exam-system.verify-cnic'), [
            'cnic' => '31201-7654321-1',
        ]);

        $response->assertSessionHas('verifiedStudent');
        $response->assertSessionHas('activeExam');

        $this->assertEquals($this->studentProfile->id, session('gtti_exam_student_id'));
        $this->assertEquals($this->test->id, session('gtti_exam_test_id'));
    }

    public function test_invalid_cnic_rejected(): void
    {
        $response = $this->post(route('exam-system.verify-cnic'), [
            'cnic' => '12345', // Invalid length
        ]);

        $response->assertSessionHasErrors('cnic');
    }

    public function test_dynamic_randomization_engine_samples_pool_and_shuffles_options(): void
    {
        session(['gtti_exam_student_id' => $this->studentProfile->id]);

        $response = $this->get(route('exam-system.take', $this->test->id));
        $response->assertOk();

        $attempt = TestAttempt::where('online_test_id', $this->test->id)
            ->where('student_profile_id', $this->studentProfile->id)
            ->first();

        $this->assertNotNull($attempt);
        $this->assertEquals('in_progress', $attempt->status);

        // Assert question_pool_size took effect: exactly 3 questions sampled from 5
        $this->assertCount(3, $attempt->shuffled_question_order);
        $this->assertEquals(3, $attempt->total_questions);

        // Verify deterministic persistence across repeat access
        $firstOrder = $attempt->shuffled_question_order;

        $response2 = $this->get(route('exam-system.take', $this->test->id));
        $response2->assertOk();

        $attempt->refresh();
        $this->assertEquals($firstOrder, $attempt->shuffled_question_order);
    }

    public function test_anti_cheat_warning_increments_count(): void
    {
        $attempt = TestAttempt::create([
            'online_test_id' => $this->test->id,
            'student_profile_id' => $this->studentProfile->id,
            'status' => 'in_progress',
            'warning_count' => 0,
        ]);

        $response = $this->postJson(route('exam-system.warning', $this->test->id), [
            'attempt_id' => $attempt->id,
        ]);

        $response->assertOk();
        $attempt->refresh();
        $this->assertEquals(1, $attempt->warning_count);
    }

    public function test_automated_grading_and_viva_marks_merging(): void
    {
        $q1 = $this->test->questions()->first();

        $attempt = TestAttempt::create([
            'online_test_id' => $this->test->id,
            'student_profile_id' => $this->studentProfile->id,
            'status' => 'in_progress',
            'shuffled_question_order' => [
                [
                    'question_id' => $q1->id,
                    'options' => [
                        'A' => ['text' => 'Option A', 'orig_key' => 'A'],
                        'B' => ['text' => 'Option B', 'orig_key' => 'B'],
                        'C' => ['text' => 'Option C', 'orig_key' => 'C'],
                        'D' => ['text' => 'Option D', 'orig_key' => 'D'],
                    ],
                ],
            ],
            'total_questions' => 1,
            'start_time' => now(),
        ]);

        // Submit answer A (correct key)
        $submitRes = $this->post(route('exam-system.submit', $this->test->id), [
            'attempt_id' => $attempt->id,
            'answers' => [
                $q1->id => 'A',
            ],
        ]);

        $submitRes->assertRedirect(route('exam-system.result', $attempt->id));

        $attempt->refresh();
        $this->assertEquals('completed', $attempt->status);
        $this->assertEquals(1, $attempt->score); // 1 / 1 in MCQ

        // Interviewer awards viva marks (4 out of 5)
        $vivaRes = $this->actingAs($this->teacher)
            ->post(route('teacher.exam-system.interview.submit', $attempt->id), [
                'practical_marks' => 4,
                'practical_remarks' => 'Good technical grasp',
            ]);

        $vivaRes->assertRedirect();

        $attempt->refresh();
        $this->assertEquals(4, $attempt->practical_marks);
        // MCQ 1 + Viva 4 = Grand Total 5. Max possible: 1 + 5 = 6. Percentage: (5/6)*100 = 83.33%
        $this->assertEquals(5, $attempt->grand_total);
        $this->assertEquals(83.33, $attempt->percentage);
        $this->assertTrue($attempt->isPassed());
    }

    public function test_teacher_can_export_csv_and_delete_attempt_for_retake(): void
    {
        $attempt = TestAttempt::create([
            'online_test_id' => $this->test->id,
            'student_profile_id' => $this->studentProfile->id,
            'status' => 'completed',
            'score' => 2,
            'total_questions' => 3,
            'practical_marks' => 4,
            'grand_total' => 6,
            'percentage' => 75.0,
        ]);

        // 1. Export CSV
        $exportRes = $this->actingAs($this->teacher)
            ->get(route('teacher.exam-system.results.export-csv', $this->test->id));

        $exportRes->assertOk();
        $this->assertTrue($exportRes->headers->contains('content-type', 'text/csv; charset=UTF-8'));

        // 2. Delete attempt for retake
        $deleteRes = $this->actingAs($this->teacher)
            ->delete(route('teacher.exam-system.attempts.delete', $attempt->id));

        $deleteRes->assertRedirect();
        $this->assertSoftDeleted('test_attempts', ['id' => $attempt->id]);
    }
}
