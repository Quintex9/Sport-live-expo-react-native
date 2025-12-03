import 'react-native-url-polyfill/auto';
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
// @ts-ignore
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

let SupabaseClient: ReturnType<typeof createClient>;

try {
  const supabaseUrl = SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = SUPABASE_ANON_KEY || 'placeholder-key';

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables!', { SUPABASE_URL, SUPABASE_ANON_KEY });
  }

  SupabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
} catch (error) {
  console.error('Failed to initialize Supabase:', error);
  // Fallback client
  SupabaseClient = createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export { SupabaseClient };