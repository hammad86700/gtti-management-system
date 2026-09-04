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
        Vite::prefetch(concurrency: 3);

        \Illuminate\Support\Facades\Event::subscribe(\App\Domains\Student\Listeners\SendLeaveParentNotification::class);
    }
}
