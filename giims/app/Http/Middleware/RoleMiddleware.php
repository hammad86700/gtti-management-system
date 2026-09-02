<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(401);
        }

        // Load roles relationship if not loaded
        if (! $user->relationLoaded("roles")) {
            $user->load("roles");
        }

        // Super Admin & Principal have overarching access to administrative subsystems
        $isSuperUser = $user->roles->contains(function ($role) {
            return in_array($role->slug, ["super-admin", "principal"]) ||
                   in_array(strtolower($role->name), ["super admin", "principal"]);
        });

        if ($isSuperUser) {
            return $next($request);
        }

        $expandedRoles = [];
        foreach ($roles as $r) {
            foreach (explode(',', $r) as $part) {
                if (trim($part) !== '') {
                    $expandedRoles[] = strtolower(trim($part));
                }
            }
        }

        foreach ($expandedRoles as $role) {

            if ($role === "admin") {
                $adminSlugs = ["super-admin", "admin", "principal", "trade-incharge", "admission-clerk"];
                $hasAdminRole = $user->roles->contains(function ($r) use ($adminSlugs) {
                    return in_array($r->slug, $adminSlugs) || in_array(strtolower($r->name), $adminSlugs);
                });
                if ($hasAdminRole) {
                    return $next($request);
                }
            } elseif ($role === "teacher") {
                $teacherSlugs = ["teacher", "trade-incharge", "instructor", "faculty"];
                $hasTeacherRole = $user->roles->contains(function ($r) use ($teacherSlugs) {
                    return in_array($r->slug, $teacherSlugs) || in_array(strtolower($r->name), $teacherSlugs);
                });
                if ($hasTeacherRole) {
                    return $next($request);
                }
            } elseif ($role === "security") {
                $securitySlugs = ["security-officer", "security", "gate-security", "guard"];
                $hasSecurityRole = $user->roles->contains(function ($r) use ($securitySlugs) {
                    return in_array($r->slug, $securitySlugs) || in_array(strtolower($r->name), $securitySlugs);
                });
                if ($hasSecurityRole) {
                    return $next($request);
                }
            } elseif ($role === "student") {
                $isStudent = $user->roles->contains(function ($r) {
                    return in_array($r->slug, ["student", "trainee"]) || in_array(strtolower($r->name), ["student", "trainee"]);
                }) || $user->studentProfile()->exists() || $user->roles->isEmpty();

                if ($isStudent) {
                    return $next($request);
                }
            } else {
                $hasSpecificRole = $user->roles->contains(function ($r) use ($role) {
                    return $r->slug === $role || strtolower($r->name) === $role;
                });
                if ($hasSpecificRole) {
                    return $next($request);
                }
            }
        }

        abort(403, "Unauthorized access to this portal area.");
    }
}

