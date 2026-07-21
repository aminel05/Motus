import { useEffect, useRef, useState } from "react";
import type { Attempt } from "@/lib/game";
import { LetterCell } from "./LetterCell";

type Props = {
  length: number;
  maxAttempts: number;
  attempts: Attempt[];
  currentGuess?: string;
};

export function GameGrid({
  length,
  maxAttempts,
  attempts,
  currentGuess,
}: Props) {
  // Track the previous length so we can pop the cell that was just added by
  // the user. We use -1 as a sentinel so the first paint (when the locked
  // first letter is seeded into the guess) does not trigger an animation.
  const prevLenRef = useRef<number>(-1);
  const [animatedIdx, setAnimatedIdx] = useState<number>(-1);

  useEffect(() => {
    const newLen = currentGuess?.length ?? 0;
    const prevLen = prevLenRef.current;
    if (newLen > prevLen && prevLen >= 1) {
      setAnimatedIdx(newLen - 1);
      const t = setTimeout(() => setAnimatedIdx(-1), 200);
      prevLenRef.current = newLen;
      return () => clearTimeout(t);
    }
    prevLenRef.current = newLen;
  }, [currentGuess]);

  const cols =
    length === 5
      ? "grid-cols-5"
      : length === 7
        ? "grid-cols-7"
        : "grid-cols-10";

  return (
    <div className="flex flex-col gap-1 sm:gap-1.5 w-full flex-1 min-h-0 justify-center">
      {Array.from({ length: maxAttempts }).map((_, rowIdx) => {
        const attempt = attempts[rowIdx];
        const isCurrentRow = rowIdx === attempts.length;
        const letters = attempt
          ? attempt.attempted_word.split("")
          : isCurrentRow
            ? Array.from({ length }).map((_, i) => currentGuess?.[i] ?? "")
            : Array.from({ length }).map(() => "");

        return (
          <div key={rowIdx} className={`grid ${cols} gap-1 sm:gap-1.5`}>
            {letters.map((letter, colIdx) => {
              const status =
                attempt && colIdx < attempt.result.length
                  ? attempt.result[colIdx]
                  : null;
              const animate =
                isCurrentRow && !attempt && colIdx === animatedIdx;
              return (
                <LetterCell
                  key={colIdx}
                  letter={letter}
                  status={status}
                  size="lg"
                  animate={animate}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
