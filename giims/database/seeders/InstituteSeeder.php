<?php

namespace Database\Seeders;

use App\Domains\Organization\Models\Institute;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class InstituteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Institute::updateOrCreate(
            ['code' => 'GTTI-RYK'],
            [
                'name' => 'Govt. Technical Training Institute, Rahim Yar Khan',
                'district' => 'Rahim Yar Khan',
                'type' => 'GTTI',
                'is_active' => true,
            ]
        );
    }
}
