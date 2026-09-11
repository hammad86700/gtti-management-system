<?php

namespace Tests\Feature;

use App\Domains\Identity\Models\Role;
use App\Domains\Identity\Models\User;
use App\Domains\Organization\Models\Course;
use App\Domains\Organization\Models\Department;
use App\Domains\Organization\Models\Institute;
use App\Domains\Organization\Models\Program;
use App\Domains\Organization\Models\Trade;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CourseAdvertisementDisplayTest extends TestCase
{
    use RefreshDatabase;

    protected Institute $institute;
    protected User $clerk;
    protected Trade $trade;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');

        $clerkRole = Role::firstOrCreate(['slug' => 'clerk'], ['name' => 'Admission Clerk', 'is_system' => false]);

        $this->institute = Institute::create([
            'name' => 'Government Technical Training Institute',
            'code' => 'GTTI-RYK',
            'is_active' => true,
        ]);

        $dept = Department::create(['institute_id' => $this->institute->id, 'name' => 'Information Technology', 'code' => 'IT']);
        $prog = Program::create(['department_id' => $dept->id, 'name' => 'Vocational G-II', 'type' => 'vocational', 'duration_months' => 6]);
        $this->trade = Trade::create(['program_id' => $prog->id, 'name' => 'Computer Applications', 'code' => 'CIT']);

        $this->clerk = User::factory()->create(['institute_id' => $this->institute->id, 'email' => 'clerk@gtti.edu.pk']);
        $this->clerk->roles()->attach($clerkRole->id);
    }

    public function test_clerk_can_create_course_with_advertisement_image(): void
    {
        $file = UploadedFile::fake()->image('web_development_flyer.png', 1200, 675);

        $payload = [
            'trade_id' => $this->trade->id,
            'name' => 'Full Stack Web Development',
            'category' => 'Software Engineering',
            'overview_description' => 'Comprehensive vocational training in modern web applications.',
            'duration_type' => 'months',
            'duration_value' => 6,
            'total_academic_days' => 60,
            'entry_level' => 'Matric',
            'admission_type' => 'first_come_first_served',
            'intake_capacity' => 40,
            'offered_shifts' => 'Both',
            'is_active' => true,
            'is_published' => true,
            'advertisement_image' => $file,
        ];

        $response = $this
            ->actingAs($this->clerk)
            ->post(route('clerk.courses.store'), $payload);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $course = Course::where('name', 'Full Stack Web Development')->first();
        $this->assertNotNull($course);
        $this->assertNotNull($course->advertisement_image_path);
        Storage::disk('public')->assertExists($course->advertisement_image_path);

        // Verify advertisement_url accessor returns root-relative storage path
        $this->assertStringStartsWith('/storage/', $course->advertisement_url);
    }

    public function test_clerk_can_update_and_replace_course_advertisement_image(): void
    {
        $oldFile = UploadedFile::fake()->image('old_flyer.png', 800, 600);
        $path = $oldFile->store('course_advertisements', 'public');

        $course = Course::create([
            'trade_id' => $this->trade->id,
            'name' => 'Graphic Designing',
            'category' => 'Creative Arts',
            'entry_level' => 'Middle',
            'admission_type' => 'first_come_first_served',
            'duration_type' => 'months',
            'duration_value' => 6,
            'intake_capacity' => 30,
            'is_active' => true,
            'is_published' => true,
            'advertisement_image_path' => $path,
        ]);

        Storage::disk('public')->assertExists($path);

        $newFile = UploadedFile::fake()->image('new_hd_flyer.jpg', 1920, 1080);

        $updatePayload = [
            'trade_id' => $this->trade->id,
            'name' => 'Graphic Designing & UI/UX',
            'category' => 'Creative Arts',
            'entry_level' => 'Middle',
            'admission_type' => 'first_come_first_served',
            'intake_capacity' => 35,
            'advertisement_image' => $newFile,
        ];

        $response = $this
            ->actingAs($this->clerk)
            ->post(route('clerk.courses.update', $course->id), $updatePayload);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $course->refresh();
        $this->assertNotEquals($path, $course->advertisement_image_path);
        Storage::disk('public')->assertExists($course->advertisement_image_path);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_clerk_can_remove_course_advertisement_image(): void
    {
        $file = UploadedFile::fake()->image('temporary_flyer.png');
        $path = $file->store('course_advertisements', 'public');

        $course = Course::create([
            'trade_id' => $this->trade->id,
            'name' => 'Auto CAD Draftsman',
            'category' => 'Engineering',
            'entry_level' => 'Matric',
            'admission_type' => 'first_come_first_served',
            'duration_type' => 'months',
            'duration_value' => 6,
            'intake_capacity' => 25,
            'is_active' => true,
            'is_published' => true,
            'advertisement_image_path' => $path,
        ]);

        Storage::disk('public')->assertExists($path);

        $updatePayload = [
            'trade_id' => $this->trade->id,
            'name' => 'Auto CAD Draftsman',
            'entry_level' => 'Matric',
            'admission_type' => 'first_come_first_served',
            'remove_advertisement' => true,
        ];

        $response = $this
            ->actingAs($this->clerk)
            ->post(route('clerk.courses.update', $course->id), $updatePayload);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $course->refresh();
        $this->assertNull($course->advertisement_image_path);
        $this->assertNull($course->advertisement_url);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_public_homepage_renders_courses_with_advertisement_flyer_attributes(): void
    {
        $file = UploadedFile::fake()->image('electrician_flyer.png');
        $path = $file->store('course_advertisements', 'public');

        Course::create([
            'trade_id' => $this->trade->id,
            'name' => 'Electrician CBT&A',
            'category' => 'Electrical Engineering',
            'entry_level' => 'Matric',
            'admission_type' => 'first_come_first_served',
            'duration_type' => 'months',
            'duration_value' => 6,
            'intake_capacity' => 50,
            'is_active' => true,
            'is_published' => true,
            'offered_shifts' => 'Both',
            'advertisement_image_path' => $path,
        ]);

        $response = $this->get(route('home'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Home')
            ->has('publishedCourses')
            ->where('publishedCourses.0.name', 'Electrician CBT&A')
            ->where('publishedCourses.0.advertisement_url', "/storage/{$path}")
        );
    }

    public function test_clerk_courses_index_includes_advertisement_paths_for_all_courses(): void
    {
        $file = UploadedFile::fake()->image('hvac_flyer.png');
        $path = $file->store('course_advertisements', 'public');

        Course::create([
            'trade_id' => $this->trade->id,
            'name' => 'HVACR Technician',
            'category' => 'Refrigeration & AC',
            'entry_level' => 'Middle',
            'admission_type' => 'first_come_first_served',
            'duration_type' => 'months',
            'duration_value' => 6,
            'intake_capacity' => 30,
            'is_active' => true,
            'is_published' => true,
            'advertisement_image_path' => $path,
        ]);

        $response = $this
            ->actingAs($this->clerk)
            ->get(route('clerk.courses.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Clerk/Courses/Index')
            ->has('courses')
            ->where('courses.0.name', 'HVACR Technician')
            ->where('courses.0.advertisement_image_path', $path)
        );
    }
}
