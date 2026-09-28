import { useEffect, useState } from "react";
import { clearHistory, getHistory } from "../types/api";
import type { Game } from "../types/api";

function History() {
    const [games, setGames] = useState<Game[]>([]);

    useEffect(() => {
        loadHistory();
    }, []);

    async function loadHistory() {
        try {
            setGames(await getHistory());
        } catch (error) {
            console.error(error);
        }
    }

    async function handleClearHistory() {
        if (!games.length) return;

        const confirmed = window.confirm(
            "Voulez-vous vraiment supprimer tout l'historique ?\n\nCette action est définitive."
        );

        if (!confirmed) return;

        try {
            await clearHistory();
            setGames([]);
        } catch (error) {
            console.error(error);
        }
    }

    function getResultLabel(result: Game["result"]) {
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
        <main className="games-page">
            <div className="page-header">
                <div>
                    <h1>Historique</h1>
                    <p>Vos anciennes parties</p>
                </div>

                <button
                    className="secondary-button danger"
                    onClick={handleClearHistory}
                    disabled={!games.length}
                >
                    Supprimer l'historique
                </button>
            </div>

            {games.length === 0 ? (
                <div className="empty-state">
                    <h2>Aucune partie terminée</h2>
                    <p>Vos parties terminées apparaîtront ici.</p>
                </div>
            ) : (
                <section className="games-grid">
                    {games.map((game, index) => (
                        <article className="game-card" key={game.id}>
                            <div className="game-card-header">
                                <span>Partie {index + 1}</span>
                                <span className={`game-badge ${game.result}`}>
                                    {getResultLabel(game.result)}
                                </span>
                            </div>

                            <div className="game-card-info">
                                <p>
                                    <strong>Début</strong>
                                    {new Date(game.createdAt).toLocaleString()}
                                </p>

                                {game.endedAt && (
                                    <p>
                                        <strong>Fin</strong>
                                        {new Date(game.endedAt).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </article>
                    ))}
                </section>
            )}
        </main>
    );
}

export default History;