import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../src/theme/colors";

interface TeamStatisticsProps {
  stats: any;
}

export default function TeamStatistics({ stats }: TeamStatisticsProps) {
  if (!stats) return null;

  // PREPARE FORM ARRAY
  const formArray = stats.form ? stats.form.split("") : [];

  const getFormColor = (char: string) => {
    switch (char) {
      case "W":
        return { color: "#4CAF50" }; // Zelená
      case "L":
        return { color: "#E53935" }; // Červená
      case "D":
      default:
        return { color: "#fff" }; // Biela
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.section}>📊 Štatistiky sezóny</Text>

      {stats.goals ? (
        <>
          <View style={styles.row}>
            <Text style={styles.label}>Strelené góly:</Text>
            <Text style={styles.valueS}>{stats.goals.for.total.total}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Inkasované góly:</Text>
            <Text style={styles.valueI}>{stats.goals.against.total.total}</Text>
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

        <View style={styles.formWrapper}>
          {formArray.map((char: string, index: number) => (
            <Text key={index} style={[styles.formChar, getFormColor(char)]}>
              {char}
            </Text>
          ))}
        </View>
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
    alignItems: "center",
  },
  label: {
    color: colors.textSecondary,
  },
  valueS: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  valueI: {
    color: "#E53935",
    fontWeight: "600",
  },
  value: {
    color: "#fff",
    fontWeight: "600",
  },
  formWrapper: {
    flexDirection: "row",
    gap: 3,
  },
  formChar: {
    fontSize: 15,
    fontWeight: "700",
  },
});
