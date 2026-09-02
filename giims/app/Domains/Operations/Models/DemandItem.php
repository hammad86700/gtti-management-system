<?php

namespace App\Domains\Operations\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class DemandItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $appends = ['remaining_qty'];

    public function materialDemand(): BelongsTo
    {
        return $this->belongsTo(MaterialDemand::class);
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    public function getRemainingQtyAttribute(): int
    {
        return max(0, (int)$this->approved_qty - (int)$this->consumed_qty);
    }
}
