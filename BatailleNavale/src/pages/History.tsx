import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHistory, markGameSeen } from "../services/api";
import type { Game } from "../types/game";

function History() {
    const [games, setGames] = useState<Game[]>([]); const [error, setError] = useState<string | null>(null);
    const load = async () => { try { setGames(await getHistory()); } catch (e) { setError(e instanceof Error ? e.message : "Impossible de charger l'historique."); } };
    useEffect(() => { void load(); }, []);
    return <main className="page"><section className="card"><h1>Historique</h1>{error && <p role="alert">{error}</p>}
        {games.length === 0 ? <p>Aucune partie terminée.</p> : games.map((game) => <article key={game.id} className="card" style={{ marginTop: 16 }}><h2>Partie #{game.id}</h2><p>Joueurs : {game.players.map((p) => p.email).join(", ")}</p><p>{game.endData ? "Résultat enregistré." : "Partie terminée."}</p><Link className="button" to={`/games/${game.id}`}>Voir</Link><button className="button button-secondary" style={{ marginLeft: 8 }} onClick={() => void markGameSeen(game.id).then(load).catch((e: unknown) => setError(e instanceof Error ? e.message : "Erreur"))}>Marquer comme vue</button></article>)}
    </section></main>;
}

export default History;
