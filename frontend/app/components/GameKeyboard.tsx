"use client";

import type { LetterStatus } from "@/lib/game";

type Props = {
  onKey: (key: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  disabled?: boolean;
  letterStatuses?: Record<string, LetterStatus>;
};

const ROWS = [
  ["A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["Q", "S", "D", "F", "G", "H", "J", "K", "L", "M"],
  ["W", "X", "C", "V", "B", "N"],
];

const statusClasses: Record<LetterStatus, string> = {
  correct: "bg-red-100 border-red-600 text-red-900",
  present: "bg-yellow-100 border-yellow-500 text-yellow-900",
  absent: "bg-blue-600 border-blue-700 text-white",
};

export function GameKeyboard({
  onKey,
  onEnter,
  onBackspace,
  disabled,
  letterStatuses,
}: Props) {
  return (
    <div className="flex flex-col gap-1.5 mt-4 select-none">
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex justify-center gap-1">
          {ri === 2 && (
            <button
              type="button"
              onClick={onEnter}
              disabled={disabled}
              className="px-3 py-2 rounded-md text-sm font-semibold border-2 border-zinc-300 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50"
            >
              Entrer
            </button>
          )}
          {row.map((k) => {
            const status = letterStatuses?.[k];
            const className = status
              ? statusClasses[status]
              : "bg-white border-zinc-300 text-zinc-900";
            return (
              <button
                key={k}
                type="button"
                onClick={() => onKey(k)}
                disabled={disabled}
                className={`w-9 h-12 sm:w-10 sm:h-14 rounded-md text-sm sm:text-base font-bold border-2 hover:opacity-80 disabled:opacity-50 ${className}`}
              >
                {k}
              </button>
            );
          })}
          {ri === 2 && (
            <button
              type="button"
              onClick={onBackspace}
              disabled={disabled}
              className="px-3 py-2 rounded-md text-sm font-semibold border-2 border-zinc-300 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50"
            >
              ⌫
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
