<?php

namespace Tests\Feature;

use App\Domains\Identity\Models\Role;
use App\Domains\Identity\Models\User;
use App\Domains\Operations\Models\CampusShowcasePhoto;
use App\Domains\Organization\Models\Institute;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CampusShowcaseMediaTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Institute $institute;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $adminRole = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        Role::firstOrCreate(['slug' => 'principal'], ['name' => 'Principal']);

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
    }

    public function test_admin_can_view_campus_media_index(): void
    {
        CampusShowcasePhoto::create([
            'image_path' => 'campus_showcase/test1.jpg',
            'title' => 'Machinist Section',
            'subtitle' => 'CNC Milling & Lathes',
            'display_order' => 1,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.campus-media.index'));

        $response->assertOk();
        $response->assertInertia(function ($page) {
            $page->component('Admin/CampusMedia/Index')
                ->has('photos', 1);
        });
    }

    public function test_admin_can_upload_showcase_photo(): void
    {
        $fakeImage = UploadedFile::fake()->image('computer_lab.jpg', 1200, 800);

        $response = $this->actingAs($this->admin)
            ->post(route('admin.campus-media.store'), [
                'image' => $fakeImage,
                'title' => 'Computer Applications Lab',
                'subtitle' => 'Modern lab with 40 workstations',
                'display_order' => 2,
                'is_active' => true,
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertDatabaseHas('campus_showcase_photos', [
            'title' => 'Computer Applications Lab',
            'subtitle' => 'Modern lab with 40 workstations',
            'display_order' => 2,
            'is_active' => true,
            'created_by' => $this->admin->id,
        ]);

        $photo = CampusShowcasePhoto::where('title', 'Computer Applications Lab')->first();
        $this->assertNotNull($photo);
        Storage::disk('public')->assertExists($photo->image_path);
    }

    public function test_admin_can_toggle_photo_visibility(): void
    {
        $photo = CampusShowcasePhoto::create([
            'image_path' => 'campus_showcase/toggle_test.jpg',
            'title' => 'Electrical Lab',
            'is_active' => true,
        ]);

        // Toggle to hidden
        $response = $this->actingAs($this->admin)
            ->patch(route('admin.campus-media.toggle', $photo->id));

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertFalse($photo->fresh()->is_active);

        // Toggle back to active
        $this->actingAs($this->admin)
            ->patch(route('admin.campus-media.toggle', $photo->id));

        $this->assertTrue($photo->fresh()->is_active);
    }

    public function test_admin_can_update_photo_and_replace_image(): void
    {
        $oldFile = UploadedFile::fake()->image('old_photo.jpg');
        $oldPath = $oldFile->store('campus_showcase', 'public');

        $photo = CampusShowcasePhoto::create([
            'image_path' => $oldPath,
            'title' => 'Old Title',
            'subtitle' => 'Old Subtitle',
            'display_order' => 0,
            'is_active' => true,
        ]);

        Storage::disk('public')->assertExists($oldPath);

        $newFile = UploadedFile::fake()->image('new_photo.jpg');

        $response = $this->actingAs($this->admin)
            ->post(route('admin.campus-media.update', $photo->id), [
                'image' => $newFile,
                'title' => 'Updated Automation Lab',
                'subtitle' => 'Updated with Festo PLC Trainers',
                'display_order' => 5,
                'is_active' => true,
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $fresh = $photo->fresh();
        $this->assertEquals('Updated Automation Lab', $fresh->title);
        $this->assertEquals('Updated with Festo PLC Trainers', $fresh->subtitle);
        $this->assertEquals(5, $fresh->display_order);

        // Old file deleted, new file exists
        Storage::disk('public')->assertMissing($oldPath);
        Storage::disk('public')->assertExists($fresh->image_path);
    }

    public function test_admin_can_delete_showcase_photo(): void
    {
        $file = UploadedFile::fake()->image('to_delete.jpg');
        $path = $file->store('campus_showcase', 'public');

        $photo = CampusShowcasePhoto::create([
            'image_path' => $path,
            'title' => 'Delete Me',
            'is_active' => true,
        ]);

        Storage::disk('public')->assertExists($path);

        $response = $this->actingAs($this->admin)
            ->delete(route('admin.campus-media.destroy', $photo->id));

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertDatabaseMissing('campus_showcase_photos', ['id' => $photo->id]);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_public_home_page_displays_active_photos_in_order(): void
    {
        CampusShowcasePhoto::create([
            'image_path' => 'campus_showcase/p2.jpg',
            'title' => 'Second Display',
            'display_order' => 2,
            'is_active' => true,
        ]);

        CampusShowcasePhoto::create([
            'image_path' => 'campus_showcase/p1.jpg',
            'title' => 'First Display',
            'display_order' => 1,
            'is_active' => true,
        ]);

        CampusShowcasePhoto::create([
            'image_path' => 'campus_showcase/p_hidden.jpg',
            'title' => 'Hidden Photo',
            'display_order' => 0,
            'is_active' => false,
        ]);

        $response = $this->get(route('home'));

        $response->assertOk();
        $response->assertInertia(function ($page) {
            $page->component('Public/Home')
                ->has('showcasePhotos', 2)
                ->where('showcasePhotos.0.title', 'First Display')
                ->where('showcasePhotos.1.title', 'Second Display');
        });
    }

    public function test_public_home_page_gracefully_falls_back_when_no_photos_active(): void
    {
        $response = $this->get(route('home'));

        $response->assertOk();
        $response->assertInertia(function ($page) {
            $page->component('Public/Home')
                ->has('showcasePhotos', 0);
        });
    }
}
