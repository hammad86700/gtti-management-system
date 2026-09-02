<?php

namespace App\Console\Commands;

use App\Domains\Examination\Models\TestAttempt;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CloseExpiredExams extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = "cbt:close-expired";

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = "Auto-submit and grade in-progress CBT exam attempts whose allotted duration has expired.";

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $now = now();
        $this->info("Checking for expired in-progress CBT exam attempts at {$now->toDateTimeString()}...");

        // Fetch all attempts in progress with test questions
        $attempts = TestAttempt::with("onlineTest.questions")
            ->where("status", "in_progress")
            ->get();

        $closedCount = 0;

        foreach ($attempts as $attempt) {
            $test = $attempt->onlineTest;

            if (! $test || ! $attempt->start_time) {
                continue;
            }

            $durationMinutes = (int) ($test->duration_minutes ?: 30);
            $expiresAt = Carbon::parse($attempt->start_time)->addMinutes($durationMinutes);

            // Check if current time has exceeded the exam start_time + duration_minutes
            if ($now->greaterThanOrEqualTo($expiresAt)) {
                $answers = is_array($attempt->answers)
                    ? $attempt->answers
                    : (json_decode($attempt->answers, true) ?: []);

                $score = 0;
                $totalQuestions = $test->questions->count();

                foreach ($test->questions as $question) {
                    $submittedAnswer = $answers[$question->id] ?? null;
                    if ($submittedAnswer && strtoupper(trim($submittedAnswer)) === strtoupper(trim($question->correct_option))) {
                        $score += $question->marks ?: 1;
                    }
                }

                $attempt->update([
                    "end_time" => $expiresAt,
                    "score" => $score,
                    "total_questions" => $totalQuestions,
                    "status" => "completed",
                ]);

                $closedCount++;
                $this->line("Auto-closed attempt #{$attempt->id} for student profile #{$attempt->student_profile_id}. Score: {$score}/{$totalQuestions}");
            }
        }

        $this->info("Completed. Auto-closed {$closedCount} expired exam attempts.");

        return Command::SUCCESS;
    }
}

