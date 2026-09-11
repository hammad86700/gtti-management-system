<?php

namespace Database\Seeders;

use App\Domains\Operations\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // General / Header Group
            [
                'key' => 'govt_subheading',
                'value' => 'GOVERNMENT OF THE PUNJAB | Technical Education & Vocational Training Authority (TEVTA)',
                'group' => 'header',
            ],
            [
                'key' => 'helpline_phones',
                'value' => '068-9230123 / 068-9230124',
                'group' => 'header',
            ],
            [
                'key' => 'office_timings',
                'value' => 'Monday – Saturday: 08:00 AM – 02:00 PM',
                'group' => 'header',
            ],
            [
                'key' => 'motto',
                'value' => 'ایمان، اتحاد، نظم و ضبط • Faith, Unity, Discipline',
                'group' => 'header',
            ],

            // Marquee Official Notice Group
            [
                'key' => 'official_notice_text',
                'value' => 'Admissions Open for Session 2026: Fall 2026 Admissions — Free Education with Govt. Toolkits & Subsidized Stipends',
                'group' => 'notice',
            ],
            [
                'key' => 'official_notice_link',
                'value' => '#courses',
                'group' => 'notice',
            ],

            // 4 Quick Cards Customizer Group
            [
                'key' => 'card_1_title',
                'value' => 'Tevta Portal',
                'group' => 'quick_cards',
            ],
            [
                'key' => 'card_1_subtitle',
                'value' => 'Enterprise Access',
                'group' => 'quick_cards',
            ],
            [
                'key' => 'card_1_url',
                'value' => '/login',
                'group' => 'quick_cards',
            ],

            [
                'key' => 'card_2_title',
                'value' => 'Online Admission Form',
                'group' => 'quick_cards',
            ],
            [
                'key' => 'card_2_subtitle',
                'value' => 'Session 2026 Open',
                'group' => 'quick_cards',
            ],
            [
                'key' => 'card_2_url',
                'value' => '/register',
                'group' => 'quick_cards',
            ],

            [
                'key' => 'card_3_title',
                'value' => 'Download Prospectus',
                'group' => 'quick_cards',
            ],
            [
                'key' => 'card_3_subtitle',
                'value' => 'Session 2026 Guide & Eligibility',
                'group' => 'quick_cards',
            ],
            [
                'key' => 'card_3_url',
                'value' => '/download-prospectus',
                'group' => 'quick_cards',
            ],

            [
                'key' => 'card_4_title',
                'value' => 'Merit Lists & Gazette',
                'group' => 'quick_cards',
            ],
            [
                'key' => 'card_4_subtitle',
                'value' => 'Session 2026 Selections',
                'group' => 'quick_cards',
            ],
            [
                'key' => 'card_4_url',
                'value' => '/merit-lists',
                'group' => 'quick_cards',
            ],

            // Institutional Files Group
            [
                'key' => 'prospectus_pdf_path',
                'value' => null,
                'group' => 'files',
            ],

            // Contact & Footer Details Group
            [
                'key' => 'institute_address',
                'value' => 'Shahbaz Pur Road, Rahim Yar Khan',
                'group' => 'contact',
            ],
            [
                'key' => 'official_email',
                'value' => 'info@gtti.edu.pk',
                'group' => 'contact',
            ],
            [
                'key' => 'affiliation_text',
                'value' => 'PBTE & NAVTTC Accredited Center',
                'group' => 'contact',
            ],
            [
                'key' => 'google_maps_link',
                'value' => 'https://maps.google.com/?q=GTTI+Rahim+Yar+Khan',
                'group' => 'contact',
            ],
        ];

        foreach ($settings as $setting) {
            SiteSetting::updateOrCreate(
                ['key' => $setting['key']],
                [
                    'value' => $setting['value'],
                    'group' => $setting['group'],
                ]
            );
        }
    }
}
