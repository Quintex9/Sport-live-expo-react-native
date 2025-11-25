import useSWR from "swr";
import { getMatchDetail } from "../../lib/api";

export const useMatchDetail = (fixtureId: string) => {
  const { data, error, isLoading } = useSWR(
    fixtureId ? `match-${fixtureId}` : null,
    () => getMatchDetail(fixtureId)
  );

  return {
    match: data,
    loading: isLoading,
    error: error ? error.message : null,
  };
};

