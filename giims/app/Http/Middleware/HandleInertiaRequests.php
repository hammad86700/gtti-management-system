<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        if ($user) {
            $user->loadMissing('roles');
        }

        $rolesArray = $user ? $user->roles->map(fn ($r) => [
            'id' => $r->id,
            'name' => $r->name,
            'slug' => $r->slug,
        ])->toArray() : [];

        $roleSlugs = array_column($rolesArray, 'slug');

        $isSuperAdmin = in_array('super-admin', $roleSlugs) || in_array('principal', $roleSlugs);
        $isAdmin = $isSuperAdmin || in_array('admin', $roleSlugs) || in_array('administrator', $roleSlugs);
        $isClerk = in_array('clerk', $roleSlugs) || in_array('admission-clerk', $roleSlugs);
        $isTeacher = in_array('teacher', $roleSlugs) || in_array('trade-incharge', $roleSlugs) || in_array('instructor', $roleSlugs);
        $isSecurity = in_array('security-officer', $roleSlugs) || in_array('security', $roleSlugs);
        $isInterviewer = in_array('interviewer', $roleSlugs);
        $isStudent = in_array('student', $roleSlugs) || (empty($roleSlugs) && !$isAdmin && !$isClerk && !$isTeacher && !$isSecurity);

        $isEnrolled = false;
        if ($user && $user->studentProfile) {
            $isEnrolled = $user->studentProfile->enrollments()->where('status', 'active')->exists();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'roles' => $rolesArray,
                    'is_super_admin' => $isSuperAdmin,
                    'is_admin' => $isAdmin,
                    'is_clerk' => $isClerk,
                    'is_teacher' => $isTeacher,
                    'is_security' => $isSecurity,
                    'is_interviewer' => $isInterviewer,
                    'is_student' => $isStudent,
                    'is_enrolled' => $isEnrolled,
                ]) : null,
            ],
            'site_settings' => \App\Domains\Operations\Models\SiteSetting::allAsKeyValue(),
        ];
    }
}
