<?php

namespace App\Domains\Shared\Services\Notification\Drivers;

use App\Domains\Shared\Services\Notification\SmsGatewayInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class LogSmsDriver implements SmsGatewayInterface
{
    /**
     * Log SMS dispatch for local development, staging, or fallback.
     */
    public function send(string $phoneNumber, string $message): array
    {
        $messageId = 'log_' . Str::random(12);

        Log::info("TELECOM SMS DISPATCH [{$phoneNumber}]: {$message}", [
            'recipient'  => $phoneNumber,
            'message_id' => $messageId,
            'driver'     => 'log',
            'timestamp'  => now()->toIso8601String(),
        ]);

        return [
            'success'    => true,
            'message_id' => $messageId,
            'error'      => null,
        ];
    }

    /**
     * Log bulk SMS dispatch.
     */
    public function sendBulk(array $recipients, string $message): array
    {
        $results = [];

        foreach ($recipients as $phone) {
            $results[] = array_merge(['phone' => $phone], $this->send($phone, $message));
        }

        return $results;
    }
}
