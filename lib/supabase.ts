import 'react-native-url-polyfill/auto';
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
// @ts-ignore
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables!', { SUPABASE_URL, SUPABASE_ANON_KEY });
}

export const SupabaseClient = createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{
    auth:{
        storage:AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});