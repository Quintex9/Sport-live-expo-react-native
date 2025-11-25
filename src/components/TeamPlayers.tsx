import { View, Text, Image, StyleSheet } from "react-native";
import { colors } from "../../src/theme/colors";

interface TeamPlayersProps {
  players: any[];
}

export default function TeamPlayers({ players }: TeamPlayersProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.section}>👥 Hráči</Text>

      {players.length === 0 && (
        <Text style={{ color: "#fff" }}>Žiadni hráči v databáze.</Text>
      )}

      {players.map((p: any) => (
        <View key={p.player.id} style={styles.playerRow}>
          <Image
            source={{ uri: p.player.photo }}
            style={styles.playerPhoto}
          />
          <View>
            <Text style={styles.playerName}>{p.player.name}</Text>
            <Text style={styles.playerPos}>
              {p.statistics[0]?.games?.position ?? "-"}
            </Text>
          </View>
        </View>
      ))}
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
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  playerPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  playerName: {
    color: "#fff",
    fontWeight: "600",
  },
  playerPos: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
