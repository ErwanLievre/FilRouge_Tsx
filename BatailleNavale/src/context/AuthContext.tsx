import {
    createContext,
    useContext,
    useEffect,
    useReducer,
    type ReactNode,
} from "react";

import {
    login as apiLogin,
    logout as apiLogout,
    register as apiRegister,
    getCurrentUser,
} from "../services/api";

import type { AuthAction, AuthState } from "../types/auth";

type AuthContextValue = AuthState & {
    login: (email: string, password: string) => Promise<boolean>;
    register: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    clearError: () => void;
};

const initialState: AuthState = {
    user: null,
    isLoading: true,
    error: null,
};

const authReducer = (
    state: AuthState,
    action: AuthAction,
): AuthState => {
    switch (action.type) {
        case "LOGIN_START":
        case "REGISTER_START":
            return {
                ...state,
                isLoading: true,
                error: null,
            };

        case "LOGIN_SUCCESS":
        case "REGISTER_SUCCESS":
            return {
                user: action.payload,
                isLoading: false,
                error: null,
            };

        case "LOGIN_ERROR":
        case "REGISTER_ERROR":
            return {
                ...state,
                isLoading: false,
                error: action.payload,
            };

        case "LOGOUT":
            return {
                user: null,
                isLoading: false,
                error: null,
            };

        case "CLEAR_ERROR":
            return {
                ...state,
                error: null,
            };

        default:
            return state;
    }
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
    children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const user = getCurrentUser();

        if (user) {
            dispatch({
                type: "LOGIN_SUCCESS",
                payload: user,
            });
        } else {
            dispatch({ type: "LOGOUT" });
        }
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        dispatch({ type: "LOGIN_START" });

        try {
            const user = await apiLogin(email, password);

            dispatch({
                type: "LOGIN_SUCCESS",
                payload: user,
            });

            return true;
        } catch (error) {
            dispatch({
                type: "LOGIN_ERROR",
                payload:
                    error instanceof Error
                        ? error.message
                        : "Une erreur est survenue.",
            });

            return false;
        }
    };

    const register = async (
        email: string,
        password: string,
    ): Promise<boolean> => {
        dispatch({ type: "REGISTER_START" });

        try {
            const user = await apiRegister(email, password);

            dispatch({
                type: "REGISTER_SUCCESS",
                payload: user,
            });

            return true;
        } catch (error) {
            dispatch({
                type: "REGISTER_ERROR",
                payload:
                    error instanceof Error
                        ? error.message
                        : "Une erreur est survenue.",
            });

            return false;
        }
    };

    const logout = () => {
        apiLogout();
        dispatch({ type: "LOGOUT" });
    };

    const clearError = () => {
        dispatch({ type: "CLEAR_ERROR" });
    };

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                register,
                logout,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth doit être utilisé à l'intérieur de AuthProvider.",
        );
    }

    return context;
};