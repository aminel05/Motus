"use client";

import { use, useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getGame,
  submitAttempt,
  type Game,
  type LetterStatus,
} from "@/lib/game";
import { readApiError } from "@/lib/api";
import { GameGrid } from "@/app/components/GameGrid";
import { GameKeyboard } from "@/app/components/GameKeyboard";
import { GameOverModal } from "@/app/components/GameOverModal";
import { useAuth } from "@/app/providers";

type Params = Promise<{ id: string }>;

export default function GamePage({ params }: { params: Params }) {
  const { id } = use(params);
  const gameId = Number(id);
  const validId = Number.isFinite(gameId);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(validId);
  const [error, setError] = useState<string | null>(
    validId ? null : "Identifiant invalide",
  );
  // The full word the user is building, including the locked first letter.
  const [guess, setGuess] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!validId || authLoading) return;
    if (!user) {
      router.push("/");
      return;
    }
    getGame(gameId)
      .then((g) => {
        setGame(g);
        setGuess(g.first_letter ?? "");
      })
      .catch((e) => {
        const status = (e as { response?: { status?: number } }).response?.status;
        if (status === 403) {
          setError("Accès refusé");
        } else {
          setError(readApiError(e)?.message ?? e?.message ?? "Erreur");
        }
      })
      .finally(() => setLoading(false));
  }, [gameId, user, authLoading, router, validId]);

  const length = game?.length ?? 0;
  const finished = game?.status !== "in_progress";

  const onKey = useCallback(
    (k: string) => {
      if (!game || finished) return;
      if (guess.length >= length) return;
      setGuess(guess + k);
    },
    [guess, game, length, finished],
  );

  const onBackspace = useCallback(() => {
    if (!game || finished) return;
    // Keep the first letter in place.
    if (guess.length <= 1) return;
    setGuess(guess.slice(0, -1));
  }, [guess, game, finished]);

  const onSubmit = useCallback(async () => {
    if (!game || busy) return;
    if (guess.length !== length) {
      setToast(`Mot incomplet : ${guess.length}/${length} lettres`);
      setTimeout(() => setToast(null), 1500);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { game: next } = await submitAttempt(game.id, guess);
      setGame(next);
      setGuess(next.first_letter ?? "");
    } catch (e) {
      const data = readApiError(e);
      const msg =
        data?.message ??
        (typeof e === "object" && e && "message" in e
          ? String((e as { message?: string }).message)
          : null) ??
        "Erreur";
      setToast(msg);
      setTimeout(() => setToast(null), 2000);
    } finally {
      setBusy(false);
    }
  }, [game, guess, length, busy]);

  const onEnter = useCallback(() => {
    void onSubmit();
  }, [onSubmit]);

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (finished || !game) return;
      if (e.key === "Enter") {
        e.preventDefault();
        onEnter();
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        onBackspace();
        return;
      }
      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        onKey(e.key.toUpperCase());
      }
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [onKey, onBackspace, onEnter, finished, game]);

  // Best status per letter across all attempts, used to colour the keyboard.
  const letterStatuses = useMemo(() => {
    const map: Record<string, LetterStatus> = {};
    for (const a of game?.attempts ?? []) {
      for (let i = 0; i < a.attempted_word.length; i++) {
        const ch = a.attempted_word[i];
        const status = a.result[i];
        if (!status) continue;
        const prev = map[ch];
        if (
          !prev ||
          (prev === "absent" && status !== "absent") ||
          (prev === "present" && status === "correct")
        ) {
          map[ch] = status;
        }
      }
    }
    return map;
  }, [game?.attempts]);

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-zinc-600">Chargement...</p>
      </main>
    );
  }

  if (error || !game) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-red-600">{error ?? "Partie introuvable"}</p>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto w-full min-h-[80vh] p-3 sm:p-6 flex flex-col gap-3 sm:gap-4 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-base sm:text-xl font-semibold">
          Partie #{game.id} ·{" "}
          <span className="capitalize">{game.difficulty ?? "?"}</span>
        </h1>
        <div className="text-xs sm:text-sm text-zinc-600">
          {game.attempts_count} / {game.max_attempts} essais
        </div>
      </div>

      <GameGrid
        length={length}
        maxAttempts={game.max_attempts}
        attempts={game.attempts}
        currentGuess={guess}
      />

      {!finished && (
        <div className="shrink-0">
          <GameKeyboard
            onKey={onKey}
            onEnter={onEnter}
            onBackspace={onBackspace}
            disabled={busy}
            letterStatuses={letterStatuses}
          />
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-4 py-2 rounded-md shadow-lg">
          {toast}
        </div>
      )}

      {finished && <GameOverModal game={game} />}
    </main>
  );
}
