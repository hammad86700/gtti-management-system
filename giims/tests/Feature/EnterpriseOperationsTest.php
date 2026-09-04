<?php

namespace Tests\Feature;

use App\Domains\Admissions\Models\AdmissionCampaign;
use App\Domains\Admissions\Models\Application;
use App\Domains\Attendance\Models\AttendanceSession;
use App\Domains\Attendance\Models\ClassAttendance;
use App\Domains\Finance\Models\FeeChallan;
use App\Domains\Identity\Models\Role;
use App\Domains\Identity\Models\User;
use App\Domains\Organization\Models\Batch;
use App\Domains\Organization\Models\Course;
use App\Domains\Organization\Models\Department;
use App\Domains\Organization\Models\Institute;
use App\Domains\Organization\Models\Program;
use App\Domains\Organization\Models\Trade;
use App\Domains\Shared\Services\Notification\Drivers\LogSmsDriver;
use App\Domains\Shared\Services\Notification\SmsGatewayInterface;
use App\Domains\Student\Models\ApprenticeshipPlacement;
use App\Domains\Student\Models\Clearance;
use App\Domains\Student\Models\Enrollment;
use App\Domains\Student\Models\StudentProfile;
use App\Jobs\SendBulkExamNoticesJob;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class EnterpriseOperationsTest extends TestCase
{
    use RefreshDatabase;

    protected User $clerk;
    protected User $admin;
    protected User $student;
    protected StudentProfile $studentProfile;
    protected Course $course;
    protected Batch $batch;
    protected Enrollment $enrollment;

    protected function setUp(): void
    {
        parent::setUp();

        // Roles
        $adminRole = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        $clerkRole = Role::firstOrCreate(['slug' => 'clerk'], ['name' => 'Clerk']);
        $studentRole = Role::firstOrCreate(['slug' => 'student'], ['name' => 'Student']);

        // Base Org
        $institute = Institute::create(['name' => 'GTTI Rahim Yar Khan', 'code' => 'GTTI-RYK', 'is_active' => true]);
        $dept = Department::create(['institute_id' => $institute->id, 'name' => 'Mechanical Dept', 'code' => 'MECH']);
        $prog = Program::create(['department_id' => $dept->id, 'name' => 'Machinist', 'type' => 'diploma', 'duration_months' => 12]);
        $trade = Trade::create(['program_id' => $prog->id, 'name' => 'CNC Machinist', 'code' => 'CNC']);
        $this->course = Course::create(['trade_id' => $trade->id, 'name' => 'Machinist CNC Trade', 'entry_level' => 'Matric', 'is_active' => true]);
        $this->batch = Batch::create(['course_id' => $this->course->id, 'name' => 'CNC-2026-M1', 'session_year' => '2026-2027', 'shift' => 'morning', 'start_date' => now()]);

        $this->campaign = AdmissionCampaign::create([
            'institute_id' => $institute->id,
            'name' => 'Fall 2026 Admissions',
            'start_date' => now()->subMonth(),
            'end_date' => now()->addMonth(),
            'is_active' => true,
        ]);

        // Users
        $this->admin = User::factory()->create(['email' => 'admin_test@gtti.edu.pk']);
        $this->admin->roles()->attach($adminRole);

        $this->clerk = User::factory()->create(['email' => 'clerk_test@gtti.edu.pk']);
        $this->clerk->roles()->attach($clerkRole);

        $this->student = User::factory()->create([
            'email' => 'student_test@gtti.edu.pk',
            'phone' => '03001122334',
            'cnic' => '31202-9988776-1',
        ]);
        $this->student->roles()->attach($studentRole);

        $this->studentProfile = StudentProfile::create([
            'user_id' => $this->student->id,
            'registration_number' => 'ADM-2026-990',
            'father_name' => 'Muhammad Rafiq',
            'gender' => 'male',
            'date_of_birth' => '2005-06-15',
            'domicile_district' => 'Rahim Yar Khan',
            'address' => 'Model Town, RYK',
        ]);

        $this->enrollment = Enrollment::create([
            'student_profile_id' => $this->studentProfile->id,
            'course_id' => $this->course->id,
            'batch_id' => $this->batch->id,
            'enrollment_number' => 'GTTI-CNC-007',
            'status' => 'active',
            'enrollment_date' => now(),
        ]);
    }

    /**
     * PART A: Bank Scroll CSV Reconciliation
     */
    public function test_clerk_can_reconcile_bank_scroll_csv_and_cascade_paid_status(): void
    {
        // 1. Create an application and clearance tied to an unpaid challan
        $application = Application::create([
            'application_number' => 'APP-2026-001',
            'student_profile_id' => $this->studentProfile->id,
            'admission_campaign_id' => $this->campaign->id,
            'course_id' => $this->course->id,
            'status' => 'submitted',
            'fee_status' => 'unpaid',
        ]);

        $clearance = Clearance::create([
            'student_profile_id' => $this->studentProfile->id,
            'enrollment_id' => $this->enrollment->id,
            'overall_status' => 'pending',
            'fee_status' => 'pending',
        ]);

        $challan = FeeChallan::create([
            'challan_number' => 'CH-2026-5501',
            'student_profile_id' => $this->studentProfile->id,
            'application_id' => $application->id,
            'enrollment_id' => $this->enrollment->id,
            'challan_type' => 'admission_fee',
            'amount' => 1500.00,
            'due_date' => now()->addDays(15),
            'status' => 'unpaid',
        ]);

        // 2. Prepare bank scroll CSV
        $csvContent = "challan_number,amount_paid,deposit_date,bank_branch_code\nCH-2026-5501,1500.00,2026-09-04,BOP-0492\n";
        $file = UploadedFile::fake()->createWithContent('bop_scroll_sept_2026.csv', $csvContent);

        // 3. Post to reconcile endpoint as Clerk
        $response = $this->actingAs($this->clerk)
            ->post(route('clerk.fees.reconcile-scroll'), [
                'scroll_file' => $file,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('reconciliation_summary');

        // 4. Assert Challan is marked paid
        $challan->refresh();
        $this->assertEquals('paid', $challan->status);
        $this->assertEquals(1500.00, (float) $challan->amount_paid);
        $this->assertEquals('BOP-0492', $challan->bank_branch_code);
        $this->assertNotNull($challan->paid_at);

        // 5. Assert cascading effects on Application & Clearance
        $application->refresh();
        $this->assertEquals('paid', $application->fee_status);

        $clearance->refresh();
        $this->assertEquals('cleared', $clearance->fee_status);
    }

    /**
     * PART A: Export Audit Report CSV
     */
    public function test_clerk_can_export_fee_audit_report_csv(): void
    {
        FeeChallan::create([
            'challan_number' => 'CH-2026-8888',
            'student_profile_id' => $this->studentProfile->id,
            'challan_type' => 'exam_fee',
            'amount' => 2000.00,
            'status' => 'unpaid',
            'due_date' => now()->addDays(5),
        ]);

        $response = $this->actingAs($this->clerk)
            ->get(route('clerk.fees.audit-report'));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }

    /**
     * PART B: Notification Drivers & Queued Worker
     */
    public function test_sms_gateway_driver_resolution_and_logging(): void
    {
        $driver = app(SmsGatewayInterface::class);
        $this->assertInstanceOf(LogSmsDriver::class, $driver);

        $result = $driver->send('03001234567', 'Test SMS message');
        $this->assertTrue($result['success']);
        $this->assertNotNull($result['message_id']);
    }

    public function test_bulk_exam_notices_job_processes_and_sends_sms(): void
    {
        Application::create([
            'application_number' => 'APP-2026-002',
            'student_profile_id' => $this->studentProfile->id,
            'admission_campaign_id' => $this->campaign->id,
            'course_id' => $this->course->id,
            'status' => 'submitted',
            'fee_status' => 'paid',
        ]);

        $job = new SendBulkExamNoticesJob(
            $this->course->id,
            '2026-09-15',
            '09:00 AM',
            'Lab 3, Main Campus',
            'Bring original documents'
        );

        $driver = new LogSmsDriver();
        $job->handle($driver);

        // Assert job executed without exception
        $this->assertTrue(true);
    }

    /**
     * PART C: PBTE Examination Admit Card (Roll Number Slip)
     */
    public function test_authenticated_student_can_view_admit_card(): void
    {
        $response = $this->actingAs($this->student)
            ->get(route('admit-card.print', ['enrollmentId' => $this->enrollment->id]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => 
            $page->component('Shared/PrintAdmitCard')
                ->has('cards', 1)
                ->where('cards.0.roll_number', 'GTTI-CNC-007')
                ->where('cards.0.student_name', $this->student->name)
        );
    }

    public function test_staff_can_view_batch_admit_cards(): void
    {
        $response = $this->actingAs($this->clerk)
            ->get(route('admit-cards.batch', ['batchId' => $this->batch->id]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => 
            $page->component('Shared/PrintAdmitCard')
                ->has('cards')
                ->where('isBatch', true)
        );
    }

    /**
     * PART D: Hybrid Mobile Attendance Fallback
     */
    public function test_student_can_check_in_with_hybrid_campus_fallback_when_gps_drifts(): void
    {
        $session = AttendanceSession::create([
            'batch_id' => $this->batch->id,
            'user_id' => $this->admin->id,
            'session_date' => today(),
            'start_time' => now()->format('H:i:s'),
            'status' => 'active',
            'daily_pin' => '4821',
            'location_name' => 'Mechanical Workshop',
            'latitude' => 28.4212,
            'longitude' => 70.3023,
            'radius_meters' => 50,
            'is_geofence_active' => true,
        ]);

        // Student coordinates simulate heavy indoor GPS drift (e.g., 300 meters away from lab center)
        // Client IP is set to campus intranet loopback 127.0.0.1
        $response = $this->actingAs($this->student)
            ->withServerVariables(['REMOTE_ADDR' => '127.0.0.1'])
            ->post(route('student.attendance.self-mark'), [
                'pin' => '4821',
                'latitude' => 28.4240, // Drifted position
                'longitude' => 70.3050,
                'accuracy' => 25,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Assert attendance recorded with hybrid method
        $attendance = ClassAttendance::where('attendance_session_id', $session->id)
            ->where('student_profile_id', $this->studentProfile->id)
            ->first();

        $this->assertNotNull($attendance);
        $this->assertEquals('present', $attendance->status);
        $this->assertEquals('pin_hybrid', $attendance->method);
    }

    /**
     * PART E: Apprenticeship & OJT Registry
     */
    public function test_student_can_register_ojt_placement(): void
    {
        $response = $this->actingAs($this->student)
            ->post(route('student.apprenticeship.store'), [
                'company_name' => 'Fatima Fertilizer Company Ltd.',
                'industry_sector' => 'Chemical & Fertilizer Industries',
                'work_location' => 'Sadiqabad Industrial Complex',
                'supervisor_name' => 'Engr. Kamran Tariq',
                'supervisor_phone' => '03009988776',
                'supervisor_email' => 'kamran.tariq@fatima-group.com',
                'stipend_amount' => 18000,
                'start_date' => '2026-10-01',
                'end_date' => '2027-03-31',
                'job_description' => 'CNC Lathe and milling component calibration.',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $placement = ApprenticeshipPlacement::where('student_profile_id', $this->studentProfile->id)->first();
        $this->assertNotNull($placement);
        $this->assertEquals('Fatima Fertilizer Company Ltd.', $placement->company_name);
        $this->assertEquals(18000.00, (float) $placement->stipend_amount);
        $this->assertEquals('active', $placement->placement_status);
    }

    public function test_admin_can_view_and_export_ojt_csv(): void
    {
        ApprenticeshipPlacement::create([
            'student_profile_id' => $this->studentProfile->id,
            'enrollment_id' => $this->enrollment->id,
            'company_name' => 'Al-Ghazi Tractors Ltd.',
            'industry_sector' => 'Automotive & Diesel Mechanics',
            'work_location' => 'Dera Ghazi Khan',
            'supervisor_name' => 'Tariq Mehmood',
            'supervisor_phone' => '03331122334',
            'stipend_amount' => 20000,
            'start_date' => '2026-09-01',
            'placement_status' => 'active',
            'tevta_registered' => true,
        ]);

        // 1. Admin Index View
        $indexResponse = $this->actingAs($this->admin)
            ->get(route('admin.apprenticeships.index'));

        $indexResponse->assertOk();
        $indexResponse->assertInertia(fn ($page) =>
            $page->component('Admin/Apprenticeships/Index')
                ->has('placements.data', 1)
                ->where('stats.total', 1)
                ->where('stats.active', 1)
        );

        // 2. Admin Export CSV
        $exportResponse = $this->actingAs($this->admin)
            ->get(route('admin.apprenticeships.export'));

        $exportResponse->assertOk();
        $exportResponse->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }
}
