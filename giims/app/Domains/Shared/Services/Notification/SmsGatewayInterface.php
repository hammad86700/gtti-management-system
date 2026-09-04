<?php

namespace App\Domains\Shared\Services\Notification;

interface SmsGatewayInterface
{
    /**
     * Send an individual SMS message to a recipient phone number.
     *
     * @param string $phoneNumber
     * @param string $message
     * @return array ['success' => bool, 'message_id' => ?string, 'error' => ?string]
     */
    public function send(string $phoneNumber, string $message): array;

    /**
     * Send bulk SMS messages to multiple recipients.
     *
     * @param array $recipients Array of phone number strings
     * @param string $message
     * @return array Array of delivery results: [['phone' => string, 'success' => bool, 'message_id' => ?string, 'error' => ?string]]
     */
    public function sendBulk(array $recipients, string $message): array;
}
