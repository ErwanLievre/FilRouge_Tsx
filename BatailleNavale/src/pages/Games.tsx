import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createGame, getMyGames, invitePlayer, startGame } from "../services/api";
import type { Game } from "../types/game";
import { useAuth } from "../context/AuthContext";

const initialGameState = JSON.stringify({ phase: "placing", boards: {} });

function Games() {
    const { user } = useAuth();
    const [games, setGames] = useState<Game[]>([]);
    const [inviteEmail, setInviteEmail] = useState<Record<number, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const load = async () => { setLoading(true); try { setGames(await getMyGames()); setError(null); } catch (e) { setError(e instanceof Error ? e.message : "Impossible de charger les parties."); } finally { setLoading(false); } };
    useEffect(() => { void load(); }, []);
    const run = async (action: () => Promise<unknown>) => { try { await action(); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Une erreur est survenue."); } };

    return <main className="page"><section className="card">
        <h1>Mes parties</h1><p>Créez une partie à deux, invitez un compte existant, puis placez vos flottes chacun votre tour.</p>
        <button className="button" onClick={() => void run(createGame)}>Créer une partie</button>
        <button className="button button-secondary" style={{ marginLeft: 8 }} onClick={() => void load()}>Actualiser</button>
        {error && <p role="alert">{error}</p>}
        {loading ? <p>Chargement…</p> : games.length === 0 ? <p>Aucune partie en cours.</p> : games.map((game) => <article key={game.id} className="card" style={{ marginTop: 16 }}>
            <h2>Partie #{game.id} — {game.status === "pending" ? "en attente" : game.status === "started" ? "en cours" : "terminée"}</h2>
            <p>Joueurs : {game.players.map((player) => player.email).join(", ")}</p>
            {game.status === "pending" && game.players.length < 2 && game.creatorId === user?.id && <div><input aria-label={`Email à inviter dans la partie ${game.id}`} type="email" placeholder="email@exemple.fr" value={inviteEmail[game.id] ?? ""} onChange={(e) => setInviteEmail({ ...inviteEmail, [game.id]: e.target.value })} /><button className="button" onClick={() => void run(() => invitePlayer(game.id, inviteEmail[game.id] ?? ""))}>Inviter</button></div>}
            {game.status === "pending" && game.players.length === 2 && game.creatorId === user?.id && <button className="button" onClick={() => void run(() => startGame(game.id, initialGameState, game.creatorId))}>Démarrer</button>}
            {(game.status === "started" || game.status === "ended") && <Link className="button" to={`/games/${game.id}`}>Ouvrir la partie</Link>}
        </article>)}
    </section></main>;
}

export default Games;
