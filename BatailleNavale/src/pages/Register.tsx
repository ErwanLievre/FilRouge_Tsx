import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext.tsx";

function Register() {
    const { user, isLoading, error, register } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    if (user && !isLoading) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);

        if (!email.trim() || !password || !confirmation) {
            setFormError("Tous les champs sont obligatoires.");
            return;
        }

        if (password.length < 6) {
            setFormError(
                "Le mot de passe doit contenir au moins 6 caractères.",
            );
            return;
        }

        if (password !== confirmation) {
            setFormError("Les mots de passe ne correspondent pas.");
            return;
        }

        const success = await register(email, password);

        if (success) {
            navigate("/", { replace: true });
        }
    };

    return (
        <main className="auth-page">
            <section className="card auth-card">
                <h1>Créer un compte</h1>
                <p className="subtitle">
                    Créez votre compte pour jouer à la Bataille Navale.
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
                        autoComplete="new-password"
                        required
                    />

                    <label htmlFor="confirmation">
                        Confirmation du mot de passe
                    </label>
                    <input
                        id="confirmation"
                        type="password"
                        value={confirmation}
                        onChange={(event) =>
                            setConfirmation(event.target.value)
                        }
                        autoComplete="new-password"
                        required
                    />

                    <button
                        type="submit"
                        className="button"
                        disabled={isLoading}
                    >
                        {isLoading ? "Création..." : "Créer mon compte"}
                    </button>
                </form>

                {isLoading && <Loading message="Création du compte..." />}

                <p className="form-footer">
                    Vous avez déjà un compte ?{" "}
                    <Link to="/login">Se connecter</Link>
                </p>
            </section>
        </main>
    );
}

export default Register;
