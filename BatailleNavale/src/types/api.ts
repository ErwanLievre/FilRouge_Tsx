import type { CellState } from "../components/game/Cell";
import type { Ship } from "../types";

const STORAGE_KEY = "bataille-navale-games";

export type GameStatus = "started" | "ended";

export type GamePhase =
    | "placing"
    | "playing"
    | "won"
    | "lost";

export type GameResult =
    | "won"
    | "lost"
    | "cancelled"
    | null;

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

    /*
     * Grille visible du joueur.
     *
     * Pour l'adversaire, cette grille ne contient
     * jamais "ship".
     */
    myGrid: CellState[][];

    myShips: Ship[];

    /*
     * Grille visible de l'adversaire.
     *
     * Elle contient uniquement :
     * unknown / miss / hit / sunk
     *
     * Les positions des bateaux sont dans opponentShips.
     */
    opponentGrid: CellState[][];

    /*
     * Position réelle des bateaux adverses.
     * Cette donnée est conservée pour le fonctionnement
     * du jeu mais n'est jamais affichée directement.
     */
    opponentShips: Ship[];

    currentTurnUserId?: number;

    isPlayerTurn: boolean;
    placingIndex: number;
    orientation: "horizontal" | "vertical";

    createdAt: string;
    updatedAt: string;
    endedAt: string | null;
}

function getStoredGames(): Game[] {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
        return [];
    }

    try {
        return JSON.parse(data) as Game[];
    } catch {
        return [];
    }
}

function saveStoredGames(games: Game[]): void {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(games),
    );
}

export async function getGames(): Promise<Game[]> {
    const games = getStoredGames();

    return games.filter(
        (game) => game.status === "started",
    );
}

export async function getHistory(): Promise<Game[]> {
    const games = getStoredGames();

    return games.filter(
        (game) => game.status === "ended",
    );
}

export async function clearHistory(): Promise<void> {
    const games = getStoredGames().filter(game => game.status !== "ended");
    saveStoredGames(games);
}

export async function getGame(
    id: number,
): Promise<Game> {
    const games = getStoredGames();

    const game = games.find(
        (item) => item.id === id,
    );

    if (!game) {
        throw new Error(
            "Partie introuvable.",
        );
    }

    return game;
}

export async function createGame(
    minPlayers: number,
    maxPlayers: number,
): Promise<Game> {
    const games = getStoredGames();

    const now =
        new Date().toISOString();

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

        /*
         * La grille adverse visible commence
         * entièrement cachée.
         */
        opponentGrid: [],

        /*
         * La flotte réelle sera générée
         * dans Game.tsx.
         */
        opponentShips: [],

        isPlayerTurn: true,
        placingIndex: 0,
        orientation: "horizontal",

        createdAt: now,
        updatedAt: now,
        endedAt: null,
    };

    saveStoredGames([
        ...games,
        game,
    ]);

    return game;
}

export async function saveGame(
    game: Game,
): Promise<void> {
    const games = getStoredGames();

    const index = games.findIndex(
        (item) => item.id === game.id,
    );

    const updatedGame: Game = {
        ...game,
        updatedAt:
            new Date().toISOString(),
    };

    if (index === -1) {
        saveStoredGames([
            ...games,
            updatedGame,
        ]);

        return;
    }

    const updatedGames = [...games];

    updatedGames[index] = updatedGame;

    saveStoredGames(updatedGames);
}

export async function finishGame(
    game: Game,
    result: "won" | "lost",
): Promise<void> {
    await saveGame({
        ...game,

        status: "ended",

        phase: result,

        result,

        endedAt:
            new Date().toISOString(),
    });
}

/*
 * Arrêter volontairement une partie.
 *
 * Elle est considérée comme terminée,
 * mais son résultat est "cancelled".
 */
export async function cancelGame(
    game: Game,
): Promise<void> {
    await saveGame({
        ...game,

        status: "ended",

        /*
         * La phase reste "playing" ou "placing"
         * dans les données techniques.
         */
        phase: game.phase,

        result: "cancelled",

        endedAt:
            new Date().toISOString(),
    });
}