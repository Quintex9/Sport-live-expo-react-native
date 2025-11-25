import Constants from "expo-constants";
import { normalizeMatch } from "../src/utils/normalizeMatch";

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
  console.log("LIVE DATA:", data); // Debug výpis
  // Vráti pole zápasov (response) alebo prázdne pole
  const response = data.response ?? [];

  return response.map(normalizeMatch).sort((a: any, b: any) => scoreOrder(a.fixture.status.short) - scoreOrder(b.fixture.status.short));
}

/* -------------------------------------------
   FUTBAL – DETAILY TÍMU (HEADER)
-------------------------------------------- */

export async function getTeamHeader(teamId: string) {
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

