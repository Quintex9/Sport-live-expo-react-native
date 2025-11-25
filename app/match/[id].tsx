import { useLocalSearchParams, Stack, Link, useRouter } from "expo-router";
import { View, Text, ActivityIndicator, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { useLiveMatches } from "../../src/hooks/useLiveMatches";
import { useMatchDetail } from "../../src/hooks/useMatchDetail";
import { colors } from "../../src/theme/colors";

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
  // Eventy - preferujeme z detailu, ak nie sú tak z live matchu
  const liveEvents = liveMatch?.events || [];
  const detailEvents = detailMatch?.events || [];
  const combinedEvents = detailEvents.length > 0 ? detailEvents : liveEvents;
  
  const match = liveMatch ? { 
    ...detailMatch, 
    ...liveMatch, 
    events: combinedEvents, 
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

  const matchDate = new Date(fixture.date).toLocaleDateString("sk-SK", {
    weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const isLive = fixture.status?.short !== "FT" && fixture.status?.short !== "NS";
  const isFinished = fixture.status?.short === "FT";

  // Live špecifické dáta
  const halftimeScore = match.score?.halftime;
  const statusLong = fixture.status?.long || '';
  const elapsed = fixture.status?.elapsed || 0;
  
  // Určenie fázy zápasu
  const getMatchPhase = () => {
    const short = fixture.status?.short;
    if (short === '1H') return '1. polčas';
    if (short === 'HT') return 'Polčas';
    if (short === '2H') return '2. polčas';
    if (short === 'ET') return 'Predĺženie';
    if (short === 'P') return 'Penalty';
    if (short === 'BT') return 'Prestávka';
    return statusLong;
  };

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
        <View style={styles.leagueBar}>
          {league?.logo && <Image source={{ uri: league.logo }} style={styles.leagueLogoSmall} />}
          <Text style={styles.leagueText}>{league?.name} • {league?.round}</Text>
        </View>

        {/* SCOREBOARD */}
        <View style={styles.scoreCard}>
          <View style={styles.teamsRow}>
            <TouchableOpacity onPress={() => goToTeam(teams?.home?.id)} style={styles.teamCol}>
              {teams?.home?.logo && <Image source={{ uri: teams.home.logo }} style={styles.teamLogo} />}
              <Text style={styles.teamName} numberOfLines={2}>{teams?.home?.name}</Text>
            </TouchableOpacity>

            <View style={styles.scoreCol}>
              <View style={[styles.statusPill, isLive ? styles.statusLive : isFinished ? styles.statusFT : styles.statusNS]}>
                <Text style={styles.statusText}>
                  {isLive ? `${fixture.status?.elapsed}'` : fixture.status?.short}
                </Text>
              </View>
              <Text style={styles.scoreText}>{goals?.home ?? '-'} - {goals?.away ?? '-'}</Text>
              <Text style={styles.dateText}>{matchDate}</Text>
            </View>

            <TouchableOpacity onPress={() => goToTeam(teams?.away?.id)} style={styles.teamCol}>
              {teams?.away?.logo && <Image source={{ uri: teams.away.logo }} style={styles.teamLogo} />}
              <Text style={styles.teamName} numberOfLines={2}>{teams?.away?.name}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* LIVE TRACKER - časová os */}
        {isLive && (
          <View style={styles.liveTracker}>
            <View style={styles.liveTrackerHeader}>
              <View style={styles.liveIndicator} />
              <Text style={styles.liveTrackerTitle}>LIVE TRACKER</Text>
              <View style={styles.livePhase}>
                <Text style={styles.livePhaseText}>{getMatchPhase()}</Text>
              </View>
            </View>

            {/* Polčasové skóre */}
            {halftimeScore && (halftimeScore.home !== null || halftimeScore.away !== null) && (
              <View style={styles.halftimeRow}>
                <Text style={styles.halftimeLabel}>Polčas:</Text>
                <Text style={styles.halftimeScore}>{halftimeScore.home ?? 0} - {halftimeScore.away ?? 0}</Text>
              </View>
            )}

            <View style={styles.timelineContainer}>
              {/* Časová os pozadie */}
              <View style={styles.timeline}>
                <View style={[styles.timelineProgress, { width: `${Math.min((fixture.status?.elapsed || 0) / 90 * 100, 100)}%` }]} />
                {/* Polčas marker */}
                <View style={styles.halfTimeMarker} />
              </View>
              {/* Minúty */}
              <View style={styles.timelineMinutes}>
                <Text style={styles.timelineMin}>0'</Text>
                <Text style={styles.timelineMin}>45'</Text>
                <Text style={styles.timelineMin}>90'</Text>
              </View>
              {/* Eventy na časovej osi */}
              <View style={styles.timelineEvents}>
                {events.filter((e: any) => e.type === 'Goal' || e.type === 'Card').slice(-8).map((e: any, i: number) => {
                  const position = Math.min((e.time?.elapsed || 0) / 90 * 100, 100);
                  const isHome = e.team?.id === teams?.home?.id;
                  const icon = e.type === 'Goal' ? '⚽' : e.detail === 'Red Card' ? '🟥' : '🟨';
                  return (
                    <View key={i} style={[styles.timelineEvent, { left: `${position}%` }, isHome ? styles.timelineEventHome : styles.timelineEventAway]}>
                      <Text style={styles.timelineEventIcon}>{icon}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
            {/* Posledné eventy */}
            <View style={styles.recentEvents}>
              {detailLoading ? (
                <View style={styles.recentEvent}>
                  <ActivityIndicator size="small" color="#ef4444" />
                  <Text style={styles.recentEventText}>Načítavam udalosti...</Text>
                </View>
              ) : events.length > 0 ? (
                events.slice(-3).reverse().map((e: any, i: number) => {
                  const isHome = e.team?.id === teams?.home?.id;
                  const icon = e.type === 'Goal' ? '⚽' : e.type === 'Card' ? (e.detail === 'Red Card' ? '🟥' : '🟨') : e.type === 'subst' ? '🔄' : '•';
                  return (
                    <View key={i} style={styles.recentEvent}>
                      <Text style={styles.recentEventTime}>{e.time?.elapsed}'</Text>
                      <Text style={styles.recentEventIcon}>{icon}</Text>
                      <Text style={styles.recentEventText} numberOfLines={1}>
                        {e.player?.name} {e.type === 'Goal' && e.assist?.name ? `(${e.assist.name})` : ''}
                      </Text>
                      <Text style={[styles.recentEventTeam, isHome ? styles.homeTeamColor : styles.awayTeamColor]}>
                        {isHome ? 'DOM' : 'HOS'}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.noEventsText}>
                  {(goals?.home || 0) + (goals?.away || 0) > 0 
                    ? 'Udalosti nie sú dostupné pre túto ligu' 
                    : 'Zatiaľ žiadne udalosti'}
                </Text>
              )}
            </View>

            {/* Quick Stats - kompaktné štatistiky pre live */}
            {homeStats.length > 0 && (
              <View style={styles.quickStats}>
                <View style={styles.quickStatItem}>
                  <Text style={styles.quickStatValue}>{getStat(homeStats, 'Ball Possession')}</Text>
                  <Text style={styles.quickStatLabel}>Lopta</Text>
                  <Text style={styles.quickStatValue}>{getStat(awayStats, 'Ball Possession')}</Text>
                </View>
                <View style={styles.quickStatItem}>
                  <Text style={styles.quickStatValue}>{getStat(homeStats, 'Total Shots')}</Text>
                  <Text style={styles.quickStatLabel}>Strely</Text>
                  <Text style={styles.quickStatValue}>{getStat(awayStats, 'Total Shots')}</Text>
                </View>
                <View style={styles.quickStatItem}>
                  <Text style={styles.quickStatValue}>{getStat(homeStats, 'Corner Kicks')}</Text>
                  <Text style={styles.quickStatLabel}>Rohy</Text>
                  <Text style={styles.quickStatValue}>{getStat(awayStats, 'Corner Kicks')}</Text>
                </View>
                <View style={styles.quickStatItem}>
                  <Text style={styles.quickStatValue}>{getStat(homeStats, 'Yellow Cards')}</Text>
                  <Text style={styles.quickStatLabel}>🟨</Text>
                  <Text style={styles.quickStatValue}>{getStat(awayStats, 'Yellow Cards')}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* EVENTY ZÁPASU */}
        {events.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Priebeh zápasu</Text>
            {events.slice(0, 15).map((e: any, i: number) => {
              const isHome = e.team?.id === teams?.home?.id;
              const icon = e.type === 'Goal' ? '⚽' : e.type === 'Card' ? (e.detail === 'Red Card' ? '🟥' : '🟨') : e.type === 'subst' ? '🔄' : '•';
              return (
                <View key={i} style={[styles.eventRow, isHome ? styles.eventLeft : styles.eventRight]}>
                  {isHome && <Text style={styles.eventText}>{e.player?.name} <Text style={styles.eventDetail}>{e.detail}</Text></Text>}
                  <View style={styles.eventBadge}>
                    <Text style={styles.eventIcon}>{icon}</Text>
                    <Text style={styles.eventTime}>{e.time?.elapsed}'</Text>
                  </View>
                  {!isHome && <Text style={styles.eventText}>{e.player?.name} <Text style={styles.eventDetail}>{e.detail}</Text></Text>}
                </View>
              );
            })}
          </View>
        )}

        {/* ŠTATISTIKY ZÁPASU */}
        {homeStats.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Štatistiky zápasu</Text>
            {['Ball Possession', 'Total Shots', 'Shots on Goal', 'Corner Kicks', 'Fouls', 'Offsides', 'Yellow Cards', 'Passes %'].map((type) => {
              const home = getStat(homeStats, type);
              const away = getStat(awayStats, type);
              const homeNum = parseInt(String(home).replace('%', '')) || 0;
              const awayNum = parseInt(String(away).replace('%', '')) || 0;
              const total = homeNum + awayNum || 1;
              return (
                <View key={type} style={styles.statRow}>
                  <Text style={styles.statValue}>{home}</Text>
                  <View style={styles.statCenter}>
                    <Text style={styles.statLabel}>{type.replace('Ball Possession', 'Držanie lopty').replace('Total Shots', 'Strely').replace('Shots on Goal', 'Na bránu').replace('Corner Kicks', 'Rohy').replace('Fouls', 'Fauly').replace('Offsides', 'Ofsajdy').replace('Yellow Cards', 'Žlté karty').replace('Passes %', 'Prihrávky %')}</Text>
                    <View style={styles.statBarBg}>
                      <View style={[styles.statBarHome, { width: `${(homeNum / total) * 100}%` }]} />
                    </View>
                  </View>
                  <Text style={styles.statValue}>{away}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* ZOSTAVY */}
        {lineups.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Zostavy</Text>
            <View style={styles.lineupsRow}>
              {lineups.map((lineup: any, idx: number) => (
                <View key={idx} style={styles.lineupCol}>
                  <View style={styles.lineupHeader}>
                    {lineup.team?.logo && <Image source={{ uri: lineup.team.logo }} style={styles.lineupLogo} />}
                    <View>
                      <Text style={styles.lineupTeam}>{lineup.team?.name}</Text>
                      <Text style={styles.lineupFormation}>{lineup.formation}</Text>
                    </View>
                  </View>
                  <Text style={styles.lineupCoach}>🧑‍💼 {lineup.coach?.name}</Text>
                  {lineup.startXI?.slice(0, 11).map((p: any, i: number) => (
                    <View key={i} style={styles.playerRow}>
                      <Text style={styles.playerNum}>{p.player?.number}</Text>
                      <Text style={styles.playerName}>{p.player?.name}</Text>
                      <Text style={styles.playerPos}>{p.player?.pos}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* H2H */}
        {h2h.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Vzájomné zápasy</Text>
            {h2h.map((m: any, i: number) => (
              <View key={i} style={styles.h2hRow}>
                <Text style={styles.h2hDate}>{new Date(m.fixture?.date).toLocaleDateString("sk-SK", { day: "numeric", month: "short", year: "2-digit" })}</Text>
                <Text style={[styles.h2hTeam, m.teams?.home?.winner && styles.h2hWinner]}>{m.teams?.home?.name}</Text>
                <Text style={styles.h2hScore}>{m.goals?.home} - {m.goals?.away}</Text>
                <Text style={[styles.h2hTeam, m.teams?.away?.winner && styles.h2hWinner]}>{m.teams?.away?.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* INFO */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informácie</Text>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Štadión</Text><Text style={styles.infoValue}>{fixture.venue?.name || '-'}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Mesto</Text><Text style={styles.infoValue}>{fixture.venue?.city || '-'}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Rozhodca</Text><Text style={styles.infoValue}>{fixture.referee || '-'}</Text></View>
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

  leagueBar: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, marginBottom: 8 },
  leagueLogoSmall: { width: 20, height: 20, marginRight: 8, borderRadius: 4 },
  leagueText: { color: colors.textSecondary, fontSize: 13 },

  scoreCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 24, marginBottom: 16 },
  teamsRow: { flexDirection: "row", alignItems: "flex-start" },
  teamCol: { flex: 1, alignItems: "center" },
  teamLogo: { width: 56, height: 56, marginBottom: 8 },
  teamName: { color: "#fff", fontSize: 13, fontWeight: "600", textAlign: "center" },
  scoreCol: { alignItems: "center", paddingHorizontal: 16 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  statusLive: { backgroundColor: "rgba(239,68,68,0.2)" },
  statusFT: { backgroundColor: "rgba(100,100,100,0.3)" },
  statusNS: { backgroundColor: "rgba(59,130,246,0.2)" },
  statusText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  scoreText: { color: colors.accent, fontSize: 32, fontWeight: "800", letterSpacing: 2 },
  dateText: { color: colors.textSecondary, fontSize: 11, marginTop: 8 },

  card: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16, marginBottom: 12 },
  cardTitle: { color: colors.accent, fontSize: 13, fontWeight: "700", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 },

  // Events
  eventRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  eventLeft: { justifyContent: "flex-start" },
  eventRight: { justifyContent: "flex-end" },
  eventBadge: { alignItems: "center", marginHorizontal: 12, minWidth: 40 },
  eventIcon: { fontSize: 16 },
  eventTime: { color: colors.textSecondary, fontSize: 10 },
  eventText: { color: "#fff", fontSize: 12, flex: 1 },
  eventDetail: { color: colors.textSecondary, fontSize: 11 },

  // Stats
  statRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  statValue: { color: "#fff", fontSize: 13, fontWeight: "600", width: 45, textAlign: "center" },
  statCenter: { flex: 1, marginHorizontal: 8 },
  statLabel: { color: colors.textSecondary, fontSize: 10, textAlign: "center", marginBottom: 4 },
  statBarBg: { height: 4, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2 },
  statBarHome: { height: 4, backgroundColor: colors.accent, borderRadius: 2 },

  // Lineups
  lineupsRow: { flexDirection: "row" },
  lineupCol: { flex: 1, paddingHorizontal: 4 },
  lineupHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  lineupLogo: { width: 24, height: 24, marginRight: 8 },
  lineupTeam: { color: "#fff", fontSize: 12, fontWeight: "600" },
  lineupFormation: { color: colors.accent, fontSize: 11 },
  lineupCoach: { color: colors.textSecondary, fontSize: 11, marginBottom: 8 },
  playerRow: { flexDirection: "row", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.03)" },
  playerNum: { color: colors.textSecondary, fontSize: 11, width: 22 },
  playerName: { color: "#fff", fontSize: 11, flex: 1 },
  playerPos: { color: colors.textSecondary, fontSize: 10, width: 20 },

  // H2H
  h2hRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  h2hDate: { color: colors.textSecondary, fontSize: 10, width: 50 },
  h2hTeam: { color: "#fff", fontSize: 11, flex: 1 },
  h2hWinner: { color: colors.accent, fontWeight: "600" },
  h2hScore: { color: colors.accent, fontSize: 12, fontWeight: "bold", marginHorizontal: 8 },

  // Info
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  infoLabel: { color: colors.textSecondary, fontSize: 13 },
  infoValue: { color: "#fff", fontSize: 13, fontWeight: "500" },

  // Back button
  backButton: { paddingVertical: 8, marginBottom: 8 },
  backButtonText: { color: colors.textSecondary, fontSize: 14 },

  // Live Tracker
  liveTracker: { backgroundColor: "rgba(239,68,68,0.08)", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" },
  liveTrackerHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  liveIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#ef4444", marginRight: 8 },
  liveTrackerTitle: { color: "#ef4444", fontSize: 12, fontWeight: "700", letterSpacing: 1, flex: 1 },
  livePhase: { backgroundColor: "rgba(239,68,68,0.2)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  livePhaseText: { color: "#ef4444", fontSize: 10, fontWeight: "600" },
  halftimeRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 12, paddingVertical: 6, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8 },
  halftimeLabel: { color: colors.textSecondary, fontSize: 11, marginRight: 8 },
  halftimeScore: { color: "#fff", fontSize: 13, fontWeight: "600" },
  quickStats: { flexDirection: "row", justifyContent: "space-around", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", paddingTop: 12, marginTop: 4 },
  quickStatItem: { flexDirection: "row", alignItems: "center" },
  quickStatValue: { color: "#fff", fontSize: 12, fontWeight: "600", minWidth: 24, textAlign: "center" },
  quickStatLabel: { color: colors.textSecondary, fontSize: 10, marginHorizontal: 6 },
  timelineContainer: { marginBottom: 12 },
  timeline: { height: 6, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 3, position: "relative", overflow: "hidden" },
  timelineProgress: { position: "absolute", left: 0, top: 0, height: 6, backgroundColor: "rgba(239,68,68,0.5)", borderRadius: 3 },
  halfTimeMarker: { position: "absolute", left: "50%", top: -2, width: 2, height: 10, backgroundColor: "rgba(255,255,255,0.3)" },
  timelineMinutes: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  timelineMin: { color: colors.textSecondary, fontSize: 9 },
  timelineEvents: { position: "absolute", top: 0, left: 0, right: 0, height: 6 },
  timelineEvent: { position: "absolute", top: -8, marginLeft: -10 },
  timelineEventHome: {},
  timelineEventAway: {},
  timelineEventIcon: { fontSize: 14 },
  recentEvents: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", paddingTop: 12 },
  recentEvent: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  recentEventTime: { color: "#ef4444", fontSize: 11, fontWeight: "600", width: 28 },
  recentEventIcon: { fontSize: 14, marginRight: 8 },
  recentEventText: { color: "#fff", fontSize: 12, flex: 1 },
  recentEventTeam: { fontSize: 10, fontWeight: "600", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  homeTeamColor: { backgroundColor: "rgba(59,130,246,0.2)", color: "#3b82f6" },
  awayTeamColor: { backgroundColor: "rgba(168,85,247,0.2)", color: "#a855f7" },
  noEventsText: { color: colors.textSecondary, fontSize: 12, textAlign: "center", paddingVertical: 8 },
});
