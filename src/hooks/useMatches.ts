import useSWR from "swr";
import { getMatches } from "../../lib/api";

export const useMatches = (matchType: 'upcoming' | 'finished' = 'upcoming') => {
  const { data, error, isLoading, mutate } = useSWR(
    `supabase-matches-${matchType}`, 
    () => getMatches(matchType), 
    {
      refreshInterval: 60000, // Refresh každú minútu
      onError: (err) => {
        console.error('useMatches error:', err);
      },
    }
  );

  return {
    data: data || [],
    loading: isLoading,
    error: error ? error.message : null,
    onRefresh: () => mutate(),
    refreshing: isLoading && !!data,
  };
};
