import Constants from "expo-constants";
import { normalizeMatch, normalizeSupabaseMatch } from "../src/utils/normalizeMatch";
import {SupabaseClient} from "../lib/supabase"
// Načítanie API kľúča z konfigurácie (env premenné)
const API_KEY = Constants.expoConfig?.extra?.APISPORTS_KEY;

// Dnešný dátum
const today = new Date().toISOString().split("T")[0];


if (!API_KEY) {
  console.warn("APISPORTS_KEY is missing! Check .env or app.config.js");
}

// Mapovanie športov na konkrétne API endpointy pre live výsledky
const LIVE_API: Record<string, string> = {
  football: `https://v3.football.api-sports.io/fixtures?live=all`,
  basketball: `https://v1.basketball.api-sports.io/games?date=${today}`,
  baseball: `https://v1.baseball.api-sports.io/games?date=${today}`,
  nfl: `https://v1.american-football.api-sports.io/games?live=all`, // NFL live funguje
  hockey: `https://v1.hockey.api-sports.io/games?date=${today}`,
  handball: `https://v1.handball.api-sports.io/games?date=${today}`,
};

const HOSTS: Record<string, string> = {
  football: "v3.football.api-sports.io",
  basketball: "v1.basketball.api-sports.io",
  baseball: "v1.baseball.api-sports.io",
  nfl: "v1.american-football.api-sports.io",
  hockey: "v1.hockey.api-sports.io",
  handball: "v1.handball.api-sports.io",
};

function scoreOrder(status: string) {
  if (status !== "FT" && status !== "NS") return 0;  // LIVE
  if (status === "NS") return 1;                    // Not started
  if (status === "FT") return 2;                    // Finished
  return 3;
}




