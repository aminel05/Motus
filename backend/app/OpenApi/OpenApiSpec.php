<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'Motus API',
    description: 'API REST pour le jeu de devinettes de mots Motus. Authentification par session cookie (Sanctum SPA).',
)]
#[OA\Server(
    url: 'http://localhost:3000',
    description: 'Serveur local de développement',
)]
#[OA\SecurityScheme(
    securityScheme: 'sanctum',
    type: 'apiKey',
    in: 'header',
    name: 'X-XSRF-TOKEN',
)]
#[OA\Schema(
    schema: 'User',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'name', type: 'string', example: 'Alice'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'alice@example.com'),
        new OA\Property(property: 'email_verified_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ],
)]
#[OA\Schema(
    schema: 'Attempt',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 42),
        new OA\Property(property: 'attempt_number', type: 'integer', example: 1),
        new OA\Property(property: 'attempted_word', type: 'string', example: 'MAISON'),
        new OA\Property(
            property: 'result',
            type: 'array',
            items: new OA\Items(type: 'string', enum: ['correct', 'present', 'absent']),
        ),
        new OA\Property(property: 'is_correct', type: 'boolean', example: false),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', nullable: true),
    ],
)]
#[OA\Schema(
    schema: 'Game',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 7),
        new OA\Property(property: 'difficulty', type: 'string', enum: ['easy', 'medium', 'hard'], nullable: true, example: 'easy'),
        new OA\Property(property: 'length', type: 'integer', nullable: true, example: 5),
        new OA\Property(property: 'first_letter', type: 'string', nullable: true, example: 'M'),
        new OA\Property(property: 'attempts_count', type: 'integer', example: 2),
        new OA\Property(property: 'max_attempts', type: 'integer', example: 6),
        new OA\Property(property: 'status', type: 'string', enum: ['in_progress', 'won', 'lost'], example: 'in_progress'),
        new OA\Property(property: 'score', type: 'integer', example: 0),
        new OA\Property(property: 'completed_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(
            property: 'attempts',
            type: 'array',
            items: new OA\Items(ref: '#/components/schemas/Attempt'),
        ),
        new OA\Property(property: 'word', type: 'string', nullable: true, example: null, description: "Le mot cible. Null tant que la partie n'est pas terminée, révélé quand la partie est gagnée ou perdue."),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', nullable: true),
    ],
)]
#[OA\Schema(
    schema: 'PaginatedGames',
    properties: [
        new OA\Property(
            property: 'data',
            type: 'array',
            items: new OA\Items(ref: '#/components/schemas/Game'),
        ),
        new OA\Property(
            property: 'meta',
            type: 'object',
            properties: [
                new OA\Property(property: 'current_page', type: 'integer', example: 1),
                new OA\Property(property: 'last_page', type: 'integer', example: 3),
                new OA\Property(property: 'per_page', type: 'integer', example: 20),
                new OA\Property(property: 'total', type: 'integer', example: 42),
            ],
        ),
    ],
)]
#[OA\Schema(
    schema: 'LeaderboardEntry',
    properties: [
        new OA\Property(property: 'rank', type: 'integer', example: 1),
        new OA\Property(
            property: 'user',
            type: 'object',
            nullable: true,
            properties: [
                new OA\Property(property: 'id', type: 'integer'),
                new OA\Property(property: 'name', type: 'string'),
            ],
        ),
        new OA\Property(property: 'total_score', type: 'integer', example: 4200),
        new OA\Property(property: 'games_played', type: 'integer', example: 12),
        new OA\Property(property: 'games_won', type: 'integer', example: 8),
        new OA\Property(property: 'best_score', type: 'integer', example: 900),
    ],
)]
#[OA\Schema(
    schema: 'Leaderboard',
    properties: [
        new OA\Property(
            property: 'top',
            type: 'array',
            items: new OA\Items(ref: '#/components/schemas/LeaderboardEntry'),
        ),
        new OA\Property(property: 'me', ref: '#/components/schemas/LeaderboardEntry', nullable: true),
        new OA\Property(property: 'in_top', type: 'boolean', example: true),
    ],
)]
#[OA\Schema(
    schema: 'AttemptSubmission',
    properties: [
        new OA\Property(property: 'attempt', ref: '#/components/schemas/Attempt'),
        new OA\Property(property: 'game', ref: '#/components/schemas/Game'),
    ],
)]
class OpenApiSpec
{
}
