<?php

namespace Tests\Feature;

use App\Domains\Identity\Models\Role;
use App\Domains\Identity\Models\User;
use App\Domains\Operations\Models\CampusShowcasePhoto;
use App\Domains\Operations\Models\CoreTeamMember;
use App\Domains\Operations\Models\InstituteGalleryImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaGalleryAndTeamTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $clerkUser;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');

        // Seed roles
        $adminRole = Role::firstOrCreate(['slug' => 'super-admin'], ['name' => 'Super Admin', 'is_system' => true]);
        $clerkRole = Role::firstOrCreate(['slug' => 'clerk'], ['name' => 'Clerk', 'is_system' => false]);

        $this->adminUser = User::factory()->create();
        $this->adminUser->roles()->attach($adminRole);

        $this->clerkUser = User::factory()->create();
        $this->clerkUser->roles()->attach($clerkRole);
    }

    public function test_public_home_delivers_active_showcase_gallery_and_core_team(): void
    {
        CampusShowcasePhoto::create([
            'image_path' => 'campus_showcase/test1.jpg',
            'title' => 'Campus Building',
            'is_active' => true,
        ]);

        InstituteGalleryImage::create([
            'image_path' => 'institute_gallery/test_event.jpg',
            'title' => 'Technopreneurship Seminar',
            'category' => 'Workshops & Training',
            'is_active' => true,
        ]);

        InstituteGalleryImage::create([
            'image_path' => 'institute_gallery/hidden_event.jpg',
            'title' => 'Draft Secret Meeting',
            'is_active' => false,
        ]);

        CoreTeamMember::create([
            'name' => 'Engr. Muhammad Tariq Khan',
            'designation' => 'Principal',
            'experience' => '22 Years',
            'is_active' => true,
        ]);

        CoreTeamMember::create([
            'name' => 'Inactive Member',
            'designation' => 'Former Instructor',
            'is_active' => false,
        ]);

        $response = $this->get(route('home'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/Home')
            ->has('showcasePhotos', 1)
            ->has('galleryImages', 1)
            ->has('coreTeamMembers', 1)
            ->where('galleryImages.0.title', 'Technopreneurship Seminar')
            ->where('coreTeamMembers.0.name', 'Engr. Muhammad Tariq Khan')
        );
    }

    public function test_admin_and_clerk_can_access_gallery_index(): void
    {
        $responseAdmin = $this->actingAs($this->adminUser)->get(route('admin.gallery.index'));
        $responseAdmin->assertOk();
        $responseAdmin->assertInertia(fn ($page) => $page->component('Admin/Gallery/Index')->where('isClerk', false));

        $responseClerk = $this->actingAs($this->clerkUser)->get(route('clerk.gallery.index'));
        $responseClerk->assertOk();
        $responseClerk->assertInertia(fn ($page) => $page->component('Admin/Gallery/Index')->where('isClerk', true));
    }

    public function test_admin_can_upload_and_toggle_gallery_image(): void
    {
        $file = UploadedFile::fake()->image('workshop.jpg', 800, 600);

        $response = $this->actingAs($this->adminUser)->post(route('admin.gallery.store'), [
            'image' => $file,
            'title' => '15 Days Training Program',
            'category' => 'Workshops & Training',
            'description' => 'Organized by TEVTA',
            'display_order' => 1,
            'is_active' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('institute_gallery_images', [
            'title' => '15 Days Training Program',
            'category' => 'Workshops & Training',
            'is_active' => true,
        ]);

        $image = InstituteGalleryImage::where('title', '15 Days Training Program')->first();
        Storage::disk('public')->assertExists($image->image_path);

        // Toggle
        $this->actingAs($this->adminUser)->patch(route('admin.gallery.toggle', $image->id));
        $this->assertDatabaseHas('institute_gallery_images', [
            'id' => $image->id,
            'is_active' => false,
        ]);
    }

    public function test_admin_can_manage_core_team_members(): void
    {
        $photo = UploadedFile::fake()->image('principal.jpg', 400, 400);

        $response = $this->actingAs($this->adminUser)->post(route('admin.core-team.store'), [
            'name' => 'Engr. Tariq Khan',
            'designation' => 'Principal / Project Director',
            'experience' => '20+ Years',
            'phone' => '068-9230101',
            'email' => 'principal@gtti.edu.pk',
            'photo' => $photo,
            'bio' => 'Experienced leader in technical education.',
            'display_order' => 1,
            'is_active' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('core_team_members', [
            'name' => 'Engr. Tariq Khan',
            'designation' => 'Principal / Project Director',
            'phone' => '068-9230101',
        ]);

        $member = CoreTeamMember::where('name', 'Engr. Tariq Khan')->first();
        $this->assertNotNull($member->photo_path);
        Storage::disk('public')->assertExists($member->photo_path);

        // Toggle visibility
        $this->actingAs($this->adminUser)->patch(route('admin.core-team.toggle', $member->id));
        $this->assertDatabaseHas('core_team_members', [
            'id' => $member->id,
            'is_active' => false,
        ]);

        // Delete member
        $this->actingAs($this->adminUser)->delete(route('admin.core-team.destroy', $member->id));
        $this->assertDatabaseMissing('core_team_members', [
            'id' => $member->id,
        ]);
    }

    public function test_clerk_cannot_access_core_team_management(): void
    {
        // Core Team is strictly for Admin / Principal as per specification
        $response = $this->actingAs($this->clerkUser)->get(route('admin.core-team.index'));
        $response->assertForbidden();
    }
}
