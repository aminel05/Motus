<?php

namespace App\Services;

class GameScorer
{
    public const STATUS_CORRECT = 'correct';
    public const STATUS_PRESENT = 'present';
    public const STATUS_ABSENT = 'absent';

    public const DIFFICULTY_MULTIPLIER = [
        'easy' => 1.0,
        'medium' => 1.5,
        'hard' => 2.0,
    ];

    /**
     * Compare guess to target letter by letter and return one status per position.
     * Uses a two-pass algorithm so duplicate letters are scored correctly:
     * first pass marks exact matches and counts unmatched target letters,
     * second pass distributes remaining guess letters against the pool.
     */
    public static function scoreLetters(string $guess, string $target): array
    {
        $guess = self::normalize($guess);
        $target = self::normalize($target);
        $length = mb_strlen($target);

        $result = array_fill(0, $length, null);
        $pool = [];

        for ($i = 0; $i < $length; $i++) {
            $g = mb_substr($guess, $i, 1);
            $t = mb_substr($target, $i, 1);

            if ($g === $t) {
                $result[$i] = self::STATUS_CORRECT;
            } else {
                $pool[$t] = ($pool[$t] ?? 0) + 1;
            }
        }

        for ($i = 0; $i < $length; $i++) {
            if ($result[$i] !== null) {
                continue;
            }

            $g = mb_substr($guess, $i, 1);
            if (($pool[$g] ?? 0) > 0) {
                $result[$i] = self::STATUS_PRESENT;
                $pool[$g]--;
            } else {
                $result[$i] = self::STATUS_ABSENT;
            }
        }

        return $result;
    }

    public static function isWin(array $result): bool
    {
        foreach ($result as $status) {
            if ($status !== self::STATUS_CORRECT) {
                return false;
            }
        }
        return true;
    }

    public static function gameScore(int $attemptsUsed, int $maxAttempts, string $difficulty, bool $won): int
    {
        if (! $won) {
            return 0;
        }

        $multiplier = self::DIFFICULTY_MULTIPLIER[$difficulty] ?? 1.0;
        $base = max(1, $maxAttempts - $attemptsUsed + 1) * 100;

        return (int) round($base * $multiplier);
    }

    private static function normalize(string $s): string
    {
        $s = trim($s);
        if (class_exists(\Normalizer::class)) {
            $s = \Normalizer::normalize($s, \Normalizer::FORM_C);
        }
        return mb_strtoupper($s);
    }
}
