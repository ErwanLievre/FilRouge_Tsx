import type { CellState } from "../components/game/Cell";
import type { Ship } from "../types";

export type GameStatus = "started" | "ended";
export type GamePhase = "placing" | "playing" | "won" | "lost";
export type GameResult = "won" | "lost" | "cancelled" | null;

export interface Player {
    id: number;
    email: string;
    profilePicture?: string | null;
}

export interface Game {
    id: number;
    creatorId: number;
    minPlayers: number;
    maxPlayers: number;
    status: GameStatus;
    phase: GamePhase;
    result: GameResult;
    myGrid: CellState[][];
    myShips: Ship[];
    opponentGrid: CellState[][];
    opponentShips: Ship[];
    currentTurnUserId?: number;
    isPlayerTurn: boolean;
    placingIndex: number;
    orientation: "horizontal" | "vertical";
    createdAt: string;
    updatedAt: string;
    endedAt: string | null;
}

function getCurrentUserEmail(): string | null {
    const data = localStorage.getItem("bataille-navale-user");
    if (!data) return null;

    try {
        const user = JSON.parse(data) as { email?: string };
        return user.email ? user.email.trim().toLowerCase() : null;
    } catch {
        return null;
    }
}

function getStorageKey(): string | null {
    const email = getCurrentUserEmail();
    return email ? `bataille-navale-games-${email}` : null;
}

function getStoredGames(): Game[] {
    const key = getStorageKey();
    if (!key) return [];

    const data = localStorage.getItem(key);
    if (!data) return [];

    try {
        return JSON.parse(data) as Game[];
    } catch {
        return [];
    }
}

function saveStoredGames(games: Game[]): void {
    const key = getStorageKey();
    if (!key) throw new Error("Utilisateur non connecté.");

    localStorage.setItem(key, JSON.stringify(games));
}

export async function getGames(): Promise<Game[]> {
    return getStoredGames().filter(game => game.status === "started");
}

export async function getHistory(): Promise<Game[]> {
    return getStoredGames().filter(game => game.status === "ended");
}

export async function getGame(id: number): Promise<Game> {
    const game = getStoredGames().find(item => item.id === id);

    if (!game) {
        throw new Error("Partie introuvable.");
    }

    return game;
}

export async function createGame(minPlayers: number, maxPlayers: number): Promise<Game> {
    const games = getStoredGames();
    const now = new Date().toISOString();

    const game: Game = {
        id: Date.now(),
        creatorId: 1,
        minPlayers,
        maxPlayers,
        status: "started",
        phase: "placing",
        result: null,
        myGrid: [],
        myShips: [],
        opponentGrid: [],
        opponentShips: [],
        isPlayerTurn: true,
        placingIndex: 0,
        orientation: "horizontal",
        createdAt: now,
        updatedAt: now,
        endedAt: null,
    };

    saveStoredGames([...games, game]);
    return game;
}

export async function saveGame(game: Game): Promise<void> {
    const games = getStoredGames();
    const index = games.findIndex(item => item.id === game.id);
    const updatedGame = { ...game, updatedAt: new Date().toISOString() };

    if (index === -1) {
        saveStoredGames([...games, updatedGame]);
        return;
    }

    const updatedGames = [...games];
    updatedGames[index] = updatedGame;
    saveStoredGames(updatedGames);
}

export async function finishGame(game: Game, result: "won" | "lost"): Promise<void> {
    await saveGame({
        ...game,
        status: "ended",
        phase: result,
        result,
        endedAt: new Date().toISOString(),
    });
}

export async function cancelGame(game: Game): Promise<void> {
    await saveGame({
        ...game,
        status: "ended",
        phase: game.phase,
        result: "cancelled",
        endedAt: new Date().toISOString(),
    });
}

export async function clearHistory(): Promise<void> {
    const games = getStoredGames().filter(game => game.status !== "ended");
    saveStoredGames(games);
}