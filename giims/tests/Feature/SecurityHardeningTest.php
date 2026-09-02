<?php

namespace Tests\Feature;

use App\Domains\Examination\Models\OnlineTest;
use App\Domains\Examination\Models\TestAttempt;
use App\Domains\Examination\Models\TestQuestion;
use App\Domains\Identity\Models\Role;
use App\Domains\Operations\Models\InventoryItem;
use App\Domains\Organization\Models\Batch;
use App\Domains\Organization\Models\Course;
use App\Domains\Organization\Models\Department;
use App\Domains\Organization\Models\Institute;
use App\Domains\Organization\Models\Program;
use App\Domains\Organization\Models\Trade;
use App\Domains\Student\Models\StudentProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_cannot_access_admin_dashboard(): void
    {
        $studentRole = Role::firstOrCreate(["slug" => "student"], ["name" => "Student", "is_system" => false]);
        $studentUser = User::factory()->create();
        $studentUser->roles()->attach($studentRole->id);

        $response = $this->actingAs($studentUser)->get(route("admin.dashboard"));

        $response->assertStatus(403);
    }

    public function test_admin_can_access_admin_dashboard(): void
    {
        $adminRole = Role::firstOrCreate(["slug" => "super-admin"], ["name" => "Super Admin", "is_system" => true]);
        $adminUser = User::factory()->create();
        $adminUser->roles()->attach($adminRole->id);

        $response = $this->actingAs($adminUser)->get(route("admin.dashboard"));

        $response->assertStatus(200);
    }

    public function test_soft_deleted_inventory_item_sku_can_be_reused(): void
    {
        $item1 = InventoryItem::create([
            "name" => "Welding Wire Roll",
            "sku" => "WELD-001",
            "category" => "consumable",
            "quantity_in_stock" => 10,
            "unit" => "rolls",
        ]);

        $item1->delete();
        $this->assertSoftDeleted("inventory_items", ["id" => $item1->id]);

        // Creating a new item with the same SKU should succeed due to composite unique with deleted_at
        $item2 = InventoryItem::create([
            "name" => "Welding Wire Roll 2.0",
            "sku" => "WELD-001",
            "category" => "consumable",
            "quantity_in_stock" => 25,
            "unit" => "rolls",
        ]);

        $this->assertDatabaseHas("inventory_items", [
            "id" => $item2->id,
            "sku" => "WELD-001",
            "deleted_at" => null,
        ]);
    }

    public function test_expired_cbt_attempts_are_closed_by_artisan_command(): void
    {
        $institute = Institute::create(["name" => "GTTI RYK", "code" => "GTTI", "is_active" => true]);
        $dept = Department::create(["institute_id" => $institute->id, "name" => "Mechanical", "code" => "MECH"]);
        $prog = Program::create(["department_id" => $dept->id, "name" => "G-II", "type" => "vocational", "duration_months" => 12]);
        $trade = Trade::create(["program_id" => $prog->id, "name" => "Welder", "code" => "WELD"]);
        $course = Course::create(["trade_id" => $trade->id, "name" => "Basic Welding", "entry_level" => "Middle"]);
        $batch = Batch::create(["course_id" => $course->id, "name" => "WELD-2026-A", "session_year" => "2026", "shift" => "morning"]);

        $teacher = User::factory()->create();
        $studentUser = User::factory()->create();
        $profile = StudentProfile::create(["user_id" => $studentUser->id, "father_name" => "Father"]);

        $test = OnlineTest::create([
            "batch_id" => $batch->id,
            "user_id" => $teacher->id,
            "title" => "Welding Safety Test",
            "duration_minutes" => 30,
            "status" => "published",
        ]);

        $q1 = TestQuestion::create([
            "online_test_id" => $test->id,
            "question_text" => "What eye protection is required?",
            "option_a" => "Sunglasses",
            "option_b" => "Welding Helmet",
            "option_c" => "Regular Glasses",
            "option_d" => "None",
            "correct_option" => "B",
            "marks" => 5,
        ]);

        // Create an attempt started 45 minutes ago (expired)
        $attempt = TestAttempt::create([
            "online_test_id" => $test->id,
            "student_profile_id" => $profile->id,
            "start_time" => Carbon::now()->subMinutes(45),
            "status" => "in_progress",
            "answers" => [$q1->id => "B"],
        ]);

        $this->artisan("cbt:close-expired")
            ->expectsOutputToContain("Auto-closed 1 expired exam attempts.")
            ->assertExitCode(0);

        $attempt->refresh();
        $this->assertEquals("completed", $attempt->status);
        $this->assertEquals(5, $attempt->score);
    }
}

