<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = auth()->user();

        if ($user && $user->roles()->whereIn('slug', ['super-admin', 'principal', 'administrator', 'admin'])->exists()) {
            return redirect()->route('admin.dashboard');
        }

        if ($user && $user->roles()->whereIn('slug', ['clerk', 'admission-clerk'])->exists()) {
            return redirect()->route('clerk.dashboard');
        }

        if ($user && $user->roles()->whereIn('slug', ['teacher', 'instructor', 'trade-incharge'])->exists()) {
            return redirect()->route('teacher.dashboard');
        }

        if ($user && $user->roles()->whereIn('slug', ['interviewer'])->exists()) {
            return redirect()->route('interviewer.viva.index');
        }

        if ($user && $user->roles()->whereIn('slug', ['security-officer', 'security'])->exists()) {
            return redirect()->route('security.gate.index');
        }

        return redirect()->route('dashboard');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
