<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Services\WordProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

class GameController extends Controller
{
    #[OA\Get(
        path: '/api/games',
        tags: ['Games'],
        summary: "Lister les parties de l'utilisateur courant",
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Liste paginée des parties', content: new OA\JsonContent(ref: '#/components/schemas/PaginatedGames')),
            new OA\Response(response: 401, description: 'Non authentifié'),
        ],
    )]
    public function index(Request $request): JsonResponse
    {
        $games = $request->user()
            ->games()
            ->with(['word', 'attempts'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $games->getCollection()->map(fn (Game $g) => $g->toApiArray())->all(),
            'meta' => [
                'current_page' => $games->currentPage(),
                'last_page' => $games->lastPage(),
                'per_page' => $games->perPage(),
                'total' => $games->total(),
            ],
        ]);
    }

    #[OA\Post(
        path: '/api/games',
        tags: ['Games'],
        summary: 'Démarrer une nouvelle partie',
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['difficulty'],
                properties: [
                    new OA\Property(property: 'difficulty', type: 'string', enum: ['easy', 'medium', 'hard'], example: 'easy'),
                ],
            ),
        ),
        responses: [
            new OA\Response(response: 201, description: 'Partie créée', content: new OA\JsonContent(ref: '#/components/schemas/Game')),
            new OA\Response(response: 422, description: 'Difficulté invalide'),
            new OA\Response(response: 401, description: 'Non authentifié'),
        ],
    )]
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'difficulty' => ['required', 'string', Rule::in(['easy', 'medium', 'hard'])],
        ]);

        $word = WordProvider::pick($data['difficulty']);

        $game = Game::create([
            'user_id' => $request->user()->id,
            'word_id' => $word->id,
            'attempts_count' => 0,
            'max_attempts' => Game::maxAttemptsFor($data['difficulty']),
            'status' => Game::STATUS_IN_PROGRESS,
            'score' => 0,
        ]);

        $game->load(['word', 'attempts']);

        return response()->json($game->toApiArray(), 201);
    }

    #[OA\Get(
        path: '/api/games/{game}',
        tags: ['Games'],
        summary: "Détail d'une partie",
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(
                name: 'game',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer'),
            ),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Partie', content: new OA\JsonContent(ref: '#/components/schemas/Game')),
            new OA\Response(response: 403, description: 'Cette partie appartient à un autre utilisateur'),
            new OA\Response(response: 404, description: 'Partie introuvable'),
            new OA\Response(response: 401, description: 'Non authentifié'),
        ],
    )]
    public function show(Request $request, Game $game): JsonResponse
    {
        abort_unless($game->user_id === $request->user()->id, 403);

        $game->load(['word', 'attempts']);

        return response()->json($game->toApiArray());
    }
}
