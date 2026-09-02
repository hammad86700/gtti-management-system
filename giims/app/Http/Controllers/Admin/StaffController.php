<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    /**
     * Display a listing of staff accounts (non-student users) and available roles.
     */
    public function index(): Response
    {
        $roles = DB::table('roles')->where('slug', '!=', 'student')->get();

        $staff = User::whereHas('roles', function ($query) {
            $query->where('slug', '!=', 'student');
        })->with('roles')->orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Staff/Index', [
            'staff' => $staff,
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created staff member in storage and assign role.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'institute_id' => auth()->user()?->institute_id,
            'status' => 'active',
        ]);

        DB::table('role_user')->insert([
            'user_id' => $user->id,
            'role_id' => $request->role_id,
        ]);

        return redirect()->back()->with('success', 'Staff account created and role assigned successfully.');
    }
}
