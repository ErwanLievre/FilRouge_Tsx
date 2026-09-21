import { useEffect, useState } from "react";

import {
    getHistory
} from "../types/api";

import type{
    Game,
} from "../types/api";


function History() {

    const [games, setGames] = useState<Game[]>([]);

    useEffect(() => {

        async function loadHistory() {

            try {

                const data = await getHistory();

                setGames(data);

            } catch (error) {

                console.error(error);

            }

        }

        loadHistory();

    }, []);

    return (
        <main>

            <h1>Historique des parties</h1>

            {games.map((game) => (

                <article key={game.id}>

                    <h2>
                        Partie #{game.id}
                    </h2>

                    <p>
                        Statut : {game.status}
                    </p>

                    <p>
                        Créée le :
                        {" "}
                        {game.createdAt}
                    </p>

                </article>

            ))}

        </main>
    );
}

export default History;