import { api } from "./api";

export type Difficulty = "easy" | "medium" | "hard";

export type LetterStatus = "correct" | "present" | "absent";

export type GameStatus = "in_progress" | "won" | "lost";

export type Attempt = {
  id: number;
  attempt_number: number;
  attempted_word: string;
  result: LetterStatus[];
  is_correct: boolean;
  created_at: string | null;
};

export type Game = {
  id: number;
  difficulty: Difficulty | null;
  length: number | null;
  first_letter: string | null;
  attempts_count: number;
  max_attempts: number;
  status: GameStatus;
  score: number;
  completed_at: string | null;
  attempts: Attempt[];
  word: string | null;
  created_at: string | null;
};

export type PaginatedGames = {
  data: Game[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export async function listGames(): Promise<PaginatedGames> {
  const { data } = await api.get<PaginatedGames>("/games");
  return data;
}

export async function createGame(difficulty: Difficulty): Promise<Game> {
  const { data } = await api.post<Game>("/games", { difficulty });
  return data;
}

export async function getGame(id: number): Promise<Game> {
  const { data } = await api.get<Game>(`/games/${id}`);
  return data;
}

export type SubmitAttemptResult = {
  attempt: Attempt;
  game: Game;
};

export async function submitAttempt(
  gameId: number,
  word: string,
): Promise<SubmitAttemptResult> {
  const { data } = await api.post<SubmitAttemptResult>(
    `/games/${gameId}/attempts`,
    { word },
  );
  return data;
}
