<?php

namespace App\Domains\Attendance\Services;

use Carbon\Carbon;
use Symfony\Component\HttpFoundation\IpUtils;

class CampusNetworkService
{
    /**
     * Check if a given client IP address matches the configured institutional subnets.
     */
    public static function isCampusIp(?string $ip): bool
    {
        if (empty($ip)) {
            return false;
        }

        // Localhost and loopback are always treated as campus network (e.g., local dev/testing)
        if (in_array($ip, ['127.0.0.1', '::1', 'localhost'])) {
            return true;
        }

        $subnetsConfig = config('services.campus.subnets', env('CAMPUS_NETWORK_SUBNETS', '192.168.1.0/24,127.0.0.1,::1,10.0.0.0/8,172.16.0.0/12'));
        $rawSubnets = array_filter(array_map('trim', explode(',', (string) $subnetsConfig)));

        if (empty($rawSubnets)) {
            return false;
        }

        // Check each subnet configuration
        foreach ($rawSubnets as $subnet) {
            if (empty($subnet)) {
                continue;
            }

            // Exact match
            if ($ip === $subnet) {
                return true;
            }

            // Wildcard / 'x' notation, e.g. 182.180.x.x or 192.168.1.*
            if (str_contains($subnet, '*') || str_contains($subnet, 'x')) {
                $regexPattern = str_replace(['.', '*', 'x'], ['\.', '\d+', '\d+'], $subnet);
                if (@preg_match('/^' . $regexPattern . '$/', $ip)) {
                    return true;
                }
            }

            // Standard CIDR or IP range using Symfony IpUtils
            try {
                if (IpUtils::checkIp($ip, $subnet)) {
                    return true;
                }
            } catch (\Throwable $e) {
                // Ignore invalid CIDR and continue
            }
        }

        return false;
    }

    /**
     * Determine if a check-in time is past the late threshold.
     */
    public static function isLate(?string $time = null): bool
    {
        $lateThreshold = config('services.campus.late_time', env('FACULTY_ATTENDANCE_LATE_TIME', '08:30'));
        $checkTime = $time ? Carbon::parse($time) : Carbon::now();
        $cutoff = Carbon::today()->setTimeFromTimeString($lateThreshold . ':00');

        return $checkTime->greaterThan($cutoff);
    }
}
