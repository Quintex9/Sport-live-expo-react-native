import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useLiveMatches } from "../../src/hooks/useLiveMatches";
import { useMatchDetail } from "../../src/hooks/useMatchDetail";
import { colors } from "../../src/theme/colors";
import { LeagueBar } from "../../src/components/match/LeagueBar";
import { ScoreCard } from "../../src/components/match/ScoreCard";
import { LiveTracker } from "../../src/components/match/LiveTracker";
import { EventsList } from "../../src/components/match/EventsList";
import { StatisticsCard } from "../../src/components/match/StatisticsCard";
import { LineupsCard } from "../../src/components/match/LineupsCard";
import { H2HCard } from "../../src/components/match/H2HCard";
import { ExtendedStatsCard } from "../../src/components/match/ExtendedStatsCard";
import { InfoCard } from "../../src/components/match/InfoCard";

export default function MatchDetail() {
  const router = useRouter();
  const { id, source } = useLocalSearchParams();
  const fixtureId = String(id);
  const isFromHistory = source === "history";

  // Pre live zápasy najprv nájdeme základné info, potom načítame detaily
  const { data: liveData, loading: liveLoading } = useLiveMatches("football");
  const liveMatch = !isFromHistory ? liveData?.find((m: any) => String(m.fixture.id) === fixtureId) : null;
  
  // Načítame detaily vždy (pre live aj history) - obsahuje eventy, štatistiky, zostavy, H2H
  const { match: detailMatch, loading: detailLoading } = useMatchDetail(fixtureId);

  // Pre live zápasy kombinujeme live dáta (aktuálne skóre) s detailmi
  const match = liveMatch ? { 
    ...detailMatch, 
    ...liveMatch, 
    events: detailMatch?.events?.length ? detailMatch.events : (liveMatch?.events || []), 
    statistics: detailMatch?.statistics || [], 
    lineups: detailMatch?.lineups || [], 
    h2h: detailMatch?.h2h || [] 
  } : detailMatch;
  const loading = isFromHistory ? detailLoading : (liveLoading || detailLoading);

  if (loading && !match) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: "Nenašlo sa" }} />
        <Text style={styles.errorText}>Zápas sa nenašiel.</Text>
      </View>
    );
  }

  // Dáta
  const fixture = match.fixture || match;
  const teams = match.teams;
  const goals = match.goals;
  const league = match.league;
  const events = (match as any).events || [];
  const statistics = (match as any).statistics || [];
  const lineups = (match as any).lineups || [];
  const h2h = (match as any).h2h || [];
  const isFromDB = (match as any).source === 'supabase';

  const matchDate = new Date(fixture.date).toLocaleDateString("sk-SK", {
    weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const isLive = fixture.status?.short !== "FT" && fixture.status?.short !== "NS";
  const isFinished = fixture.status?.short === "FT";

  // Live špecifické dáta
  const halftimeScore = match.score?.halftime;
  const statusLong = fixture.status?.long || '';
  
  // Mapovanie fáz zápasu
  const PHASES: Record<string, string> = { '1H': '1. polčas', 'HT': 'Polčas', '2H': '2. polčas', 'ET': 'Predĺženie', 'P': 'Penalty', 'BT': 'Prestávka' };
  const getIcon = (e: any) => e.type === 'Goal' ? '⚽' : e.type === 'Card' ? (e.detail === 'Red Card' ? '🟥' : '🟨') : e.type === 'subst' ? '🔄' : '•';
  const matchPhase = PHASES[fixture.status?.short] || statusLong || '';

  // Štatistiky zápasu
  const homeStats = statistics.find((s: any) => s.team?.id === teams?.home?.id)?.statistics || [];
  const awayStats = statistics.find((s: any) => s.team?.id === teams?.away?.id)?.statistics || [];
  const getStat = (stats: any[], type: string) => stats.find((s: any) => s.type === type)?.value || 0;

  function goToTeam(teamId: string) {
    router.push({
      pathname: `/team/${teamId}`,
      params: { league: String(league?.id), season: String(league?.season) },
    });
  }

  return (
    <>
      <Stack.Screen options={{ title: "", headerStyle: { backgroundColor: colors.background }, headerTintColor: "#fff" }} />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentWrapper}>
          {/* TLAČÍTKO SPÄŤ */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Späť</Text>
          </TouchableOpacity>

          {/* HLAVIČKA S LIGOU */}
          <LeagueBar league={league} isFromDB={isFromDB} />

          {/* SCOREBOARD */}
          <ScoreCard 
            teams={teams}
            goals={goals}
            fixture={fixture}
            matchDate={matchDate}
            isLive={isLive}
            isFinished={isFinished}
            onTeamPress={goToTeam}
          />

          {/* LIVE TRACKER - časová os */}
          {isLive ? (
            <LiveTracker
              matchPhase={matchPhase}
              halftimeScore={halftimeScore}
              fixture={fixture}
              events={events}
              teams={teams}
              goals={goals}
              homeStats={homeStats}
              awayStats={awayStats}
              detailLoading={detailLoading}
              getIcon={getIcon}
              getStat={getStat}
            />
          ) : null}

          {/* EVENTY ZÁPASU - len pre ukončené zápasy */}
          {isFinished ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Priebeh zápasu
                {isFromDB ? <Text style={styles.dbBadge}> {events.length > 0 ? `(${events.length} z DB)` : '(žiadne v DB)'}</Text> : null}
              </Text>
              <EventsList events={events} teams={teams} isFromDB={isFromDB} getIcon={getIcon} />
            </View>
          ) : null}

          {/* ŠTATISTIKY ZÁPASU */}
          {(homeStats.length > 0 || (isFromDB && statistics.length > 0)) ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Štatistiky zápasu
                {isFromDB ? <Text style={styles.dbBadge}> {statistics.length > 0 ? `(${statistics.length} tímov z DB)` : '(žiadne v DB)'}</Text> : null}
              </Text>
              <StatisticsCard 
                homeStats={homeStats}
                awayStats={awayStats}
                statistics={statistics}
                isFromDB={isFromDB}
                getStat={getStat}
              />
            </View>
          ) : null}

          {/* ZOSTAVY */}
          {(lineups.length > 0 || isFromDB) ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Zostavy
                {isFromDB ? <Text style={styles.dbBadge}> {lineups.length > 0 ? `(${lineups.length} tímov z DB)` : '(žiadne v DB)'}</Text> : null}
              </Text>
              <LineupsCard lineups={lineups} isFromDB={isFromDB} />
            </View>
          ) : null}

          {/* H2H */}
          {h2h.length > 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Vzájomné zápasy</Text>
              <H2HCard h2h={h2h} />
            </View>
          ) : null}

          {/* ROZŠÍRENÉ DB INFO */}
          {isFromDB && statistics.length > 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Rozšírené štatistiky z DB</Text>
              <ExtendedStatsCard statistics={statistics} teams={teams} />
            </View>
          ) : null}

          {/* INFO */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informácie</Text>
            <InfoCard 
              fixture={fixture}
              league={league}
              isFromDB={isFromDB}
              match={match}
              events={events}
              statistics={statistics}
              lineups={lineups}
            />
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: 16, alignItems: "center" },
  contentWrapper: { width: "100%", maxWidth: 600 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  errorText: { color: "#fff", fontSize: 16 },
  card: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16, marginBottom: 12 },
  cardTitle: { color: colors.accent, fontSize: 13, fontWeight: "700", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 },
  dbBadge: { color: colors.accent, fontSize: 11, fontWeight: "600" },
  backButton: { paddingVertical: 8, marginBottom: 8 },
  backButtonText: { color: colors.textSecondary, fontSize: 14 },
});
