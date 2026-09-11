<?php

namespace Tests\Feature;

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
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StudentIdCardAndProfilePhotoTest extends TestCase
{
    use RefreshDatabase;

    protected User $studentUser;
    protected StudentProfile $studentProfile;
    protected Enrollment $enrollment;
    protected Batch $batch;
    protected Course $course;
    protected Institute $institute;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();

        Role::firstOrCreate(['slug' => 'student'], ['name' => 'Student']);
        Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        Role::firstOrCreate(['slug' => 'teacher'], ['name' => 'Teacher']);

        $this->institute = Institute::create([
            'name' => 'Govt Technical Training Institute RYK',
            'code' => 'GTTI-RYK',
            'is_active' => true,
        ]);

        $dept = Department::create(['institute_id' => $this->institute->id, 'name' => 'Computer Dept', 'code' => 'CS']);
        $prog = Program::create(['department_id' => $dept->id, 'name' => 'Vocational Diploma', 'type' => 'diploma', 'duration_months' => 6]);
        $trade = Trade::create(['program_id' => $prog->id, 'name' => 'IT Software', 'code' => 'ITS']);
        $this->course = Course::create(['trade_id' => $trade->id, 'name' => 'Full Stack Web Development', 'entry_level' => 'Matric']);

        $this->batch = Batch::create([
            'course_id' => $this->course->id,
            'name' => 'WD-2026-A',
            'session_year' => '2026-2027',
            'shift' => 'morning',
            'start_date' => now()->subMonth(),
            'end_date' => now()->addMonths(5),
        ]);

        $this->studentUser = User::factory()->create([
            'name' => 'Muhammad Hammad',
            'email' => 'hammad@example.com',
            'cnic' => '31201-1234567-1',
            'phone' => '03001234567',
        ]);
        $this->studentUser->roles()->attach(Role::where('slug', 'student')->first());

        $this->studentProfile = StudentProfile::create([
            'user_id' => $this->studentUser->id,
            'father_name' => 'Tariq Mehmood',
            'date_of_birth' => '2004-05-15',
            'gender' => 'male',
            'registration_number' => 'GTTI-2026-0012',
            'domicile_district' => 'Rahim Yar Khan',
            'address' => 'Model Town, RYK',
            'emergency_contact' => '03007654321',
        ]);

        $this->enrollment = Enrollment::create([
            'student_profile_id' => $this->studentProfile->id,
            'batch_id' => $this->batch->id,
            'course_id' => $this->course->id,
            'enrollment_number' => 'GTTI-WD-042',
            'enrollment_date' => now()->subMonth(),
            'status' => 'enrolled',
            'is_lms_active' => true,
        ]);
    }

    public function test_student_can_upload_profile_picture_and_view_it_in_profile(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('passport_photo.jpg', 400, 500);

        $response = $this
            ->actingAs($this->studentUser)
            ->from(route('student.profile.edit'))
            ->post(route('student.profile.update'), [
                'cnic' => '31201-1234567-1',
                'father_name' => 'Tariq Mehmood',
                'date_of_birth' => '2004-05-15',
                'gender' => 'male',
                'phone' => '03001234567',
                'emergency_contact' => '03007654321',
                'address' => 'Model Town, RYK',
                'domicile_district' => 'Rahim Yar Khan',
                'profile_picture' => $file,
            ]);

        $response->assertRedirect(route('student.profile.edit'));
        $response->assertSessionHas('success');

        $this->studentProfile->refresh();

        $this->assertNotNull($this->studentProfile->profile_picture);
        Storage::disk('public')->assertExists($this->studentProfile->profile_picture);

        $this->assertNotNull($this->studentProfile->profile_picture_url);
        $this->assertStringContainsString('storage/profile_pictures/', $this->studentProfile->profile_picture_url);
    }

    public function test_student_can_view_and_download_official_id_card(): void
    {
        Storage::fake('public');
        $this->studentProfile->update([
            'profile_picture' => 'profile_pictures/sample.jpg',
        ]);

        $response = $this
            ->actingAs($this->studentUser)
            ->get(route('student.id-card'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Shared/PrintStudentCard')
            ->has('card', fn ($card) => $card
                ->where('student_name', 'Muhammad Hammad')
                ->where('father_name', 'Tariq Mehmood')
                ->where('roll_number', 'GTTI-WD-042')
                ->where('course_name', 'Full Stack Web Development')
                ->where('session_year', '2026-2027')
                ->where('has_photo', true)
                ->etc()
            )
        );
    }

    public function test_unauthenticated_user_cannot_view_id_card(): void
    {
        $response = $this->get(route('student.id-card'));
        $response->assertRedirect('/login');
    }

    public function test_staff_can_view_student_id_card(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(Role::where('slug', 'admin')->first());

        $response = $this
            ->actingAs($admin)
            ->get(route('student.id-card', $this->studentProfile->id));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Shared/PrintStudentCard')
            ->where('card.student_name', 'Muhammad Hammad')
            ->where('card.roll_number', 'GTTI-WD-042')
        );
    }
}
