import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getGames, createGame, cancelGame } from "../types/api";
import type { Game } from "../types/api";

function Games() {
    const navigate = useNavigate();
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGames();
    }, []);

    async function loadGames() {
        try {
            setGames(await getGames());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateGame() {
        try {
            const game = await createGame(2, 4);
            setGames(previous => [...previous, game]);
            navigate(`/game/${game.id}`);
        } catch (error) {
            console.error(error);
        }
    }

    async function handleCancelGame(game: Game) {
        const confirmed = window.confirm(
            "Voulez-vous vraiment arrêter cette partie ?\n\nElle sera déplacée dans l'historique."
        );

        if (!confirmed) return;

        try {
            await cancelGame(game);
            setGames(previous => previous.filter(item => item.id !== game.id));
        } catch (error) {
            console.error(error);
        }
    }

    if (loading) return <p>Chargement...</p>;

    return (
        <main className="games-page">
            <div className="page-header">
                <div>
                    <h1>Parties</h1>
                    <p>Vos parties en cours</p>
                </div>

                <button className="primary-button" onClick={handleCreateGame}>
                    + Nouvelle partie
                </button>
            </div>

            {games.length === 0 ? (
                <div className="empty-state">
                    <h2>Aucune partie en cours</h2>
                    <p>Créez une nouvelle partie pour commencer.</p>
                </div>
            ) : (
                <section className="games-grid">
                    {games.map((game, index) => (
                        <article className="game-card" key={game.id}>
                            <div className="game-card-header">
                                <span>Partie {index + 1}</span>
                                <span className="game-badge">En cours</span>
                            </div>

                            <div className="game-card-info">
                                <p>
                                    <strong>Début</strong>
                                    {new Date(game.createdAt).toLocaleString()}
                                </p>
                            </div>

                            <div className="game-card-actions">
                                <button
                                    className="primary-button"
                                    onClick={() => navigate(`/game/${game.id}`)}
                                >
                                    Reprendre
                                </button>

                                <button
                                    className="secondary-button danger"
                                    onClick={() => handleCancelGame(game)}
                                >
                                    Arrêter
                                </button>
                            </div>
                        </article>
                    ))}
                </section>
            )}
        </main>
    );
}

export default Games;