<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Operations\Models\ActivityLog;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    /**
     * Display the centralized institutional audit logs console.
     */
    public function index(Request $request): Response
    {
        $query = ActivityLog::with("user")->latest();

        if ($request->filled("action")) {
            $query->where("action", $request->action);
        }

        if ($request->filled("model")) {
            $query->where("model_type", "like", "%" . $request->model . "%");
        }

        $logs = $query->paginate(25)->withQueryString();

        return Inertia::render("Admin/SystemLogs/Index", [
            "logs" => $logs,
            "filters" => $request->only(["action", "model"]),
        ]);
    }
}

