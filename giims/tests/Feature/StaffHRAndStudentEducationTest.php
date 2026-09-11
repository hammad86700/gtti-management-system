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
use App\Domains\Staff\Models\StaffProfile;
use App\Domains\Student\Models\StudentEducation;
use App\Domains\Student\Models\StudentProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StaffHRAndStudentEducationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $clerk;
    protected User $student;
    protected Role $adminRole;
    protected Role $teacherRole;
    protected Role $clerkRole;
    protected Role $studentRole;
    protected Institute $institute;
    protected Department $department;
    protected Course $course;
    protected AdmissionCampaign $campaign;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminRole = Role::firstOrCreate(['slug' => 'super-admin'], ['name' => 'Super Admin', 'is_system' => true]);
        $this->teacherRole = Role::firstOrCreate(['slug' => 'teacher'], ['name' => 'Teacher', 'is_system' => false]);
        $this->clerkRole = Role::firstOrCreate(['slug' => 'clerk'], ['name' => 'Admission Clerk', 'is_system' => true]);
        $this->studentRole = Role::firstOrCreate(['slug' => 'student'], ['name' => 'Student', 'is_system' => false]);

        $this->admin = User::factory()->create(['name' => 'Admin Officer', 'email' => 'admin.hr@gtti.edu.pk']);
        $this->admin->roles()->attach($this->adminRole->id);

        $this->clerk = User::factory()->create(['name' => 'Desk Clerk', 'email' => 'clerk.desk@gtti.edu.pk']);
        $this->clerk->roles()->attach($this->clerkRole->id);

        $this->institute = Institute::create([
            'name' => 'GTTI Rahim Yar Khan',
            'code' => 'GTTI-RYK',
            'is_active' => true,
        ]);

        $this->department = Department::create([
            'institute_id' => $this->institute->id,
            'name' => 'Electrical Department',
            'code' => 'EE',
        ]);

        $program = Program::create([
            'department_id' => $this->department->id,
            'name' => 'Vocational Diploma Program',
            'type' => 'certificate',
            'duration_months' => 12,
        ]);

        $trade = Trade::create([
            'program_id' => $program->id,
            'name' => 'Industrial Electrician',
            'code' => 'IE',
        ]);

        $this->course = Course::create([
            'trade_id' => $trade->id,
            'name' => 'Industrial Electrician & Automation',
            'entry_level' => 'Matric',
            'admission_type' => 'first_come_first_served',
            'requires_entrance_test' => false,
            'intake_capacity' => 40,
            'is_published' => true,
            'is_active' => true,
        ]);

        $this->campaign = AdmissionCampaign::create([
            'institute_id' => $this->institute->id,
            'name' => 'Fall 2026 Admissions',
            'start_date' => now()->subDays(3),
            'end_date' => now()->addDays(25),
            'is_active' => true,
        ]);

        $this->student = User::factory()->create([
            'name' => 'Muhammad Zubair',
            'email' => 'zubair.applicant@gtti.edu.pk',
            'cnic' => '31202-4455667-1',
            'email_verified_at' => now(),
        ]);
        $this->student->roles()->attach($this->studentRole->id);

        StudentProfile::create([
            'user_id' => $this->student->id,
            'father_name' => 'Abdul Rasheed',
            'status' => 'applicant',
        ]);
    }

    public function test_admin_can_onboard_staff_with_complete_dossier_and_documents(): void
    {
        Storage::fake('public');

        $photo = UploadedFile::fake()->image('staff_photo.jpg', 300, 300);
        $cnicFront = UploadedFile::fake()->image('cnic_front.jpg', 600, 400);
        $cnicBack = UploadedFile::fake()->image('cnic_back.jpg', 600, 400);
        $cv = UploadedFile::fake()->create('resume_curriculum_vitae.pdf', 500, 'application/pdf');
        $expCert = UploadedFile::fake()->create('experience_certificate.pdf', 600, 'application/pdf');

        $payload = [
            'name' => 'Engr. Zohaib Tariq',
            'email' => 'zohaib.tariq@gtti.edu.pk',
            'password' => 'SecurePass@1234',
            'role_id' => $this->teacherRole->id,
            'department_id' => $this->department->id,
            'father_name' => 'Tariq Mehmood',
            'cnic' => '31202-7654321-3',
            'phone' => '03007654321',
            'emergency_contact' => '03019876543',
            'dob' => '1989-08-14',
            'gender' => 'male',
            'designation' => 'Senior Instructor Electrical',
            'employment_type' => 'regular',
            'joining_date' => '2021-02-15',
            'highest_qualification' => 'MS Electrical Engineering',
            'residential_address' => 'House 42, Gulshan-e-Iqbal, Rahim Yar Khan',
            'permanent_address' => 'Village 145/P, Sadiqabad',
            'profile_photo' => $photo,
            'cnic_front' => $cnicFront,
            'cnic_back' => $cnicBack,
            'cv_resume' => $cv,
            'experience_certificate' => $expCert,
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.staff.store'), $payload);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $user = User::where('email', 'zohaib.tariq@gtti.edu.pk')->first();
        $this->assertNotNull($user);
        $this->assertEquals('Engr. Zohaib Tariq', $user->name);
        $this->assertTrue($user->roles->contains($this->teacherRole->id));

        $this->assertDatabaseHas('staff_profiles', [
            'user_id' => $user->id,
            'department_id' => $this->department->id,
            'father_name' => 'Tariq Mehmood',
            'cnic' => '31202-7654321-3',
            'phone' => '03007654321',
            'emergency_contact' => '03019876543',
            'gender' => 'male',
            'designation' => 'Senior Instructor Electrical',
            'employment_type' => 'regular',
            'highest_qualification' => 'MS Electrical Engineering',
            'residential_address' => 'House 42, Gulshan-e-Iqbal, Rahim Yar Khan',
            'permanent_address' => 'Village 145/P, Sadiqabad',
        ]);

        $profile = StaffProfile::where('user_id', $user->id)->first();
        $this->assertNotNull($profile->profile_photo_path);
        $this->assertNotNull($profile->cnic_front_path);
        $this->assertNotNull($profile->cnic_back_path);
        $this->assertNotNull($profile->cv_resume_path);
        $this->assertNotNull($profile->experience_certificate_path);

        Storage::disk('public')->assertExists($profile->profile_photo_path);
        Storage::disk('public')->assertExists($profile->cnic_front_path);
        Storage::disk('public')->assertExists($profile->cnic_back_path);
        Storage::disk('public')->assertExists($profile->cv_resume_path);
        Storage::disk('public')->assertExists($profile->experience_certificate_path);

        // Assert model URL accessors work seamlessly
        $this->assertStringContainsString('/storage/', $profile->profile_photo_url);
        $this->assertStringContainsString('/storage/', $profile->cnic_front_url);
        $this->assertStringContainsString('/storage/', $profile->cv_resume_url);
    }

    public function test_staff_cnic_regex_and_uniqueness_validation(): void
    {
        // 1. Invalid CNIC format (no hyphens)
        $invalidPayload = [
            'name' => 'Invalid CNIC Staff',
            'email' => 'invalid.cnic@gtti.edu.pk',
            'password' => 'secret12345',
            'role_id' => $this->teacherRole->id,
            'father_name' => 'Father Name',
            'cnic' => '3120212345671', // Invalid: missing hyphens
            'phone' => '03001234567',
            'dob' => '1992-01-01',
            'gender' => 'male',
            'designation' => 'Instructor',
            'employment_type' => 'contract',
            'joining_date' => '2023-01-01',
            'highest_qualification' => 'BS IT',
            'residential_address' => 'RYK City',
        ];

        $res1 = $this->actingAs($this->admin)->post(route('admin.staff.store'), $invalidPayload);
        $res1->assertSessionHasErrors(['cnic']);

        // 2. Pre-create a staff profile with unique CNIC
        $existingUser = User::factory()->create(['email' => 'existing.staff@gtti.edu.pk']);
        StaffProfile::create([
            'user_id' => $existingUser->id,
            'father_name' => 'Existing Father',
            'cnic' => '31202-9999999-9',
            'phone' => '03009999999',
            'dob' => '1991-01-01',
            'gender' => 'female',
            'designation' => 'Instructor',
            'employment_type' => 'regular',
            'joining_date' => '2022-01-01',
            'highest_qualification' => 'BS Mathematics',
            'residential_address' => 'Rahim Yar Khan',
        ]);

        // Attempt creation with duplicate CNIC
        $duplicatePayload = array_merge($invalidPayload, [
            'email' => 'another.staff@gtti.edu.pk',
            'cnic' => '31202-9999999-9',
        ]);

        $res2 = $this->actingAs($this->admin)->post(route('admin.staff.store'), $duplicatePayload);
        $res2->assertSessionHasErrors(['cnic']);
    }

    public function test_admin_can_delete_staff_and_cleanup_profile(): void
    {
        $staffUser = User::factory()->create([
            'name' => 'To Be Deleted Staff',
            'email' => 'delete.me@gtti.edu.pk',
        ]);
        $staffUser->roles()->attach($this->teacherRole->id);

        $profile = StaffProfile::create([
            'user_id' => $staffUser->id,
            'father_name' => 'Father',
            'cnic' => '31202-8888888-8',
            'phone' => '03008888888',
            'dob' => '1995-05-05',
            'gender' => 'male',
            'designation' => 'Junior Instructor',
            'employment_type' => 'regular',
            'joining_date' => '2024-01-01',
            'highest_qualification' => 'DAE Electrical',
            'residential_address' => 'Khanpur Road, RYK',
        ]);

        $this->assertDatabaseHas('users', ['id' => $staffUser->id]);
        $this->assertDatabaseHas('staff_profiles', ['id' => $profile->id]);

        $response = $this->actingAs($this->admin)->delete(route('admin.staff.destroy', $staffUser));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertSoftDeleted('users', ['id' => $staffUser->id]);
        $this->assertDatabaseMissing('staff_profiles', ['id' => $profile->id]);
    }

    public function test_student_can_submit_application_with_multi_tier_education(): void
    {
        Storage::fake('public');
        Storage::fake('local');

        $cnicDoc = UploadedFile::fake()->image('student_cnic.jpg', 800, 600);
        $profilePic = UploadedFile::fake()->image('student_photo.jpg', 300, 300);
        $matricTranscript = UploadedFile::fake()->create('matric_transcript.pdf', 800, 'application/pdf');
        $daeTranscript = UploadedFile::fake()->create('dae_diploma.pdf', 900, 'application/pdf');

        $payload = [
            'course_id' => $this->course->id,
            'shift' => 'Morning',
            'name' => 'Muhammad Zubair',
            'cnic' => '31202-4455667-1',
            'father_name' => 'Abdul Rasheed',
            'guardian_name' => 'Abdul Rasheed',
            'guardian_phone' => '03001122334',
            'dob' => '2004-03-20',
            'gender' => 'male',
            'domicile_district' => 'Rahim Yar Khan',
            'religion' => 'Islam',
            'address' => 'House 12, Street 4, Satellite Town, RYK',
            'permanent_address' => 'Chak 100/P, Tehsil RYK',
            'profile_picture' => $profilePic,
            'cnic_document' => $cnicDoc,

            'educations' => [
                [
                    'degree_level' => 'matric',
                    'degree_title' => 'Matriculation (Science)',
                    'institute_or_board' => 'BISE Bahawalpur',
                    'passing_year' => 2021,
                    'roll_number' => '440123',
                    'total_marks' => 1100,
                    'obtained_marks' => 960,
                    'grade_or_division' => 'A+',
                    'transcript_scan' => $matricTranscript,
                ],
                [
                    'degree_level' => 'intermediate',
                    'degree_title' => 'FSc Pre-Engineering',
                    'institute_or_board' => 'BISE Bahawalpur',
                    'passing_year' => 2023,
                    'roll_number' => '550987',
                    'total_marks' => 1100,
                    'obtained_marks' => 890,
                    'grade_or_division' => 'A',
                ],
                [
                    'degree_level' => 'dae',
                    'degree_title' => 'DAE in Electrical Technology',
                    'institute_or_board' => 'PBTE Lahore',
                    'passing_year' => 2026,
                    'roll_number' => '990112',
                    'total_marks' => 3000,
                    'obtained_marks' => 2610,
                    'grade_or_division' => 'A+',
                    'transcript_scan' => $daeTranscript,
                ],
            ],
        ];

        $response = $this->actingAs($this->student)->post(route('student.application.store'), $payload);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('dashboard'));
        $response->assertSessionHas('success');

        // Verify Application created with legacy synchronization for merit rankings
        $app = Application::where('student_profile_id', $this->student->studentProfile->id)->first();
        $this->assertNotNull($app);
        $this->assertEquals($this->course->id, $app->course_id);
        $this->assertEquals(1100, $app->matric_total_marks);
        $this->assertEquals(960, $app->matric_obtained_marks);
        $this->assertEquals(1100, $app->intermediate_total_marks);
        $this->assertEquals(890, $app->intermediate_obtained_marks);

        // Verify Student Profile updated with extended biographical details
        $profile = $this->student->studentProfile->fresh();
        $this->assertEquals('Abdul Rasheed', $profile->father_name);
        $this->assertEquals('Abdul Rasheed', $profile->guardian_name);
        $this->assertEquals('03001122334', $profile->guardian_phone);
        $this->assertEquals('2004-03-20', $profile->date_of_birth->format('Y-m-d'));
        $this->assertEquals('male', $profile->gender);
        $this->assertEquals('Rahim Yar Khan', $profile->domicile_district);
        $this->assertEquals('Islam', $profile->religion);
        $this->assertEquals(960, $profile->matric_obtained_marks);

        // Verify 3 StudentEducation records created with auto-calculated percentages
        $educations = StudentEducation::where('student_profile_id', $profile->id)->orderBy('id')->get();
        $this->assertCount(3, $educations);

        // 1. Matriculation
        $this->assertEquals('matric', $educations[0]->degree_level);
        $this->assertEquals('Matriculation (Science)', $educations[0]->degree_title);
        $this->assertEquals('BISE Bahawalpur', $educations[0]->institute_or_board);
        $this->assertEquals(2021, $educations[0]->passing_year);
        $this->assertEquals(1100, $educations[0]->total_marks);
        $this->assertEquals(960, $educations[0]->obtained_marks);
        $this->assertEquals(87.27, $educations[0]->percentage); // round((960/1100)*100, 2)
        $this->assertNotNull($educations[0]->transcript_scan_path);
        Storage::disk('public')->assertExists($educations[0]->transcript_scan_path);

        // 2. Intermediate
        $this->assertEquals('intermediate', $educations[1]->degree_level);
        $this->assertEquals(1100, $educations[1]->total_marks);
        $this->assertEquals(890, $educations[1]->obtained_marks);
        $this->assertEquals(80.91, $educations[1]->percentage); // round((890/1100)*100, 2)

        // 3. DAE
        $this->assertEquals('dae', $educations[2]->degree_level);
        $this->assertEquals(3000, $educations[2]->total_marks);
        $this->assertEquals(2610, $educations[2]->obtained_marks);
        $this->assertEquals(87.00, $educations[2]->percentage); // round((2610/3000)*100, 2)
        $this->assertNotNull($educations[2]->transcript_scan_path);
        Storage::disk('public')->assertExists($educations[2]->transcript_scan_path);
    }

    public function test_clerk_can_review_application_with_eager_loaded_educations(): void
    {
        // Set up student with profile and education
        $profile = $this->student->studentProfile;
        $profile->update([
            'father_name' => 'Abdul Rasheed',
            'guardian_name' => 'Abdul Rasheed',
            'guardian_phone' => '03001122334',
            'gender' => 'male',
            'domicile_district' => 'Rahim Yar Khan',
            'religion' => 'Islam',
            'date_of_birth' => '2004-03-20',
        ]);

        StudentEducation::create([
            'student_profile_id' => $profile->id,
            'degree_level' => 'matric',
            'degree_title' => 'Matriculation (Science)',
            'institute_or_board' => 'BISE Bahawalpur',
            'passing_year' => 2021,
            'roll_number' => '440123',
            'total_marks' => 1100,
            'obtained_marks' => 960,
            'percentage' => 87.27,
            'grade_or_division' => 'A+',
        ]);

        StudentEducation::create([
            'student_profile_id' => $profile->id,
            'degree_level' => 'dae',
            'degree_title' => 'DAE in Electrical',
            'institute_or_board' => 'PBTE Lahore',
            'passing_year' => 2026,
            'roll_number' => '990112',
            'total_marks' => 3000,
            'obtained_marks' => 2610,
            'percentage' => 87.00,
            'grade_or_division' => 'A+',
        ]);

        $app = Application::create([
            'admission_campaign_id' => $this->campaign->id,
            'student_profile_id' => $profile->id,
            'course_id' => $this->course->id,
            'shift' => 'Morning',
            'application_number' => 'APP-2026-TEST01',
            'status' => 'pending',
            'fee_status' => 'unpaid',
            'total_marks' => 1100,
            'obtained_marks' => 960,
            'matric_total_marks' => 1100,
            'matric_obtained_marks' => 960,
        ]);

        $response = $this->actingAs($this->clerk)->get(route('clerk.applications.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Clerk/Applications/Index')
            ->has('applications.data')
            ->where('applications.data.0.student_profile.educations.0.degree_level', 'matric')
            ->where('applications.data.0.student_profile.educations.1.degree_level', 'dae')
            ->where('applications.data.0.student_profile.educations.0.percentage', '87.27')
        );
    }
}
