import { View, Text, Image, StyleSheet } from "react-native";
import { colors } from "../../src/theme/colors";

interface TeamPlayersProps {
  players: any[];
}

export default function TeamPlayers({ players }: TeamPlayersProps) {
  if (!players) return null;

  // Fallback obrázok
  const fallbackUrl =
    "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png";

  const getPositionColor = (pos: string) => {
    switch (pos) {
      case "Goalkeeper":
      case "GK":
        return "#FBC02D";
      case "Defender":
      case "DF":
        return "#42A5F5";
      case "Midfielder":
      case "MF":
        return "#66BB6A";
      case "Attacker":
      case "FW":
        return "#EF5350";
      default:
        return "rgba(255,255,255,0.3)";
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.section}>👥 Hráči</Text>

      {players.length === 0 && (
        <Text style={styles.noPlayers}>Žiadni hráči v databáze.</Text>
      )}

      {/* GRID layout */}
      <View style={styles.grid}>
        {players.map((p) => {
          const pos = p.statistics?.[0]?.games?.position ?? "-";
          const posColor = getPositionColor(pos);

          const photo =
            p.player.photo && p.player.photo !== "" ? p.player.photo : fallbackUrl;

          return (
            <View key={p.player.id} style={styles.playerCard}>
              <Image source={{ uri: photo }} style={styles.playerPhoto} />

              <Text numberOfLines={1} style={styles.name}>
                {p.player.name}
              </Text>

              <View
                style={[styles.positionChip, { backgroundColor: posColor }]}
              >
                <Text style={styles.positionText}>{pos}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  section: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "700",
    marginBottom: 14,
  },

  noPlayers: {
    color: "#fff",
    opacity: 0.8,
  },

  /* GRID layout */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },

  playerCard: {
    width: "30%", //3 hráči v riadku (zmeň na "23%" pre 4 hráčov)
    alignItems: "center",
  },

  playerPhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  name: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },

  positionChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  positionText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "700",
  },
});
