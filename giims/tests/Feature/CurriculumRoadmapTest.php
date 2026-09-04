<?php

namespace Tests\Feature;

use App\Domains\Academic\Models\DailyLesson;
use App\Domains\Identity\Models\Role;
use App\Domains\Identity\Models\User;
use App\Domains\Organization\Models\Batch;
use App\Domains\Organization\Models\Course;
use App\Domains\Organization\Models\Department;
use App\Domains\Organization\Models\Program;
use App\Domains\Organization\Models\Trade;
use App\Domains\Student\Models\Enrollment;
use App\Domains\Student\Models\StudentProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class CurriculumRoadmapTest extends TestCase
{
    use RefreshDatabase;

    protected User $clerk;
    protected User $teacher;
    protected User $student;
    protected Course $course;
    protected Batch $batch;

    protected function setUp(): void
    {
        parent::setUp();

        // Ensure roles exist
        Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Super Administrator']);
        Role::firstOrCreate(['slug' => 'clerk'], ['name' => 'Admission Clerk']);
        Role::firstOrCreate(['slug' => 'teacher'], ['name' => 'Instructor / Teacher']);
        Role::firstOrCreate(['slug' => 'student'], ['name' => 'Trainee / Student']);

        // Institute, Department, Program, Trade
        $institute = \App\Domains\Organization\Models\Institute::create(['name' => 'GTTI RYK', 'code' => 'GTTI-RYK', 'is_active' => true]);
        $dept = Department::create(['institute_id' => $institute->id, 'name' => 'Information Technology Wing', 'code' => 'IT', 'is_active' => true]);
        $prog = Program::create(['department_id' => $dept->id, 'name' => 'Software & Cyber', 'type' => 'diploma', 'duration_months' => 6]);
        $trade = Trade::create(['program_id' => $prog->id, 'name' => 'Python & Web Development', 'code' => 'IT-PY']);

        // Course
        $this->course = Course::create([
            'trade_id' => $trade->id,
            'name' => 'Full-Stack Web Development',
            'category' => 'Information Technology',
            'duration_type' => 'months',
            'duration_value' => 3,
            'total_academic_days' => 60,
            'entry_level' => 'Matric',
            'admission_type' => 'merit_based',
            'is_published' => true,
            'is_active' => true,
        ]);

        // Batch
        $this->batch = Batch::create([
            'course_id' => $this->course->id,
            'name' => 'Batch 2026-A',
            'session_year' => '2026',
            'shift' => 'Morning',
            'start_date' => now()->subMonth(),
            'end_date' => now()->addMonths(2),
        ]);

        // Clerk user
        $this->clerk = User::factory()->create(['email' => 'clerk_test@gtti.edu.pk']);
        $this->clerk->roles()->attach(Role::where('slug', 'clerk')->first());

        // Teacher user
        $this->teacher = User::factory()->create(['email' => 'teacher_test@gtti.edu.pk']);
        $this->teacher->roles()->attach(Role::where('slug', 'teacher')->first());
        $this->batch->teachers()->attach($this->teacher->id);

        // Student user with profile and active enrollment
        $this->student = User::factory()->create(['email' => 'student_test@gtti.edu.pk']);
        $this->student->roles()->attach(Role::where('slug', 'student')->first());
        $profile = StudentProfile::create([
            'user_id' => $this->student->id,
            'registration_number' => 'GTTI-2026-001',
            'father_name' => 'Father Name',
            'status' => 'enrolled',
        ]);
        Enrollment::create([
            'student_profile_id' => $profile->id,
            'course_id' => $this->course->id,
            'batch_id' => $this->batch->id,
            'enrollment_number' => 'GTTI-2026-001',
            'status' => 'active',
            'enrollment_date' => now(),
        ]);
    }

    public function test_clerk_can_create_course_with_flexible_duration_and_category(): void
    {
        $trade = Trade::first();

        $response = $this->actingAs($this->clerk)->post(route('clerk.courses.store'), [
            'trade_id' => $trade->id,
            'name' => 'Solar Energy & Photovoltaic Systems',
            'category' => 'Electrical & Electronics',
            'duration_type' => 'months',
            'duration_value' => 6,
            'total_academic_days' => 90,
            'entry_level' => 'Matric Science',
            'admission_type' => 'first_come_first_served',
            'is_published' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('courses', [
            'name' => 'Solar Energy & Photovoltaic Systems',
            'category' => 'Electrical & Electronics',
            'duration_type' => 'months',
            'duration_value' => 6,
            'total_academic_days' => 90,
            'is_published' => true,
        ]);

        $created = Course::where('name', 'Solar Energy & Photovoltaic Systems')->first();
        $this->assertEquals('6 Months CBT&A', $created->formatted_duration);
    }

    public function test_public_home_page_displays_published_courses(): void
    {
        $response = $this->get(route('home'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/Home')
            ->has('publishedCourses')
            ->where('publishedCourses.0.name', 'Full-Stack Web Development')
            ->where('publishedCourses.0.formatted_duration', '3 Months Short Course')
        );
    }

    public function test_teacher_can_access_batch_curriculum_cockpit(): void
    {
        $response = $this->actingAs($this->teacher)->get(route('curriculum.index', $this->batch->id));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Teacher/Curriculum/Index')
            ->has('batch')
            ->has('course')
            ->has('lessons')
            ->has('stats')
        );
    }

    public function test_teacher_can_bulk_import_daily_lessons_via_csv(): void
    {
        $csvContent = "DayNumber,TopicTitle,TheoryContent,PracticalTask\n"
            . "1,Intro to Web Development,HTML tags and structure,Write a basic index.html\n"
            . "2,CSS Styling Fundamentals,CSS Box Model and selectors,Style the layout using CSS\n"
            . "3,Responsive Flexbox,Flex container and alignment properties,Build a navigation bar\n";

        $file = UploadedFile::fake()->createWithContent('curriculum.csv', $csvContent);

        $response = $this->actingAs($this->teacher)->post(route('curriculum.import', $this->batch->id), [
            'csv_file' => $file,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('daily_lessons', [
            'batch_id' => $this->batch->id,
            'day_number' => 1,
            'topic_title' => 'Intro to Web Development',
            'theory_content' => 'HTML tags and structure',
            'practical_task' => 'Write a basic index.html',
        ]);

        $this->assertDatabaseHas('daily_lessons', [
            'batch_id' => $this->batch->id,
            'day_number' => 2,
            'topic_title' => 'CSS Styling Fundamentals',
        ]);

        $this->assertDatabaseHas('daily_lessons', [
            'batch_id' => $this->batch->id,
            'day_number' => 3,
            'topic_title' => 'Responsive Flexbox',
        ]);
    }

    public function test_teacher_can_add_single_day_lesson_manually(): void
    {
        $response = $this->actingAs($this->teacher)->post(route('curriculum.store-lesson', $this->batch->id), [
            'day_number' => 4,
            'topic_title' => 'JavaScript DOM Manipulation',
            'theory_content' => 'Event listeners and selectors',
            'practical_task' => 'Build a dynamic counter',
            'resource_url' => 'https://developer.mozilla.org',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('daily_lessons', [
            'batch_id' => $this->batch->id,
            'day_number' => 4,
            'topic_title' => 'JavaScript DOM Manipulation',
            'resource_url' => 'https://developer.mozilla.org',
        ]);
    }

    public function test_teacher_can_toggle_day_completion(): void
    {
        $lesson = DailyLesson::create([
            'batch_id' => $this->batch->id,
            'day_number' => 1,
            'topic_title' => 'Intro to Web',
            'status' => 'pending',
        ]);

        // Toggle to completed
        $response = $this->actingAs($this->teacher)->patch(route('curriculum.toggle-lesson', $lesson->id));
        $response->assertRedirect();

        $lesson->refresh();
        $this->assertEquals('completed', $lesson->status);
        $this->assertNotNull($lesson->completed_at);

        // Toggle back to pending
        $response = $this->actingAs($this->teacher)->patch(route('curriculum.toggle-lesson', $lesson->id));
        $response->assertRedirect();

        $lesson->refresh();
        $this->assertEquals('pending', $lesson->status);
        $this->assertNull($lesson->completed_at);
    }

    public function test_teacher_can_attach_resource_to_lesson(): void
    {
        $lesson = DailyLesson::create([
            'batch_id' => $this->batch->id,
            'day_number' => 1,
            'topic_title' => 'Intro to Web',
        ]);

        $response = $this->actingAs($this->teacher)->post(route('curriculum.attach-resource', $lesson->id), [
            'resource_url' => 'https://example.com/handout.pdf',
        ]);

        $response->assertRedirect();
        $lesson->refresh();
        $this->assertEquals('https://example.com/handout.pdf', $lesson->resource_url);
    }

    public function test_enrolled_student_can_view_interactive_curriculum_roadmap(): void
    {
        DailyLesson::create([
            'batch_id' => $this->batch->id,
            'day_number' => 1,
            'topic_title' => 'Web Foundations',
            'theory_content' => 'HTML, CSS, and JS',
            'practical_task' => 'Create a project folder',
            'status' => 'completed',
        ]);

        $response = $this->actingAs($this->student)->get(route('student.curriculum.journey'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Student/Lms/CurriculumJourney')
            ->has('enrollment')
            ->has('course')
            ->has('batch')
            ->has('lessons')
            ->has('stats')
        );
    }

    public function test_enrolled_student_can_jump_to_specific_day(): void
    {
        DailyLesson::create([
            'batch_id' => $this->batch->id,
            'day_number' => 5,
            'topic_title' => 'Advanced APIs',
            'theory_content' => 'REST principles',
            'practical_task' => 'Fetch test data',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->student)->get(route('student.curriculum.journey', ['day' => 5]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Student/Lms/CurriculumJourney')
            ->where('selectedDayNumber', 5)
            ->where('currentLesson.topic_title', 'Advanced APIs')
        );
    }
}
