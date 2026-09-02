<?php

namespace App\Domains\Operations\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    use HasFactory;

    protected $table = "activity_logs";

    protected $fillable = [
        "user_id",
        "action",
        "model_type",
        "model_id",
        "description",
        "old_data",
        "new_data",
        "ip_address",
    ];

    protected $casts = [
        "old_data" => "array",
        "new_data" => "array",
    ];

    /**
     * User who initiated or caused the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

