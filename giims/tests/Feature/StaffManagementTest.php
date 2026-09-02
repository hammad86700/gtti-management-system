<?php

namespace Tests\Feature;

use App\Domains\Identity\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class StaffManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_staff_index_page(): void
    {
        $adminRole = Role::firstOrCreate(['slug' => 'super-admin'], ['name' => 'Super Admin', 'is_system' => true]);
        $admin = User::factory()->create();
        $admin->roles()->attach($adminRole->id);

        $response = $this->actingAs($admin)->get(route('admin.staff.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Staff/Index')
            ->has('staff')
            ->has('roles')
        );

        // Also assert staff.index alias works
        $responseDirect = $this->actingAs($admin)->get(route('staff.index'));
        $responseDirect->assertStatus(200);
    }

    public function test_admin_can_create_staff_member_with_role(): void
    {
        $adminRole = Role::firstOrCreate(['slug' => 'super-admin'], ['name' => 'Super Admin', 'is_system' => true]);
        $teacherRole = Role::firstOrCreate(['slug' => 'teacher'], ['name' => 'Teacher', 'is_system' => false]);

        $admin = User::factory()->create();
        $admin->roles()->attach($adminRole->id);

        $staffData = [
            'name' => 'Engr. Test Teacher',
            'email' => 'testteacher@gtti.edu.pk',
            'password' => 'secret12345',
            'role_id' => $teacherRole->id,
        ];

        $response = $this->actingAs($admin)->post(route('admin.staff.store'), $staffData);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $createdUser = User::where('email', 'testteacher@gtti.edu.pk')->first();
        $this->assertNotNull($createdUser);
        $this->assertEquals('Engr. Test Teacher', $createdUser->name);
        $this->assertTrue(Hash::check('secret12345', $createdUser->password));
        $this->assertTrue($createdUser->roles->contains($teacherRole->id));
    }

    public function test_staff_creation_validates_required_fields_and_uniqueness(): void
    {
        $adminRole = Role::firstOrCreate(['slug' => 'super-admin'], ['name' => 'Super Admin', 'is_system' => true]);
        $admin = User::factory()->create();
        $admin->roles()->attach($adminRole->id);

        // Attempt creation with empty payload
        $response = $this->actingAs($admin)->post(route('admin.staff.store'), []);
        $response->assertSessionHasErrors(['name', 'email', 'password', 'role_id']);

        // Attempt creation with short password
        $response = $this->actingAs($admin)->post(route('admin.staff.store'), [
            'name' => 'Short Pass',
            'email' => 'short@gtti.edu.pk',
            'password' => '123',
            'role_id' => $adminRole->id,
        ]);
        $response->assertSessionHasErrors(['password']);

        // Attempt creation with existing email
        $response = $this->actingAs($admin)->post(route('admin.staff.store'), [
            'name' => 'Duplicate Email',
            'email' => $admin->email,
            'password' => 'validpassword123',
            'role_id' => $adminRole->id,
        ]);
        $response->assertSessionHasErrors(['email']);
    }
}
