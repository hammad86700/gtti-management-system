<?php

namespace Database\Seeders;

use App\Domains\Identity\Models\Role;
use App\Domains\Identity\Models\User;
use App\Domains\Organization\Models\Institute;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $institute = Institute::where('code', 'GTTI-RYK')->firstOrFail();
        $superAdminRole = Role::where('slug', 'super-admin')->firstOrFail();

        $user = User::updateOrCreate(
            ['email' => 'admin@gtti.edu.pk'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('password'),
                'institute_id' => $institute->id,
                'cnic' => '00000-0000000-0',
                'status' => 'active',
            ]
        );

        $user->roles()->syncWithoutDetaching([$superAdminRole->id]);
    }
}
