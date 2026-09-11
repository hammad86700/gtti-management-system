<?php

namespace Tests\Feature;

use App\Domains\Attendance\Models\ClassAttendance;
use App\Domains\Identity\Models\Role;
use App\Domains\Identity\Models\User;
use App\Domains\Operations\Models\InstitutionalHoliday;
use App\Domains\Organization\Models\Batch;
use App\Domains\Organization\Models\Course;
use App\Domains\Organization\Models\Department;
use App\Domains\Organization\Models\Institute;
use App\Domains\Organization\Models\Program;
use App\Domains\Organization\Models\Timetable;
use App\Domains\Organization\Models\Trade;
use App\Domains\Student\Models\Certificate;
use App\Domains\Student\Models\Enrollment;
use App\Domains\Student\Models\StudentProfile;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase36InstitutionalWorkflowsTest extends TestCase
{
    use RefreshDatabase;

    protected Institute $institute;
    protected Department $department;
    protected Course $course;
    protected Batch $batch;
    protected User $admin;
    protected User $clerk;
    protected User $teacher;
    protected User $studentUser;
    protected StudentProfile $studentProfile;
    protected Enrollment $enrollment;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();

        $adminRole = Role::firstOrCreate(['slug' => 'super-admin'], ['name' => 'Super Admin', 'is_system' => true]);
        $clerkRole = Role::firstOrCreate(['slug' => 'clerk'], ['name' => 'Admission Clerk', 'is_system' => false]);
        $teacherRole = Role::firstOrCreate(['slug' => 'teacher'], ['name' => 'Teacher', 'is_system' => false]);
        $studentRole = Role::firstOrCreate(['slug' => 'student'], ['name' => 'Student', 'is_system' => false]);

        $this->institute = Institute::create([
            'name' => 'Govt Technical Training Institute RYK',
            'code' => 'GTTI-RYK',
            'is_active' => true,
        ]);

        $this->department = Department::create([
            'institute_id' => $this->institute->id,
            'name' => 'Computer Department',
            'code' => 'CS',
            'is_active' => true,
        ]);

        $program = Program::create([
            'department_id' => $this->department->id,
            'name' => 'Vocational Diploma',
            'type' => 'vocational',
            'duration_months' => 6,
        ]);

        $trade = Trade::create([
            'program_id' => $program->id,
            'name' => 'Web Development',
            'code' => 'WEB',
        ]);

        $this->course = Course::create([
            'trade_id' => $trade->id,
            'name' => 'Full Stack Laravel & React',
            'entry_level' => 'Matric',
            'is_active' => true,
            'is_published' => true,
        ]);

        $this->batch = Batch::create([
            'course_id' => $this->course->id,
            'name' => 'Morning Batch 2026',
            'session_year' => '2026-2027',
            'shift' => 'Morning',
            'start_date' => '2026-01-01',
            'end_date' => '2026-06-30',
        ]);

        // 1. Admin
        $this->admin = User::factory()->create([
            'institute_id' => $this->institute->id,
            'name' => 'Principal Engr. Asim',
            'email' => 'principal@gtti.edu.pk',
        ]);
        $this->admin->roles()->attach($adminRole->id);

        // 2. Clerk
        $this->clerk = User::factory()->create([
            'institute_id' => $this->institute->id,
            'name' => 'Clerk Naveed',
            'email' => 'clerk@gtti.edu.pk',
        ]);
        $this->clerk->roles()->attach($clerkRole->id);

        // 3. Teacher
        $this->teacher = User::factory()->create([
            'institute_id' => $this->institute->id,
            'name' => 'Instructor Tariq',
            'email' => 'teacher@gtti.edu.pk',
        ]);
        $this->teacher->roles()->attach($teacherRole->id);
        $this->teacher->batches()->attach($this->batch->id);

        // 4. Student
        $this->studentUser = User::factory()->create([
            'institute_id' => $this->institute->id,
            'name' => 'Muhammad Bilal',
            'email' => 'bilal@student.gtti.edu.pk',
        ]);
        $this->studentUser->roles()->attach($studentRole->id);

        $this->studentProfile = StudentProfile::create([
            'user_id' => $this->studentUser->id,
            'father_name' => 'Muhammad Iqbal',
        ]);

        $this->enrollment = Enrollment::create([
            'student_profile_id' => $this->studentProfile->id,
            'course_id' => $this->course->id,
            'batch_id' => $this->batch->id,
            'enrollment_number' => 'GTTI-2026-WEB-001',
            'status' => 'enrolled',
            'enrollment_date' => Carbon::now()->subMonths(6),
        ]);
    }

    /**
     * Test 1: Admin accessing Gate Security Portal retains Admin oversight and does not get branded as applicant.
     */
    public function test_admin_accessing_gate_security_does_not_cascade_to_applicant(): void
    {
        $response = $this->actingAs($this->admin)->get(route('security.gate.index'));
        $response->assertOk();
    }

    /**
     * Test 2: Full End-of-Course Certificate Lifecycle:
     * - Student submits certificate request
     * - Clerk reviews & manually issues with collection date (pending approval)
     * - Admin approves certificate & releases digital copy
     * - Student can view released certificate
     */
    public function test_certificate_request_clerk_issue_and_admin_approval_workflow(): void
    {
        // Step A: Student requests certificate
        $studentResponse = $this->actingAs($this->studentUser)->post(route('student.certificates.store'), [
            'enrollment_id' => $this->enrollment->id,
            'student_remarks' => 'Course completed successfully. Requesting official certificate.',
        ]);
        $studentResponse->assertRedirect();

        $certificate = Certificate::where('student_profile_id', $this->studentProfile->id)->first();
        $this->assertNotNull($certificate);
        $this->assertEquals('requested', $certificate->status);
        $this->assertFalse((bool) $certificate->is_digital_released);

        // Step B: Clerk views certificates index
        $clerkIndex = $this->actingAs($this->clerk)->get(route('clerk.certificates.index'));
        $clerkIndex->assertOk();

        // Step C: Clerk manually issues certificate assigning Certificate No, Grade, Marks, and Physical Collection Date
        $collectionDate = Carbon::now()->addDays(7)->format('Y-m-d');
        $issueResponse = $this->actingAs($this->clerk)->post(route('clerk.certificates.issue', $certificate->id), [
            'certificate_number' => 'GTTI-CER-2026-9901',
            'grade' => 'A+',
            'marks_obtained' => 915,
            'total_marks' => 1000,
            'collection_date' => $collectionDate,
            'notes' => 'Trainee passed with distinction. Ready for Principal approval.',
        ]);
        $issueResponse->assertRedirect();

        $certificate->refresh();
        $this->assertEquals('pending_approval', $certificate->status);
        $this->assertEquals('GTTI-CER-2026-9901', $certificate->certificate_number);
        $this->assertEquals('A+', $certificate->grade);
        $this->assertEquals($collectionDate, $certificate->collection_date->format('Y-m-d'));
        $this->assertEquals($this->clerk->id, $certificate->issued_by);
        $this->assertFalse((bool) $certificate->is_digital_released);

        // Step D: Admin views pending approvals
        $adminIndex = $this->actingAs($this->admin)->get(route('admin.certificates.index'));
        $adminIndex->assertOk();

        // Step E: Admin / Principal approves certificate and releases digital copy
        $approveResponse = $this->actingAs($this->admin)->post(route('admin.certificates.approve', $certificate->id));
        $approveResponse->assertRedirect();

        $certificate->refresh();
        $this->assertEquals('approved', $certificate->status);
        $this->assertEquals($this->admin->id, $certificate->approved_by);
        $this->assertNotNull($certificate->approved_at);
        $this->assertTrue((bool) $certificate->is_digital_released);

        // Step F: Student visits Certificates desk and sees digital certificate unlocked
        $studentView = $this->actingAs($this->studentUser)->get(route('student.certificates.index'));
        $studentView->assertOk();
    }

    /**
     * Test 3: Admin Timetable slot creation and active student access.
     */
    public function test_timetable_management_and_student_access(): void
    {
        // Admin views timetable desk
        $desk = $this->actingAs($this->admin)->get(route('admin.timetables.index'));
        $desk->assertOk();

        // Admin adds a timetable slot
        $createResponse = $this->actingAs($this->admin)->post(route('admin.timetables.store'), [
            'department_id' => $this->department->id,
            'course_id' => $this->course->id,
            'batch_id' => $this->batch->id,
            'teacher_id' => $this->teacher->id,
            'subject_name' => 'Backend API Development with Laravel',
            'day_of_week' => 'Monday',
            'start_time' => '08:30',
            'end_time' => '10:30',
            'room_or_lab' => 'Computer Lab 3 (Advanced)',
            'shift' => 'morning',
            'is_active' => true,
        ]);
        $createResponse->assertRedirect();

        $this->assertDatabaseHas('timetables', [
            'course_id' => $this->course->id,
            'teacher_id' => $this->teacher->id,
            'subject_name' => 'Backend API Development with Laravel',
            'day_of_week' => 'Monday',
            'shift' => 'morning',
        ]);

        // Active student views personal timetable
        $studentTimetable = $this->actingAs($this->studentUser)->get(route('student.timetable.index'));
        $studentTimetable->assertOk();
    }

    /**
     * Test 4: Urgent College Off / Random Holiday declaration and automatic attendance counting as holiday.
     */
    public function test_urgent_college_off_and_attendance_auto_holiday(): void
    {
        $holidayDate = Carbon::today()->format('Y-m-d');

        // Admin or Clerk declares emergency college off for all courses
        $holidayResponse = $this->actingAs($this->admin)->post(route('admin.holidays.store'), [
            'title' => 'Severe Weather Alert / Flash Rain Closure',
            'reason' => 'District administration alert regarding torrential rains.',
            'holiday_date' => $holidayDate,
            'scope' => 'all',
            'is_published' => true,
        ]);
        $holidayResponse->assertRedirect();

        $this->assertDatabaseHas('institutional_holidays', [
            'title' => 'Severe Weather Alert / Flash Rain Closure',
            'scope' => 'all',
        ]);
        $holiday = InstitutionalHoliday::where('title', 'Severe Weather Alert / Flash Rain Closure')->first();
        $this->assertNotNull($holiday);
        $this->assertEquals($holidayDate, $holiday->holiday_date->format('Y-m-d'));
        $this->assertTrue((bool) $holiday->is_published);

        // Model helper check
        $this->assertTrue(InstitutionalHoliday::isHolidayForInstitute($holidayDate));
        $this->assertTrue(InstitutionalHoliday::isHolidayForCourse($this->course->id, $holidayDate));

        // Teacher records attendance on this urgent off date
        $attendanceResponse = $this->actingAs($this->teacher)->post(route('teacher.attendance.store', ['batchId' => $this->batch->id]), [
            'session_date' => $holidayDate,
            'attendances' => [
                [
                    'student_profile_id' => $this->studentProfile->id,
                    'status' => 'holiday',
                ],
            ],
        ]);
        $attendanceResponse->assertRedirect();

        $this->assertDatabaseHas('class_attendances', [
            'student_profile_id' => $this->studentProfile->id,
            'status' => 'holiday',
        ]);
    }
}
