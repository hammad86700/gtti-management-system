<?php

namespace Tests\Feature;

use App\Domains\Admissions\Models\AdmissionCampaign;
use App\Domains\Admissions\Models\Application;
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
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ApplicationSubmissionValidationTest extends TestCase
{
    use RefreshDatabase;

    protected User $student;
    protected Course $course;
    protected AdmissionCampaign $campaign;

    protected function setUp(): void
    {
        parent::setUp();

        $studentRole = Role::firstOrCreate(['slug' => 'student'], ['name' => 'Student']);

        $institute = Institute::create([
            'name' => 'GTTI Rahim Yar Khan',
            'code' => 'GTTI-RYK',
            'is_active' => true,
        ]);

        $dept = Department::create(['institute_id' => $institute->id, 'name' => 'Electrical Dept', 'code' => 'ELEC']);
        $prog = Program::create(['department_id' => $dept->id, 'name' => 'Vocational Program', 'type' => 'certificate', 'duration_months' => 6]);
        $trade = Trade::create(['program_id' => $prog->id, 'name' => 'Electrician Trade', 'code' => 'ELEC']);

        $this->course = Course::create([
            'trade_id' => $trade->id,
            'name' => 'Solar & Building Electrician',
            'entry_level' => 'Matric',
            'admission_type' => 'first_come_first_served',
            'requires_entrance_test' => false,
            'intake_capacity' => 30,
            'is_published' => true,
            'is_active' => true,
        ]);

        $this->campaign = AdmissionCampaign::create([
            'institute_id' => $institute->id,
            'name' => 'Fall 2026 Admissions',
            'start_date' => now()->subDays(2),
            'end_date' => now()->addDays(20),
            'is_active' => true,
        ]);

        $this->student = User::factory()->create([
            'name' => 'Applicant Tester',
            'email' => 'applicant.tester@gtti.edu.pk',
            'cnic' => '31202-9988776-1',
            'email_verified_at' => now(),
        ]);
        $this->student->roles()->attach($studentRole);

        StudentProfile::create([
            'user_id' => $this->student->id,
            'father_name' => 'Tester Father',
            'status' => 'applicant',
        ]);
    }

    public function test_large_mobile_camera_photo_up_to_10mb_is_accepted_without_validation_failure(): void
    {
        Storage::fake('local');

        // Create 8MB mobile camera capture simulation (previously rejected by 2MB limit)
        $largeCnic = UploadedFile::fake()->create('camera_cnic_front.jpg', 8192, 'image/jpeg');
        $largeMarksheet = UploadedFile::fake()->create('camera_marksheet.webp', 6144, 'image/webp');

        $response = $this->actingAs($this->student)->post(route('student.application.store'), [
            'course_id' => $this->course->id,
            'cnic' => '31202-9988776-1',
            'father_name' => 'Tester Father',
            'matric_total_marks' => 1100,
            'matric_obtained_marks' => 920,
            'cnic_document' => $largeCnic,
            'academic_document' => $largeMarksheet,
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('dashboard'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('applications', [
            'course_id' => $this->course->id,
            'status' => 'submitted',
            'obtained_marks' => 920,
        ]);
    }

    public function test_validation_fails_with_friendly_message_if_documents_are_missing(): void
    {
        Storage::fake('local');

        $response = $this->actingAs($this->student)->post(route('student.application.store'), [
            'course_id' => $this->course->id,
            'cnic' => '31202-9988776-1',
            'father_name' => 'Tester Father',
            'matric_total_marks' => 1100,
            'matric_obtained_marks' => 920,
        ]);

        $response->assertSessionHasErrors(['cnic_document', 'academic_document']);
        $errors = session('errors')->getBag('default');
        $this->assertStringContainsString('CNIC', $errors->first('cnic_document'));
        $this->assertStringContainsString('academic certificate', $errors->first('academic_document'));
    }

    public function test_inertia_shares_flash_messages(): void
    {
        session()->flash('success', 'Test admission flash notification');

        $response = $this->actingAs($this->student)->get(route('student.application.create'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('flash.success')
            ->where('flash.success', 'Test admission flash notification')
        );
    }
}
