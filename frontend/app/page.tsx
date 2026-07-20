"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "./providers";

export default function Home() {
  const { user, loading, login, register, logout } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
      setName("");
      setEmail("");
      setPassword("");
      setPasswordConfirmation("");
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : null;
      setError(message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </main>
    );
  }

  if (user) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="flex flex-col gap-4 max-w-md w-full">
          <h1 className="text-2xl font-semibold">Welcome, {user.name}</h1>
          <p className="text-zinc-600 dark:text-zinc-400">{user.email}</p>
          <button
            onClick={() => {
              void logout();
            }}
            className="rounded-md bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
          >
            Log out
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-4 max-w-md w-full"
      >
        <h1 className="text-2xl font-semibold">
          {mode === "login" ? "Log in" : "Register"}
        </h1>

        {mode === "register" && (
          <label className="flex flex-col gap-1">
            <span className="text-sm">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
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
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>

        {mode === "register" && (
          <label className="flex flex-col gap-1">
            <span className="text-sm">Confirm password</span>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              minLength={8}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {busy
            ? "Please wait..."
            : mode === "login"
              ? "Log in"
              : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError(null);
          }}
          className="text-sm text-zinc-600 underline dark:text-zinc-400"
        >
          {mode === "login"
            ? "Need an account? Register"
            : "Already have an account? Log in"}
        </button>
      </form>
    </main>
  );
}
