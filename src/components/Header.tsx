import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

type SportType =
    "football" |
    "basketball" |
    "baseball" |
    "nfl" |
    "hockey" |
    "handball";

const SPORT_TITLES: Record<SportType, string> = {
    football: "Futbalové výsledky",
    basketball: "Basketbalové výsledky",
    baseball: "Baseball výsledky",
    nfl: "NFL výsledky",
    hockey: "Hokejové výsledky",
    handball: "Hadzanárske výsledky",
};

interface HeaderProps {
    sport: SportType;
    count: number;
    mode?: 'live' | 'history';
}

export const Header = ({ sport, count, mode = 'live' }: HeaderProps) => {
  const isLive = mode === 'live';
  
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>LiveScore</Text>
        <Text style={styles.headerSubtitle}>{SPORT_TITLES[sport]}</Text>
      </View>

      <View style={[styles.liveIndicator, !isLive && styles.historyIndicator]}>
        {isLive && <View style={styles.liveDotPulse} />}
        <Text style={[styles.liveCount, !isLive && styles.historyCount]}>
          {count} {isLive ? 'Live' : 'Zápasov'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveDotPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginRight: 6,
  },
  liveCount: {
    color: colors.accent,
    fontWeight: "bold",
    fontSize: 12,
  },
  historyIndicator: {
    backgroundColor: colors.surface,
  },
  historyCount: {
    color: colors.textSecondary,
  },
});