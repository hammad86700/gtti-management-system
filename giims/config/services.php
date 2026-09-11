<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Pluggable Telecom SMS Gateway
    |--------------------------------------------------------------------------
    */
    'sms' => [
        'driver'    => env('SMS_DRIVER', 'log'), // 'log' or 'generic_http'
        'api_url'   => env('SMS_API_URL', 'https://api.sms-gateway.pk/v1/send'),
        'api_key'   => env('SMS_API_KEY', ''),
        'sender_id' => env('SMS_SENDER_ID', 'GTTI-TEVTA'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Institutional Campus Network Configuration (Phase 34)
    |--------------------------------------------------------------------------
    */
    'campus' => [
        'subnets' => env('CAMPUS_NETWORK_SUBNETS', '192.168.1.0/24,127.0.0.1,::1,10.0.0.0/8,172.16.0.0/12'),
        'late_time' => env('FACULTY_ATTENDANCE_LATE_TIME', '08:30'),
    ],

];
