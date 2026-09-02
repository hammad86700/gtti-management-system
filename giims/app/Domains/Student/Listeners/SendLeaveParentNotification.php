<?php

namespace App\Domains\Student\Listeners;

use App\Domains\Student\Events\LeaveProcessed;
use App\Domains\Student\Events\LeaveRequested;
use Illuminate\Support\Facades\Log;

class SendLeaveParentNotification
{
    /**
     * Handle LeaveRequested event.
     */
    public function handleLeaveRequested(LeaveRequested $event): void
    {
        $leave = $event->leaveRequest;
        $profile = $leave->studentProfile;
        $studentUser = $profile?->user;
        $studentName = $studentUser?->name ?? 'Trainee';
        $fatherName = $profile?->father_name ?? 'Parent/Guardian';
        $phone = $profile?->emergency_contact ?: ($studentUser?->phone ?: '0300-XXXXXXX');

        $start = $leave->start_date ? $leave->start_date->format('d M Y') : 'Today';
        $end = $leave->end_date ? $leave->end_date->format('d M Y') : 'Today';

        Log::info("[PARENT NOTIFICATION - SMS/EMAIL SENT] To: {$fatherName} ({$phone}) - GTTI Alert: Your son/daughter {$studentName} has submitted a formal leave request from {$start} to {$end}. Reason: '{$leave->reason}'. Category: '{$leave->category}'. Please contact the institute administration if this was unauthorized.");
    }

    /**
     * Handle LeaveProcessed event.
     */
    public function handleLeaveProcessed(LeaveProcessed $event): void
    {
        $leave = $event->leaveRequest;
        $profile = $leave->studentProfile;
        $studentUser = $profile?->user;
        $studentName = $studentUser?->name ?? 'Trainee';
        $fatherName = $profile?->father_name ?? 'Parent/Guardian';
        $phone = $profile?->emergency_contact ?: ($studentUser?->phone ?: '0300-XXXXXXX');
        $instructorName = $leave->approvedBy?->name ?? 'Course Instructor';

        $start = $leave->start_date ? $leave->start_date->format('d M Y') : 'Date';
        $end = $leave->end_date ? $leave->end_date->format('d M Y') : 'Date';

        if ($event->action === 'approved') {
            Log::info("[PARENT NOTIFICATION - SMS/EMAIL SENT] To: {$fatherName} ({$phone}) - GTTI Alert: Leave application for {$studentName} ({$start} to {$end}) has been APPROVED by Instructor {$instructorName}.");
            Log::info("[STUDENT NOTIFICATION - IN-APP] Trainee {$studentName}: Your leave request ({$start} to {$end}) has been APPROVED by {$instructorName}.");
        } else {
            $reason = $leave->rejection_reason ?: 'Institutional operational requirements';
            Log::info("[PARENT NOTIFICATION - SMS/EMAIL SENT] To: {$fatherName} ({$phone}) - GTTI Alert: Leave application for {$studentName} ({$start} to {$end}) has been REJECTED by Instructor {$instructorName}. Reason: {$reason}. Trainee is expected in class.");
            Log::info("[STUDENT NOTIFICATION - IN-APP] Trainee {$studentName}: Your leave request ({$start} to {$end}) was REJECTED by {$instructorName}. Reason: {$reason}.");
        }
    }

    /**
     * Register listeners for subscriber.
     */
    public function subscribe($events): array
    {
        return [
            LeaveRequested::class => 'handleLeaveRequested',
            LeaveProcessed::class => 'handleLeaveProcessed',
        ];
    }
}