// Funkcia na získanie živých zápasov podľa športu
export async function getLiveMatches(sport: string) {
  console.log('getLiveMatches called for:', sport, 'API_KEY exists:', !!API_KEY);
  const url = LIVE_API[sport];

  if (!url) {
    throw new Error("Neznámy šport: " + sport);
  }

  // Volanie API s hlavičkou pre autentifikáciu
  if (!API_KEY) {
    throw new Error("APISPORTS_KEY is missing! Check .env or app.config.js");
  }

  const res = await fetch(url, {
    headers: {
      "x-apisports-key": API_KEY,
      "x-rapidapi-host": HOSTS[sport],
    },
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error("API error: " + msg);
  }

  const data = await res.json();
  // Vráti pole zápasov (response) alebo prázdne pole
  const response = data.response ?? [];

  return response.map(normalizeMatch).sort((a: any, b: any) => scoreOrder(a.fixture.status.short) - scoreOrder(b.fixture.status.short));
}

export async function getMatches() {
  console.log('getMatches called, Supabase configured:', !!SupabaseClient);
  try {
    const now = new Date();
    const twoDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
    const nowISO = now.toISOString();
    
    // Live statusy ktoré nechceme v zozname
    const liveStatuses = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'];
    
    const { data, error } = await SupabaseClient
      .from('fixtures')
      .select('*, home_team:teams!home_team_id(id,name,logo), away_team:teams!away_team_id(id,name,logo)')
      .gte('date', twoDaysAgo)
      .lt('date', todayEnd)
      .order('date', { ascending: true })
      .limit(50);
    
    
    if (error) return [];
    
    // Filter: všetko okrem live zápasov, NS len ak ešte nezačal
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString();
    
    const filtered = (data || []).filter((m: any) => {
      // Live statusy - nikdy nezobrazuj
      if (liveStatuses.includes(m.status_short)) return false;
      // NS ktoré už mali začať - nezobrazuj (pravdepodobne live)
      if (m.status_short === 'NS' && m.date <= nowISO) return false;
      // Zápas starší ako 3h bez FT statusu - pravdepodobne skončil ale DB sa neaktualizovala
      if (m.status_short !== 'FT' && m.date < threeHoursAgo) return false;
      return true;
    });
    
    const result = filtered.map(normalizeSupabaseMatch);
    console.log('getMatches returning:', result.length, 'matches');
    return result;
  } catch (e) {
    // Ak Supabase nie je nakonfigurované, vráť prázdne pole
    console.error('getMatches error:', e);
    return [];
  }
}

// Načítanie detailu zápasu - všetko z API
export async function getMatchDetail(fixtureId: string) {
  if (!API_KEY) {
    throw new Error("APISPORTS_KEY is missing!");
  }
  const headers = { "x-apisports-key": API_KEY, "x-rapidapi-host": "v3.football.api-sports.io" };
  
  // Načítame všetky dáta o zápase paralelne
  const [fixtureRes, eventsRes, statsRes, lineupsRes] = await Promise.all([
    fetch(`https://v3.football.api-sports.io/fixtures?id=${fixtureId}`, { headers }).then(r => r.json()).catch(() => ({ response: [] })),
    fetch(`https://v3.football.api-sports.io/fixtures/events?fixture=${fixtureId}`, { headers }).then(r => r.json()).catch(() => ({ response: [] })),
    fetch(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixtureId}`, { headers }).then(r => r.json()).catch(() => ({ response: [] })),
    fetch(`https://v3.football.api-sports.io/fixtures/lineups?fixture=${fixtureId}`, { headers }).then(r => r.json()).catch(() => ({ response: [] })),
  ]);


  const fixture = fixtureRes.response?.[0];
  if (!fixture) return null;

  // H2H
  const h2hRes = await fetch(
    `https://v3.football.api-sports.io/fixtures/headtohead?h2h=${fixture.teams.home.id}-${fixture.teams.away.id}&last=5`,
    { headers }
  ).then(r => r.json()).catch(() => ({ response: [] }));

  return {
    ...fixture,
    events: eventsRes.response || [],
    statistics: statsRes.response || [],
    lineups: lineupsRes.response || [],
    h2h: (h2hRes.response || []).slice(0, 5),
  };
}

/* -------------------------------------------
   FUTBAL – DETAILY TÍMU (HEADER)
-------------------------------------------- */

export async function getTeamHeader(teamId: string) {
  if (!API_KEY) {
    throw new Error("APISPORTS_KEY is missing!");
  }
  const res = await fetch(
    `https://v3.football.api-sports.io/teams?id=${teamId}`,
    {
      headers: {
        "x-apisports-key": API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io",
      },
    }
  );

  const data = await res.json();
  return data.response?.[0] ?? null;
}

/* -------------------------------------------
   FUTBAL – ŠTATISTIKY TÍMU
-------------------------------------------- */
export async function getTeamStatistics(teamId: string, league: string, season: string) {
  if (!API_KEY) {
    throw new Error("APISPORTS_KEY is missing!");
  }
  const res = await fetch(
    `https://v3.football.api-sports.io/teams/statistics?team=${teamId}&league=${league}&season=${season}`,
    {
      headers: {
        "x-apisports-key": API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io",
      },
    }
  );

  const data = await res.json();
  return data.response ?? null;
}

/* -------------------------------------------
   FUTBAL – HRÁČI TÍMU
-------------------------------------------- */
export async function getTeamPlayers(teamId: string, season: string) {
  if (!API_KEY) {
    throw new Error("APISPORTS_KEY is missing!");
  }
  const res = await fetch(
    `https://v3.football.api-sports.io/players?team=${teamId}&season=${season}`,
    {
      headers: {
        "x-apisports-key": API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io",
      },
    }
  );

  const data = await res.json();
  return data.response ?? [];
}

/* -------------------------------------------
   FUTBAL – TABUĽKA LIGY
-------------------------------------------- */
export async function getStandings(league: string, season: string) {
  if (!API_KEY) {
    throw new Error("APISPORTS_KEY is missing!");
  }
  const res = await fetch(
    `https://v3.football.api-sports.io/standings?league=${league}&season=${season}`,
    {
      headers: {
        "x-apisports-key": API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io",
      },
    }
  );

  const data = await res.json();

  // vracia pole standings pre všetky tímy
  return data.response?.[0]?.league?.standings?.[0] ?? [];
}

