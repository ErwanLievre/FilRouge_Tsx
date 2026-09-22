import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext.tsx";
import Game from "./pages/Game";
import Games from "./pages/Games";
import History from "./pages/History";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <div className="app-shell">
                    <Navbar />

                    <main className="app-content">
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/Game" element={<Game />} />

                            <Route element={<ProtectedRoute />}>
                                <Route path="/" element={<Home />} />
                                <Route path="/games" element={<Games />} />
                                <Route path="/history" element={<History />} />
                            </Route>

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
