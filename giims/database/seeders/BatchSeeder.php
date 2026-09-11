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
            // 1. Morning Shift Batch
            Batch::firstOrCreate(
                [
                    'course_id' => $course->id,
                    'shift' => 'Morning',
                ],
                [
                    'name' => 'Fall 2026 - Morning Batch',
                    'session_year' => '2026-2027',
                    'start_date' => '2026-09-01',
                    'end_date' => '2027-08-31',
                ]
            );

            // 2. Evening Shift Batch
            Batch::firstOrCreate(
                [
                    'course_id' => $course->id,
                    'shift' => 'Evening',
                ],
                [
                    'name' => 'Fall 2026 - Evening Batch',
                    'session_year' => '2026-2027',
                    'start_date' => '2026-09-01',
                    'end_date' => '2027-08-31',
                ]
            );
        }
    }
}
