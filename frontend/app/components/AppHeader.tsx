"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";

export function AppHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (!user) return null;

  const link = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`px-3 py-1.5 rounded-md text-sm font-medium ${
          active
            ? "bg-zinc-900 text-white"
            : "text-zinc-700 hover:bg-zinc-200"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="font-bold text-lg tracking-tight"
        >
          Motus
        </Link>
        <nav className="flex items-center gap-1">
          {link("/dashboard", "Tableau de bord")}
          {link("/game/new", "Nouvelle partie")}
          {link("/leaderboard", "Classement")}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-zinc-600">
            {user.name}
          </span>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push("/");
            }}
            className="text-sm px-3 py-1.5 rounded-md border border-zinc-300 hover:bg-zinc-100"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}
