<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeaderboardController extends Controller
{
    private const TOP_LIMIT = 10;

    public function index(Request $request): JsonResponse
    {
        $meId = $request->user()->id;

        $rows = DB::table('games')
            ->select([
                'user_id',
                DB::raw('COALESCE(SUM(score), 0) as total_score'),
                DB::raw('COUNT(*) as games_played'),
                DB::raw("SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as games_won"),
                DB::raw('COALESCE(MAX(score), 0) as best_score'),
            ])
            ->groupBy('user_id')
            ->orderByDesc('total_score')
            ->orderByDesc('best_score')
            ->get();

        $ranked = [];
        foreach ($rows as $i => $row) {
            $ranked[] = [
                'rank' => $i + 1,
                'user_id' => (int) $row->user_id,
                'total_score' => (int) $row->total_score,
                'games_played' => (int) $row->games_played,
                'games_won' => (int) $row->games_won,
                'best_score' => (int) $row->best_score,
            ];
        }

        $top = array_slice($ranked, 0, self::TOP_LIMIT);

        $meEntry = null;
        foreach ($ranked as $entry) {
            if ($entry['user_id'] === $meId) {
                $meEntry = $entry;
                break;
            }
        }

        $userIds = array_unique(array_column($ranked, 'user_id'));
        $users = User::whereIn('id', $userIds)->get(['id', 'name'])->keyBy('id');

        $top = array_map(fn ($e) => $this->buildEntry($e, $users), $top);
        $me = $meEntry ? $this->buildEntry($meEntry, $users) : null;

        return response()->json([
            'top' => array_values($top),
            'me' => $me,
            'in_top' => $me ? $me['rank'] <= self::TOP_LIMIT : false,
        ]);
    }

    private function buildEntry(array $entry, $users): array
    {
        $u = $users->get($entry['user_id']);
        return [
            'rank' => $entry['rank'],
            'user' => $u ? ['id' => $u->id, 'name' => $u->name] : null,
            'total_score' => $entry['total_score'],
            'games_played' => $entry['games_played'],
            'games_won' => $entry['games_won'],
            'best_score' => $entry['best_score'],
        ];
    }
}
