<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Organization\Models\Department;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationController extends Controller
{
    /**
     * Display a listing of departments, programs, trades, and courses.
     */
    public function index(): Response
    {
        $departments = Department::with(['programs.trades.courses'])->get();

        return Inertia::render('Admin/Organization/Index', [
            'departments' => $departments,
        ]);
    }
}
