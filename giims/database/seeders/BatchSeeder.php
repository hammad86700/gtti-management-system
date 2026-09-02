<?php

namespace Database\Seeders;

use App\Domains\Organization\Models\Batch;
use App\Domains\Organization\Models\Course;
use Illuminate\Database\Seeder;

class BatchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = Course::all();

        foreach ($courses as $course) {
            Batch::firstOrCreate(
                [
                    'course_id' => $course->id,
                    'name' => 'Fall 2026 Batch',
                ],
                [
                    'session_year' => '2026-2027',
                    'shift' => 'Morning',
                    'start_date' => '2026-09-01',
                    'end_date' => '2027-08-31',
                ]
            );
        }
    }
}
