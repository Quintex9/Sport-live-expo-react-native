export function normalizeMatch(m: any) {

  // FUTBAL
  if (m.fixture) return m;

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
