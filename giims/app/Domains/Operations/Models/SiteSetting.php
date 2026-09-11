<?php

namespace App\Domains\Operations\Models;

use App\Domains\Identity\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SiteSetting extends Model
{
    use HasFactory;

    protected $table = 'site_settings';

    protected $fillable = [
        'key',
        'value',
        'group',
        'updated_by',
    ];

    /**
     * Default institutional settings fallback.
     */
    public static function defaults(): array
    {
        return [
            // General / Identity
            'institute_name' => 'Government Technical Training Institute, Rahim Yar Khan',
            'institute_short_name' => 'GTTI RYK',
            'tagline' => 'Directorate of Technical Education - TEVTA Punjab',
            'govt_subheading' => 'GOVERNMENT OF THE PUNJAB | Technical Education & Vocational Training Authority (TEVTA)',
            'motto' => 'ایمان، اتحاد، نظم و ضبط • Faith, Unity, Discipline',
            'institute_logo' => '/images/tevta-logo.png',
            'tevta_logo' => '/images/tevta-logo.png',

            // Contact & Helpline
            'phone' => '068-9230123',
            'email' => 'info@gtti.edu.pk',
            'official_email' => 'info@gtti.edu.pk',
            'helpline' => '068-9230123 / 068-9230124',
            'helpline_phones' => '068-9230123 / 068-9230124',
            'address' => 'Shahbaz Pur Road, Near Sports Complex, Rahim Yar Khan, Punjab, Pakistan',
            'institute_address' => 'Shahbaz Pur Road, Rahim Yar Khan',
            'office_timings' => 'Monday – Saturday: 08:00 AM – 02:00 PM',
            'accreditation_text' => 'PBTE & NAVTTC Accredited',
            'affiliation_text' => 'PBTE & NAVTTC Accredited Center',
            'google_maps_link' => 'https://maps.google.com/?q=GTTI+Rahim+Yar+Khan',

            // Official Marquee Notice
            'official_notice_text' => 'Admissions Open for Session 2026: Fall 2026 Admissions — Free Education with Govt. Toolkits & Subsidized Stipends',
            'official_notice_link' => '#courses',

            // Quick Cards (4 Portal Tiles)
            'card_1_title' => 'Tevta Portal',
            'card_1_subtitle' => 'Enterprise Access',
            'card_1_url' => '/login',

            'card_2_title' => 'Online Admission Form',
            'card_2_subtitle' => 'Session 2026 Open',
            'card_2_url' => '/register',

            'card_3_title' => 'Download Prospectus',
            'card_3_subtitle' => 'Session 2026 Guide & Eligibility',
            'card_3_url' => '/download-prospectus',

            'card_4_title' => 'Merit Lists & Gazette',
            'card_4_subtitle' => 'Session 2026 Selections',
            'card_4_url' => '/merit-lists',

            // Institutional Files
            'prospectus_pdf_path' => null,
            'prospectus_file_size' => null,
            'prospectus_uploaded_at' => null,
        ];
    }

    /**
     * Retrieve a setting by key, with default fallback.
     */
    public static function get(string $key, ?string $default = null): ?string
    {
        try {
            $setting = static::where('key', $key)->first();
            if ($setting && $setting->value !== null) {
                return $setting->value;
            }
        } catch (\Throwable $e) {
            // Table might not exist during early migration
        }

        $defaults = static::defaults();
        return $default ?? ($defaults[$key] ?? null);
    }

    /**
     * Store or update a setting by key.
     */
    public static function set(string $key, ?string $value, string $group = 'general', ?int $updatedBy = null): static
    {
        $payload = ['value' => $value, 'group' => $group];
        if ($updatedBy) {
            $payload['updated_by'] = $updatedBy;
        }

        return static::updateOrCreate(
            ['key' => $key],
            $payload
        );
    }

    /**
     * User who last updated this setting.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get all settings merged with defaults as key-value pairs.
     */
    public static function allAsKeyValue(): array
    {
        $defaults = static::defaults();

        try {
            $dbSettings = static::pluck('value', 'key')->toArray();
            return array_merge($defaults, array_filter($dbSettings, fn ($v) => $v !== null));
        } catch (\Throwable $e) {
            return $defaults;
        }
    }
}