<?php

namespace Tests\Feature;

use App\Domains\Admissions\Models\MeritList;
use App\Domains\Identity\Models\Role;
use App\Domains\Identity\Models\User;
use App\Domains\Operations\Models\SiteSetting;
use App\Domains\Organization\Models\Course;
use App\Domains\Organization\Models\Department;
use App\Domains\Organization\Models\Institute;
use App\Domains\Organization\Models\Program;
use App\Domains\Organization\Models\Trade;
use Database\Seeders\SiteSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicLandingCmsAndQuickCardsTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $clerk;
    protected User $student;
    protected Institute $institute;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $adminRole = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        $clerkRole = Role::firstOrCreate(['slug' => 'clerk'], ['name' => 'Clerk']);
        $studentRole = Role::firstOrCreate(['slug' => 'student'], ['name' => 'Student']);

        $this->institute = Institute::create([
            'name' => 'GTTI Rahim Yar Khan',
            'code' => 'GTTI-RYK',
            'is_active' => true,
        ]);

        $this->admin = User::factory()->create([
            'institute_id' => $this->institute->id,
            'name' => 'Campus Administrator',
            'email' => 'admin@gtti.edu.pk',
        ]);
        $this->admin->roles()->attach($adminRole);

        $this->clerk = User::factory()->create([
            'institute_id' => $this->institute->id,
            'name' => 'Admission Clerk',
            'email' => 'clerk@gtti.edu.pk',
        ]);
        $this->clerk->roles()->attach($clerkRole);

        $this->student = User::factory()->create([
            'institute_id' => $this->institute->id,
            'name' => 'Trainee Applicant',
            'email' => 'student@gtti.edu.pk',
        ]);
        $this->student->roles()->attach($studentRole);

        // Seed default site settings
        $this->seed(SiteSettingsSeeder::class);
    }

    /**
     * Test public landing page renders dynamic settings and replaced quick cards.
     */
    public function test_public_landing_page_renders_dynamic_settings_and_replaced_quick_cards(): void
    {
        $response = $this->get(route('home'));

        $response->assertOk();
        $response->assertInertia(function ($page) {
            $page->component('Public/Home')
                ->has('settings')
                ->where('settings.card_3_title', 'Download Prospectus')
                ->where('settings.card_4_title', 'Merit Lists & Gazette');
        });

        // Verify the HTML does not contain legacy cards "Web Email" or "TEVTA Shop"
        $content = $response->getContent();
        $this->assertStringNotContainsString('Web Email', $content);
        $this->assertStringNotContainsString('TEVTA Shop', $content);
    }

    /**
     * Test Admin and Clerk can access CMS Management Desk, but student and guest are blocked.
     */
    public function test_admin_and_clerk_can_access_cms_management_desk_while_unauthorized_users_are_blocked(): void
    {
        // Guest access redirects to login
        $guestResponse = $this->get(route('admin.site-settings.index'));
        $guestResponse->assertRedirect(route('login'));

        // Admin access
        $adminResponse = $this->actingAs($this->admin)->get(route('admin.site-settings.index'));
        $adminResponse->assertOk();
        $adminResponse->assertInertia(fn ($page) => $page->component('Admin/SiteSettings/Index'));

        // Clerk access
        $clerkResponse = $this->actingAs($this->clerk)->get(route('clerk.site-settings.index'));
        $clerkResponse->assertOk();
        $clerkResponse->assertInertia(fn ($page) => $page->component('Admin/SiteSettings/Index'));

        // Student access blocked (403)
        $studentResponse = $this->actingAs($this->student)->get(route('admin.site-settings.index'));
        $studentResponse->assertForbidden();
    }

    /**
     * Test Admin can update landing page settings and changes immediately reflect on public page.
     */
    public function test_admin_can_update_landing_page_settings_and_changes_reflect_on_public_page(): void
    {
        $payload = [
            'govt_subheading' => 'Updated Directorate of Technical Excellence 2026',
            'helpline_phones' => '068-9999111 / 068-9999222',
            'office_timings' => 'Mon - Sat: 7:30 AM - 3:30 PM',
            'motto' => 'Ilm, Amal, Kamyabi',
            'official_notice_text' => 'BREAKING: Phase 37 Live Intake Portal Now Fully Open.',
            'official_notice_link' => '#merit-lists',
            'card_1_title' => 'Tevta Portal',
            'card_1_subtitle' => 'Enterprise Access',
            'card_1_url' => '/login',
            'card_2_title' => 'Online Admission Form',
            'card_2_subtitle' => 'Session 2026 Open',
            'card_2_url' => '/register',
            'card_3_title' => 'Download Official Prospectus',
            'card_3_subtitle' => '2026 Comprehensive Brochure',
            'card_3_url' => '/download-prospectus',
            'card_4_title' => 'Merit Gazette & Selections',
            'card_4_subtitle' => 'Transparent Selection Lists',
            'card_4_url' => '/merit-lists',
            'institute_address' => 'Model Town Campus, Rahim Yar Khan',
            'official_email' => 'admissions@gtti.edu.pk',
            'affiliation_text' => 'Accredited with PBTE & NAVTTC Punjab',
            'google_maps_link' => 'https://maps.google.com/gtti-ryk',
        ];

        $postResponse = $this->actingAs($this->admin)
            ->post(route('admin.site-settings.update'), $payload);

        $postResponse->assertRedirect();
        $postResponse->assertSessionHas('success');

        // Check DB has been updated
        $this->assertEquals('BREAKING: Phase 37 Live Intake Portal Now Fully Open.', SiteSetting::get('official_notice_text'));
        $this->assertEquals('068-9999111 / 068-9999222', SiteSetting::get('helpline_phones'));
        $this->assertEquals('Download Official Prospectus', SiteSetting::get('card_3_title'));

        // Verify public landing page renders new settings
        $publicResponse = $this->get(route('home'));
        $publicResponse->assertOk();
        $publicResponse->assertInertia(function ($page) {
            $page->component('Public/Home')
                ->where('settings.official_notice_text', 'BREAKING: Phase 37 Live Intake Portal Now Fully Open.')
                ->where('settings.helpline_phones', '068-9999111 / 068-9999222')
                ->where('settings.card_3_title', 'Download Official Prospectus');
        });
    }

    /**
     * Test prospectus download workflow: redirect with info alert when unuploaded, stream file when uploaded.
     */
    public function test_prospectus_download_lifecycle_workflow(): void
    {
        // 1. Initially without file upload -> redirects back with info flash
        $response = $this->get(route('prospectus.download'));
        $response->assertRedirect();
        $response->assertSessionHas('info');

        // 2. Upload official prospectus PDF
        $fakePdf = UploadedFile::fake()->create('official_prospectus_2026.pdf', 1024, 'application/pdf');

        $uploadResponse = $this->actingAs($this->admin)
            ->post(route('admin.site-settings.update'), [
                'prospectus_file' => $fakePdf,
                'card_3_title' => 'Download Prospectus',
            ]);

        $uploadResponse->assertRedirect();
        $uploadResponse->assertSessionHas('success');

        $storedPath = SiteSetting::get('prospectus_pdf_path');
        $this->assertNotNull($storedPath);
        Storage::disk('public')->assertExists($storedPath);

        // 3. Now public download streams the PDF file
        $downloadResponse = $this->get(route('prospectus.download'));
        $downloadResponse->assertOk();
        $downloadResponse->assertHeader('content-type', 'application/pdf');
        $this->assertStringContainsString('GTTI-Rahim-Yar-Khan-Prospectus-2026.pdf', $downloadResponse->headers->get('content-disposition'));
    }

    /**
     * Test public selection gazette renders published merit lists.
     */
    public function test_public_selection_gazette_renders_published_merit_lists(): void
    {
        $dept = Department::create([
            'institute_id' => $this->institute->id,
            'name' => 'Mechanical Engineering Wing',
            'code' => 'MECH',
            'is_active' => true,
        ]);

        $program = Program::create([
            'department_id' => $dept->id,
            'name' => 'Machinist Vocational Certificate',
            'type' => 'diploma',
            'duration_months' => 12,
        ]);

        $trade = Trade::create([
            'program_id' => $program->id,
            'name' => 'Precision Machinist',
            'code' => 'TR-MACH',
        ]);

        $course = Course::create([
            'trade_id' => $trade->id,
            'name' => 'CNC Milling & Turning Operations',
            'entry_level' => 'Matric with Science',
            'is_active' => true,
        ]);

        $campaign = \App\Domains\Admissions\Models\AdmissionCampaign::create([
            'institute_id' => $this->institute->id,
            'name' => 'Fall 2026 Regular Intake',
            'start_date' => now()->subMonth(),
            'end_date' => now()->addMonth(),
            'is_active' => true,
        ]);

        $meritList = MeritList::create([
            'admission_campaign_id' => $campaign->id,
            'course_id' => $course->id,
            'title' => 'First Provisional Merit List - CNC Milling',
            'status' => 'published',
            'is_publicly_visible' => true,
            'published_at' => now(),
        ]);

        $response = $this->get(route('merit-lists'));

        $response->assertOk();
        $response->assertInertia(function ($page) {
            $page->component('Public/MeritLists')
                ->has('meritLists.data', 1);
        });
    }
}
