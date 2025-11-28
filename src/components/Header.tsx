import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";
import { router } from "expo-router";

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

      {/* LEFT SIDE */}
      <View>
        <Text style={styles.headerTitle}>LiveScore</Text>
        <Text style={styles.headerSubtitle}>{SPORT_TITLES[sport]}</Text>
      </View>

      {/* RIGHT SIDE */}
      <View style={styles.rightGroup}>

        {/* LIVE BUBLINA */}
        <View style={[styles.liveIndicator, !isLive && styles.historyIndicator]}>
          {isLive && <View style={styles.liveDotPulse} />}
          <Text style={[styles.liveCount, !isLive && styles.historyCount]}>
            {count} {isLive ? "Live" : "Zápasov"}
          </Text>
        </View>

        {/* PRIHLÁSENIE */}
        <TouchableOpacity onPress={() => router.push("/auth/login")}>
          <Text style={styles.loginButton}>Prihlásiť</Text>
        </TouchableOpacity>

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

  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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

  loginButton: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  historyIndicator: {
    backgroundColor: colors.surface,
  },
  historyCount: {
    color: colors.textSecondary,
  },
});
