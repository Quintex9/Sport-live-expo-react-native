export interface Match {
  fixture: {
    id: number;
    date: string;
    status: {
      elapsed: number;
      long: string;
      short: string;
    };
    venue: {
      name: string;
      city: string;
    };
    referee: string;
  };
  league: {
    name: string;
    country: string;
    logo?: string;
    flag?: string;
  };
  teams: {
    home: {
      name: string;
      logo?: string;
      winner?: boolean;
    };
    away: {
      name: string;
      logo?: string;
      winner?: boolean;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

