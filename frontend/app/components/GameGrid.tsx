import type { Attempt } from "@/lib/game";
import { LetterCell } from "./LetterCell";

type Props = {
  length: number;
  maxAttempts: number;
  attempts: Attempt[];
  firstLetter?: string | null;
};

export function GameGrid({ length, maxAttempts, attempts, firstLetter }: Props) {
  const cols =
    length === 5
      ? "grid-cols-5"
      : length === 7
        ? "grid-cols-7"
        : "grid-cols-10";

  return (
    <div className="flex flex-col gap-1 sm:gap-1.5 w-full">
      {Array.from({ length: maxAttempts }).map((_, rowIdx) => {
        const attempt = attempts[rowIdx];
        const isCurrentRow = rowIdx === attempts.length;
        const letters = attempt
          ? attempt.attempted_word.split("")
          : isCurrentRow && firstLetter
            ? Array.from({ length }).map((_, i) =>
                i === 0 ? firstLetter : "",
              )
            : Array.from({ length }).map(() => "");

        return (
          <div key={rowIdx} className={`grid ${cols} gap-1 sm:gap-1.5`}>
            {letters.map((letter, colIdx) => {
              const status =
                attempt && colIdx < attempt.result.length
                  ? attempt.result[colIdx]
                  : null;
              return (
                <LetterCell
                  key={colIdx}
                  letter={letter}
                  status={status}
                  size="lg"
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
