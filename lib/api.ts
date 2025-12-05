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
  // Vrátí pole zápasov (response) alebo prázdne pole
  const response = data.response ?? [];

  return response.map(normalizeMatch).sort((a: any, b: any) => scoreOrder(a.fixture.status.short) - scoreOrder(b.fixture.status.short));
}

export async function getMatches(matchType: 'upcoming' | 'finished' = 'upcoming') {
  try {
    const now = new Date();
    const twoDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
    const nowISO = now.toISOString();
    
    // Live statusy ktoré nechceme v zozname
    const liveStatuses = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'];
    
    const { data, error } = await SupabaseClient
      .from('fixtures')
      .select('*, home_team:teams!home_team_id(id,name,logo), away_team:teams!away_team_id(id,name,logo), league:leagues!league_id(id,name,logo,country_code)')
      .gte('date', twoDaysAgo)
      .lt('date', todayEnd)
      .order('date', { ascending: true })
      .limit(50);
    
    
    if (error) {
      console.error('getMatches Supabase error:', error);
      return [];
    }
    // Filter podľa typu zápasov
    const filtered = (data || []).filter((m: any) => {
      // Live statusy - nikdy nezobrazuj
      if (liveStatuses.includes(m.status_short)) {
        return false;
      }
      
      if (matchType === 'upcoming') {
        // NS zápasy - zobraz len ak sú v budúcnosti (upcoming)
        if (m.status_short === 'NS') {
          const isUpcoming = m.date > nowISO;
          return isUpcoming;
        }
        
        // Iné statusy (napr. CANC, POSTP) - zobraz len ak sú v budúcnosti
        if (m.date > nowISO) {
          return true;
        }
        
        return false;
      } else {
        // Finished zápasy - zobraz len FT
        if (m.status_short === 'FT') {
          return true;
        }
        
        return false;
      }
    });
    
    // Načítanie názvov lig z API pre všetky ligy v finished zápasoch
    const uniqueLeagueIds = new Set(
      filtered
        .map((m: any) => m.league_id)
        .filter((id: any) => id)
    );
    
    const leagueNamesMap = new Map<number, string>();
    if (uniqueLeagueIds.size > 0 && API_KEY) {
      try {
        const leagueIdsArray = Array.from(uniqueLeagueIds);
        // Načítame názvy lig z API (max 10 naraz kvôli rate limit)
        const leaguePromises = leagueIdsArray.slice(0, 10).map(async (leagueId) => {
          try {
            const res = await fetch(
              `https://v3.football.api-sports.io/leagues?id=${leagueId}`,
              {
                headers: {
                  "x-apisports-key": API_KEY,
                  "x-rapidapi-host": "v3.football.api-sports.io",
                },
              }
            );
            if (!res.ok) return null;
            const apiData = await res.json();
            const league = apiData.response?.[0]?.league;
            if (league?.name) {
              return { id: leagueId, name: league.name };
            }
          } catch (e) {
            // Ignoruj chyby pri načítaní jednotlivých lig
          }
          return null;
        });
        
        const results = await Promise.all(leaguePromises);
        results.forEach((result) => {
          if (result) {
            leagueNamesMap.set(result.id, result.name);
          }
        });
      } catch (e) {
        // Ignoruj chyby pri načítaní názvov lig
      }
    }
    
    const result = filtered.map((m: any) => {
      const normalized = normalizeSupabaseMatch(m);
      // Použi názov z API ak existuje, inak použij z databázy
      if (m.league_id && leagueNamesMap.has(m.league_id)) {
        const apiName = leagueNamesMap.get(m.league_id);
        if (apiName) {
          normalized.league.name = apiName;
        }
      }
      // Ak stále nemá názov, použij fallback
      if (!normalized.league.name || normalized.league.name.trim() === '') {
        normalized.league.name = `Liga ${m.league_id}`;
      }
      return normalized;
    });
    return result;
  } catch (e) {
    // Ak Supabase nie je nakonfigurovaný, vráť prázdne pole
    console.error('getMatches error:', e);
    return [];
  }
}

