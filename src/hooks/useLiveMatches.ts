import useSWR from "swr";
import { getLiveMatches } from "../../lib/api";

const fetcher = (sport: string) => getLiveMatches(sport);

export const useLiveMatches = (sport: string = 'Football') => {

    const { data, error, isLoading,mutate} = useSWR(sport,fetcher,{
        refreshInterval: 30000
    });

    return {
        data: data || [],
        loading: isLoading,
        error: error? error.message : null,
        onRefresh: () => mutate(),
        refreshing: isLoading && !!data
    };

}
