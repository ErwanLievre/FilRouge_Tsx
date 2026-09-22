const API_URL = "http://localhost:8000";

// TEMPORAIRE : à supprimer lorsque le système de connexion sera implémenté
const DEV_TOKEN = "TOKEN_DE_TEST";

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token") ?? DEV_TOKEN;

    return {
        Authorization: `Bearer ${token}`,
    };
}

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

    status: "pending" | "started" | "ended";

    state?: string;

    currentTurnUserId?: number;

    players?: Player[];

    createdAt: string;
    startedAt?: string;
    endedAt?: string;
}

export interface GameResult {
    gameId: number;
    winnerId?: number;
    result: string;
}

export async function getGames(): Promise<Game[]> {
    const response = await fetch(
        `${API_URL}/games/mine`,
        {
            headers: getAuthHeaders(),
        }
    );

    if (!response.ok) {
        throw new Error(
            `Impossible de récupérer les parties (${response.status})`
        );
    }

    return response.json();
}

export async function getGame(
    id: number
): Promise<Game> {
    const response = await fetch(
        `${API_URL}/games/${id}`,
        {
            headers: getAuthHeaders(),
        }
    );

    if (!response.ok) {
        throw new Error(
            `Impossible de récupérer la partie (${response.status})`
        );
    }

    return response.json();
}

export async function createGame(
    minPlayers: number,
    maxPlayers: number
): Promise<Game> {
    const response = await fetch(
        `${API_URL}/games`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },

            body: JSON.stringify({
                minPlayers,
                maxPlayers,
            }),
        }
    );

    if (!response.ok) {
        throw new Error(
            `Impossible de créer la partie (${response.status})`
        );
    }

    return response.json();
}

export async function invitePlayer(
    gameId: number,
    email: string
): Promise<Game> {
    const response = await fetch(
        `${API_URL}/games/${gameId}/invite`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },

            body: JSON.stringify({
                email,
            }),
        }
    );

    if (!response.ok) {
        throw new Error(
            `Impossible d'inviter le joueur (${response.status})`
        );
    }

    return response.json();
}

export async function getHistory(): Promise<Game[]> {
    const response = await fetch(
        `${API_URL}/games/history`,
        {
            headers: getAuthHeaders(),
        }
    );

    if (!response.ok) {
        throw new Error(
            `Impossible de récupérer l'historique (${response.status})`
        );
    }

    return response.json();
}