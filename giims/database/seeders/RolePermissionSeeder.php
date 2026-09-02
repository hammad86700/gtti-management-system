<?php

namespace Database\Seeders;

use App\Domains\Identity\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            ['name' => 'Super Admin', 'slug' => 'super-admin', 'is_system' => true],
            ['name' => 'Principal', 'slug' => 'principal', 'is_system' => false],
            ['name' => 'Trade Incharge', 'slug' => 'trade-incharge', 'is_system' => false],
            ['name' => 'Teacher', 'slug' => 'teacher', 'is_system' => false],
            ['name' => 'Admission Clerk', 'slug' => 'admission-clerk', 'is_system' => false],
            ['name' => 'Security Officer', 'slug' => 'security-officer', 'is_system' => false],
            ['name' => 'Student', 'slug' => 'student', 'is_system' => false],
        ];

        foreach ($roles as $roleData) {
            Role::updateOrCreate(
                ['slug' => $roleData['slug']],
                $roleData
            );
        }
    }
}
