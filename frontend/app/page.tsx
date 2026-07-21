"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { readApiError } from "@/lib/api";
import { useAuth } from "./providers";

export default function Home() {
  const router = useRouter();
  const { user, loading, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        });
      }
      router.push("/dashboard");
    } catch (err) {
      const data = readApiError(err);
      if (data?.errors) {
        setError(Object.values(data.errors).flat()[0] as string);
      } else {
        setError(data?.message ?? "Une erreur est survenue");
      }
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-zinc-600">Chargement...</p>
      </main>
    );
  }

  if (user) {
    return null;
  }

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <form onSubmit={onSubmit} className="flex flex-col gap-4 max-w-md w-full">
        <h1 className="text-2xl font-semibold">
          {mode === "login" ? "Connexion" : "Inscription"}
        </h1>

        {mode === "register" && (
          <label className="flex flex-col gap-1">
            <span className="text-sm">Nom</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-md border border-zinc-300 px-3 py-2"
            />
          </label>
        )}

        <label className="flex flex-col gap-1">
          <span className="text-sm">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Mot de passe</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
        </label>

        {mode === "register" && (
          <label className="flex flex-col gap-1">
            <span className="text-sm">Confirmation</span>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              minLength={8}
              className="rounded-md border border-zinc-300 px-3 py-2"
            />
          </label>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {busy
            ? "Patientez..."
            : mode === "login"
              ? "Se connecter"
              : "Créer un compte"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError(null);
          }}
          className="text-sm text-zinc-600 underline"
        >
          {mode === "login"
            ? "Pas de compte ? S'inscrire"
            : "Déjà un compte ? Se connecter"}
        </button>
      </form>
    </main>
  );
}
