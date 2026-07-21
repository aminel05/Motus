"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers";

export function AppHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the menu whenever the route changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
  }, [pathname]);

  if (!user) return null;

  const link = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`px-3 py-2 sm:py-1.5 rounded-md text-sm font-medium ${
          active
            ? "bg-zinc-900 text-white"
            : "text-zinc-700 hover:bg-zinc-200"
        }`}
      >
        {label}
      </Link>
    );
  };

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        <Link href="/dashboard" className="font-bold text-lg tracking-tight">
          Motus
        </Link>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-sm text-zinc-600">
            {user.name}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded-md border border-zinc-300 hover:bg-zinc-100"
          >
            Déconnexion
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            className="sm:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-zinc-300 hover:bg-zinc-100"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      <nav
        className={`sm:flex ${
          menuOpen ? "block" : "hidden"
        } border-t border-zinc-200 sm:border-t-0`}
      >
        <div className="max-w-5xl mx-auto px-4 py-2 flex flex-col sm:flex-row sm:items-center gap-1">
          {link("/dashboard", "Tableau de bord")}
          {link("/game/new", "Nouvelle partie")}
          {link("/leaderboard", "Classement")}
        </div>
      </nav>
    </header>
  );
}
