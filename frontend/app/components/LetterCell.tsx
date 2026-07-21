import type { LetterStatus } from "@/lib/game";

type Props = {
  letter: string;
  status: LetterStatus | null;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
};

const base =
  "inline-flex items-center justify-center font-bold uppercase select-none transition-transform";

const sizes: Record<NonNullable<Props["size"]>, string> = {
  sm: "w-10 h-10 text-base",
  md: "w-12 h-12 text-xl",
  lg: "w-14 h-14 sm:w-16 sm:h-16 text-2xl",
};

const statusStyles: Record<LetterStatus, string> = {
  correct: "bg-white text-zinc-900 border-4 border-red-600 rounded-md",
  present: "bg-white text-zinc-900 border-4 border-yellow-500 rounded-full",
  absent: "bg-blue-600 text-white border-4 border-blue-700 rounded-md",
};

const emptyStyle =
  "bg-white text-zinc-900 border-2 border-zinc-300 rounded-md";

export function LetterCell({ letter, status, size = "md", animate }: Props) {
  const className = [
    base,
    sizes[size],
    status ? statusStyles[status] : emptyStyle,
    animate ? "scale-100" : "",
    letter ? "" : "text-transparent",
  ].join(" ");

  return (
    <div className={className} aria-label={status ?? "empty"}>
      {letter || "\u00A0"}
    </div>
  );
}
