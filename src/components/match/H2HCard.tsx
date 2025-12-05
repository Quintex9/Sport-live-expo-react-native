import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

interface H2HCardProps {
  h2h: any[];
}

export const H2HCard = ({ h2h }: H2HCardProps) => {
  return (
    <>
      {h2h.map((m: any, i: number) => (
        <View key={i} style={styles.h2hRow}>
          <Text style={styles.h2hDate}>{m.fixture?.date ? new Date(m.fixture.date).toLocaleDateString("sk-SK", { day: "numeric", month: "short", year: "2-digit" }) : ''}</Text>
          <Text style={[styles.h2hTeam, m.teams?.home?.winner ? styles.h2hWinner : null]}>{m.teams?.home?.name || ''}</Text>
          <Text style={styles.h2hScore}>{m.goals?.home ?? '-'} - {m.goals?.away ?? '-'}</Text>
          <Text style={[styles.h2hTeam, m.teams?.away?.winner ? styles.h2hWinner : null]}>{m.teams?.away?.name || ''}</Text>
        </View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  h2hRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  h2hDate: { color: colors.textSecondary, fontSize: 10, width: 50 },
  h2hTeam: { color: "#fff", fontSize: 11, flex: 1 },
  h2hWinner: { color: colors.accent, fontWeight: "600" },
  h2hScore: { color: colors.accent, fontSize: 12, fontWeight: "bold", marginHorizontal: 8 },
});

