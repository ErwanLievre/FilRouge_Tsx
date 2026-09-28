import type { User } from "./auth";

export type Game = {
    id: number; creatorId: number; minPlayers: number; maxPlayers: number;
    status: "pending" | "started" | "ended"; players: User[];
    currentTurnUserId: number | null; isYourTurn: boolean; state: string;
    endData: string | null; createdAt: string; startedAt: string | null; endedAt: string | null;
};
