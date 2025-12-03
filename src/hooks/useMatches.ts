import useSWR from "swr";
import { getMatches } from "../../lib/api";

export const useMatches = () => {
  const { data, error, isLoading, mutate } = useSWR('supabase-matches', getMatches, {
    refreshInterval: 60000, // Refresh každú minútu
    onError: (err) => {
      console.error('useMatches error:', err);
    },
    onSuccess: (data) => {
      console.log('useMatches loaded:', data?.length || 0, 'matches');
    },
  });

  return {
    data: data || [],
    loading: isLoading,
    error: error ? error.message : null,
    onRefresh: () => mutate(),
    refreshing: isLoading && !!data,
  };
};

