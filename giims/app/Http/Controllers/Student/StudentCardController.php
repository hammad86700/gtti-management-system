<?php

namespace App\Http\Controllers\Student;

use App\Domains\Identity\Models\User;
use App\Domains\Student\Models\Enrollment;
use App\Domains\Student\Models\StudentProfile;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentCardController extends Controller
{
    /**
     * Display the official, downloadable & printable GTTI Student Identity Card.
     */
    public function show(Request $request, int|string|null $identifier = null): Response
    {
        $currentUser = $request->user();
        $isStaff = $currentUser->roles()->whereIn('slug', ['super-admin', 'principal', 'admin', 'administrator', 'clerk', 'admission-clerk', 'teacher', 'instructor', 'security-officer', 'security'])->exists();

        if ($identifier) {
            if (!$isStaff && (int)$identifier !== (int)$currentUser->id && (int)$identifier !== (int)($currentUser->studentProfile?->id ?? 0)) {
                abort(403, 'Unauthorized. Trainees may only view their own student card.');
            }

            // 1. Try finding by User ID
            $targetUser = User::with([
                'studentProfile.enrollments.course.trade.program.department',
                'studentProfile.enrollments.batch',
                'studentProfile.applications.course.trade',
            ])->find($identifier);

            // 2. Try finding by StudentProfile ID
            if (!$targetUser) {
                $foundProfile = StudentProfile::with('user')->find($identifier);
                if ($foundProfile && $foundProfile->user) {
                    $targetUser = $foundProfile->user;
                }
            }

            // 3. Try finding by Enrollment ID
            if (!$targetUser) {
                $enrollment = Enrollment::with(['studentProfile.user', 'course.trade.program.department', 'batch'])->find($identifier);
                $targetUser = $enrollment?->studentProfile?->user;
            }

            // 4. Try finding by Registration / Roll Number
            if (!$targetUser) {
                $foundProfile = StudentProfile::where('registration_number', $identifier)->with('user')->first();
                if ($foundProfile && $foundProfile->user) {
                    $targetUser = $foundProfile->user;
                }
            }

            if (!$targetUser) {
                abort(404, 'Student record not found.');
            }
        } else {
            // Trainee viewing their own card
            $targetUser = $currentUser;
            $targetUser->load([
                'studentProfile.enrollments.course.trade.program.department',
                'studentProfile.enrollments.batch',
                'studentProfile.applications.course.trade',
            ]);
        }

        $profile = $targetUser->studentProfile;

        if (!$profile) {
            abort(404, 'Student profile has not been initialized yet.');
        }

        // Active or latest enrollment
        $enrollment = $profile->enrollments()
            ->where('status', 'active')
            ->with(['course.trade.program.department', 'batch'])
            ->latest()
            ->first()
            ?? $profile->enrollments()
            ->with(['course.trade.program.department', 'batch'])
            ->latest()
            ->first();

        $latestApp = $profile->applications()->with(['course.trade'])->latest()->first();

        $course = $enrollment?->course ?? $latestApp?->course;
        $batch = $enrollment?->batch;

        $rollNumber = $enrollment?->enrollment_number 
            ?: ($profile->registration_number 
            ?: ('GTTI-' . date('Y') . '-' . str_pad((string)$profile->id, 4, '0', STR_PAD_LEFT)));

        $regNumber = $profile->registration_number 
            ?: ('PBTE-' . date('Y') . '-' . str_pad((string)$profile->id, 5, '0', STR_PAD_LEFT));

        $sessionYear = $batch?->session_year ?? (date('Y') . '-' . (date('Y') + 1));
        $issueDate = $enrollment?->enrollment_date 
            ? \Carbon\Carbon::parse($enrollment->enrollment_date)->format('d M, Y') 
            : now()->format('d M, Y');

        $validUntil = $batch?->end_date 
            ? \Carbon\Carbon::parse($batch->end_date)->format('d M, Y') 
            : now()->addMonths(12)->format('d M, Y');

        $card = [
            'id'                  => $profile->id,
            'enrollment_id'       => $enrollment?->id,
            'student_name'        => $targetUser->name,
            'father_name'         => $profile->father_name ?? 'N/A',
            'cnic'                => $targetUser->cnic ?? 'N/A',
            'gender'              => ucfirst($profile->gender ?? 'Male'),
            'roll_number'         => $rollNumber,
            'registration_number' => $regNumber,
            'course_name'         => $course?->name ?? 'Vocational & Technical Training',
            'trade_name'          => $course?->trade?->name ?? 'Technical Trades Division',
            'department_name'     => $course?->trade?->program?->department?->name ?? 'Directorate of Technical Training',
            'batch_name'          => $batch?->name ?? 'Morning Shift Batch',
            'shift'               => ucfirst($batch?->shift ?? ($latestApp?->shift ?? 'Morning')),
            'session_year'        => $sessionYear,
            'emergency_contact'   => $profile->emergency_contact ?? ($targetUser->phone ?? '068-9230123'),
            'address'             => $profile->address ?? 'Rahim Yar Khan, Punjab',
            'profile_picture_url' => $profile->profile_picture_url,
            'has_photo'           => !empty($profile->profile_picture_url),
            'issue_date'          => $issueDate,
            'valid_until'         => $validUntil,
            'status'              => $profile->status ?? 'active',
            'is_enrolled'         => (bool) $enrollment,
            'barcode'             => "GTTI*{$rollNumber}*{$sessionYear}",
            'institute_name'      => 'GOVERNMENT TECHNICAL TRAINING INSTITUTE',
            'institute_short'     => 'GTTI RAHIM YAR KHAN',
            'institute_address'   => 'Shahbaz Pur Road, Near Sports Complex, Rahim Yar Khan',
            'institute_helpline'  => '068-9230123 / 068-9230124',
            'authority_title'     => 'Principal / Registrar',
        ];

        return Inertia::render('Shared/PrintStudentCard', [
            'card' => $card,
        ]);
    }
}
