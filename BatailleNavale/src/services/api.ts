import type { User } from "../types/auth";

/*
 * Adaptation temporaire en attendant le backend fourni par le professeur.
 *
 * Quand le backend sera disponible, ce fichier deviendra le seul endroit
 * à modifier pour remplacer les données temporaires par les vrais appels API.
 */

const STORAGE_KEY = "bataille-navale-user";

type StoredAccount = User & {
    password: string;
};

const getAccounts = (): StoredAccount[] => {
    const data = localStorage.getItem("bataille-navale-accounts");

    if (!data) {
        return [];
    }

    try {
        return JSON.parse(data) as StoredAccount[];
    } catch {
        return [];
    }
};

const saveAccounts = (accounts: StoredAccount[]) => {
    localStorage.setItem(
        "bataille-navale-accounts",
        JSON.stringify(accounts),
    );
};
export const register = async (
    email: string,
    password: string,
): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const accounts = getAccounts();
    const normalizedEmail = email.trim().toLowerCase();

    if (accounts.some((account) => account.email === normalizedEmail)) {
        throw new Error("Un compte existe déjà avec cet email.");
    }

    const user: User = { email: normalizedEmail };

    saveAccounts([...accounts, { ...user, password }]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

    return user;
};

export const login = async (
    email: string,
    password: string,
): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const normalizedEmail = email.trim().toLowerCase();
    const account = getAccounts().find(
        (item) => item.email === normalizedEmail,
    );

    if (!account || account.password !== password) {
        throw new Error("Email ou mot de passe incorrect.");
    }

    const user: User = { email: account.email };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

    return user;
};

export const logout = (): void => {
    localStorage.removeItem(STORAGE_KEY);
};

export const getCurrentUser = (): User | null => {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
        return null;
    }

    try {
        return JSON.parse(data) as User;
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        return null;
    }
};