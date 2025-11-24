// Definícia TypeScript rozhrania pre dáta zápasu z API
export interface Match {
  id?: number;
  fixture?: {
    id: number;
    date: string; // ISO dátum zápasu
    status: {
      elapsed: number; // Odohrané minúty
      long: string;    // Dlhý popis stavu (napr. "Match Finished")
      short: string;   // Skratka stavu (napr. "FT", "1H")
    };
    venue: {
      name: string;
      city: string;
    };
    referee: string;
  };
  league?: {
    name: string;
    country: string;
    logo?: string;
    flag?: string;
  };
  teams: {
    home: {
      name: string;
      logo?: string;
      winner?: boolean; // True, ak vyhrali
    };
    away: {
      name: string;
      logo?: string;
      winner?: boolean;
    };
  };
  goals: {
    home: number | null; // Počet gólov (null ak ešte nezačalo)
    away: number | null;
  };
}
