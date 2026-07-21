"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Difficulty } from "@/lib/game";
import { createGame } from "@/lib/game";
import { readApiError } from "@/lib/api";

const CHOICES: { value: Difficulty; label: string; desc: string }[] = [
  { value: "easy", label: "Facile", desc: "5 lettres, 6 essais" },
  { value: "medium", label: "Moyen", desc: "7 lettres, 6 essais" },
  { value: "hard", label: "Difficile", desc: "10 lettres, 5 essais" },
];

export function NewGameForm() {
  const router = useRouter();
  const [picking, setPicking] = useState<Difficulty | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start(difficulty: Difficulty) {
    setPicking(difficulty);
    setError(null);
    try {
      const game = await createGame(difficulty);
      router.push(`/game/${game.id}`);
    } catch (err) {
      setError(readApiError(err)?.message ?? "Impossible de démarrer la partie");
      setPicking(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {CHOICES.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => start(c.value)}
          disabled={picking !== null}
          className="flex items-center justify-between rounded-lg border-2 border-zinc-300 px-4 py-3 hover:border-zinc-900 disabled:opacity-50"
        >
          <span className="font-semibold">{c.label}</span>
          <span className="text-sm text-zinc-600">
            {c.desc}
          </span>
        </button>
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
