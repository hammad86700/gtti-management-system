<?php

namespace App\Domains\Student\Events;

use App\Domains\Student\Models\LeaveRequest;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LeaveProcessed
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public LeaveRequest $leaveRequest,
        public string $action // 'approved' or 'rejected'
    ) {}
}
