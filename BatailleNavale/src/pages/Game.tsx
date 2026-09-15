import { useParams } from "react-router-dom";

function Game() {
    const { id } = useParams<{ id: string }>();

    return (
        <main className="page">
            <section className="card">
                <h1>Bataille Navale</h1>
                <p>Partie : {id}</p>
                <p>
                    L'interface de jeu sera réalisée par la personne
                    responsable de la Bataille Navale.
                </p>
            </section>
        </main>
    );
}

export default Game;
