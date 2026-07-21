"use client";

import Link from "next/link";
import type { Game } from "@/lib/game";

type Props = {
  game: Game;
  onClose?: () => void;
};

export function GameOverModal({ game, onClose }: Props) {
  const won = game.status === "won";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl flex flex-col gap-4">
        <h2
          className={`text-2xl font-bold text-center ${won ? "text-green-600" : "text-red-600"}`}
        >
          {won ? "Bravo !" : "Perdu !"}
        </h2>

        <div className="text-center text-zinc-700">
          {won ? (
            <p>
              Vous avez trouvé le mot en {game.attempts_count} essai
              {game.attempts_count > 1 ? "s" : ""}.
            </p>
          ) : (
            <p>Vous n&apos;avez pas trouvé le mot.</p>
          )}
          <p className="mt-2">
            Le mot était :{" "}
            <span className="font-bold tracking-widest">{game.word}</span>
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-zinc-500">Score</p>
          <p className="text-3xl font-bold">{game.score}</p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/dashboard"
            className="flex-1 text-center rounded-md bg-zinc-900 text-white px-4 py-2 font-semibold"
            onClick={onClose}
          >
            Tableau de bord
          </Link>
          <Link
            href="/game/new"
            className="flex-1 text-center rounded-md border-2 border-zinc-900 px-4 py-2 font-semibold"
            onClick={onClose}
          >
            Nouvelle partie
          </Link>
        </div>
      </div>
    </div>
  );
}
