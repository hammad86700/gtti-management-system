<?php

namespace Tests\Feature;

use App\Domains\Attendance\Models\AttendanceSession;
use App\Domains\Identity\Models\Role;
use App\Domains\Identity\Models\User;
use App\Domains\Operations\Models\AssetAllocation;
use App\Domains\Operations\Models\DemandItem;
use App\Domains\Operations\Models\InventoryItem;
use App\Domains\Operations\Models\MaterialDemand;
use App\Domains\Operations\Models\TeacherBill;
use App\Domains\Organization\Models\Batch;
use App\Domains\Organization\Models\Course;
use App\Domains\Organization\Models\Department;
use App\Domains\Organization\Models\Institute;
use App\Domains\Organization\Models\Program;
use App\Domains\Organization\Models\Trade;
use App\Domains\Academic\Models\Subject;
use App\Domains\Student\Models\Enrollment;
use App\Domains\Student\Models\LeaveRequest;
use App\Domains\Student\Models\StudentProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class AcademicOperationsTest extends TestCase
{
    use RefreshDatabase;

    protected User $teacher;
    protected User $admin;
    protected User $student;
    protected StudentProfile $studentProfile;
    protected Batch $batch;
    protected InventoryItem $consumableItem;
    protected InventoryItem $fixedAssetItem;

    protected function setUp(): void
    {
        parent::setUp();

        $teacherRole = Role::firstOrCreate(['slug' => 'teacher'], ['name' => 'Teacher']);
        $adminRole = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        $studentRole = Role::firstOrCreate(['slug' => 'student'], ['name' => 'Student']);

        $this->institute = \App\Domains\Organization\Models\Institute::create([
            'name' => 'Govt Technical Training Institute',
            'code' => 'GTTI',
            'is_active' => true,
        ]);

        $this->teacher = User::factory()->create([
            'name' => 'Prof. Tariq Mahmood',
            'institute_id' => $this->institute->id,
        ]);
        $this->teacher->roles()->attach($teacherRole);

        $this->admin = User::factory()->create([
            'name' => 'Admin Officer',
            'institute_id' => $this->institute->id,
        ]);
        $this->admin->roles()->attach($adminRole);

        $this->student = User::factory()->create([
            'name' => 'Ali Raza',
            'phone' => '0300-1234567',
            'institute_id' => $this->institute->id,
        ]);
        $this->student->roles()->attach($studentRole);

        $this->studentProfile = StudentProfile::create([
            'user_id' => $this->student->id,
            'father_name' => 'Muhammad Raza',
            'domicile_district' => 'Rahim Yar Khan',
            'emergency_contact' => '0300-9876543',
        ]);

        $dept = Department::create(['institute_id' => $this->institute->id, 'name' => 'Mechanical Engineering', 'code' => 'MECH']);
        $prog = Program::create(['department_id' => $dept->id, 'name' => 'Vocational Technical', 'type' => 'vocational', 'duration_months' => 6]);
        $trade = Trade::create(['program_id' => $prog->id, 'name' => 'Machinist & Tool Making', 'code' => 'MACH']);
        $course = Course::create(['trade_id' => $trade->id, 'name' => 'CNC Milling & Turning', 'entry_level' => 'Matric']);

        $this->batch = Batch::create([
            'course_id' => $course->id,
            'name' => 'CNC-2026-M1',
            'session_year' => '2026',
            'shift' => 'morning',
            'start_date' => now()->subMonth()->format('Y-m-d'),
            'end_date' => now()->addMonths(5)->format('Y-m-d'),
        ]);

        // Attach teacher to batch
        $this->teacher->batches()->attach($this->batch->id);

        // Enroll student into batch
        Enrollment::create([
            'batch_id' => $this->batch->id,
            'course_id' => $course->id,
            'student_profile_id' => $this->studentProfile->id,
            'enrollment_number' => 'CNC-001',
            'enrollment_date' => now()->subDays(20)->format('Y-m-d'),
            'status' => 'active',
        ]);

        // Create Inventory Items
        $this->consumableItem = InventoryItem::create([
            'name' => 'A4 Paper Reams',
            'sku' => 'PAP-A4-01',
            'category' => 'consumable',
            'quantity_in_stock' => 100,
            'unit' => 'reams',
            'min_threshold' => 10,
        ]);

        $this->fixedAssetItem = InventoryItem::create([
            'name' => 'CNC Lathe Machine Pro 500',
            'sku' => 'MCH-LATHE-01',
            'category' => 'fixed_asset',
            'quantity_in_stock' => 4,
            'unit' => 'units',
            'min_threshold' => 1,
        ]);
    }

    public function test_teacher_can_submit_material_demand_with_auto_generated_letter(): void
    {
        $response = $this->actingAs($this->teacher)->post(route('teacher.demands.store'), [
            'batch_id' => $this->batch->id,
            'items' => [
                [
                    'inventory_item_id' => $this->consumableItem->id,
                    'requested_qty' => 5,
                ],
            ],
            'remarks' => 'Needed for Mid-Term exam printing.',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('material_demands', [
            'batch_id' => $this->batch->id,
            'user_id' => $this->teacher->id,
            'status' => 'pending',
        ]);

        $demand = MaterialDemand::where('batch_id', $this->batch->id)->first();
        $this->assertNotNull($demand);
        $this->assertStringContainsString('REQUISITION / MATERIAL INDENT', $demand->demand_letter_text);
        $this->assertStringContainsString('A4 Paper Reams — 5 reams', $demand->demand_letter_text);

        $this->assertDatabaseHas('demand_items', [
            'material_demand_id' => $demand->id,
            'inventory_item_id' => $this->consumableItem->id,
            'requested_qty' => 5,
            'approved_qty' => 0,
        ]);
    }

    public function test_admin_can_approve_material_demand_and_decrement_central_stock(): void
    {
        $demand = MaterialDemand::create([
            'batch_id' => $this->batch->id,
            'user_id' => $this->teacher->id,
            'status' => 'pending',
            'demand_letter_text' => 'Official Indent Letter',
            'generated_at' => now(),
        ]);

        $item = DemandItem::create([
            'material_demand_id' => $demand->id,
            'inventory_item_id' => $this->consumableItem->id,
            'requested_qty' => 10,
            'approved_qty' => 0,
        ]);

        $initialStock = $this->consumableItem->quantity_in_stock;

        $response = $this->actingAs($this->admin)->post(route('admin.inventory.demands.approve', $demand->id), [
            'status' => 'approved',
            'items' => [
                [
                    'id' => $item->id,
                    'approved_qty' => 8,
                ],
            ],
        ]);

        $response->assertRedirect();

        $demand->refresh();
        $item->refresh();
        $this->consumableItem->refresh();

        $this->assertEquals('approved', $demand->status);
        $this->assertEquals(8, $item->approved_qty);
        $this->assertEquals($initialStock - 8, $this->consumableItem->quantity_in_stock);
    }

    public function test_creating_exam_triggers_auto_consumption_of_approved_materials(): void
    {
        // Setup approved demand with consumables
        $demand = MaterialDemand::create([
            'batch_id' => $this->batch->id,
            'user_id' => $this->teacher->id,
            'status' => 'approved',
            'approved_by' => $this->admin->id,
            'approved_at' => now(),
        ]);

        $demandItem = DemandItem::create([
            'material_demand_id' => $demand->id,
            'inventory_item_id' => $this->consumableItem->id,
            'requested_qty' => 10,
            'approved_qty' => 10,
            'consumed_qty' => 0,
        ]);

        $subject = Subject::create([
            'course_id' => $this->batch->course_id,
            'name' => 'CNC Machine Operations',
            'code' => 'CNC-101',
        ]);

        $response = $this->actingAs($this->teacher)->post(route('teacher.exams.store', $this->batch->id), [
            'subject_id' => $subject->id,
            'title' => 'Mid-Term Assessment 2026',
            'exam_date' => now()->addDays(5)->format('Y-m-d'),
            'total_theory_marks' => 50,
            'total_practical_marks' => 50,
        ]);

        $response->assertRedirect();

        $demandItem->refresh();
        $this->assertGreaterThan(0, $demandItem->consumed_qty);

        $this->assertDatabaseHas('inventory_transactions', [
            'inventory_item_id' => $this->consumableItem->id,
            'batch_id' => $this->batch->id,
            'transaction_type' => 'stock_out',
        ]);
    }

    public function test_admin_can_allocate_fixed_asset_to_teacher_and_teacher_views_it(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.inventory.allocate-asset'), [
            'user_id' => $this->teacher->id,
            'inventory_item_id' => $this->fixedAssetItem->id,
            'room_location' => 'Main CNC Workshop, Bay 4',
            'quantity' => 1,
            'remarks' => 'Assigned for trade training.',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('asset_allocations', [
            'user_id' => $this->teacher->id,
            'inventory_item_id' => $this->fixedAssetItem->id,
            'room_location' => 'Main CNC Workshop, Bay 4',
            'quantity' => 1,
            'status' => 'active',
        ]);

        $allocation = AssetAllocation::where('user_id', $this->teacher->id)->first();
        $this->assertNotNull($allocation);

        // Teacher dashboard receives assignedAssets
        $dashResponse = $this->actingAs($this->teacher)->get(route('teacher.dashboard'));
        $dashResponse->assertOk();
        $dashResponse->assertInertia(fn ($page) => $page
            ->component('Teacher/Dashboard')
            ->has('assignedAssets', 1)
        );
    }

    public function test_student_leave_rejection_requires_reason_and_logs_parent_notification(): void
    {
        $leave = LeaveRequest::create([
            'student_profile_id' => $this->studentProfile->id,
            'start_date' => now()->addDay(),
            'end_date' => now()->addDays(3),
            'category' => 'Medical / Sickness',
            'reason' => 'Severe headache and doctor advised rest.',
            'status' => 'pending',
        ]);

        // Attempt rejection without rejection_reason -> should fail validation
        $failResponse = $this->actingAs($this->teacher)->patch(route('teacher.leaves.update-status', $leave->id), [
            'status' => 'rejected',
            'rejection_reason' => '',
        ]);
        $failResponse->assertSessionHasErrors(['rejection_reason']);

        // Submit rejection with proper reason
        Log::shouldReceive('info')
            ->once()
            ->withArgs(function ($message) {
                return str_contains($message, '[PARENT NOTIFICATION - SMS/EMAIL SENT]') &&
                       str_contains($message, 'REJECTED') &&
                       str_contains($message, 'Board practical exam scheduled');
            });

        Log::shouldReceive('info')
            ->once()
            ->withArgs(function ($message) {
                return str_contains($message, '[STUDENT NOTIFICATION - IN-APP]');
            });

        $successResponse = $this->actingAs($this->teacher)->patch(route('teacher.leaves.update-status', $leave->id), [
            'status' => 'rejected',
            'rejection_reason' => 'Board practical exam scheduled on these dates; attendance is mandatory.',
        ]);

        $successResponse->assertRedirect();

        $leave->refresh();
        $this->assertEquals('rejected', $leave->status);
        $this->assertEquals('Board practical exam scheduled on these dates; attendance is mandatory.', $leave->rejection_reason);
    }

    public function test_visiting_faculty_monthly_billing_calculates_distinct_attendance_sessions(): void
    {
        $this->teacher->update([
            'is_visiting_faculty' => true,
            'daily_rate' => 3500,
        ]);

        $month = '2026-09';

        // Create 3 sessions on 3 distinct dates
        AttendanceSession::create([
            'batch_id' => $this->batch->id,
            'user_id' => $this->teacher->id,
            'session_date' => '2026-09-02',
            'status' => 'closed',
        ]);

        AttendanceSession::create([
            'batch_id' => $this->batch->id,
            'user_id' => $this->teacher->id,
            'session_date' => '2026-09-03',
            'status' => 'closed',
        ]);

        // Duplicate session on same date 2026-09-03 (e.g. practical session in afternoon)
        AttendanceSession::create([
            'batch_id' => $this->batch->id,
            'user_id' => $this->teacher->id,
            'session_date' => '2026-09-03',
            'status' => 'closed',
        ]);

        AttendanceSession::create([
            'batch_id' => $this->batch->id,
            'user_id' => $this->teacher->id,
            'session_date' => '2026-09-04',
            'status' => 'closed',
        ]);

        // Distinct dates count should be 3
        $response = $this->actingAs($this->teacher)->post(route('teacher.billing.generate'), [
            'billing_month' => $month,
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('teacher_bills', [
            'user_id' => $this->teacher->id,
            'billing_month' => $month,
            'total_days_taught' => 3,
            'rate_per_day' => 3500,
            'total_amount' => 10500.00,
            'status' => 'submitted',
        ]);
    }
}
