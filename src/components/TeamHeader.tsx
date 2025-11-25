import { View, Text, Image, StyleSheet } from "react-native";
import { colors } from "../../src/theme/colors";

interface TeamHeaderProps {
  team: any;
}

export default function TeamHeader({ team }: TeamHeaderProps) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: team.logo }} style={styles.logo} />

      <Text style={styles.name}>{team.name}</Text>
      <Text style={styles.country}>{team.country}</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Založený:</Text>
        <Text style={styles.value}>{team.founded || "N/A"}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Kód:</Text>
        <Text style={styles.value}>{team.code || "N/A"}</Text>
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
  logo: {
    width: 80,
    height: 80,
    alignSelf: "center",
    marginBottom: 12,
  },
  name: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  country: {
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 16,
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
