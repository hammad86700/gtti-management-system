<?php

namespace Database\Seeders;

use App\Domains\Operations\Models\CampusShowcasePhoto;
use App\Domains\Operations\Models\CoreTeamMember;
use App\Domains\Operations\Models\InstituteGalleryImage;
use Illuminate\Database\Seeder;

class MediaGalleryTeamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Hero Showcase Slides
        $showcaseData = [
            [
                'title' => 'GTTI Rahim Yar Khan - Premier Technical Campus',
                'subtitle' => 'Flagship technical training campus equipped with industrial workshops, modern classrooms, and accredited CBT&A testing facilities.',
                'image_path' => '/images/campus_building.jpg',
                'display_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Executive Training Seminar on Technopreneurship & Vocational Skills',
                'subtitle' => 'TEVTA dignitaries and industry leaders presiding over the technical capacity development workshop at the Government Center of Excellence.',
                'image_path' => '/images/workshop_event.jpg',
                'display_order' => 2,
                'is_active' => true,
            ],
            [
                'title' => 'Precision Mechanical Workshops & Modern CNC Facilities',
                'subtitle' => 'Hands-on practical trade instruction providing market-driven vocational skills aligned with international industrial benchmarks.',
                'image_path' => '/images/campus_building.jpg',
                'display_order' => 3,
                'is_active' => true,
            ],
        ];

        foreach ($showcaseData as $slide) {
            CampusShowcasePhoto::firstOrCreate(
                ['title' => $slide['title']],
                $slide
            );
        }

        // 2. Image Gallery Items
        $galleryData = [
            [
                'title' => '15 Days Training Program on Technopreneurship',
                'category' => 'Workshops & Training',
                'description' => 'Specialized technical capacity development organized by TEVTA Punjab at Government Center of Excellence.',
                'event_date' => '2026-07-15',
                'image_path' => '/images/workshop_event.jpg',
                'display_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Annual Independence Day & Flag Hoisting Ceremony',
                'category' => 'Ceremonies',
                'description' => 'Traiing cadets, faculty, and administrative staff gathering at the historic academic building courtyard.',
                'event_date' => '2026-08-14',
                'image_path' => '/images/campus_building.jpg',
                'display_order' => 2,
                'is_active' => true,
            ],
            [
                'title' => 'Hands-on Practical Technical Workshop Demonstration',
                'category' => 'Workshops & Training',
                'description' => 'Students undertaking industrial testing, circuit diagnostics, and mechanical fabrication under certified instructors.',
                'event_date' => '2026-08-25',
                'image_path' => '/images/workshop_event.jpg',
                'display_order' => 3,
                'is_active' => true,
            ],
            [
                'title' => 'Campus Infrastructure & Green Courtyard Inspection',
                'category' => 'Campus Life',
                'description' => 'Provincial technical delegation reviewing laboratory equipment, safety compliance, and instructional classrooms.',
                'event_date' => '2026-09-02',
                'image_path' => '/images/campus_building.jpg',
                'display_order' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($galleryData as $item) {
            InstituteGalleryImage::firstOrCreate(
                ['title' => $item['title']],
                $item
            );
        }

        // 3. Core Team Leadership Members
        $teamData = [
            [
                'name' => 'Engr. Muhammad Tariq Khan',
                'designation' => 'Principal / Project Director',
                'department' => 'Institutional Executive Office',
                'experience' => '22+ Years Institutional Leadership & Technical Training',
                'phone' => '068-9230101',
                'email' => 'principal@gtti.edu.pk',
                'photo_path' => '/images/quaid-e-azam.jpg',
                'bio' => 'M.Sc. Mechanical Engineering (UET Lahore). Spearheading digital transformation, CBT&A accreditation, and nationwide industrial linkages.',
                'display_order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Engr. Sohail Ahmad',
                'designation' => 'Vice Principal & Head of Electrical Wing',
                'department' => 'Electrical Department',
                'experience' => '18+ Years Power Systems, Automation & CBT&A Assessment',
                'phone' => '068-9230102',
                'email' => 'sohail.ahmad@gtti.edu.pk',
                'photo_path' => '/images/campus_building.jpg',
                'bio' => 'B.Sc. Electrical Engineering, Lead Assessor NAVTTC. In charge of academic curriculum compliance and daily instructional quality.',
                'display_order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Mian Khalid Mehmood',
                'designation' => 'Chief Instructor Mechanical & Workshop Superintendent',
                'department' => 'Mechanical Engineering Wing',
                'experience' => '19+ Years Industrial Manufacturing & CAD/CAM Systems',
                'phone' => '068-9230103',
                'email' => 'khalid.mehmood@gtti.edu.pk',
                'photo_path' => '/images/workshop_event.jpg',
                'bio' => 'B.Tech (Hons) Mechanical. Supervises precision machining laboratories, tool room stores, and practical student trade projects.',
                'display_order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Dr. Farhan Ali',
                'designation' => 'Head of Computer & Information Technology Wing',
                'department' => 'IT & Software Department',
                'experience' => '14+ Years Enterprise Systems & Network Infrastructure',
                'phone' => '068-9230104',
                'email' => 'farhan.ali@gtti.edu.pk',
                'photo_path' => '/images/campus_building.jpg',
                'bio' => 'Ph.D. Computer Science. Leads online CBT testing systems, smart classrooms, and cloud infrastructure.',
                'display_order' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($teamData as $member) {
            CoreTeamMember::firstOrCreate(
                ['name' => $member['name']],
                $member
            );
        }
    }
}
