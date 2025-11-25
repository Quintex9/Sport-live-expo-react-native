import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../src/theme/colors";

interface TeamStandingsProps {
  standing: any;
}

export default function TeamStandings({ standing }: TeamStandingsProps) {
  if (!standing) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.section}>🏆 Tabuľka</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Pozícia:</Text>
        <Text style={styles.value}>{standing.rank}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Body:</Text>
        <Text style={styles.value}>{standing.points}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Skóre:</Text>
        <Text style={styles.value}>
          {standing.all.goals.for} : {standing.all.goals.against}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 16,
    borderRadius: 14,
    marginBottom: 24,
  },
  section: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    color: colors.textSecondary,
  },
  value: {
    color: "#fff",
    fontWeight: "600",
  },
});
