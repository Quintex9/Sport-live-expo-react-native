import { SupabaseClient } from "../../lib/supabase";

export async function register(email: string, password: string) {
    const { data, error } = await SupabaseClient.auth.signUp({
        email,
        password,
    });

    if (error) throw error;

    return data;
}

export async function login(email: string, password: string) {
    const { data, error } = await SupabaseClient.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;

    return data;
}

export async function logout() {
    await SupabaseClient.auth.signOut();
}
