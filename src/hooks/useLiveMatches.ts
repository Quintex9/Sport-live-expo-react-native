import { useState, useEffect, useCallback } from 'react';
import { getLiveMatches } from '../../lib/api'; // Adjust path if needed
import { Match } from '../types/match';

export const useLiveMatches = (sport: string = 'football') => {
  const [data, setData] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMatches = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const result = await getLiveMatches(sport);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo sa načítať zápasy');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sport]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const onRefresh = () => {
    loadMatches(true);
  };

  return { data, loading, refreshing, error, onRefresh };
};

