import Constants from "expo-constants";

// Načítanie API kľúča z konfigurácie (env premenné)
const API_KEY = Constants.expoConfig?.extra?.APISPORTS_KEY;

if (!API_KEY) {
  console.warn("APISPORTS_KEY is missing! Check .env or app.config.js");
}

// Mapovanie športov na konkrétne API endpointy pre live výsledky
const LIVE_API: Record<string, string> = {
  football: "https://v3.football.api-sports.io/fixtures?live=all",
  basketball: `https://v1.basketball.api-sports.io/games?live=all`,
  baseball: `https://v1.baseball.api-sports.io/games?live=all`,
  nfl: `https://v1.american-football.api-sports.io/games?live=all`,
  hockey: `https://v1.hockey.api-sports.io/games?live=all`,
  handball: `https://v1.handball.api-sports.io/games?live=all`,
};

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
    },
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error("API error: " + msg);
  }

  const data = await res.json();
  console.log("LIVE DATA:", data); // Debug výpis

  // Vráti pole zápasov (response) alebo prázdne pole
  return data.response ?? [];
}
