export type User = {
    id: number;
    email: string;
    profilePicture?: string | null;
};

export type AuthSession = { token: string; user: User };

export type AuthState = {
    user: User | null;
    isLoading: boolean;
    error: string | null;
};

export type AuthAction =
    | { type: "LOGIN_START" }
    | { type: "LOGIN_SUCCESS"; payload: User }
    | { type: "LOGIN_ERROR"; payload: string }
    | { type: "REGISTER_START" }
    | { type: "REGISTER_SUCCESS"; payload: User }
    | { type: "REGISTER_ERROR"; payload: string }
    | { type: "LOGOUT" }
    | { type: "CLEAR_ERROR" };
