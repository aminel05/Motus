<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Services\WordProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GameController extends Controller
{
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

    public function show(Request $request, Game $game): JsonResponse
    {
        abort_unless($game->user_id === $request->user()->id, 403);

        $game->load(['word', 'attempts']);

        return response()->json($game->toApiArray());
    }
}
