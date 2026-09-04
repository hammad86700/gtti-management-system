<?php

namespace App\Http\Middleware;

use App\Domains\Student\Models\Enrollment;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStudentActive
{
    /**
     * Handle an incoming request and ensure sanctioned students cannot access functional modules.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        $profile = $user->studentProfile;

        if (! $profile) {
            return $next($request);
        }

        // 1. Automatic expiry check for temporary struck-off
        $isProfileStruckOff = $profile->status === 'struck_off';
        if ($isProfileStruckOff && $profile->struck_off_until && now()->greaterThan($profile->struck_off_until)) {
            $profile->update([
                'status' => 'active',
                'struck_off_at' => null,
                'struck_off_until' => null,
                'struck_off_days' => null,
                'termination_reason' => null,
                'sanctioned_by' => null,
                'order_reference' => null,
            ]);

            Enrollment::where('student_profile_id', $profile->id)
                ->whereIn('status', ['suspended', 'struck_off'])
                ->update([
                    'status' => 'active',
                    'struck_off_at' => null,
                    'struck_off_until' => null,
                    'struck_off_days' => null,
                    'disciplinary_reason' => null,
                    'disciplined_by' => null,
                ]);

            $isProfileStruckOff = false;
        }

        // Auto-lift expired struck-off enrollments
        Enrollment::where('student_profile_id', $profile->id)
            ->where('status', 'struck_off')
            ->whereNotNull('struck_off_until')
            ->where('struck_off_until', '<=', now())
            ->update([
                'status' => 'active',
                'struck_off_at' => null,
                'struck_off_until' => null,
                'struck_off_days' => null,
                'disciplinary_reason' => null,
                'disciplined_by' => null,
            ]);

        $hasStruckOffEnrollment = Enrollment::where('student_profile_id', $profile->id)
            ->where('status', 'struck_off')
            ->exists();

        $hasTerminatedEnrollment = Enrollment::where('student_profile_id', $profile->id)
            ->where('status', 'terminated')
            ->exists();

        // 2. Check for active temporary suspension
        if ($isProfileStruckOff || $hasStruckOffEnrollment) {
            if ($request->routeIs('dashboard')) {
                return $next($request);
            }

            $expiryDate = $profile->struck_off_until?->format('d M Y') ?? 'further notice';
            return redirect()->route('dashboard')->with(
                'warning',
                "Your student account is temporarily struck off until {$expiryDate}. Academic modules and portal access are locked."
            );
        }

        // 3. Check for permanent termination
        if ($profile->status === 'terminated' || $hasTerminatedEnrollment) {
            if ($request->routeIs('dashboard')) {
                return $next($request);
            }

            return redirect()->route('dashboard')->with(
                'error',
                'Your student account has been permanently terminated from Govt Technical Training Institute. Access is permanently locked.'
            );
        }

        // Check if candidate is still an applicant (not yet enrolled in active batch)
        $hasActiveEnrollment = $profile->enrollments()->where('status', 'active')->exists();
        $academicRoutes = [
            'student.lms.*',
            'student.online-tests.*',
            'student.leaves.*',
            'student.clearance.*',
            'student.alumni.*',
            'student.attendance.*',
            'student.assignments.*',
        ];

        if (! $hasActiveEnrollment && $request->routeIs($academicRoutes)) {
            return redirect()->route('dashboard')->with(
                'info',
                'You are currently in the admission application pipeline. Coursework, CBT exams, and student services activate once you are selected and enrolled into a batch.'
            );
        }

        return $next($request);
    }
}
