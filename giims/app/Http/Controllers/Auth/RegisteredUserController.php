<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Domains\Identity\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'cnic' => 'nullable|string|max:25',
            'phone' => 'nullable|string|max:25',
            'father_name' => 'nullable|string|max:255',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'cnic' => $request->cnic,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        $studentRole = \App\Domains\Identity\Models\Role::firstOrCreate(
            ['slug' => 'student'],
            ['name' => 'Student', 'is_system' => false]
        );
        $user->roles()->attach($studentRole->id);

        \App\Domains\Student\Models\StudentProfile::firstOrCreate(
            ['user_id' => $user->id],
            [
                'father_name' => $request->father_name,
                'status' => 'applicant',
            ]
        );

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
