"use client";

import { useEffect, useState } from "react";
import { getLeaderboard, type Leaderboard } from "@/lib/leaderboard";
import { useAuth } from "@/app/providers";

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<Leaderboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    getLeaderboard()
      .then(setData)
      .catch((e) => setError(e?.message ?? "Erreur"));
  }, [user, authLoading]);

  if (authLoading || !user) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-zinc-600">Chargement...</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto w-full p-4 sm:p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Classement</h1>

      {error && <p className="text-red-600">{error}</p>}

      {data && (
        <>
          <div className="rounded-lg border border-zinc-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-100 text-left">
                <tr>
                  <th className="px-3 py-2 w-12">#</th>
                  <th className="px-3 py-2">Joueur</th>
                  <th className="px-3 py-2 text-right">Score</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">
                    Parties
                  </th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">
                    Victoires
                  </th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">
                    Meilleur
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.top.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-6 text-center text-zinc-500"
                    >
                      Aucun classement pour l&apos;instant.
                    </td>
                  </tr>
                )}
                {data.top.map((row) => (
                  <tr
                    key={row.user?.id ?? `rank-${row.rank}`}
                    className="border-t border-zinc-200"
                  >
                    <td className="px-3 py-2 font-mono">{row.rank}</td>
                    <td className="px-3 py-2">
                      {row.user?.name ?? "—"}
                      {row.user?.id === user.id && (
                        <span className="ml-2 text-xs text-zinc-500">(vous)</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold">
                      {row.total_score}
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      {row.games_played}
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      {row.games_won}
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      {row.best_score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.me && !data.in_top && (
            <div className="rounded-lg border border-zinc-200 overflow-hidden">
              <div className="px-3 py-2 bg-zinc-100 text-sm font-semibold">
                Votre classement
              </div>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="px-3 py-2 font-mono w-12">{data.me.rank}</td>
                    <td className="px-3 py-2">
                      {data.me.user?.name ?? "—"}
                      <span className="ml-2 text-xs text-zinc-500">(vous)</span>
                    </td>
                    <td className="px-3 py-2 text-right font-semibold">
                      {data.me.total_score}
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      {data.me.games_played}
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      {data.me.games_won}
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      {data.me.best_score}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}
