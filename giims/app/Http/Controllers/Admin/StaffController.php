<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Organization\Models\Department;
use App\Domains\Staff\Models\StaffProfile;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    /**
     * Display a listing of staff accounts with complete profiles, departments, and roles.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $roleFilter = $request->input('role', 'all');
        $deptFilter = $request->input('department_id', 'all');
        $statusFilter = $request->input('status', 'all');

        $query = User::whereHas('roles', function ($query) {
            $query->where('slug', '!=', 'student');
        })->with(['roles', 'staffProfile.department']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('cnic', 'like', "%{$search}%")
                  ->orWhereHas('staffProfile', function ($sp) use ($search) {
                      $sp->where('designation', 'like', "%{$search}%")
                         ->orWhere('father_name', 'like', "%{$search}%")
                         ->orWhere('cnic', 'like', "%{$search}%")
                         ->orWhere('highest_qualification', 'like', "%{$search}%");
                  });
            });
        }

        if ($roleFilter && $roleFilter !== 'all') {
            $query->whereHas('roles', function ($q) use ($roleFilter) {
                $q->where('slug', $roleFilter)
                  ->orWhere('roles.id', $roleFilter);
            });
        }

        if ($deptFilter && $deptFilter !== 'all') {
            $query->whereHas('staffProfile', function ($sp) use ($deptFilter) {
                $sp->where('department_id', $deptFilter);
            });
        }

        if ($statusFilter && $statusFilter !== 'all') {
            $query->whereHas('staffProfile', function ($sp) use ($statusFilter) {
                $sp->where('status', $statusFilter);
            });
        }

        $staff = $query->orderBy('id', 'desc')->paginate(20)->withQueryString();

        $roles = DB::table('roles')->where('slug', '!=', 'student')->get();
        $departments = Department::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Admin/Staff/Index', [
            'staff' => $staff,
            'roles' => $roles,
            'departments' => $departments,
            'filters' => [
                'search' => $search,
                'role' => $roleFilter,
                'department_id' => $deptFilter,
                'status' => $statusFilter,
            ],
        ]);
    }

    /**
     * Store a newly created staff member with credentials, HR profile, and document scans.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            // Section A: Credentials
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',

            // Section B: Personal Identity
            'father_name' => 'required|string|max:255',
            'cnic' => [
                'required',
                'string',
                'regex:/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/',
                'unique:staff_profiles,cnic',
            ],
            'phone' => 'required|string|max:25',
            'emergency_contact' => 'nullable|string|max:25',
            'dob' => 'required|date|before:today',
            'gender' => 'required|in:male,female,other',

            // Section C: Institutional Posting
            'department_id' => 'nullable|exists:departments,id',
            'designation' => 'required|string|max:255',
            'employment_type' => 'required|in:regular,contract,visiting',
            'salary_or_daily_rate' => 'nullable|numeric|min:0',
            'joining_date' => 'required|date',
            'highest_qualification' => 'required|string|max:255',

            // Section D: Residential Details
            'residential_address' => 'required|string|max:1000',
            'permanent_address' => 'nullable|string|max:1000',

            // Section E: Document Uploads (Max 2MB for images, 5MB for PDFs/Docs)
            'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'cnic_front' => 'nullable|file|mimes:pdf,jpeg,png,jpg,webp|max:5120',
            'cnic_back' => 'nullable|file|mimes:pdf,jpeg,png,jpg,webp|max:5120',
            'cv_resume' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'experience_certificate' => 'nullable|file|mimes:pdf,jpeg,png,jpg,webp|max:5120',
        ], [
            'cnic.regex' => 'The CNIC must follow the valid format XXXXX-XXXXXXX-X (e.g. 31202-1234567-1).',
            'profile_photo.max' => 'Profile photograph size must not exceed 2MB.',
            'cnic_front.max' => 'CNIC front document must not exceed 5MB.',
            'cnic_back.max' => 'CNIC back document must not exceed 5MB.',
            'cv_resume.max' => 'CV / Resume must not exceed 5MB.',
            'experience_certificate.max' => 'Experience certificate must not exceed 5MB.',
        ]);

        // Handle file uploads
        $profilePhotoPath = $request->hasFile('profile_photo')
            ? $request->file('profile_photo')->store('staff_photos', 'public')
            : null;

        $cnicFrontPath = $request->hasFile('cnic_front')
            ? $request->file('cnic_front')->store('staff_documents', 'public')
            : null;

        $cnicBackPath = $request->hasFile('cnic_back')
            ? $request->file('cnic_back')->store('staff_documents', 'public')
            : null;

        $cvResumePath = $request->hasFile('cv_resume')
            ? $request->file('cv_resume')->store('staff_documents', 'public')
            : null;

        $expCertPath = $request->hasFile('experience_certificate')
            ? $request->file('experience_certificate')->store('staff_documents', 'public')
            : null;

        DB::transaction(function () use ($validated, $request, $profilePhotoPath, $cnicFrontPath, $cnicBackPath, $cvResumePath, $expCertPath) {
            // 1. Create User
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'cnic' => $validated['cnic'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'institute_id' => auth()->user()?->institute_id,
                'status' => 'active',
            ]);

            // 2. Assign Role
            DB::table('role_user')->updateOrInsert([
                'user_id' => $user->id,
                'role_id' => $validated['role_id'],
            ]);

            // 3. Create Staff Profile
            StaffProfile::create([
                'user_id' => $user->id,
                'father_name' => $validated['father_name'],
                'cnic' => $validated['cnic'],
                'phone' => $validated['phone'],
                'emergency_contact' => $validated['emergency_contact'] ?? null,
                'dob' => $validated['dob'],
                'gender' => $validated['gender'],
                'designation' => $validated['designation'],
                'department_id' => $validated['department_id'] ?? null,
                'employment_type' => $validated['employment_type'],
                'salary_or_daily_rate' => $validated['salary_or_daily_rate'] ?? null,
                'joining_date' => $validated['joining_date'],
                'highest_qualification' => $validated['highest_qualification'],
                'residential_address' => $validated['residential_address'],
                'permanent_address' => $validated['permanent_address'] ?? null,
                'profile_photo_path' => $profilePhotoPath,
                'cnic_front_path' => $cnicFrontPath,
                'cnic_back_path' => $cnicBackPath,
                'cv_resume_path' => $cvResumePath,
                'experience_certificate_path' => $expCertPath,
                'status' => 'active',
            ]);
        });

        return redirect()->back()->with('success', "Staff member '{$validated['name']}' registered successfully with complete HR profile.");
    }

    /**
     * Delete staff member and linked profile.
     */
    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'You cannot delete your own administrative account.');
        }

        if ($user->staffProfile) {
            $filesToDelete = [
                $user->staffProfile->profile_photo_path,
                $user->staffProfile->cnic_front_path,
                $user->staffProfile->cnic_back_path,
                $user->staffProfile->cv_resume_path,
                $user->staffProfile->experience_certificate_path,
            ];

            foreach ($filesToDelete as $file) {
                if ($file && Storage::disk('public')->exists($file)) {
                    Storage::disk('public')->delete($file);
                }
            }

            $user->staffProfile->delete();
        }

        DB::table('role_user')->where('user_id', $user->id)->delete();
        $user->delete();

        return redirect()->back()->with('success', "Staff account '{$user->name}' deleted successfully.");
    }
}
