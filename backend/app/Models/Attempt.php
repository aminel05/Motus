<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_id',
        'attempted_word',
        'attempt_number',
        'result',
        'is_correct',
    ];

    protected $casts = [
        'attempt_number' => 'integer',
        'result' => 'array',
        'is_correct' => 'boolean',
    ];

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }
}
