<?php

namespace App\Services;

use App\Models\Word;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
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
            // SSL verification is disabled because the trouve-mot.fr public
            // word list is fetched over HTTPS, and MAMP's bundled PHP 8.3 on
            // the host (and some minimal Docker base images) ship without a
            // usable CA bundle, raising "cURL error 60: SSL certificate
            // problem". This endpoint serves only an open word list (no
            // auth, no user data), so skipping verification is acceptable.
            // In a production environment that handles authenticated calls
            // or user data, point curl.cainfo / openssl.cafile at a real
            // cacert.pem instead of using this shortcut.
            try {
                $response = Http::timeout(10)
                    ->withOptions(['verify' => false])
                    ->get(self::API_BASE."/size/{$length}/50");
            } catch (\Throwable $e) {
                Log::error('WordProvider: API fetch failed, falling back to DB', [
                    'url' => self::API_BASE."/size/{$length}/50",
                    'length' => $length,
                    'exception' => $e::class,
                    'message' => $e->getMessage(),
                ]);
                return [];
            }
            if (! $response->ok()) {
                return [];
            }
            $data = $response->json();
            if (! is_array($data)) {
                return [];
            }
            $words = array_map(
                fn ($entry) => is_array($entry) ? (string) ($entry['name'] ?? '') : (string) $entry,
                $data,
            );
            return array_values(array_filter($words, fn ($w) => $w !== ''));
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
