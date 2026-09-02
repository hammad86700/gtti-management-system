<?php

namespace App\Domains\Student\Events;

use App\Domains\Student\Models\LeaveRequest;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LeaveRequested
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public LeaveRequest $leaveRequest
    ) {}
}