// Načítanie detailu zápasu - najprv API, ak prázdne tak Supabase
export async function getMatchDetail(fixtureId: string) {
  if (!API_KEY) {
    throw new Error("APISPORTS_KEY is missing!");
  }
  const headers = { "x-apisports-key": API_KEY, "x-rapidapi-host": "v3.football.api-sports.io" };

  // Fallback: ak API nenájde zápas, skús Supabase
  const loadFromSupabase = async () => {
    // Načítanie základných dát zápasu
    const { data: fixtureData, error: fixtureError } = await SupabaseClient
      .from('fixtures')
      .select('*, home_team:home_team_id(id,name,logo), away_team:away_team_id(id,name,logo), venue:venues!venue_id(*)')
      .eq('id', fixtureId)
      .single();

    if (fixtureError || !fixtureData) {
      console.error('getMatchDetail: Supabase fallback failed', fixtureError);
      return null;
    }

    const dbData = fixtureData as any;

    // Načítanie eventov z DB
    const { data: eventsData } = await SupabaseClient
      .from('fixture_events')
      .select('*')
      .eq('fixture_id', fixtureId)
      .order('time_elapsed', { ascending: true });

    // Konverzia eventov na formát API
    const events = (eventsData || []).map((e: any) => ({
      time: {
        elapsed: e.time_elapsed ?? 0,
        extra: e.time_extra ?? null,
      },
      team: {
        id: e.team_id,
      },
      player: {
        id: e.player_id_api,
        name: e.player_name,
      },
      assist: e.assist_name ? {
        id: e.assist_id_api,
        name: e.assist_name,
      } : null,
      type: e.type,
      detail: e.detail,
      comments: e.comments,
      period: e.period,
      // DB metadata
      dbInfo: {
        id: e.id,
        created_at: e.created_at,
        updated_at: e.updated_at,
      },
    }));

    // Načítanie zostáv z DB
    const { data: lineupsData } = await SupabaseClient
      .from('fixture_lineups')
      .select('*, team:team_id(id,name,logo)')
      .eq('fixture_id', fixtureId);

    // Načítanie hráčov pre zostavy z fixture_lineup_players
    const lineups = await Promise.all((lineupsData || []).map(async (l: any) => {
      const { data: playersData } = await SupabaseClient
        .from('fixture_lineup_players')
        .select('*')
        .eq('fixture_id', fixtureId)
        .eq('team_id', l.team_id)
        .order('is_starting', { ascending: false })
        .order('number', { ascending: true });

      const startXI = (playersData || [])
        .filter((p: any) => p.is_starting === true)
        .map((p: any) => ({
          player: {
            id: p.player_id_api,
            name: p.player_name,
            number: p.number,
            pos: p.position,
            grid: p.grid,
          },
        }));

      const substitutes = (playersData || [])
        .filter((p: any) => p.is_starting === false)
        .map((p: any) => ({
          player: {
            id: p.player_id_api,
            name: p.player_name,
            number: p.number,
            pos: p.position,
          },
        }));

      return {
        team: l.team || { id: l.team_id, name: `Team ${l.team_id}`, logo: l.team?.logo },
        coach: {
          id: l.coach_id_api,
          name: l.coach_name,
        },
        formation: l.formation,
        startXI: startXI,
        substitutes: substitutes,
      };
    }));

    // Načítanie štatistík z DB
    const { data: statsData } = await SupabaseClient
      .from('fixture_team_stats')
      .select('*, team:team_id(id,name)')
      .eq('fixture_id', fixtureId);

    // Konverzia štatistík na formát API
    const statistics = (statsData || []).map((s: any) => {
      const passesAccuracy = s.passes_total && s.passes_accurate 
        ? Math.round((s.passes_accurate / s.passes_total) * 100) 
        : 0;
      
      return {
        team: s.team || { id: s.team_id },
        statistics: [
          { type: 'Ball Possession', value: s.ball_possession ? `${s.ball_possession}%` : '0%' },
          { type: 'Total Shots', value: s.shots_total ?? 0 },
          { type: 'Shots on Goal', value: s.shots_on_target ?? 0 },
          { type: 'Shots off Goal', value: s.shots_off_target ?? 0 },
          { type: 'Shots Blocked', value: s.shots_blocked ?? 0 },
          { type: 'Shots insidebox', value: s.shots_inside_box ?? 0 },
          { type: 'Shots outsidebox', value: s.shots_outside_box ?? 0 },
          { type: 'Corner Kicks', value: s.corners ?? 0 },
          { type: 'Fouls', value: s.fouls ?? 0 },
          { type: 'Offsides', value: s.offsides ?? 0 },
          { type: 'Yellow Cards', value: s.yellow_cards ?? 0 },
          { type: 'Red Cards', value: s.red_cards ?? 0 },
          { type: 'Total passes', value: s.passes_total ?? 0 },
          { type: 'Passes accurate', value: s.passes_accurate ?? 0 },
          { type: 'Passes %', value: `${passesAccuracy}%` },
          { type: 'expected_goals', value: s.expected_goals_xg ? parseFloat(s.expected_goals_xg).toFixed(2) : '0.00' },
        ].filter(stat => stat.value !== null && stat.value !== undefined),
        // DB metadata a raw data
        dbInfo: {
          created_at: s.created_at,
          updated_at: s.updated_at,
          raw: {
            shots_total: s.shots_total,
            shots_on_target: s.shots_on_target,
            shots_off_target: s.shots_off_target,
            shots_blocked: s.shots_blocked,
            shots_inside_box: s.shots_inside_box,
            shots_outside_box: s.shots_outside_box,
            passes_total: s.passes_total,
            passes_accurate: s.passes_accurate,
            expected_goals_xg: s.expected_goals_xg,
          },
        },
      };
    });

    const fallback = {
      fixture: {
        id: dbData.id,
        date: dbData.date,
        status: {
          elapsed: 0,
          long: dbData.status_long ?? "",
          short: dbData.status_short ?? "NS",
        },
        venue: { 
          name: dbData.venue?.name ?? "", 
          city: dbData.venue?.city ?? "",
          id: dbData.venue_id ?? null,
        },
        referee: "", // DB nemá referee stĺpec v fixtures tabuľke
        timezone: dbData.timezone ?? "UTC",
      },
      teams: {
        home: dbData.home_team || { id: dbData.home_team_id, name: `Team ${dbData.home_team_id}`, logo: dbData.home_team?.logo },
        away: dbData.away_team || { id: dbData.away_team_id, name: `Team ${dbData.away_team_id}`, logo: dbData.away_team?.logo },
      },
      goals: { 
        home: dbData.goals_home ?? 0, 
        away: dbData.goals_away ?? 0,
        halftime: {
          home: null, // DB nemá halftime skóre v fixtures tabuľke
          away: null,
        },
      },
      league: { 
        id: dbData.league_id, 
        name: dbData.league_name ?? "",
        season: dbData.season, 
        round: dbData.round,
        country: dbData.country ?? "",
      },
      events: events,
      statistics: statistics,
      lineups: lineups,
      h2h: [],
      source: 'supabase',
      // Dodatočné DB informácie
      dbInfo: {
        created_at: dbData.created_at,
        updated_at: dbData.updated_at,
        details_synced_at: dbData.details_synced_at,
        fixture_id: dbData.id,
        venue_id: dbData.venue_id,
        timezone: dbData.timezone,
        status_short: dbData.status_short,
        status_long: dbData.status_long,
      },
    };

    return fallback;
  };

  try {
    const fetchJson = async (url: string) => {
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`API ${res.status} ${res.statusText}`);
      return res.json();
    };

    // Načítame všetky dáta o zápase paralelne
    const [fixtureRes, eventsRes, statsRes, lineupsRes] = await Promise.all([
      fetchJson(`https://v3.football.api-sports.io/fixtures?id=${fixtureId}`).catch(() => ({ response: [] })),
      fetchJson(`https://v3.football.api-sports.io/fixtures/events?fixture=${fixtureId}`).catch(() => ({ response: [] })),
      fetchJson(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixtureId}`).catch(() => ({ response: [] })),
      fetchJson(`https://v3.football.api-sports.io/fixtures/lineups?fixture=${fixtureId}`).catch(() => ({ response: [] })),
    ]);

    const fixture = fixtureRes.response?.[0];
    if (!fixture) {
      return await loadFromSupabase();
    }

    // H2H
    const h2hRes = await fetchJson(
      `https://v3.football.api-sports.io/fixtures/headtohead?h2h=${fixture.teams.home.id}-${fixture.teams.away.id}&last=5`
    ).catch(() => ({ response: [] }));

    const result = {
      ...fixture,
      events: eventsRes.response || [],
      statistics: statsRes.response || [],
      lineups: lineupsRes.response || [],
      h2h: (h2hRes.response || []).slice(0, 5),
      source: 'api',
    };
    return result;
  } catch (err) {
    return await loadFromSupabase();
  }
}

/* -------------------------------------------
   FUTBAL – DETaily Tímu (HEADER)
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
   FUTBAL – ŠTATISTIKY Tímu
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
   FUTBAL – HRÁČI Tímu
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
