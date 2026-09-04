<?php

namespace App\Domains\Shared\Services\Notification\Drivers;

use App\Domains\Shared\Services\Notification\SmsGatewayInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class GenericHttpSmsDriver implements SmsGatewayInterface
{
    protected string $apiUrl;
    protected string $apiKey;
    protected string $senderId;

    public function __construct(?string $apiUrl = null, ?string $apiKey = null, ?string $senderId = null)
    {
        $this->apiUrl = $apiUrl ?? config('services.sms.api_url', 'https://api.sms-gateway.pk/v1/send');
        $this->apiKey = $apiKey ?? config('services.sms.api_key', '');
        $this->senderId = $senderId ?? config('services.sms.sender_id', 'GTTI-TEVTA');
    }

    /**
     * Send an individual SMS through an external HTTP telecom endpoint.
     */
    public function send(string $phoneNumber, string $message): array
    {
        // Sanitize Pakistani phone number format (e.g., 03001234567 -> 923001234567)
        $normalizedPhone = preg_replace('/[^0-9]/', '', $phoneNumber);
        if (str_starts_with($normalizedPhone, '03')) {
            $normalizedPhone = '92' . substr($normalizedPhone, 1);
        }

        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Accept'        => 'application/json',
                ])
                ->post($this->apiUrl, [
                    'sender'    => $this->senderId,
                    'recipient' => $normalizedPhone,
                    'message'   => $message,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $messageId = $data['message_id'] ?? $data['id'] ?? uniqid('http_');

                Log::info("TELECOM HTTP SMS SENT to {$normalizedPhone}", ['msg_id' => $messageId]);

                return [
                    'success'    => true,
                    'message_id' => (string)$messageId,
                    'error'      => null,
                ];
            }

            Log::warning("TELECOM HTTP SMS FAILED for {$normalizedPhone}", [
                'status'   => $response->status(),
                'response' => $response->body(),
            ]);

            return [
                'success'    => false,
                'message_id' => null,
                'error'      => "Gateway HTTP error {$response->status()}: " . $response->body(),
            ];
        } catch (Throwable $e) {
            Log::error("TELECOM HTTP SMS EXCEPTION: " . $e->getMessage(), [
                'recipient' => $normalizedPhone,
            ]);

            return [
                'success'    => false,
                'message_id' => null,
                'error'      => $e->getMessage(),
            ];
        }
    }

    /**
     * Send bulk SMS messages.
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
