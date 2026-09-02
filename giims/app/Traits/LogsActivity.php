<?php

namespace App\Traits;

use App\Domains\Operations\Models\ActivityLog;

trait LogsActivity
{
    /**
     * Boot the trait to observe model lifecycle events.
     */
    public static function bootLogsActivity(): void
    {
        static::created(function ($model) {
            static::recordActivity("created", $model, null, $model->getAttributes());
        });

        static::updated(function ($model) {
            $dirtyKeys = array_keys($model->getDirty());
            // Exclude common timestamp fields if nothing else changed
            if (count($dirtyKeys) === 1 && in_array($dirtyKeys[0], ["updated_at", "created_at"])) {
                return;
            }

            $oldData = array_intersect_key($model->getOriginal(), $model->getDirty());
            $newData = $model->getDirty();

            static::recordActivity("updated", $model, $oldData, $newData);
        });

        static::deleted(function ($model) {
            static::recordActivity("deleted", $model, $model->getAttributes(), null);
        });
    }

    /**
     * Record an activity log entry for this model.
     */
    protected static function recordActivity(string $action, $model, ?array $oldData, ?array $newData, ?string $customDesc = null): void
    {
        try {
            $user = auth()->user();
            $modelClass = class_basename($model);
            $desc = $customDesc ?? "{$action} {$modelClass} #{$model->getKey()}";

            ActivityLog::create([
                "user_id" => $user?->id,
                "action" => $action,
                "model_type" => get_class($model),
                "model_id" => $model->getKey(),
                "description" => $desc,
                "old_data" => $oldData,
                "new_data" => $newData,
                "ip_address" => request()?->ip(),
            ]);
        } catch (\Throwable $e) {
            // Avoid failing primary business transactions if logging encounters an issue
        }
    }
}

