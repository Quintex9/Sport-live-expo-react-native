import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

interface ScoreCardProps {
  teams: any;
  goals: any;
  fixture: any;
  matchDate: string;
  isLive: boolean;
  isFinished: boolean;
  onTeamPress: (teamId: string) => void;
}

export const ScoreCard = ({ teams, goals, fixture, matchDate, isLive, isFinished, onTeamPress }: ScoreCardProps) => {
  return (
    <View style={styles.scoreCard}>
      <View style={styles.teamsRow}>
        <TouchableOpacity onPress={() => onTeamPress(teams?.home?.id)} style={styles.teamCol}>
          {teams?.home?.logo ? <Image source={{ uri: teams.home.logo }} style={styles.teamLogo} /> : null}
          <Text style={styles.teamName} numberOfLines={2}>{teams?.home?.name || ''}</Text>
        </TouchableOpacity>

        <View style={styles.scoreCol}>
          <View style={[styles.statusPill, isLive ? styles.statusLive : isFinished ? styles.statusFT : styles.statusNS]}>
            <Text style={styles.statusText}>
              {isLive ? `${fixture.status?.elapsed || 0}'` : (fixture.status?.short || 'NS')}
            </Text>
          </View>
          <Text style={styles.scoreText}>{goals?.home ?? '-'} - {goals?.away ?? '-'}</Text>
          <Text style={styles.dateText}>{matchDate}</Text>
        </View>

        <TouchableOpacity onPress={() => onTeamPress(teams?.away?.id)} style={styles.teamCol}>
          {teams?.away?.logo ? <Image source={{ uri: teams.away.logo }} style={styles.teamLogo} /> : null}
          <Text style={styles.teamName} numberOfLines={2}>{teams?.away?.name || ''}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

