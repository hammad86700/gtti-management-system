<?php

namespace Tests\Feature;

use App\Domains\Admissions\Models\AdmissionCampaign;
use App\Domains\Admissions\Models\AdmissionEntranceExam;
use App\Domains\Admissions\Models\Application;
use App\Domains\Admissions\Models\EntranceTestAttempt;
use App\Domains\Admissions\Models\EntranceTestQuestion;
use App\Domains\Admissions\Models\InterviewQuestion;
use App\Domains\Identity\Models\Role;
use App\Domains\Identity\Models\User;
use App\Domains\Organization\Models\Course;
use App\Domains\Organization\Models\Department;
use App\Domains\Organization\Models\Institute;
use App\Domains\Organization\Models\Program;
use App\Domains\Organization\Models\Trade;
use App\Domains\Student\Models\StudentProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdmissionMeritEngineTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $teacher;
    protected User $interviewerA;
    protected User $interviewerB;
    protected User $clerk;
    protected User $studentUser;
    protected StudentProfile $studentProfile;
    protected Course $meritCourse;
    protected Course $fcfsCourse;
    protected AdmissionCampaign $campaign;
    protected AdmissionEntranceExam $entranceExam;
    protected Application $meritApplication;
    protected Application $fcfsApplication;
    protected EntranceTestAttempt $attempt;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin', 'is_system' => true]);
        $teacherRole = Role::firstOrCreate(['slug' => 'teacher'], ['name' => 'Teacher', 'is_system' => false]);
        $interviewerRole = Role::firstOrCreate(['slug' => 'interviewer'], ['name' => 'Interviewer', 'is_system' => false]);
        $clerkRole = Role::firstOrCreate(['slug' => 'clerk'], ['name' => 'Clerk', 'is_system' => false]);
        $studentRole = Role::firstOrCreate(['slug' => 'student'], ['name' => 'Student', 'is_system' => false]);

        $institute = Institute::create(['name' => 'GTTI RYK', 'code' => 'GTTI-RYK', 'is_active' => true]);
        $dept = Department::create(['institute_id' => $institute->id, 'name' => 'Electrical Department', 'code' => 'ELEC']);
        $prog = Program::create(['department_id' => $dept->id, 'name' => 'DAE', 'type' => 'diploma', 'duration_months' => 36]);
        $trade = Trade::create(['program_id' => $prog->id, 'name' => 'Electrical Technology', 'code' => 'ET']);

        $this->admin = User::factory()->create(['name' => 'Admin Officer']);
        $this->admin->roles()->attach($adminRole);

        $this->teacher = User::factory()->create(['name' => 'Lead Teacher']);
        $this->teacher->roles()->attach($teacherRole);

        $this->interviewerA = User::factory()->create(['name' => 'Examiner Ali']);
        $this->interviewerA->roles()->attach($interviewerRole);

        $this->interviewerB = User::factory()->create(['name' => 'Examiner Bilal']);
        $this->interviewerB->roles()->attach($interviewerRole);

        $this->clerk = User::factory()->create(['name' => 'Admission Clerk']);
        $this->clerk->roles()->attach($clerkRole);

        $this->studentUser = User::factory()->create([
            'name' => 'Usman Tariq',
            'cnic' => '31201-1122334-5',
        ]);
        $this->studentUser->roles()->attach($studentRole);

        $this->studentProfile = StudentProfile::create([
            'user_id' => $this->studentUser->id,
            'registration_number' => 'GTTI-2026-001',
            'father_name' => 'Tariq Mehmood',
            'status' => 'applicant',
        ]);

        $this->campaign = AdmissionCampaign::create([
            'institute_id' => $institute->id,
            'name' => 'Fall 2026 Admissions',
            'start_date' => now()->subMonth(),
            'end_date' => now()->addMonth(),
            'is_active' => true,
        ]);

        // 1. Merit-based Course
        $this->meritCourse = Course::create([
            'trade_id' => $trade->id,
            'name' => 'Electrical Automation (Merit)',
            'entry_level' => 'Matric',
            'admission_type' => 'merit_based',
            'requires_entrance_test' => true,
            'matric_weightage' => 50,
            'test_weightage' => 40,
            'interview_weightage' => 10,
            'interview_max_marks' => 10,
            'interview_venue' => 'Lab 3 / Interview Room',
            'is_active' => true,
        ]);

        // 2. FCFS Course
        $this->fcfsCourse = Course::create([
            'trade_id' => $trade->id,
            'name' => 'Basic Electrician (FCFS)',
            'entry_level' => 'Middle',
            'admission_type' => 'first_come_first_served',
            'requires_entrance_test' => false,
            'is_active' => true,
        ]);

        $this->meritApplication = Application::create([
            'admission_campaign_id' => $this->campaign->id,
            'student_profile_id' => $this->studentProfile->id,
            'course_id' => $this->meritCourse->id,
            'application_number' => 'APP-ET-001',
            'status' => 'submitted',
        ]);

        $this->fcfsApplication = Application::create([
            'admission_campaign_id' => $this->campaign->id,
            'student_profile_id' => $this->studentProfile->id,
            'course_id' => $this->fcfsCourse->id,
            'application_number' => 'APP-ET-FCFS',
            'status' => 'submitted',
        ]);

        // Scheduled Exam
        $this->entranceExam = AdmissionEntranceExam::create([
            'course_id' => $this->meritCourse->id,
            'teacher_id' => $this->teacher->id,
            'test_type' => 'cbt_online',
            'exam_date' => today(),
            'start_time' => '09:00 AM',
            'venue' => 'Main Lab 1',
            'duration_minutes' => 60,
            'total_marks' => 50,
            'passing_marks' => 20,
            'is_live' => false,
        ]);

        // Attempt for candidate
        $this->attempt = EntranceTestAttempt::create([
            'entrance_exam_id' => $this->entranceExam->id,
            'application_id' => $this->meritApplication->id,
            'student_profile_id' => $this->studentProfile->id,
            'matric_marks_obtained' => 880,
            'total_matric_marks' => 1100, // 80% => 40/50 weighted
            'status' => 'scheduled',
            'is_present' => true,
        ]);

        // Interview Question
        InterviewQuestion::create([
            'course_id' => $this->meritCourse->id,
            'question_text' => 'What is Ohm\'s Law and how do you calculate electrical resistance?',
        ]);
    }

    public function test_fcfs_course_admits_student_directly_upon_clerk_verification_without_test(): void
    {
        $response = $this->actingAs($this->clerk)
            ->post(route('clerk.applications.verify', $this->fcfsApplication->id));

        $response->assertRedirect();
        $this->fcfsApplication->refresh();

        $this->assertEquals('challan_issued', $this->fcfsApplication->status);
        $this->assertEquals('unpaid', $this->fcfsApplication->fee_status);
        $this->assertNull($this->fcfsApplication->test_date);
    }

    public function test_merit_course_verifies_awaiting_test(): void
    {
        $response = $this->actingAs($this->clerk)
            ->post(route('clerk.applications.verify', $this->meritApplication->id));

        $response->assertRedirect();
        $this->meritApplication->refresh();

        $this->assertEquals('verified', $this->meritApplication->status);
    }

    public function test_cbt_login_blocked_when_exam_not_live(): void
    {
        $this->entranceExam->update(['is_live' => false]);

        $response = $this->post(route('admissions.cbt-exam.verify'), [
            'cnic' => '31201-1122334-5',
            'application_number' => 'APP-ET-001',
        ]);

        $response->assertSessionHasErrors('live_status');
    }

    public function test_cbt_submission_records_cbt_score_and_sets_interview_waiting(): void
    {
        $this->entranceExam->update(['is_live' => true]);

        // Create 2 test questions
        $q1 = EntranceTestQuestion::create([
            'entrance_exam_id' => $this->entranceExam->id,
            'question_text' => 'Unit of Voltage?',
            'option_a' => 'Volt',
            'option_b' => 'Ampere',
            'option_c' => 'Ohm',
            'option_d' => 'Watt',
            'correct_option' => 'A',
            'marks' => 25,
        ]);
        $q2 = EntranceTestQuestion::create([
            'entrance_exam_id' => $this->entranceExam->id,
            'question_text' => 'Unit of Current?',
            'option_a' => 'Ampere',
            'option_b' => 'Volt',
            'option_c' => 'Ohm',
            'option_d' => 'Watt',
            'correct_option' => 'A',
            'marks' => 25,
        ]);

        $this->attempt->update([
            'started_at' => now(),
            'status' => 'in_progress',
            'shuffled_question_order' => [
                ['question_id' => $q1->id, 'options' => ['A' => ['text' => 'Volt', 'orig_key' => 'A']]],
                ['question_id' => $q2->id, 'options' => ['A' => ['text' => 'Ampere', 'orig_key' => 'A']]],
            ],
        ]);

        session(['cbt_attempt_id' => $this->attempt->id]);

        $response = $this->post(route('admissions.cbt-exam.submit'), [
            'answers' => [
                $q1->id => 'A',
                $q2->id => 'A',
            ],
        ]);

        $response->assertOk();
        $this->attempt->refresh();

        $this->assertEquals('completed', $this->attempt->status);
        $this->assertEquals(50, $this->attempt->cbt_score);
        $this->assertEquals('waiting', $this->attempt->interview_status);
    }

    public function test_interviewer_concurrency_locking_prevents_evaluation_collisions(): void
    {
        $this->attempt->update([
            'status' => 'completed',
            'cbt_score' => 45,
            'interview_status' => 'waiting',
        ]);

        // Examiner Ali claims candidate
        $claimResA = $this->actingAs($this->interviewerA)
            ->post(route('interviewer.viva.claim', $this->attempt->id));

        $claimResA->assertRedirect(route('interviewer.viva.evaluate', $this->attempt->id));
        $this->attempt->refresh();

        $this->assertEquals('in_progress', $this->attempt->interview_status);
        $this->assertEquals($this->interviewerA->id, $this->attempt->evaluated_by);
        $this->assertNotNull($this->attempt->locked_at);

        // Examiner Bilal attempts to claim same candidate -> Collision blocked!
        $claimResB = $this->actingAs($this->interviewerB)
            ->post(route('interviewer.viva.claim', $this->attempt->id));

        $claimResB->assertSessionHas('error');
        $this->attempt->refresh();
        $this->assertEquals($this->interviewerA->id, $this->attempt->evaluated_by);
    }

    public function test_interviewer_can_submit_viva_evaluation_and_recalculates_composite_score(): void
    {
        $this->attempt->update([
            'status' => 'completed',
            'cbt_score' => 50, // 50/50 => 100% * 40 weight = 40.0
            'matric_marks_obtained' => 880,
            'total_matric_marks' => 1100, // 880/1100 => 80% * 50 weight = 40.0
            'interview_status' => 'in_progress',
            'evaluated_by' => $this->interviewerA->id,
            'locked_at' => now(),
        ]);

        $response = $this->actingAs($this->interviewerA)
            ->post(route('interviewer.viva.submit', $this->attempt->id), [
                'interview_score' => 10, // 10/10 => 100% * 10 weight = 10.0
                'interview_remarks' => 'Outstanding technical grasp of electrical systems.',
            ]);

        $response->assertRedirect(route('interviewer.viva.index', $this->meritCourse->id));
        $this->attempt->refresh();

        $this->assertEquals('completed', $this->attempt->interview_status);
        $this->assertEquals(10, $this->attempt->interview_score);
        $this->assertNull($this->attempt->locked_at); // lock cleared

        // Composite calculation: 40 (matric) + 40 (cbt) + 10 (viva) = 90.0%
        $this->assertEquals(90.0, (float) $this->attempt->composite_score);
        $this->meritApplication->refresh();
        $this->assertEquals(90.0, (float) $this->meritApplication->merit_score);
    }

    public function test_dynamic_seat_cutoff_selector_partitions_candidates_into_selected_and_waiting(): void
    {
        // Candidate 1 (Usman): Composite 90
        $this->attempt->update([
            'status' => 'completed',
            'composite_score' => 90.0,
            'interview_status' => 'completed',
        ]);

        // Candidate 2: Composite 75
        $cand2User = User::factory()->create();
        $cand2Profile = StudentProfile::create(['user_id' => $cand2User->id, 'registration_number' => 'GTTI-002']);
        $cand2App = Application::create([
            'admission_campaign_id' => $this->campaign->id,
            'student_profile_id' => $cand2Profile->id,
            'course_id' => $this->meritCourse->id,
            'application_number' => 'APP-ET-002',
            'status' => 'submitted',
        ]);
        $attempt2 = EntranceTestAttempt::create([
            'entrance_exam_id' => $this->entranceExam->id,
            'application_id' => $cand2App->id,
            'student_profile_id' => $cand2Profile->id,
            'status' => 'completed',
            'composite_score' => 75.0,
            'interview_status' => 'completed',
        ]);

        // Candidate 3: Composite 60
        $cand3User = User::factory()->create();
        $cand3Profile = StudentProfile::create(['user_id' => $cand3User->id, 'registration_number' => 'GTTI-003']);
        $cand3App = Application::create([
            'admission_campaign_id' => $this->campaign->id,
            'student_profile_id' => $cand3Profile->id,
            'course_id' => $this->meritCourse->id,
            'application_number' => 'APP-ET-003',
            'status' => 'submitted',
        ]);
        $attempt3 = EntranceTestAttempt::create([
            'entrance_exam_id' => $this->entranceExam->id,
            'application_id' => $cand3App->id,
            'student_profile_id' => $cand3Profile->id,
            'status' => 'completed',
            'composite_score' => 60.0,
            'interview_status' => 'completed',
        ]);

        // Cutoff = 2 Allocated Seats
        $response = $this->actingAs($this->teacher)
            ->post(route('teacher.merit-desk.apply-cutoff', $this->meritCourse->id), [
                'allocated_seats' => 2,
                'minimum_passing_score' => 40,
            ]);

        $response->assertRedirect();

        $this->attempt->refresh();
        $attempt2->refresh();
        $attempt3->refresh();

        // Cand 1 (90%) => Rank 1, Selected
        $this->assertEquals('selected', $this->attempt->selection_status);
        $this->assertEquals(1, $this->attempt->merit_rank);
        $this->assertEquals('selected_for_admission', $this->meritApplication->fresh()->status);

        // Cand 2 (75%) => Rank 2, Selected
        $this->assertEquals('selected', $attempt2->selection_status);
        $this->assertEquals(2, $attempt2->merit_rank);
        $this->assertEquals('selected_for_admission', $cand2App->fresh()->status);

        // Cand 3 (60%) => Rank 3, Waiting
        $this->assertEquals('waiting', $attempt3->selection_status);
        $this->assertEquals(3, $attempt3->merit_rank);
        $this->assertEquals('waiting_list', $cand3App->fresh()->status);
    }

    public function test_official_print_merit_gazette_and_scorecard_render_successfully(): void
    {
        $this->attempt->update([
            'status' => 'completed',
            'composite_score' => 88.5,
            'merit_rank' => 1,
            'selection_status' => 'selected',
        ]);

        // 1. Merit Gazette
        $gazetteRes = $this->actingAs($this->teacher)
            ->get(route('teacher.merit-desk.gazette', $this->meritCourse->id));
        $gazetteRes->assertOk();

        // 2. Candidate Scorecard
        $scorecardRes = $this->actingAs($this->teacher)
            ->get(route('teacher.merit-desk.scorecard', $this->attempt->id));
        $scorecardRes->assertOk();
    }

    public function test_clerk_can_generate_challans_for_selected_candidates(): void
    {
        $this->meritApplication->update([
            'status' => 'selected_for_admission',
        ]);

        $response = $this->actingAs($this->clerk)
            ->post(route('clerk.courses.generate-challans', $this->meritCourse->id));

        $response->assertRedirect();
        $this->meritApplication->refresh();

        $this->assertEquals('unpaid', $this->meritApplication->fee_status);
    }
}
