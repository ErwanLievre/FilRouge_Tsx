import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (!user) {
        return null;
    }

    return (
        <nav className="navbar">
            <NavLink to="/" className="navbar-brand">
                ⚓ Bataille Navale
            </NavLink>

            <div className="navbar-links">
                <NavLink
                    to="/"
                    className={({ isActive }: { isActive: boolean }) =>
                        isActive ? "nav-link active" : "nav-link"
                    }
                >
                    Accueil
                </NavLink>

                <NavLink
                    to="/games"
                    className={({ isActive }: { isActive: boolean }) =>
                        isActive ? "nav-link active" : "nav-link"
                    }
                >
                    Parties
                </NavLink>

                <NavLink
                    to="/history"
                    className={({ isActive }: { isActive: boolean }) =>
                        isActive ? "nav-link active" : "nav-link"
                    }
                >
                    Historique
                </NavLink>

                <span className="navbar-user">{user.email}</span>

                <button
                    type="button"
                    className="button button-secondary"
                    onClick={handleLogout}
                >
                    Déconnexion
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
