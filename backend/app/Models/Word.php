<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Word extends Model
{
    use HasFactory;

    protected $fillable = [
        'word',
        'length',
        'difficulty',
    ];

    protected $casts = [
        'length' => 'integer',
    ];

    public function games(): HasMany
    {
        return $this->hasMany(Game::class);
    }
}
