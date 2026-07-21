"use client";

import type { LetterStatus } from "@/lib/game";

type Props = {
  onKey: (key: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  disabled?: boolean;
  letterStatuses?: Record<string, LetterStatus>;
};

// AZERTY layout, three rows. Row 3 has the special action buttons on either
// side of the six remaining letters.
const ROWS = [
  ["A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["Q", "S", "D", "F", "G", "H", "J", "K", "L", "M"],
  ["W", "X", "C", "V", "B", "N"],
] as const;

const statusClasses: Record<LetterStatus, string> = {
  correct: "bg-red-100 border-red-600 text-red-900",
  present: "bg-yellow-100 border-yellow-500 text-yellow-900",
  absent: "bg-blue-600 border-blue-700 text-white",
};

const KEY_BASE =
  "aspect-square text-sm sm:text-base font-bold border-2 rounded-md disabled:opacity-50";
const KEY_DEFAULT = "bg-white border-zinc-300 text-zinc-900 hover:opacity-80";
const ACTION_BASE =
  "col-span-2 text-xs sm:text-sm font-semibold border-2 rounded-md disabled:opacity-50";
const ACTION_DEFAULT =
  "bg-zinc-100 border-zinc-300 text-zinc-900 hover:bg-zinc-200";

export function GameKeyboard({
  onKey,
  onEnter,
  onBackspace,
  disabled,
  letterStatuses,
}: Props) {
  return (
    <div className="flex flex-col gap-1 sm:gap-1.5 w-full select-none">
      <div className="grid grid-cols-10 gap-1">
        {ROWS[0].map((k) => {
          const status = letterStatuses?.[k];
          return (
            <button
              key={k}
              type="button"
              onClick={() => onKey(k)}
              disabled={disabled}
              className={`${KEY_BASE} ${status ? statusClasses[status] : KEY_DEFAULT}`}
            >
              {k}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-10 gap-1">
        {ROWS[1].map((k) => {
          const status = letterStatuses?.[k];
          return (
            <button
              key={k}
              type="button"
              onClick={() => onKey(k)}
              disabled={disabled}
              className={`${KEY_BASE} ${status ? statusClasses[status] : KEY_DEFAULT}`}
            >
              {k}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-10 gap-1">
        <button
          type="button"
          onClick={onEnter}
          disabled={disabled}
          className={`${ACTION_BASE} ${ACTION_DEFAULT}`}
        >
          Entrer
        </button>
        {ROWS[2].map((k) => {
          const status = letterStatuses?.[k];
          return (
            <button
              key={k}
              type="button"
              onClick={() => onKey(k)}
              disabled={disabled}
              className={`${KEY_BASE} ${status ? statusClasses[status] : KEY_DEFAULT}`}
            >
              {k}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onBackspace}
          disabled={disabled}
          className={`${ACTION_BASE} ${ACTION_DEFAULT}`}
        >
          ⌫
        </button>
      </div>
    </div>
  );
}
