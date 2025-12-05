import { View, Text, Image, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

interface LineupsCardProps {
  lineups: any[];
  isFromDB: boolean;
}

export const LineupsCard = ({ lineups, isFromDB }: LineupsCardProps) => {
  if (lineups.length === 0) {
    return (
      <Text style={styles.noEventsText}>
        {isFromDB ? 'Žiadne zostavy v databáze pre tento zápas' : 'Žiadne zostavy dostupné'}
      </Text>
    );
  }

  return (
    <View style={styles.lineupsRow}>
      {lineups.map((lineup: any, idx: number) => (
        <View key={idx} style={styles.lineupCol}>
          <View style={styles.lineupHeader}>
            {lineup.team?.logo ? <Image source={{ uri: lineup.team.logo }} style={styles.lineupLogo} /> : null}
            <View>
              <Text style={styles.lineupTeam}>{lineup.team?.name || ''}</Text>
              <Text style={styles.lineupFormation}>{lineup.formation || ''}</Text>
            </View>
          </View>
          <Text style={styles.lineupCoach}>🧑‍💼 {lineup.coach?.name || ''}</Text>
          {lineup.startXI?.slice(0, 11).map((p: any, i: number) => (
            <View key={i} style={styles.playerRow}>
              <Text style={styles.playerNum}>{p.player?.number || ''}</Text>
              <Text style={styles.playerName}>{p.player?.name || ''}</Text>
              <Text style={styles.playerPos}>{p.player?.pos || ''}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
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
  noEventsText: { color: colors.textSecondary, fontSize: 12, textAlign: "center", paddingVertical: 8 },
});

