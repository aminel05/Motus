<?php

namespace App\Services;

use App\Models\Word;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class WordProvider
{
    private const SOURCE_URL = 'https://raw.githubusercontent.com/Taknok/Liste-de-mots-francais/main/liste_francais.txt';
    private const CACHE_KEY = 'taknok_french_word_list';
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

        $existing = Word::where('length', $length)->inRandomOrder()->first();
        if ($existing) {
            return $existing;
        }

        $apiWord = self::fetchFromApi($length);
        if ($apiWord !== null) {
            return self::saveWord($apiWord, $difficulty);
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
        $list = Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            $response = Http::timeout(10)->get(self::SOURCE_URL);
            if (! $response->ok()) {
                throw new \RuntimeException("HTTP {$response->status()} from Taknok");
            }
            return $response->body();
        });

        $candidates = self::filterByLength($list, $length);
        if (empty($candidates)) {
            return null;
        }

        return $candidates[array_rand($candidates)];
    }

    private static function filterByLength(string $list, int $length): array
    {
        $pattern = '/^[a-zàâçéèêëîïôûùüÿñæœ-]+$/i';

        $lines = preg_split('/\R/', $list) ?: [];
        $matches = [];

        foreach ($lines as $line) {
            $word = trim($line);
            if ($word === '' || mb_strlen($word) !== $length) {
                continue;
            }
            if (! preg_match($pattern, $word)) {
                continue;
            }
            $matches[] = $word;
        }

        return $matches;
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
