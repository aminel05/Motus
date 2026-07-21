<?php

namespace App\Services;

use App\Models\Word;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class WordProvider
{
    private const API_BASE = 'https://trouve-mot.fr/api';

    private const CACHE_TTL = 3600;

    public const DIFFICULTY_LENGTHS = [
        'easy' => 5,
        'medium' => 7,
        'hard' => 10,
    ];

    public static function pick(string $difficulty): Word
    {
        $length = self::DIFFICULTY_LENGTHS[$difficulty] ?? null;
        if ($length === null) {
            throw new \InvalidArgumentException("Unknown difficulty: {$difficulty}");
        }

        $apiWord = self::fetchFromApi($length);
        if ($apiWord !== null) {
            return self::saveWord($apiWord, $difficulty);
        }

        $existing = Word::where('length', $length)->inRandomOrder()->first();
        if ($existing) {
            return $existing;
        }

        $fallback = Word::inRandomOrder()->first();
        if (! $fallback) {
            throw new RuntimeException(
                'No words available. Run: php artisan db:seed --class=WordSeeder',
            );
        }

        return $fallback;
    }

    private static function fetchFromApi(int $length): ?string
    {
        $cacheKey = "trouve_mot_words_{$length}_50";

        $words = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($length) {
            $response = Http::timeout(10)->get(self::API_BASE."/size/{$length}/50");
            if (! $response->ok()) {
                return [];
            }
            $data = $response->json();
            return is_array($data) ? array_map('strval', $data) : [];
        });

        if (empty($words)) {
            return null;
        }

        $clean = array_values(array_filter($words, fn ($w) => self::isValidWord($w)));
        if (empty($clean)) {
            return null;
        }

        return $clean[array_rand($clean)];
    }

    private static function isValidWord(string $word): bool
    {
        $word = trim($word);
        if ($word === '' || mb_strlen($word) < 3) {
            return false;
        }
        return (bool) preg_match('/^[A-ZÀÂÇÉÈÊËÎÏÔÛÙÜŸÑÆŒ\-]+$/i', $word);
    }

    private static function saveWord(string $word, string $difficulty): Word
    {
        return Word::firstOrCreate(
            ['word' => $word],
            [
                'length' => mb_strlen($word),
                'difficulty' => $difficulty,
            ],
        );
    }
}
