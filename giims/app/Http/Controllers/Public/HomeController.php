<?php

namespace App\Http\Controllers\Public;

use App\Domains\Admissions\Models\AdmissionCampaign;
use App\Domains\Admissions\Models\MeritList;
use App\Domains\Operations\Models\SiteSetting;
use App\Domains\Organization\Models\Course;
use App\Domains\Organization\Models\Department;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class HomeController extends Controller
{
    /**
     * Display the public landing page with active campaigns and department courses.
     */
    public function index(): Response
    {
        $activeCampaign = AdmissionCampaign::where('is_active', true)->latest()->first();

        $departments = Department::where('is_active', true)
            ->with(['programs.trades.courses' => function ($q) {
                $q->where('is_published', true);
            }])
            ->get();

        $publishedCourses = Course::where('is_published', true)
            ->where('is_active', true)
            ->with(['trade.program.department'])
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        $showcasePhotos = \App\Domains\Operations\Models\CampusShowcasePhoto::active()->get();
        $galleryImages = \App\Domains\Operations\Models\InstituteGalleryImage::active()->get();
        $coreTeamMembers = \App\Domains\Operations\Models\CoreTeamMember::active()->get();

        $settings = SiteSetting::allAsKeyValue();

        $publishedMeritLists = MeritList::where('is_publicly_visible', true)
            ->orWhere('status', 'published')
            ->with(['course.trade.program'])
            ->latest('published_at')
            ->take(10)
            ->get();

        return Inertia::render('Public/Home', [
            'activeCampaign' => $activeCampaign,
            'departments' => $departments,
            'publishedCourses' => $publishedCourses,
            'showcasePhotos' => $showcasePhotos,
            'galleryImages' => $galleryImages,
            'coreTeamMembers' => $coreTeamMembers,
            'settings' => $settings,
            'publishedMeritLists' => $publishedMeritLists,
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
        ]);
    }

    /**
     * Public route to download the official institutional prospectus PDF.
     */
    public function downloadProspectus(): StreamedResponse|BinaryFileResponse|RedirectResponse
    {
        $prospectusPath = SiteSetting::get('prospectus_pdf_path');

        if ($prospectusPath && Storage::disk('public')->exists($prospectusPath)) {
            return Storage::disk('public')->download($prospectusPath, 'GTTI-Rahim-Yar-Khan-Prospectus-2026.pdf', [
                'Content-Type' => 'application/pdf',
            ]);
        }

        return redirect()->back()->with('info', 'Prospectus for the upcoming session will be uploaded shortly.');
    }

    /**
     * Public route to view official selection merit lists and gazette.
     */
    public function meritLists(Request $request): Response
    {
        $courseId = $request->input('course_id');
        $search = $request->input('search');

        $query = MeritList::where(function ($q) {
            $q->where('is_publicly_visible', true)
              ->orWhere('status', 'published');
        })->with(['course.trade.program.department', 'uploader:id,name']);

        if ($courseId) {
            $query->where('course_id', $courseId);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhereHas('course', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $meritLists = $query->latest('published_at')->paginate(12)->withQueryString();

        $courses = Course::where('is_active', true)
            ->with('trade')
            ->orderBy('name')
            ->get();

        $settings = SiteSetting::allAsKeyValue();

        return Inertia::render('Public/MeritLists', [
            'meritLists' => $meritLists,
            'courses' => $courses,
            'settings' => $settings,
            'filters' => [
                'course_id' => $courseId,
                'search' => $search,
            ],
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
        ]);
    }
}
