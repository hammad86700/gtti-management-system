<?php

namespace App\Http\Controllers\Shared;

use App\Domains\Organization\Models\Batch;
use App\Domains\Student\Models\Enrollment;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdmitCardController extends Controller
{
    /**
     * Generate & render an individual PBTE official examination admit card.
     */
    public function print(Request $request, int|string $enrollmentId): Response
    {
        $enrollment = Enrollment::with([
            'studentProfile.user',
            'course.trade.program.department',
            'course.subjects',
            'batch',
        ])->findOrFail($enrollmentId);

        // Security check: Trainees can only print their own slip
        $user = $request->user();
        if ($user->hasRole('student') && $enrollment->studentProfile?->user_id !== $user->id) {
            abort(403, 'Unauthorized access to student examination admit card.');
        }

        $card = $this->buildAdmitCardPayload($enrollment);

        return Inertia::render('Shared/PrintAdmitCard', [
            'cards'      => [$card],
            'isBatch'    => false,
            'batchTitle' => $enrollment->batch?->name ?? 'Examination Slip',
        ]);
    }

    /**
     * Batch print PBTE admit cards for an entire classroom / batch.
     */
    public function printBatch(Request $request, int|string $batchId): Response
    {
        $batch = Batch::with(['course.trade.program.department', 'course.subjects'])->findOrFail($batchId);

        $enrollments = Enrollment::where('batch_id', $batchId)
            ->whereIn('status', ['active', 'enrolled'])
            ->with([
                'studentProfile.user',
                'course.trade.program.department',
                'course.subjects',
                'batch',
            ])
            ->orderBy('id')
            ->get();

        $cards = $enrollments->map(fn($e) => $this->buildAdmitCardPayload($e))->values()->all();

        return Inertia::render('Shared/PrintAdmitCard', [
            'cards'      => $cards,
            'isBatch'    => true,
            'batchTitle' => "Batch Roll No Slips: {$batch->name} ({$batch->session_year})",
        ]);
    }

    /**
     * Format standardized PBTE Examination Slip data payload.
     */
    protected function buildAdmitCardPayload(Enrollment $enrollment): array
    {
        $user = $enrollment->studentProfile?->user;
        $profile = $enrollment->studentProfile;
        $course = $enrollment->course;
        $batch = $enrollment->batch;

        $rollNumber = $enrollment->enrollment_number ?: ($enrollment->roll_number ?: ('GTTI-' . str_pad((string)$enrollment->id, 5, '0', STR_PAD_LEFT)));
        $regNumber  = $enrollment->registration_number ?: ($profile?->registration_number ?: ('PBTE-' . date('Y') . '-' . str_pad((string)$enrollment->id, 5, '0', STR_PAD_LEFT)));

        // Date sheet compilation
        $subjects = $course?->subjects;
        $timetable = [];

        if ($subjects && $subjects->count() > 0) {
            $baseDate = now()->addDays(7);
            foreach ($subjects as $idx => $subject) {
                $examDate = $baseDate->copy()->addDays($idx * 2);
                $timetable[] = [
                    'code'      => $subject->code ?? ('TH-' . ($idx + 101)),
                    'title'     => $subject->name,
                    'type'      => $subject->type ?? 'Theory',
                    'date'      => $examDate->format('D, d M Y'),
                    'time'      => $idx % 2 === 0 ? '09:00 AM - 12:00 PM' : '01:30 PM - 04:30 PM',
                    'room'      => 'Main Examination Hall ' . (($idx % 3) + 1),
                ];
            }
        } else {
            // Default PBTE CBT & Practical Standard Examination Schedule
            $baseDate = now()->addDays(7);
            $defaultModules = [
                ['code' => 'PBTE-TH101', 'title' => ($course?->name ?? 'Trade') . ' - Core Theory & Applied Science', 'type' => 'Theory', 'offset' => 0, 'time' => '09:00 AM - 12:00 PM'],
                ['code' => 'PBTE-PR102', 'title' => ($course?->name ?? 'Trade') . ' - Workshop Practical & Machine Task', 'type' => 'Practical', 'offset' => 2, 'time' => '09:00 AM - 01:00 PM'],
                ['code' => 'PBTE-HS103', 'title' => 'Industrial Safety, First Aid & HSE Compliance', 'type' => 'Viva & Practical', 'offset' => 4, 'time' => '01:30 PM - 03:30 PM'],
                ['code' => 'PBTE-FE104', 'title' => 'Functional English & Workplace Communication', 'type' => 'Theory', 'offset' => 6, 'time' => '09:00 AM - 11:30 AM'],
            ];

            foreach ($defaultModules as $mod) {
                $examDate = $baseDate->copy()->addDays($mod['offset']);
                $timetable[] = [
                    'code'  => $mod['code'],
                    'title' => $mod['title'],
                    'type'  => $mod['type'],
                    'date'  => $examDate->format('D, d M Y'),
                    'time'  => $mod['time'],
                    'room'  => 'Main Exam Center / Workshop Block B',
                ];
            }
        }

        return [
            'id'                  => $enrollment->id,
            'roll_number'         => $rollNumber,
            'registration_number' => $regNumber,
            'student_name'        => $user?->name ?? 'Trainee Candidate',
            'father_name'         => $profile?->father_name ?? 'N/A',
            'cnic'                => $user?->cnic ?? $profile?->cnic ?? 'N/A',
            'gender'              => ucfirst($profile?->gender ?? 'Male'),
            'course_name'         => $course?->name ?? 'Technical Trade Course',
            'course_duration'     => $course?->formatted_duration ?? '6 Months CBT',
            'department_name'     => $course?->trade?->program?->department?->name ?? 'Engineering & Technical Trades',
            'batch_name'          => $batch?->name ?? 'Regular Morning Shift',
            'session_year'        => $batch?->session_year ?? (date('Y') . '-' . (date('Y') + 1)),
            'exam_center'         => 'Govt. Technical Training Institute (GTTI), Examination Complex, Khanpur Road, Rahim Yar Khan',
            'center_code'         => 'RYK-PBTE-041',
            'barcode'             => "PBTE*{$rollNumber}*" . date('Y'),
            'timetable'           => $timetable,
            'issued_at'           => now()->format('d M, Y'),
        ];
    }

    /**
     * Generate & render an individual Official Entrance Test Roll Number Slip / Admit Card.
     */
    public function printEntranceSlip(Request $request, int|string $applicationId): Response
    {
        $application = \App\Domains\Admissions\Models\Application::with([
            'studentProfile.user',
            'course.trade.program.department',
        ])->findOrFail($applicationId);

        $user = $request->user();
        $isStaff = $user->hasRole('admin') || $user->hasRole('clerk') || $user->hasRole('teacher') || $user->is_super_admin || $user->is_admin;

        // Security check: Candidate can only print their own slip unless staff
        if (!$isStaff && $application->studentProfile?->user_id !== $user->id) {
            abort(403, 'Unauthorized access to applicant entrance test slip.');
        }

        // Must require entrance test
        if (!$application->requiresEntranceTest()) {
            abort(403, 'Entrance test is not required for this course (Direct / FCFS track). No roll number slip is generated.');
        }

        // Must be verified by clerk
        if (!$application->isVerified()) {
            abort(403, 'Application is currently under clerical verification. The official Entrance Roll Number Slip will be unlocked once approved.');
        }

        $card = $this->buildEntranceSlipPayload($application);

        return Inertia::render('Shared/PrintEntranceAdmitCard', [
            'card' => $card,
        ]);
    }

    /**
     * Build entrance slip payload.
     */
    protected function buildEntranceSlipPayload(\App\Domains\Admissions\Models\Application $application): array
    {
        $user = $application->studentProfile?->user;
        $profile = $application->studentProfile;
        $course = $application->course;

        $rollNumber = $application->entrance_roll_number ?: $application->generateEntranceRollNumber();
        $testDate = $application->test_date 
            ? $application->test_date->format('l, d F Y')
            : 'Scheduled on Admission Notice (Check Notice Board)';

        return [
            'id'                  => $application->id,
            'roll_number'         => $rollNumber,
            'application_number'  => $application->application_number,
            'candidate_name'      => $user?->name ?? 'Candidate',
            'father_name'         => $profile?->father_name ?? 'N/A',
            'cnic'                => $user?->cnic ?? 'N/A',
            'phone'               => $profile?->phone_number ?? 'N/A',
            'district'            => $profile?->domicile_district ?? 'Rahim Yar Khan',
            'address'             => $profile?->address ?? 'N/A',
            'gender'              => ucfirst($profile?->gender ?? 'Male'),
            'course_name'         => $course?->name ?? 'Technical Trade Course',
            'trade_name'          => $course?->trade?->name ?? 'Vocational & Technical Training',
            'department_name'     => $course?->trade?->program?->department?->name ?? 'Engineering & Technical Trades',
            'duration'            => $course?->formatted_duration ?? '6 Months',
            'test_date'           => $testDate,
            'test_time'           => $application->test_time ?: '09:00 AM Sharp',
            'test_venue'          => $application->test_venue ?: 'Govt Technical Training Institute (GTTI), Main Examination Hall & Computer Labs, Khanpur Road, Rahim Yar Khan',
            'clerk_notice'        => $application->clerk_notice ?: 'Report 30 minutes prior to exam time. Bring original CNIC/B-Form and clipboard.',
            'barcode'             => "ET*{$rollNumber}*" . date('Y'),
            'issued_at'           => now()->format('d M, Y - h:i A'),
        ];
    }

    /**
     * Generate & render an individual Official 3-Copy Bank Fee Challan Voucher.
     */
    public function printChallan(Request $request, int|string $applicationId): Response
    {
        $application = \App\Domains\Admissions\Models\Application::with([
            'studentProfile.user',
            'course.trade.program.department',
            'feeChallan',
        ])->findOrFail($applicationId);

        $user = $request->user();
        $isStaff = $user->hasRole('admin') || $user->hasRole('clerk') || $user->hasRole('teacher') || $user->is_super_admin || $user->is_admin;

        // Security check: Candidate can only print their own slip unless staff
        if (!$isStaff && $application->studentProfile?->user_id !== $user->id) {
            abort(403, 'Unauthorized access to applicant fee challan voucher.');
        }

        $voucher = $this->buildChallanVoucherPayload($application);

        return Inertia::render('Shared/PrintFeeChallan', [
            'voucher' => $voucher,
        ]);
    }

    /**
     * Build 3-part bank fee challan voucher payload.
     */
    protected function buildChallanVoucherPayload(\App\Domains\Admissions\Models\Application $application): array
    {
        $user = $application->studentProfile?->user;
        $profile = $application->studentProfile;
        $course = $application->course;
        $challan = $application->feeChallan;

        $challanNumber = $challan?->challan_number ?: ('CH-2026-' . str_pad((string) $application->id, 5, '0', STR_PAD_LEFT));
        
        $classesStartDate = $course?->classes_start_date 
            ? \Illuminate\Support\Carbon::parse($course->classes_start_date)->format('d M, Y')
            : '16 Sep, 2026';

        // Due date is 1 day before classes start date or 7 days from now
        $dueDate = $challan?->due_date
            ? \Illuminate\Support\Carbon::parse($challan->due_date)->format('d M, Y')
            : ($course?->classes_start_date ? \Illuminate\Support\Carbon::parse($course->classes_start_date)->subDay()->format('d M, Y') : '15 Sep, 2026');

        $issueDate = $application->clerk_challan_uploaded_at
            ? \Illuminate\Support\Carbon::parse($application->clerk_challan_uploaded_at)->format('d M, Y')
            : now()->format('d M, Y');

        $amount = (float) ($challan?->amount ?: 3500.00);

        return [
            'id' => $application->id,
            'challan_number' => $challanNumber,
            'application_number' => $application->application_number,
            'candidate_name' => $user?->name ?? 'Candidate',
            'father_name' => $profile?->father_name ?? 'N/A',
            'cnic' => $user?->cnic ?? 'N/A',
            'phone' => $profile?->phone_number ?? 'N/A',
            'district' => $profile?->domicile_district ?? 'Rahim Yar Khan',
            'course_name' => $course?->name ?? 'Technical Trade Course',
            'trade_name' => $course?->trade?->name ?? 'Vocational & Technical Training',
            'duration' => $course?->formatted_duration ?? '6 Months',
            'issue_date' => $issueDate,
            'due_date' => $dueDate,
            'classes_start_date' => $classesStartDate,
            'amount' => $amount,
            'fee_breakdown' => [
                ['head' => 'Admission & Registration Fee', 'amount' => 1000],
                ['head' => 'Tuition & Training Fee', 'amount' => 1500],
                ['head' => 'Examination & Assessment Fund', 'amount' => 500],
                ['head' => 'Workshop Safety & Student ID Card', 'amount' => 500],
            ],
            'bank_info' => [
                [
                    'name' => 'National Bank of Pakistan (NBP)',
                    'branch' => 'Main Branch / GTTI Counter, Khanpur Road, RYK',
                    'code' => '0492',
                    'account_no' => 'PK42NBPA04920038920194',
                ],
                [
                    'name' => 'The Bank of Punjab (BOP)',
                    'branch' => 'City Branch, Rahim Yar Khan',
                    'code' => '0128',
                    'account_no' => 'PK71BPUN0128006510009982',
                ],
            ],
            'clerk_challan_path' => $application->clerk_challan_path,
            'barcode' => "CH*{$challanNumber}*" . date('Y'),
        ];
    }
}
