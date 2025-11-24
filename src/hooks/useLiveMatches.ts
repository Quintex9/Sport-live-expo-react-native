import { useState, useEffect, useCallback } from 'react';
import { getLiveMatches } from '../../lib/api'; 
import { Match } from '../types/match';

// Custom hook pre načítanie a správu živých zápasov
export const useLiveMatches = (sport: string = 'football') => {
  const [data, setData] = useState<Match[]>([]); // Dáta zápasov
  const [loading, setLoading] = useState(true);  // Indikátor prvotného načítania
  const [refreshing, setRefreshing] = useState(false); // Indikátor "pull-to-refresh"
  const [error, setError] = useState<string | null>(null); // Chybová správa

  // Funkcia na načítanie dát (používa sa pri inite aj refreshi)
  const loadMatches = useCallback(async (isRefresh = false) => {
    try {
      // Nastavíme správny indikátor načítania
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Volanie API
      const result = await getLiveMatches(sport);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo sa načítať zápasy');
    } finally {
      // Vypneme indikátory po dokončení
      setLoading(false);
      setRefreshing(false);
    }
  }, [sport]);

  // reset pri zmene športu
  useEffect(() => {
    setData([])
    setLoading(true);
    loadMatches();
  }, [sport]);

  // Handler pre manuálne obnovenie (napr. potiahnutím zoznamu)
  const onRefresh = () => {
    loadMatches(true);
  };

  return { data, loading, refreshing, error, onRefresh };
};
