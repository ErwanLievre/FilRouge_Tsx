import { useEffect, useState } from "react";

import {
    getGames,
    createGame
} from "../types/api";

import type { 
    Game
} from "../types/api";
function Games() {

    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGames();
    }, []);

    async function loadGames() {

        try {
            const data = await getGames();

            setGames(data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }
    }

    async function handleCreateGame() {

        try {

            const game = await createGame(2, 4);

            setGames((previousGames) => [
                ...previousGames,
                game
            ]);

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

            <button onClick={handleCreateGame}>
                Créer une partie
            </button>

            <section>

                {games.map((game) => (

                    <article key={game.id}>

                        <h2>
                            Partie #{game.id}
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
                            {game.status}
                        </p>

                    </article>

                ))}

            </section>

        </main>
    );
}

export default Games;