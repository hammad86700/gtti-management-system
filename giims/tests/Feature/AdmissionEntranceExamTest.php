<?php

namespace Tests\Feature;

use App\Domains\Admissions\Models\AdmissionCampaign;
use App\Domains\Admissions\Models\AdmissionEntranceExam;
use App\Domains\Admissions\Models\Application;
use App\Domains\Admissions\Models\EntranceTestAttempt;
use App\Domains\Admissions\Models\EntranceTestQuestion;
use App\Domains\Identity\Models\Role;
use App\Domains\Identity\Models\User;
use App\Domains\Organization\Models\Course;
use App\Domains\Organization\Models\Department;
use App\Domains\Organization\Models\Institute;
use App\Domains\Organization\Models\Program;
use App\Domains\Organization\Models\Trade;
use App\Domains\Student\Models\StudentProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class AdmissionEntranceExamTest extends TestCase
{
    use RefreshDatabase;

    protected User $teacher;
    protected User $admin;
    protected User $studentUser;
    protected StudentProfile $studentProfile;
    protected Course $meritCourse;
    protected Course $fcfsCourse;
    protected AdmissionCampaign $campaign;
    protected Application $application;

    protected function setUp(): void
    {
        parent::setUp();

        $teacherRole = Role::firstOrCreate(['slug' => 'teacher'], ['name' => 'Teacher']);
        $adminRole = Role::firstOrCreate(['slug' => 'super-admin'], ['name' => 'Super Administrator']);
        $studentRole = Role::firstOrCreate(['slug' => 'student'], ['name' => 'Student']);

        $institute = Institute::create([
            'name' => 'Govt Technical Training Institute RYK',
            'code' => 'GTTI-RYK',
            'is_active' => true,
        ]);

        $dept = Department::create(['institute_id' => $institute->id, 'name' => 'IT Dept', 'code' => 'IT']);
        $prog = Program::create(['department_id' => $dept->id, 'name' => 'Diploma Tech', 'type' => 'diploma', 'duration_months' => 24]);
        $trade = Trade::create(['program_id' => $prog->id, 'name' => 'Computer Applications', 'code' => 'CA']);

        $this->meritCourse = Course::create([
            'trade_id' => $trade->id,
            'name' => 'Software Technology',
            'entry_level' => 'Matric',
            'admission_type' => 'merit_based',
            'matric_weightage' => 50,
            'test_weightage' => 50,
            'is_active' => true,
        ]);

        $this->fcfsCourse = Course::create([
            'trade_id' => $trade->id,
            'name' => 'Plumbing & Pipefitting',
            'entry_level' => 'Middle',
            'admission_type' => 'first_come_first_served',
            'matric_weightage' => 100,
            'test_weightage' => 0,
            'is_active' => true,
        ]);

        $this->campaign = AdmissionCampaign::create([
            'institute_id' => $institute->id,
            'name' => 'Fall 2026 Admissions',
            'start_date' => now()->subMonth(),
            'end_date' => now()->addMonths(2),
            'is_active' => true,
        ]);

        $this->teacher = User::factory()->create(['name' => 'Engr. Tariq Mehmood']);
        $this->teacher->roles()->attach($teacherRole);

        $this->admin = User::factory()->create(['name' => 'Principal Office']);
        $this->admin->roles()->attach($adminRole);

        $this->studentUser = User::factory()->create([
            'name' => 'Hamza Ali',
            'email' => 'hamza@example.com',
            'cnic' => '31202-1234567-1',
        ]);
        $this->studentUser->roles()->attach($studentRole);

        $this->studentProfile = StudentProfile::create([
            'user_id' => $this->studentUser->id,
            'registration_number' => 'GTTI-2026-9901',
            'father_name' => 'Muhammad Ali',
            'status' => 'active',
        ]);

        $this->application = Application::create([
            'admission_campaign_id' => $this->campaign->id,
            'student_profile_id' => $this->studentProfile->id,
            'course_id' => $this->meritCourse->id,
            'application_number' => 'APP-2026-0042',
            'status' => 'submitted',
            'obtained_marks' => 880,
            'total_marks' => 1100,
        ]);
    }

    public function test_course_admission_type_helpers(): void
    {
        $this->assertTrue($this->meritCourse->isMeritBased());
        $this->assertFalse($this->meritCourse->isFcfs());

        $this->assertTrue($this->fcfsCourse->isFcfs());
        $this->assertFalse($this->fcfsCourse->isMeritBased());
    }

    public function test_teacher_can_schedule_entrance_exam_and_attempts_are_generated(): void
    {
        $response = $this->actingAs($this->teacher)
            ->post(route('teacher.admission-tests.store'), [
                'course_id' => $this->meritCourse->id,
                'test_type' => 'cbt_online',
                'exam_date' => now()->addDays(2)->toDateString(),
                'start_time' => '10:00 AM',
                'venue' => 'Main IT Lab 2',
                'duration_minutes' => 60,
                'total_marks' => 100,
                'passing_marks' => 40,
                'instructions' => 'No electronic gadgets allowed.',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('admission_entrance_exams', [
            'course_id' => $this->meritCourse->id,
            'teacher_id' => $this->teacher->id,
            'venue' => 'Main IT Lab 2',
            'is_live' => false,
        ]);

        $exam = AdmissionEntranceExam::where('course_id', $this->meritCourse->id)->first();

        // Check applicant attempt was automatically generated
        $this->assertDatabaseHas('entrance_test_attempts', [
            'entrance_exam_id' => $exam->id,
            'application_id' => $this->application->id,
            'student_profile_id' => $this->studentProfile->id,
            'matric_marks_obtained' => 880,
            'total_matric_marks' => 1100,
            'status' => 'scheduled',
        ]);

        $this->application->refresh();
        $this->assertEquals('scheduled', $this->application->test_status);
    }

    public function test_teacher_can_toggle_live_status(): void
    {
        $exam = AdmissionEntranceExam::create([
            'course_id' => $this->meritCourse->id,
            'teacher_id' => $this->teacher->id,
            'test_type' => 'cbt_online',
            'exam_date' => now()->toDateString(),
            'start_time' => '09:00 AM',
            'venue' => 'Lab 1',
            'total_marks' => 100,
            'passing_marks' => 40,
            'duration_minutes' => 60,
            'is_live' => false,
        ]);

        // Toggle to Live
        $this->actingAs($this->teacher)
            ->post(route('teacher.admission-tests.toggle-live', $exam->id));

        $exam->refresh();
        $this->assertTrue($exam->is_live);

        // Toggle back to Offline
        $this->actingAs($this->teacher)
            ->post(route('teacher.admission-tests.toggle-live', $exam->id));

        $exam->refresh();
        $this->assertFalse($exam->is_live);
    }

    public function test_teacher_can_bulk_upload_questions_via_csv(): void
    {
        $exam = AdmissionEntranceExam::create([
            'course_id' => $this->meritCourse->id,
            'teacher_id' => $this->teacher->id,
            'test_type' => 'cbt_online',
            'exam_date' => now()->toDateString(),
            'start_time' => '09:00 AM',
            'venue' => 'Lab 1',
            'total_marks' => 100,
            'passing_marks' => 40,
            'duration_minutes' => 60,
        ]);

        $csvContent = "Question,Option A,Option B,Option C,Option D,Correct Option,Marks\n"
            . "What is HTML?,HyperText Markup Language,HighText Machine Lang,Hyperlink Tool,None,A,2\n"
            . "What is CPU?,Central Processing Unit,Computer Power Unit,Central Plant,None,A,2\n";

        $file = UploadedFile::fake()->createWithContent('questions.csv', $csvContent);

        $response = $this->actingAs($this->teacher)
            ->post(route('teacher.admission-tests.bulk-upload', $exam->id), [
                'file' => $file,
            ]);

        $response->assertRedirect();
        $this->assertEquals(2, EntranceTestQuestion::where('entrance_exam_id', $exam->id)->count());
    }

    public function test_candidate_cannot_enter_locked_exam(): void
    {
        $exam = AdmissionEntranceExam::create([
            'course_id' => $this->meritCourse->id,
            'teacher_id' => $this->teacher->id,
            'test_type' => 'cbt_online',
            'exam_date' => now()->toDateString(),
            'start_time' => '09:00 AM',
            'venue' => 'Lab 1',
            'is_live' => false, // LOCKED
        ]);

        EntranceTestAttempt::create([
            'entrance_exam_id' => $exam->id,
            'application_id' => $this->application->id,
            'student_profile_id' => $this->studentProfile->id,
            'status' => 'scheduled',
        ]);

        $response = $this->post(route('admissions.cbt-exam.verify'), [
            'cnic' => '31202-1234567-1',
            'application_number' => 'APP-2026-0042',
        ]);

        $response->assertSessionHasErrors('live_status');
        $this->assertNull(session('cbt_attempt_id'));
    }

    public function test_candidate_can_access_live_exam_with_shuffled_questions(): void
    {
        $exam = AdmissionEntranceExam::create([
            'course_id' => $this->meritCourse->id,
            'teacher_id' => $this->teacher->id,
            'test_type' => 'cbt_online',
            'exam_date' => now()->toDateString(),
            'start_time' => '09:00 AM',
            'venue' => 'Lab 1',
            'total_marks' => 10,
            'duration_minutes' => 60,
            'is_live' => true, // LIVE
        ]);

        for ($i = 1; $i <= 3; $i++) {
            EntranceTestQuestion::create([
                'entrance_exam_id' => $exam->id,
                'question_text' => "Question {$i}",
                'option_a' => "Answer {$i} A",
                'option_b' => "Answer {$i} B",
                'option_c' => "Answer {$i} C",
                'option_d' => "Answer {$i} D",
                'correct_option' => 'A',
                'marks' => 2,
            ]);
        }

        $attempt = EntranceTestAttempt::create([
            'entrance_exam_id' => $exam->id,
            'application_id' => $this->application->id,
            'student_profile_id' => $this->studentProfile->id,
            'status' => 'scheduled',
        ]);

        // Verify login
        $verifyRes = $this->post(route('admissions.cbt-exam.verify'), [
            'cnic' => '31202-1234567-1',
            'application_number' => 'APP-2026-0042',
        ]);

        $verifyRes->assertRedirect(route('admissions.cbt-exam.take'));
        $this->assertEquals($attempt->id, session('cbt_attempt_id'));

        // Take exam
        $takeRes = $this->get(route('admissions.cbt-exam.take'));
        $takeRes->assertOk();

        $attempt->refresh();
        $this->assertEquals('in_progress', $attempt->status);
        $this->assertNotNull($attempt->started_at);
        $this->assertNotEmpty($attempt->shuffled_question_order);
    }

    public function test_automated_grading_and_composite_merit_score(): void
    {
        $exam = AdmissionEntranceExam::create([
            'course_id' => $this->meritCourse->id,
            'teacher_id' => $this->teacher->id,
            'test_type' => 'cbt_online',
            'exam_date' => now()->toDateString(),
            'start_time' => '09:00 AM',
            'venue' => 'Lab 1',
            'total_marks' => 10,
            'passing_marks' => 4,
            'duration_minutes' => 60,
            'is_live' => true,
        ]);

        $q1 = EntranceTestQuestion::create([
            'entrance_exam_id' => $exam->id,
            'question_text' => 'Question 1',
            'option_a' => 'Correct Option',
            'option_b' => 'Wrong 1',
            'option_c' => 'Wrong 2',
            'option_d' => 'Wrong 3',
            'correct_option' => 'A',
            'marks' => 5,
        ]);

        $attempt = EntranceTestAttempt::create([
            'entrance_exam_id' => $exam->id,
            'application_id' => $this->application->id,
            'student_profile_id' => $this->studentProfile->id,
            'matric_marks_obtained' => 880,
            'total_matric_marks' => 1100, // 880 / 1100 = 80%
            'shuffled_question_order' => [
                [
                    'question_id' => $q1->id,
                    'options' => [
                        'A' => ['text' => 'Correct Option', 'orig_key' => 'A'],
                        'B' => ['text' => 'Wrong 1', 'orig_key' => 'B'],
                        'C' => ['text' => 'Wrong 2', 'orig_key' => 'C'],
                        'D' => ['text' => 'Wrong 3', 'orig_key' => 'D'],
                    ],
                ],
            ],
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        session(['cbt_attempt_id' => $attempt->id]);

        // Submit answer A (correct key)
        $response = $this->post(route('admissions.cbt-exam.submit'), [
            'answers' => [
                $q1->id => 'A',
            ],
        ]);

        $response->assertOk();

        $attempt->refresh();
        $this->application->refresh();

        $this->assertEquals('completed', $attempt->status);
        $this->assertEquals(5, $attempt->entrance_marks_obtained);

        // Matric: 80% * 50 = 40. Test: (5/10) * 50 = 25. Composite: 40 + 25 = 65%
        $this->assertEquals(65.0, $attempt->composite_merit_score);
        $this->assertEquals(65.0, $this->application->merit_score);
        $this->assertEquals('passed', $this->application->test_status);
    }

    public function test_merit_controller_ranks_merit_based_and_fcfs_correctly(): void
    {
        // 1. Merit-based course ranking
        $app1 = Application::create([
            'admission_campaign_id' => $this->campaign->id,
            'student_profile_id' => $this->studentProfile->id,
            'course_id' => $this->meritCourse->id,
            'application_number' => 'APP-2026-M1',
            'status' => 'submitted',
            'obtained_marks' => 700,
            'total_marks' => 1100,
        ]);

        $app2 = Application::create([
            'admission_campaign_id' => $this->campaign->id,
            'student_profile_id' => $this->studentProfile->id,
            'course_id' => $this->meritCourse->id,
            'application_number' => 'APP-2026-M2',
            'status' => 'submitted',
            'obtained_marks' => 1000,
            'total_marks' => 1100,
        ]);

        $exam = AdmissionEntranceExam::create([
            'course_id' => $this->meritCourse->id,
            'teacher_id' => $this->teacher->id,
            'test_type' => 'cbt_online',
            'exam_date' => now()->toDateString(),
            'start_time' => '09:00 AM',
            'venue' => 'Lab 1',
            'total_marks' => 100,
            'passing_marks' => 40,
            'duration_minutes' => 60,
        ]);

        // M1 has higher test composite score (85%)
        EntranceTestAttempt::create([
            'entrance_exam_id' => $exam->id,
            'application_id' => $app1->id,
            'student_profile_id' => $this->studentProfile->id,
            'composite_merit_score' => 85.0,
            'status' => 'completed',
        ]);

        // M2 has lower test composite score (60%)
        EntranceTestAttempt::create([
            'entrance_exam_id' => $exam->id,
            'application_id' => $app2->id,
            'student_profile_id' => $this->studentProfile->id,
            'composite_merit_score' => 60.0,
            'status' => 'completed',
        ]);

        $response = $this->actingAs($this->admin)
            ->post(route('admin.merit.store'), [
                'course_id' => $this->meritCourse->id,
                'title' => 'First Open Merit List - Software Technology',
            ]);

        $response->assertRedirect();

        $app1->refresh();
        $app2->refresh();

        $this->assertEquals(85.0, $app1->merit_score);
        $this->assertEquals(60.0, $app2->merit_score);
        $this->assertEquals('selected', $app1->status);
    }
}
