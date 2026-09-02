<?php

namespace Database\Seeders;

use App\Domains\Organization\Models\Course;
use App\Domains\Organization\Models\Department;
use App\Domains\Organization\Models\Institute;
use App\Domains\Organization\Models\Program;
use App\Domains\Organization\Models\Trade;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class OrganizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $institute = Institute::where('code', 'GTTI-RYK')->firstOrFail();

        $departmentsData = [
            [
                'name' => 'Mechanical Technology',
                'code' => 'MECH',
                'programs' => [
                    [
                        'name' => '2-Year G-II',
                        'type' => 'G-II',
                        'duration_months' => 24,
                        'trades' => [
                            ['name' => 'Welder', 'code' => 'WELD', 'entry_level' => 'Middle'],
                            ['name' => 'Auto & Farm Machinery Mechanic', 'code' => 'AFMM', 'entry_level' => 'Middle'],
                            ['name' => 'HVACR', 'code' => 'HVACR', 'entry_level' => 'Matric'],
                            ['name' => 'Machinist', 'code' => 'MACH', 'entry_level' => 'Matric'],
                            ['name' => 'Fitter General', 'code' => 'FG', 'entry_level' => 'Middle'],
                        ],
                    ],
                    [
                        'name' => '6-Month CBT&A',
                        'type' => 'CBT&A',
                        'duration_months' => 6,
                        'trades' => [
                            ['name' => 'Motorcycle Mechanic', 'code' => 'MM', 'entry_level' => 'Middle'],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Electrical & Electronics',
                'code' => 'EE',
                'programs' => [
                    [
                        'name' => '2-Year G-II',
                        'type' => 'G-II',
                        'duration_months' => 24,
                        'trades' => [
                            ['name' => 'Electrician', 'code' => 'ELEC', 'entry_level' => 'Matric'],
                            ['name' => 'Electronics Application', 'code' => 'EA', 'entry_level' => 'Matric'],
                        ],
                    ],
                    [
                        'name' => '1-Year G-III',
                        'type' => 'G-III',
                        'duration_months' => 12,
                        'trades' => [
                            ['name' => 'Industrial Electronics', 'code' => 'IE', 'entry_level' => 'Matric'],
                        ],
                    ],
                    [
                        'name' => '6-Month CBT&A',
                        'type' => 'CBT&A',
                        'duration_months' => 6,
                        'trades' => [
                            ['name' => 'Auto Electrician', 'code' => 'AE', 'entry_level' => 'Middle'],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Information Technology',
                'code' => 'IT',
                'programs' => [
                    [
                        'name' => '1-Year G-III',
                        'type' => 'G-III',
                        'duration_months' => 12,
                        'trades' => [
                            ['name' => 'Computer Operator', 'code' => 'CO', 'entry_level' => 'Matric'],
                        ],
                    ],
                    [
                        'name' => '6-Month CBT&A',
                        'type' => 'CBT&A',
                        'duration_months' => 6,
                        'trades' => [
                            ['name' => 'Web Design & Development', 'code' => 'WDD', 'entry_level' => 'Matric'],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Drafting & Civil',
                'code' => 'CIVIL',
                'programs' => [
                    [
                        'name' => '1-Year G-III',
                        'type' => 'G-III',
                        'duration_months' => 12,
                        'trades' => [
                            ['name' => 'Draftsman Mechanical', 'code' => 'DM', 'entry_level' => 'Matric'],
                            ['name' => 'Draftsman Civil', 'code' => 'DC', 'entry_level' => 'Matric'],
                        ],
                    ],
                ],
            ],
            [
                'name' => 'Hospitality',
                'code' => 'HOSP',
                'programs' => [
                    [
                        'name' => '6-Month CBT&A',
                        'type' => 'CBT&A',
                        'duration_months' => 6,
                        'trades' => [
                            ['name' => 'Cooking', 'code' => 'COOK', 'entry_level' => 'Middle'],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($departmentsData as $deptData) {
            $department = Department::firstOrCreate(
                [
                    'institute_id' => $institute->id,
                    'code' => $deptData['code'],
                ],
                [
                    'name' => $deptData['name'],
                    'is_active' => true,
                ]
            );

            foreach ($deptData['programs'] as $progData) {
                $program = Program::firstOrCreate(
                    [
                        'department_id' => $department->id,
                        'name' => $progData['name'],
                        'type' => $progData['type'],
                    ],
                    [
                        'duration_months' => $progData['duration_months'],
                    ]
                );

                foreach ($progData['trades'] as $tradeData) {
                    $trade = Trade::firstOrCreate(
                        [
                            'program_id' => $program->id,
                            'name' => $tradeData['name'],
                        ],
                        [
                            'code' => $tradeData['code'],
                        ]
                    );

                    Course::firstOrCreate(
                        [
                            'trade_id' => $trade->id,
                            'name' => $tradeData['name'],
                        ],
                        [
                            'entry_level' => $tradeData['entry_level'],
                            'is_active' => true,
                        ]
                    );
                }
            }
        }
    }
}
