<?php

namespace App\Domains\Operations\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    use HasFactory;

    protected $table = 'site_settings';

    protected $fillable = [
        'key',
        'value',
        'group',
    ];

    /**
     * Default institutional settings fallback.
     */
    public static function defaults(): array
    {
        return [
            'institute_name' => 'Government Technical Training Institute, Rahim Yar Khan',
            'institute_short_name' => 'GTTI RYK',
            'tagline' => 'Directorate of Technical Education - TEVTA Punjab',
            'phone' => '068-9230123',
            'email' => 'info@gtti.edu.pk',
            'address' => 'Shahbaz Pur Road, Near Sports Complex, Rahim Yar Khan, Punjab, Pakistan',
            'accreditation_text' => 'PBTE & NAVTTC Accredited',
            'helpline' => '068-9230123 / 068-9230124',
            'motto' => 'Faith, Unity, Discipline',
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
    public static function set(string $key, ?string $value, string $group = 'general'): static
    {
        return static::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'group' => $group]
        );
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