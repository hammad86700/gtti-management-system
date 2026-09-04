<?php

namespace App\Jobs;

use App\Domains\Admissions\Models\Application;
use App\Domains\Organization\Models\Course;
use App\Domains\Shared\Services\Notification\SmsGatewayInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendBulkExamNoticesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $courseId;
    public string $testDate;
    public string $testTime;
    public string $testVenue;
    public string $clerkNotice;

    /**
     * Create a new job instance.
     */
    public function __construct(
        int $courseId,
        string $testDate,
        string $testTime,
        string $testVenue,
        string $clerkNotice
    ) {
        $this->courseId = $courseId;
        $this->testDate = $testDate;
        $this->testTime = $testTime;
        $this->testVenue = $testVenue;
        $this->clerkNotice = $clerkNotice;
    }

    /**
     * Execute the job.
     */
    public function handle(SmsGatewayInterface $smsGateway): void
    {
        $course = Course::find($this->courseId);
        $courseName = $course ? $course->name : 'Applied Course';

        Log::info("Starting SendBulkExamNoticesJob for Course ID #{$this->courseId} ({$courseName})");

        $query = Application::where('course_id', $this->courseId)
            ->whereIn('status', ['submitted', 'verified'])
            ->with(['studentProfile.user']);

        $totalProcessed = 0;
        $totalSent = 0;

        $query->chunk(50, function ($applications) use ($courseName, $smsGateway, &$totalProcessed, &$totalSent) {
            foreach ($applications as $application) {
                $totalProcessed++;
                $studentProfile = $application->studentProfile;
                $user = $studentProfile?->user;

                // Priority: User's registered phone -> StudentProfile emergency contact -> StudentProfile guardian contact
                $phone = $user?->phone 
                    ?? $studentProfile?->emergency_contact 
                    ?? $studentProfile?->guardian_phone;

                if (empty($phone)) {
                    continue;
                }

                $applicantName = $user?->name ?? 'Applicant';
                $smsText = "GTTI-TEVTA Call Letter: Dear {$applicantName}, your entrance test for {$courseName} is scheduled on {$this->testDate} at {$this->testTime}. Venue: {$this->testVenue}. Bring original CNIC/B-Form & Challan.";

                $result = $smsGateway->send($phone, $smsText);

                if ($result['success'] ?? false) {
                    $totalSent++;
                }
            }
        });

        Log::info("Completed SendBulkExamNoticesJob: {$totalSent}/{$totalProcessed} SMS dispatched successfully for {$courseName}.");
    }
}
