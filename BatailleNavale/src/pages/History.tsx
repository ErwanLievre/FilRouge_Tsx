import { useEffect, useState } from "react";

import {
    getHistory,
} from "../types/api";

import type {
    Game,
} from "../types/api";

function History() {
    const [games, setGames] =
        useState<Game[]>([]);

    useEffect(() => {
        async function loadHistory() {
            try {
                const data =
                    await getHistory();

                setGames(data);
            } catch (error) {
                console.error(error);
            }
        }

        loadHistory();
    }, []);

    function getResultLabel(
        result: Game["result"],
    ) {
        switch (result) {
            case "won":
                return "Victoire";

            case "lost":
                return "Défaite";

            case "cancelled":
                return "Annulée";

            default:
                return "Inconnu";
        }
    }

    return (
        <main>
            <h1>
                Historique des parties
            </h1>

            {games.length === 0 && (
                <p>
                    Aucune partie terminée.
                </p>
            )}

            {games.map((game) => (
                <article
                    key={game.id}
                >
                    <h2>
                        Partie #{game.id}
                    </h2>

                    <p>
                        Statut :
                        {" "}
                        Terminée
                    </p>

                    <p>
                        Résultat :
                        {" "}
                        {getResultLabel(
                            game.result,
                        )}
                    </p>

                    <p>
                        Créée le :
                        {" "}
                        {new Date(
                            game.createdAt,
                        ).toLocaleString()}
                    </p>

                    {game.endedAt && (
                        <p>
                            Terminée le :
                            {" "}
                            {new Date(
                                game.endedAt,
                            ).toLocaleString()}
                        </p>
                    )}
                </article>
            ))}
        </main>
    );
}

export default History;