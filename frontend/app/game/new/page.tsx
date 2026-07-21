"use client";

import { NewGameForm } from "@/app/components/NewGameForm";

export default function NewGamePage() {
  return (
    <main className="max-w-md mx-auto w-full p-4 sm:p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Nouvelle partie</h1>
      <p className="text-sm text-zinc-600">
        Choisissez une difficulté. La première lettre vous sera révélée.
      </p>
      <NewGameForm />
    </main>
  );
}
