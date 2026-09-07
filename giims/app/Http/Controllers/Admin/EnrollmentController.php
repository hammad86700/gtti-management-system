<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Admissions\Models\Application;
use App\Domains\Identity\Models\Role;
use App\Domains\Identity\Models\User;
use App\Domains\Organization\Models\Batch;
use App\Domains\Organization\Models\Course;
use App\Domains\Student\Models\Enrollment;
use App\Domains\Student\Models\StudentProfile;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EnrollmentController extends Controller
{
    /**
     * Display the student enrollment workbench, active roster, and manual student controls.
     */
    public function index(): Response
    {
        $applications = Application::with([
            'studentProfile.user',
            'course.trade.program.department',
        ])
        ->where('status', 'selected')
        ->orderBy('updated_at', 'desc')
        ->get();

        $batches = Batch::with('course')->orderBy('name')->get();
        $courses = Course::with('trade.program')->where('is_active', true)->orderBy('name')->get();

        $enrollments = Enrollment::with([
            'studentProfile.user',
            'course.trade.program.department',
            'batch',
        ])
        ->orderBy('created_at', 'desc')
        ->get();

        return Inertia::render('Admin/Enrollments/Index', [
            'applications' => $applications,
            'batches' => $batches,
            'courses' => $courses,
            'enrollments' => $enrollments,
        ]);
    }

    /**
     * Officially enroll a selected candidate into a batch and issue permanent credentials.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'application_id' => 'required|exists:applications,id',
            'batch_id' => 'required|exists:batches,id',
        ]);

        $application = Application::with('studentProfile.user')->findOrFail($validated['application_id']);

        // Generate permanent institute Student Roll / Enrollment ID
        $enrollmentNumber = 'GTTI-' . date('Y') . '-' . str_pad((string) rand(1, 9999), 4, '0', STR_PAD_LEFT);

        while (Enrollment::where('enrollment_number', $enrollmentNumber)->exists()) {
            $enrollmentNumber = 'GTTI-' . date('Y') . '-' . str_pad((string) rand(1, 9999), 4, '0', STR_PAD_LEFT);
        }

        // Retrieve and safeguard student profile
        $profile = $application->studentProfile;
        if (!$profile && $application->student_profile_id) {
            $profile = StudentProfile::withTrashed()->find($application->student_profile_id);
        }

        if ($profile) {
            if ($profile->trashed()) {
                $profile->restore();
            }
            if ($profile->user?->trashed()) {
                $profile->user->restore();
            }
        } else {
            // Create fallback user & student profile if none exists
            $user = User::create([
                'name' => 'Candidate ' . $application->application_number,
                'email' => 'student_' . $application->id . '_' . strtolower(Str::random(4)) . '@gtti.edu.pk',
                'password' => Hash::make('password123'),
                'status' => 'active',
            ]);
            $profile = StudentProfile::create([
                'user_id' => $user->id,
                'registration_number' => $enrollmentNumber,
                'father_name' => 'N/A',
                'status' => 'active',
            ]);
            $application->update(['student_profile_id' => $profile->id]);
            $application->setRelation('studentProfile', $profile);
        }

        if (empty($profile->registration_number)) {
            $profile->update([
                'registration_number' => $enrollmentNumber,
            ]);
        }

        // Create official permanent enrollment record
        Enrollment::create([
            'student_profile_id' => $profile->id,
            'course_id' => $application->course_id,
            'batch_id' => $validated['batch_id'],
            'enrollment_number' => $enrollmentNumber,
            'enrollment_date' => now()->toDateString(),
            'status' => 'active',
        ]);

        $application->update([
            'status' => 'enrolled',
        ]);

        $studentRole = Role::where('slug', 'student')->first();
        if ($studentRole && $profile->user) {
            $profile->user->roles()->syncWithoutDetaching([$studentRole->id]);
        }

        $userName = $profile->user?->name ?? 'Candidate';

        return redirect()->back()->with('success', "Student {$userName} successfully enrolled into batch. Official Student ID: {$enrollmentNumber}.");
    }

    /**
     * Manually create and register a new student directly into the college.
     */
    public function storeManualStudent(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'nullable|string|min:6',
            'phone' => 'nullable|string|max:20',
            'cnic' => 'nullable|string|max:255|unique:users,cnic',
            'father_name' => 'required|string|max:255',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|string|in:male,female,other',
            'domicile_district' => 'nullable|string|max:100',
            'emergency_contact' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'course_id' => 'required|exists:courses,id',
            'batch_id' => 'required|exists:batches,id',
            'registration_number' => 'nullable|string|unique:student_profiles,registration_number',
        ]);

        // Generate unique Student Roll ID if not specified
        $enrollmentNumber = $validated['registration_number'] ?? ('GTTI-' . date('Y') . '-' . str_pad((string) rand(1, 9999), 4, '0', STR_PAD_LEFT));
        while (Enrollment::where('enrollment_number', $enrollmentNumber)->exists()) {
            $enrollmentNumber = 'GTTI-' . date('Y') . '-' . str_pad((string) rand(1, 9999), 4, '0', STR_PAD_LEFT);
        }

        $defaultPassword = $validated['password'] ?? 'password123';

        // 1. Create User Identity
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'cnic' => $validated['cnic'] ?? null,
            'password' => Hash::make($defaultPassword),
            'status' => 'active',
        ]);

        // Assign student role
        $studentRole = Role::firstOrCreate(['slug' => 'student'], ['name' => 'Student']);
        $user->roles()->syncWithoutDetaching([$studentRole->id]);

        // 2. Create Student Profile
        $profile = StudentProfile::create([
            'user_id' => $user->id,
            'registration_number' => $enrollmentNumber,
            'father_name' => $validated['father_name'],
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'gender' => $validated['gender'] ?? 'male',
            'domicile_district' => $validated['domicile_district'] ?? 'Rahim Yar Khan',
            'emergency_contact' => $validated['emergency_contact'] ?? null,
            'address' => $validated['address'] ?? null,
            'status' => 'active',
        ]);

        // 3. Create Official Enrollment
        Enrollment::create([
            'student_profile_id' => $profile->id,
            'course_id' => $validated['course_id'],
            'batch_id' => $validated['batch_id'],
            'enrollment_number' => $enrollmentNumber,
            'enrollment_date' => now()->toDateString(),
            'status' => 'active',
        ]);

        return redirect()->back()->with('success', "Student {$validated['name']} registered and enrolled successfully. Roll Number: {$enrollmentNumber}.");
    }

    /**
     * Update an enrolled student's personal, profile, or batch assignment details.
     */
    public function updateStudent(Request $request, int $id): RedirectResponse
    {
        $enrollment = Enrollment::with('studentProfile.user')->findOrFail($id);
        $userId = $enrollment->studentProfile?->user_id;
        $profileId = $enrollment->student_profile_id;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $userId,
            'phone' => 'nullable|string|max:20',
            'cnic' => 'nullable|string|max:255|unique:users,cnic,' . $userId,
            'father_name' => 'required|string|max:255',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|string|in:male,female,other',
            'domicile_district' => 'nullable|string|max:100',
            'emergency_contact' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'course_id' => 'required|exists:courses,id',
            'batch_id' => 'required|exists:batches,id',
            'status' => 'required|in:active,suspended,graduated,dropped',
            'registration_number' => 'nullable|string|unique:student_profiles,registration_number,' . $profileId,
        ]);

        // Update User
        $enrollment->studentProfile?->user?->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'cnic' => $validated['cnic'] ?? null,
        ]);

        // Update Student Profile
        $enrollment->studentProfile?->update([
            'father_name' => $validated['father_name'],
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'gender' => $validated['gender'] ?? 'male',
            'domicile_district' => $validated['domicile_district'] ?? 'Rahim Yar Khan',
            'emergency_contact' => $validated['emergency_contact'] ?? null,
            'address' => $validated['address'] ?? null,
            'registration_number' => $validated['registration_number'] ?? $enrollment->studentProfile?->registration_number,
        ]);

        // Update Enrollment
        $enrollment->update([
            'course_id' => $validated['course_id'],
            'batch_id' => $validated['batch_id'],
            'status' => $validated['status'],
        ]);

        return redirect()->back()->with('success', "Student {$validated['name']} updated successfully.");
    }

    /**
     * Delete / remove a student record.
     */
    public function destroyStudent(int $id): RedirectResponse
    {
        $enrollment = Enrollment::with('studentProfile.user')->findOrFail($id);
        $studentName = $enrollment->studentProfile?->user?->name ?? 'Student';

        $profile = $enrollment->studentProfile;
        $user = $profile?->user;

        $enrollment->delete();

        if ($profile && $profile->enrollments()->count() === 0 && $profile->applications()->count() === 0) {
            $profile->delete();
            $user?->delete();
        }

        return redirect()->back()->with('success', "Student {$studentName} has been removed successfully.");
    }
}
