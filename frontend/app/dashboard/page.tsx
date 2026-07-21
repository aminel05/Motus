"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listGames, type Game } from "@/lib/game";
import { useAuth } from "@/app/providers";

function statusLabel(status: Game["status"]): string {
  if (status === "won") return "Gagné";
  if (status === "lost") return "Perdu";
  return "En cours";
}

function statusClass(status: Game["status"]): string {
  if (status === "won") return "text-green-600";
  if (status === "lost") return "text-red-600";
  return "text-blue-600";
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    listGames()
      .then((r) => setGames(r.data))
      .catch((e) => setError(e?.message ?? "Erreur"))
      .finally(() => setBusy(false));
  }, [user, loading]);

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-zinc-600">Chargement...</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto w-full p-4 sm:p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <Link
          href="/game/new"
          className="rounded-md bg-zinc-900 text-white px-4 py-2 font-semibold"
        >
          Nouvelle partie
        </Link>
      </div>

      {busy && (
        <p className="text-zinc-600">Chargement des parties...</p>
      )}
      {error && <p className="text-red-600">{error}</p>}

      {!busy && !error && games.length === 0 && (
        <p className="text-zinc-600">
          Aucune partie. Démarrez votre première partie.
        </p>
      )}

      {games.length > 0 && (
        <ul className="flex flex-col gap-2">
          {games.map((g) => (
            <li key={g.id}>
              <Link
                href={`/game/${g.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 px-4 py-3 hover:bg-zinc-50"
              >
                <div className="flex flex-col">
                  <span className="font-semibold">
                    Partie #{g.id} · {g.difficulty ?? "?"} · {g.length ?? "?"} lettres
                  </span>
                  <span className="text-sm text-zinc-500">
                    {g.attempts_count} / {g.max_attempts} essais
                    {g.completed_at
                      ? ` · ${new Date(g.completed_at).toLocaleString()}`
                      : ""}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`font-semibold ${statusClass(g.status)}`}>
                    {statusLabel(g.status)}
                  </span>
                  <span className="text-sm text-zinc-500">{g.score} pts</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
