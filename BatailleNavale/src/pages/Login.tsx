import { type FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";

function Login() {
    const { user, isLoading, error, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [formError, setFormError] = useState<string | null>(null);

    const from =
        (location.state as { from?: string } | null)?.from ?? "/";
    if (user && !isLoading) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);

        if (!email.trim() || !password) {
            setFormError("Tous les champs sont obligatoires.");
            return;
        }

        const success = await login(email, password);

        if (success) {
            navigate(from, { replace: true });
        }
    };

    return (
        <main className="auth-page">
            <section className="card auth-card">
                <h1>Connexion</h1>
                <p className="subtitle">
                    Connectez-vous pour accéder à vos parties.
                </p>

                <ErrorMessage message={formError ?? error} />

                <form onSubmit={handleSubmit} className="form">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        required
                    />

                    <label htmlFor="password">Mot de passe</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password"
                        required
                    />

                    <button
                        type="submit"
                        className="button"
                        disabled={isLoading}
                    >
                        {isLoading ? "Connexion..." : "Se connecter"}
                    </button>
                </form>

                {isLoading && <Loading message="Connexion en cours..." />}

                <p className="form-footer">
                    Pas encore de compte ?{" "}
                    <Link to="/register">Créer un compte</Link>
                </p>
            </section>
        </main>
    );
}

export default Login;
