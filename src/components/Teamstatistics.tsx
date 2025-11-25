import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../src/theme/colors";

interface TeamStatisticsProps {
  stats: any;
}

export default function TeamStatistics({ stats }: TeamStatisticsProps) {
  if (!stats) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.section}>📊 Štatistiky sezóny</Text>

      {stats.goals ? (
        <>
          <View style={styles.row}>
            <Text style={styles.label}>Strelené góly:</Text>
            <Text style={styles.value}>{stats.goals.for.total.total}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Inkasované góly:</Text>
            <Text style={styles.value}>{stats.goals.against.total.total}</Text>
          </View>
        </>
      ) : (
        <Text style={{ color: "#fff" }}>Štatistiky nie sú dostupné.</Text>
      )}

      <View style={styles.row}>
        <Text style={styles.label}>Najčastejšia formácia:</Text>
        <Text style={styles.value}>
          {stats.lineups?.[0]?.formation ?? "N/A"}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Forma:</Text>
        <Text style={styles.value}>{stats.form ?? "-"}</Text>
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
