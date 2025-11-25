export function normalizeMatch(m: any) {

  // FUTBAL - zachovaj aj eventy ak existujú
  if (m.fixture) {
    return {
      ...m,
      events: m.events || [],
    };
  }

  // SKÓRE – extrakcia podľa športu
  let homeScore = 0;
  let awayScore = 0;

  // Basketball + Baseball + Hockey (V1)
  if (m.scores) {
    
    if (typeof m.scores.home === "object") {
      homeScore = m.scores.home.total ?? 0;
      awayScore = m.scores.away.total ?? 0;
    }
    // Ak je to priamo číslo (napr. hockey)
    else {
      homeScore = m.scores.home ?? 0;
      awayScore = m.scores.away ?? 0;
    }
  }

  // Handball – iný názov poľa
  if (m.score) {
    homeScore = m.score.home ?? homeScore;
    awayScore = m.score.away ?? awayScore;
  }

  // Dátum – V1 má rôzne formáty
  const date =
    m.date?.start ??
    m.date?.timestamp ??
    m.date ??
    "";

  return {
    fixture: {
      id: m.id,
      date: date,
      status: {
        elapsed: m.status?.elapsed ?? 0,
        long: m.status?.long ?? "",
        short: m.status?.short ?? "",
      },
      venue: {
        name: m.venue?.name ?? "",
        city: m.venue?.city ?? "",
      },
      referee: m.officials?.[0]?.name ?? ""
    },

    teams: m.teams,

    goals: {
      home: homeScore,
      away: awayScore,
    },

    league: m.league ?? {}
  };
}

// Normalizácia Supabase záznamu na rovnaký formát
export const normalizeSupabaseMatch = (m: any) => ({
  fixture: { id: m.id, date: m.date, status: { elapsed: 0, long: m.status_long ?? "", short: m.status_short ?? "NS" }, venue: { name: "", city: "" }, referee: "" },
  teams: {
    home: { id: m.home_team_id, name: m.home_team?.name ?? `Tím ${m.home_team_id}`, logo: m.home_team?.logo },
    away: { id: m.away_team_id, name: m.away_team?.name ?? `Tím ${m.away_team_id}`, logo: m.away_team?.logo },
  },
  goals: { home: m.goals_home ?? 0, away: m.goals_away ?? 0 },
  league: { id: m.league_id, name: "", season: m.season, round: m.round }
});