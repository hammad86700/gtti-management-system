<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Domains\Shared\Services\Notification\SmsGatewayInterface::class,
            function () {
                $driver = config('services.sms.driver', 'log');

                return match ($driver) {
                    'generic_http' => new \App\Domains\Shared\Services\Notification\Drivers\GenericHttpSmsDriver(),
                    default        => new \App\Domains\Shared\Services\Notification\Drivers\LogSmsDriver(),
                };
            }
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // When precompiled build exists, serve versioned production assets directly from port 8000.
        // This permanently prevents external devices on LAN from attempting to connect to port 5173,
        // which Windows Defender Firewall blocks by default (causing 'Failed to load resource').
        if (file_exists(public_path('build/manifest.json'))) {
            Vite::useHotFile(storage_path('framework/cache/disabled_hot'));
        }

        \Illuminate\Support\Facades\Event::subscribe(\App\Domains\Student\Listeners\SendLeaveParentNotification::class);
    }
}
