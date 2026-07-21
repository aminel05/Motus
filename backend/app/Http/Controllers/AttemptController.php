<?php

namespace App\Http\Controllers;

use App\Models\Attempt;
use App\Models\Game;
use App\Services\GameScorer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttemptController extends Controller
{
    public function store(Request $request, Game $game): JsonResponse
    {
        abort_unless($game->user_id === $request->user()->id, 403);
        abort_unless($game->status === Game::STATUS_IN_PROGRESS, 403);

        $game->load('word');
        $target = $game->word->word;
        $length = mb_strlen($target);

        $data = $request->validate([
            'word' => ['required', 'string', "size:{$length}", 'regex:/^[A-Za-zÀ-ÖØ-öø-ÿ\-\']+$/'],
        ]);

        $guess = $data['word'];
        $result = GameScorer::scoreLetters($guess, $target);
        $isCorrect = GameScorer::isWin($result);

        $attempt = Attempt::create([
            'game_id' => $game->id,
            'attempted_word' => mb_strtoupper($guess),
            'attempt_number' => $game->attempts_count + 1,
            'result' => $result,
            'is_correct' => $isCorrect,
        ]);

        $game->increment('attempts_count');

        if ($isCorrect) {
            $game->status = Game::STATUS_WON;
            $game->score = GameScorer::gameScore(
                $game->attempts_count,
                $game->max_attempts,
                $game->word->difficulty,
                true,
            );
            $game->completed_at = now();
        } elseif ($game->attempts_count >= $game->max_attempts) {
            $game->status = Game::STATUS_LOST;
            $game->score = 0;
            $game->completed_at = now();
        }

        $game->save();
        $game->refresh()->load(['word', 'attempts']);

        return response()->json([
            'attempt' => [
                'id' => $attempt->id,
                'attempt_number' => $attempt->attempt_number,
                'attempted_word' => $attempt->attempted_word,
                'result' => $attempt->result,
                'is_correct' => $attempt->is_correct,
                'created_at' => $attempt->created_at?->toIso8601String(),
            ],
            'game' => $game->toApiArray(),
        ]);
    }
}
