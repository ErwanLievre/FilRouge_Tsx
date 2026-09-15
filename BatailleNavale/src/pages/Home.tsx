import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Home() {
    const { user } = useAuth();

    return (
        <main className="page">
            <section className="hero">
                <h1>Bienvenue sur Bataille Navale</h1>
                <p>
                    Bonjour {user?.email}. Préparez votre flotte et affrontez
                    vos adversaires au tour par tour.
                </p>

                <div className="actions">
                    <Link to="/games" className="button">
                        Voir mes parties
                    </Link>
                    <Link to="/history" className="button button-secondary">
                        Voir mon historique
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default Home;
