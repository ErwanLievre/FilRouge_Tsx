import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getGames,
    createGame,
    cancelGame,
} from "../types/api";

import type {
    Game,
} from "../types/api";

function Games() {
    const navigate = useNavigate();

    const [games, setGames] =
        useState<Game[]>([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        loadGames();
    }, []);

    async function loadGames() {
        try {
            const data =
                await getGames();

            setGames(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateGame() {
        try {
            const game =
                await createGame(2, 4);

            setGames(
                (previousGames) => [
                    ...previousGames,
                    game,
                ],
            );

            navigate(
                `/game/${game.id}`,
            );
        } catch (error) {
            console.error(error);
        }
    }

    function handleOpenGame(
        id: number,
    ) {
        navigate(`/game/${id}`);
    }

    async function handleCancelGame(
        game: Game,
    ) {
        const confirmed =
            window.confirm(
                `Voulez-vous vraiment arrêter la partie #${game.id} ?\n\nCette partie sera déplacée dans l'historique comme "Annulée".`,
            );

        if (!confirmed) {
            return;
        }

        try {
            await cancelGame(game);

            /*
             * On retire la partie de la liste
             * des parties en cours.
             */
            setGames(
                (previousGames) =>
                    previousGames.filter(
                        (item) =>
                            item.id !==
                            game.id,
                    ),
            );
        } catch (error) {
            console.error(error);
        }
    }

    if (loading) {
        return <p>Chargement...</p>;
    }

    return (
        <main>
            <h1>Parties</h1>

            <button
                onClick={
                    handleCreateGame
                }
            >
                Créer une partie
            </button>

            <section>
                {games.length === 0 && (
                    <p>
                        Aucune partie en cours.
                    </p>
                )}

                {games.map((game) => (
                    <article
                        key={game.id}
                    >
                        <h2>
                            Partie #
                            {game.id}
                        </h2>

                        <p>
                            Joueurs :
                            {" "}
                            {game.minPlayers}
                            {" - "}
                            {game.maxPlayers}
                        </p>

                        <p>
                            Statut :
                            {" "}
                            En cours
                        </p>

                        <p>
                            Dernière
                            modification :
                            {" "}
                            {new Date(
                                game.updatedAt,
                            ).toLocaleString()}
                        </p>

                        <button
                            onClick={() =>
                                handleOpenGame(
                                    game.id,
                                )
                            }
                        >
                            Reprendre la partie
                        </button>

                        {" "}

                        <button
                            onClick={() =>
                                handleCancelGame(
                                    game,
                                )
                            }
                        >
                            Arrêter la partie
                        </button>
                    </article>
                ))}
            </section>
        </main>
    );
}

export default Games;