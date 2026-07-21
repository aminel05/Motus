import type { LetterStatus } from "@/lib/game";

type Props = {
  letter: string;
  status: LetterStatus | null;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
};

const base =
  "inline-flex items-center justify-center font-bold uppercase select-none";

const sizes: Record<NonNullable<Props["size"]>, string> = {
  // aspect-square makes the cell fill its grid column equally in both
  // dimensions, so the grid stays the right size on any screen.
  sm: "aspect-square text-base",
  md: "aspect-square text-lg",
  lg: "aspect-square text-lg sm:text-2xl",
};

const statusStyles: Record<LetterStatus, string> = {
  correct: "bg-white text-zinc-900 border-2 sm:border-4 border-red-600 rounded-md",
  present: "bg-white text-zinc-900 border-2 sm:border-4 border-yellow-500 rounded-full",
  absent: "bg-blue-600 text-white border-2 sm:border-4 border-blue-700 rounded-md",
};

const emptyStyle =
  "bg-white text-zinc-900 border-2 border-zinc-300 rounded-md";

export function LetterCell({ letter, status, size = "md", animate }: Props) {
  const className = [
    base,
    sizes[size],
    status ? statusStyles[status] : emptyStyle,
    animate ? "animate-pop" : "",
    letter ? "" : "text-transparent",
  ].join(" ");

  return (
    <div className={className} aria-label={status ?? "empty"}>
      {letter || " "}
    </div>
  );
}
