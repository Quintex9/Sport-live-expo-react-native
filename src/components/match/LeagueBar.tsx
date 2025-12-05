import { View, Text, Image, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

interface LeagueBarProps {
  league: any;
  isFromDB: boolean;
}

export const LeagueBar = ({ league, isFromDB }: LeagueBarProps) => {
  return (
    <View style={styles.leagueBar}>
      {league?.logo ? <Image source={{ uri: league.logo }} style={styles.leagueLogoSmall} /> : null}
      <Text style={styles.leagueText}>
        {league?.name || ''}{league?.name && league?.round ? ' • ' : ''}{league?.round || ''}
        {isFromDB ? <Text style={styles.dbBadge}> • DB</Text> : null}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  leagueBar: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, marginBottom: 8 },
  leagueLogoSmall: { width: 20, height: 20, marginRight: 8, borderRadius: 4 },
  leagueText: { color: colors.textSecondary, fontSize: 13 },
  dbBadge: { color: colors.accent, fontSize: 11, fontWeight: "600" },
});

