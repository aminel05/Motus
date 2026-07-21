import { api } from "./api";

export type LeaderboardEntry = {
  rank: number;
  user: { id: number; name: string } | null;
  total_score: number;
  games_played: number;
  games_won: number;
  best_score: number;
};

export type Leaderboard = {
  top: LeaderboardEntry[];
  me: LeaderboardEntry | null;
  in_top: boolean;
};

export async function getLeaderboard(): Promise<Leaderboard> {
  const { data } = await api.get<Leaderboard>("/leaderboard");
  return data;
}
