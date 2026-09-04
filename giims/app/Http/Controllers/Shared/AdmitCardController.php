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
}
