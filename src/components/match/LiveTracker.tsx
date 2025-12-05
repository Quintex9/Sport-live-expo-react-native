import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

interface LiveTrackerProps {
  matchPhase: string;
  halftimeScore: any;
  fixture: any;
  events: any[];
  teams: any;
  goals: any;
  homeStats: any[];
  awayStats: any[];
  detailLoading: boolean;
  getIcon: (e: any) => string;
  getStat: (stats: any[], type: string) => any;
}

export const LiveTracker = ({
  matchPhase,
  halftimeScore,
  fixture,
  events,
  teams,
  goals,
  homeStats,
  awayStats,
  detailLoading,
  getIcon,
  getStat,
}: LiveTrackerProps) => {
  return (
    <View style={styles.liveTracker}>
      <View style={styles.liveTrackerHeader}>
        <View style={styles.liveIndicator} />
        <Text style={styles.liveTrackerTitle}>LIVE TRACKER</Text>
        <View style={styles.livePhase}>
          <Text style={styles.livePhaseText}>{matchPhase}</Text>
        </View>
      </View>

      {/* Polčasové skóre */}
      {halftimeScore && (halftimeScore.home !== null || halftimeScore.away !== null) ? (
        <View style={styles.halftimeRow}>
          <Text style={styles.halftimeLabel}>Polčas:</Text>
          <Text style={styles.halftimeScore}>{halftimeScore.home ?? 0} - {halftimeScore.away ?? 0}</Text>
        </View>
      ) : null}

      <View style={styles.timelineContainer}>
        <View style={styles.timeline}>
          <View style={[styles.timelineProgress, { width: `${Math.min((fixture.status?.elapsed || 0) / 90 * 100, 100)}%` }]} />
          <View style={styles.halfTimeMarker} />
        </View>
        <View style={styles.timelineMinutes}>
          <Text style={styles.timelineMin}>0'</Text>
          <Text style={styles.timelineMin}>45'</Text>
          <Text style={styles.timelineMin}>90'</Text>
        </View>
        <View style={styles.timelineEvents}>
          {events.filter((e: any) => e.type === 'Goal' || e.type === 'Card').slice(-8).map((e: any, i: number) => {
            const position = Math.min((e.time?.elapsed || 0) / 90 * 100, 100);
            const icon = e.type === 'Goal' ? '⚽' : (e.detail === 'Red Card' ? '🟥' : '🟨');
            return (
              <View key={i} style={[styles.timelineEvent, { left: `${position}%` }]}>
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
            return (
              <View key={i} style={styles.recentEvent}>
                <Text style={styles.recentEventTime}>{e.time?.elapsed || 0}'</Text>
                <Text style={styles.recentEventIcon}>{getIcon(e)}</Text>
                <Text style={styles.recentEventText} numberOfLines={1}>
                  {e.player?.name || ''}{e.type === 'Goal' && e.assist?.name ? ` (${e.assist.name})` : ''}
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

      {/* Quick Stats */}
      {homeStats.length > 0 ? (
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
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  liveTracker: { backgroundColor: "rgba(239,68,68,0.08)", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" },
  liveTrackerHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  liveIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#ef4444", marginRight: 8 },
  liveTrackerTitle: { color: "#ef4444", fontSize: 12, fontWeight: "700", letterSpacing: 1, flex: 1 },
  livePhase: { backgroundColor: "rgba(239,68,68,0.2)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  livePhaseText: { color: "#ef4444", fontSize: 10, fontWeight: "600" },
  halftimeRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 12, paddingVertical: 6, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8 },
  halftimeLabel: { color: colors.textSecondary, fontSize: 11, marginRight: 8 },
  halftimeScore: { color: "#fff", fontSize: 13, fontWeight: "600" },
  timelineContainer: { marginBottom: 12 },
  timeline: { height: 6, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 3, position: "relative", overflow: "hidden" },
  timelineProgress: { position: "absolute", left: 0, top: 0, height: 6, backgroundColor: "rgba(239,68,68,0.5)", borderRadius: 3 },
  halfTimeMarker: { position: "absolute", left: "50%", top: -2, width: 2, height: 10, backgroundColor: "rgba(255,255,255,0.3)" },
  timelineMinutes: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  timelineMin: { color: colors.textSecondary, fontSize: 9 },
  timelineEvents: { position: "absolute", top: 0, left: 0, right: 0, height: 6 },
  timelineEvent: { position: "absolute", top: -8, marginLeft: -10 },
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
  quickStats: { flexDirection: "row", justifyContent: "space-around", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", paddingTop: 12, marginTop: 4 },
  quickStatItem: { flexDirection: "row", alignItems: "center" },
  quickStatValue: { color: "#fff", fontSize: 12, fontWeight: "600", minWidth: 24, textAlign: "center" },
  quickStatLabel: { color: colors.textSecondary, fontSize: 10, marginHorizontal: 6 },
});

