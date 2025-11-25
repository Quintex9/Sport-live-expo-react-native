import useSWR from "swr";
import { getMatches } from "../../lib/api";

export const useMatches = () => {
  const { data, error, isLoading, mutate } = useSWR('supabase-matches', getMatches, {
    refreshInterval: 60000, // Refresh každú minútu
  });

  return {
    data: data || [],
    loading: isLoading,
    error: error ? error.message : null,
    onRefresh: () => mutate(),
    refreshing: isLoading && !!data,
  };
};

