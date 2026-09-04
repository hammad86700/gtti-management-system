<?php

namespace App\Http\Controllers\Admin;

use App\Domains\Admissions\Models\AdmissionCampaign;
use App\Domains\Admissions\Models\Application;
use App\Domains\Admissions\Models\MeritList;
use App\Domains\Organization\Models\Course;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MeritController extends Controller
{
    /**
     * Display a listing of generated merit lists and the generation control form.
     */
    public function index(): Response
    {
        $activeCampaign = AdmissionCampaign::where('is_active', true)->latest()->first();

        $meritLists = MeritList::with([
            'course.trade.program.department',
            'admissionCampaign',
            'applications',
        ])
        ->orderBy('created_at', 'desc')
        ->get();

        $courses = Course::with('trade.program.department')->where('is_active', true)->get();

        return Inertia::render('Admin/Admissions/Merit/Index', [
            'meritLists' => $meritLists,
            'campaign' => $activeCampaign,
            'courses' => $courses,
        ]);
    }

    /**
     * Generate a new formal merit list for a selected course and calculate ranks.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
        ]);

        $campaign = AdmissionCampaign::where('is_active', true)->latest()->first();

        if (!$campaign) {
            return redirect()->back()->with('error', 'No active admission campaign is currently running.');
        }

        $meritList = MeritList::create([
            'admission_campaign_id' => $campaign->id,
            'course_id' => $validated['course_id'],
            'title' => $validated['title'],
            'status' => 'published',
        ]);

        $course = Course::findOrFail($validated['course_id']);

        $applications = Application::where('course_id', $validated['course_id'])
            ->whereIn('status', ['verified', 'submitted', 'under_review'])
            ->with(['entranceTestAttempt.entranceExam'])
            ->get();

        $matricWeightage = $course->matric_weightage ?? 50;
        $testWeightage = $course->test_weightage ?? 50;

        foreach ($applications as $app) {
            $obtained = $app->obtained_marks ?? 700;
            $total = $app->total_marks ?? 1100;
            $app->obtained_marks = $obtained;
            $app->total_marks = $total;

            if ($course->isFcfs()) {
                // FCFS: simple matric percentage
                $app->merit_score = $total > 0 ? round(($obtained / $total) * 100, 2) : 0;
            } else {
                // Merit-based: use calculated entrance composite merit score if available
                $attempt = $app->entranceTestAttempt;
                if ($attempt && $attempt->composite_merit_score !== null) {
                    $app->merit_score = $attempt->composite_merit_score;
                } else {
                    // Fallback to matric percentage if no entrance exam taken
                    $app->merit_score = $total > 0 ? round(($obtained / $total) * 100, 2) : 0;
                }
            }
            $app->save();
        }

        // Sorting: FCFS by earliest created_at, Merit-based by composite merit_score DESC
        if ($course->isFcfs()) {
            $sorted = $applications->sortBy('created_at')->values();
        } else {
            $sorted = $applications->sortByDesc('merit_score')->values();
        }

        foreach ($sorted as $index => $app) {
            if ($index < 30) {
                $app->update([
                    'status' => 'selected',
                    'merit_list_id' => $meritList->id,
                ]);
            } else {
                $app->update([
                    'status' => 'waitlisted',
                    'merit_list_id' => $meritList->id,
                ]);
            }
        }

        return redirect()->back()->with('success', "Merit list '{$meritList->title}' successfully compiled using {$course->admission_type} strategy. {$sorted->count()} applicant(s) ranked and processed.");
    }

    /**
     * Display the specified merit list with ranked student listings.
     */
    public function show(int $id): Response
    {
        $meritList = MeritList::with([
            'course.trade.program.department',
            'admissionCampaign',
            'applications.studentProfile.user',
        ])->findOrFail($id);

        $meritList->setRelation(
            'applications',
            $meritList->applications->sortByDesc('merit_score')->values()
        );

        return Inertia::render('Admin/Admissions/Merit/Show', [
            'meritList' => $meritList,
        ]);
    }

    /**
     * Override applicant status and merit ranking for an official merit list.
     */
    public function reorder(Request $request, int $id): RedirectResponse
    {
        $meritList = MeritList::findOrFail($id);

        $validated = $request->validate([
            'applications' => 'required|array',
            'applications.*.id' => 'required|exists:applications,id',
            'applications.*.status' => 'required|in:selected,waitlisted,rejected,admitted',
            'applications.*.merit_score' => 'nullable|numeric|min:0|max:100',
        ]);

        foreach ($validated['applications'] as $appData) {
            $app = Application::where('id', $appData['id'])
                ->where('merit_list_id', $meritList->id)
                ->first();

            if ($app) {
                $oldStatus = $app->status;
                $oldScore = $app->merit_score;

                $updateData = ['status' => $appData['status']];
                if (isset($appData['merit_score'])) {
                    $updateData['merit_score'] = $appData['merit_score'];
                }
                $app->update($updateData);

                if ($oldStatus !== $appData['status'] || (isset($appData['merit_score']) && $oldScore != $appData['merit_score'])) {
                    \App\Domains\Operations\Models\ActivityLog::create([
                        'user_id' => auth()->id(),
                        'action' => 'overridden',
                        'model_type' => Application::class,
                        'model_id' => $app->id,
                        'description' => "Manual merit rank/status adjustment for Application #{$app->id} in '{$meritList->title}'",
                        'old_data' => ['status' => $oldStatus, 'merit_score' => $oldScore],
                        'new_data' => $updateData,
                        'ip_address' => $request->ip(),
                    ]);
                }
            }
        }

        return redirect()->back()->with('success', 'Merit rankings and selection statuses successfully adjusted and saved.');
    }
}
