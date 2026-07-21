<?php

namespace App\Models;

use App\Services\WordProvider;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Game extends Model
{
    use HasFactory;

    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_WON = 'won';
    public const STATUS_LOST = 'lost';

    protected $fillable = [
        'user_id',
        'word_id',
        'attempts_count',
        'max_attempts',
        'status',
        'completed_at',
        'score',
    ];

    protected $casts = [
        'attempts_count' => 'integer',
        'max_attempts' => 'integer',
        'score' => 'integer',
        'completed_at' => 'datetime',
    ];

    protected $attributes = [
        'attempts_count' => 0,
        'max_attempts' => 6,
        'status' => self::STATUS_IN_PROGRESS,
        'score' => 0,
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function word(): BelongsTo
    {
        return $this->belongsTo(Word::class);
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(Attempt::class)->orderBy('attempt_number');
    }

    public function isFinished(): bool
    {
        return in_array($this->status, [self::STATUS_WON, self::STATUS_LOST], true);
    }

    public function scopeInProgress(Builder $q): Builder
    {
        return $q->where('status', self::STATUS_IN_PROGRESS);
    }

    public function scopeFinished(Builder $q): Builder
    {
        return $q->whereIn('status', [self::STATUS_WON, self::STATUS_LOST]);
    }

    public static function maxAttemptsFor(string $difficulty): int
    {
        return match ($difficulty) {
            'easy' => 6,
            'medium' => 6,
            'hard' => 5,
            default => 6,
        };
    }

    public static function lengthFor(string $difficulty): int
    {
        return WordProvider::DIFFICULTY_LENGTHS[$difficulty] ?? 5;
    }

    /**
     * Shape this game for the JSON API. The target word is only included
     * once the game is finished — it would spoil the answer otherwise.
     * Requires `word` and `attempts` to be eager-loaded.
     */
    public function toApiArray(): array
    {
        $word = $this->word;
        $finished = $this->isFinished();

        return [
            'id' => $this->id,
            'difficulty' => $word?->difficulty,
            'length' => $word?->length,
            'first_letter' => $word ? mb_substr($word->word, 0, 1) : null,
            'attempts_count' => $this->attempts_count,
            'max_attempts' => $this->max_attempts,
            'status' => $this->status,
            'score' => $this->score,
            'completed_at' => $this->completed_at?->toIso8601String(),
            'attempts' => $this->attempts->map(fn ($a) => [
                'id' => $a->id,
                'attempt_number' => $a->attempt_number,
                'attempted_word' => $a->attempted_word,
                'result' => $a->result,
                'is_correct' => $a->is_correct,
                'created_at' => $a->created_at?->toIso8601String(),
            ])->all(),
            'word' => $finished ? $word?->word : null,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
