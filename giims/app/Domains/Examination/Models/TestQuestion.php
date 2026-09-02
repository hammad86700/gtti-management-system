<?php

namespace App\Domains\Examination\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TestQuestion extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that aren't mass assignable.
     *
     * @var array<string>|bool
     */
    protected $guarded = [];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'marks' => 'integer',
        ];
    }

    /**
     * The parent online test to which this question belongs.
     */
    public function onlineTest(): BelongsTo
    {
        return $this->belongsTo(OnlineTest::class);
    }
}
