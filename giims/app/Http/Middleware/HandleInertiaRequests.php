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

        $isAdmin = in_array('super-admin', $roleSlugs)
            || in_array('principal', $roleSlugs)
            || in_array('admission-clerk', $roleSlugs)
            || in_array('admin', $roleSlugs);

        $isTeacher = in_array('teacher', $roleSlugs) || in_array('trade-incharge', $roleSlugs);
        $isSecurity = in_array('security-officer', $roleSlugs) || in_array('security', $roleSlugs);
        $isStudent = in_array('student', $roleSlugs) || empty($roleSlugs);

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'roles' => $rolesArray,
                    'is_admin' => $isAdmin,
                    'is_teacher' => $isTeacher,
                    'is_security' => $isSecurity,
                    'is_student' => $isStudent,
                ]) : null,
            ],
            'site_settings' => \App\Domains\Operations\Models\SiteSetting::allAsKeyValue(),
        ];
    }
}
