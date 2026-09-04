<?php

namespace Database\Seeders;

use App\Domains\Identity\Models\Role;
use App\Domains\Identity\Models\User;
use App\Domains\Organization\Models\Institute;
use App\Domains\Student\Models\StudentProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoAccountsSeeder extends Seeder
{
    public function run(): void
    {
        $institute = Institute::firstOrCreate(
            ['code' => 'GTTI-RYK'],
            ['name' => 'Government Technical Training Institute Rahim Yar Khan', 'is_active' => true]
        );

        $adminRole = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin / Principal', 'is_system' => true]);
        $clerkRole = Role::firstOrCreate(['slug' => 'clerk'], ['name' => 'Clerk / Admission Officer', 'is_system' => false]);
        $teacherRole = Role::firstOrCreate(['slug' => 'teacher'], ['name' => 'Teacher / Examiner', 'is_system' => false]);
        $interviewerRole = Role::firstOrCreate(['slug' => 'interviewer'], ['name' => 'Examiner / Interviewer', 'is_system' => false]);
        $studentRole = Role::firstOrCreate(['slug' => 'student'], ['name' => 'Student / Trainee', 'is_system' => false]);

        // 1. Admin / Principal
        $admin = User::updateOrCreate(
            ['email' => 'admin@gtti.edu.pk'],
            [
                'name' => 'Principal / Super Admin',
                'password' => Hash::make('password'),
                'institute_id' => $institute->id,
                'cnic' => '31201-0000001-1',
                'status' => 'active',
            ]
        );
        $admin->roles()->syncWithoutDetaching([$adminRole->id]);

        // 2. Admission Clerk
        $clerk = User::updateOrCreate(
            ['email' => 'clerk@gtti.edu.pk'],
            [
                'name' => 'Admissions Clerk Officer',
                'password' => Hash::make('password'),
                'institute_id' => $institute->id,
                'cnic' => '31201-0000002-2',
                'status' => 'active',
            ]
        );
        $clerk->roles()->syncWithoutDetaching([$clerkRole->id]);

        // 3. Teacher / Examiner
        $teacher = User::updateOrCreate(
            ['email' => 'teacher@gtti.edu.pk'],
            [
                'name' => 'Engr. Tariq Mehmood (Senior Instructor)',
                'password' => Hash::make('password'),
                'institute_id' => $institute->id,
                'cnic' => '31201-0000003-3',
                'status' => 'active',
            ]
        );
        $teacher->roles()->syncWithoutDetaching([$teacherRole->id, $interviewerRole->id]);

        // 4. Sample Applicant / Student
        $student = User::updateOrCreate(
            ['email' => 'student@gtti.edu.pk'],
            [
                'name' => 'Muhammad Usman Tariq',
                'password' => Hash::make('password'),
                'institute_id' => $institute->id,
                'cnic' => '31201-1234567-1',
                'status' => 'active',
            ]
        );
        $student->roles()->syncWithoutDetaching([$studentRole->id]);

        StudentProfile::firstOrCreate(
            ['user_id' => $student->id],
            [
                'registration_number' => 'GTTI-2026-001',
                'father_name' => 'Tariq Mehmood',
                'status' => 'applicant',
            ]
        );
    }
}
