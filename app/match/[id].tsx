import { useLocalSearchParams, Stack, Link, useRouter } from "expo-router";
import { View, Text, ActivityIndicator, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { useLiveMatches } from "../../src/hooks/useLiveMatches";
import { colors } from "../../src/theme/colors";

export default function MatchDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { data, loading } = useLiveMatches("football");

  const match = data?.find((m) => String(m.fixture.id) === String(id));

  if (loading && !match) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: "Nenašlo sa" }} />
        <Text style={styles.errorText}>
          Zápas sa nenašiel alebo už nie je v live zozname.
        </Text>
      </View>
    );
  }

  const matchDate = new Date(match.fixture.date).toLocaleDateString("sk-SK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isLive =
    match.fixture.status.short !== "FT" &&
    match.fixture.status.short !== "NS";

  // --- NAVIGÁCIA NA TEAM DETAIL (funguje na mobile) ---
  function goToTeam(teamId: string) {
    router.push({
      pathname: `/team/${teamId}`,
      params: {
        league: String(match.league.id),
        season: String(match.league.season),
      },
    });
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Detail zápasu",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: "#fff",
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.maxWidthContainer}>
          {/* SPÄŤ */}
          <Link href="/" asChild>
            <TouchableOpacity style={styles.backButton}>
              <Text style={styles.backText}>← Späť na zoznam</Text>
            </TouchableOpacity>
          </Link>

          {/* HLAVIČKA LIGY */}
          <View style={styles.leagueHeader}>
            {match.league?.logo && (
              <Image
                source={{ uri: match.league.logo }}
                style={styles.leagueLogo}
              />
            )}
            <View>
              <Text style={styles.leagueName}>{match.league?.name}</Text>
              <Text style={styles.leagueCountry}>{match.league?.country}</Text>
            </View>
          </View>

          {/* SCOREBOARD */}
          <View style={styles.scoreCard}>
            {/* Status */}
            <View
              style={[
                styles.statusBadge,
                isLive ? styles.statusLive : styles.statusFinished,
              ]}
            >
              <Text style={styles.statusText}>
                {isLive
                  ? `LIVE • ${match.fixture.status.elapsed}'`
                  : match.fixture.status.long}
              </Text>
            </View>

            <View style={styles.teamsRow}>
              {/* DOMÁCI */}
              <TouchableOpacity
                onPress={() => goToTeam(match.teams.home.id)}
                style={styles.teamContainer}
              >
                <Image
                  source={{ uri: match.teams.home.logo }}
                  style={styles.bigLogo}
                  resizeMode="contain"
                />
                <Text style={styles.teamName}>{match.teams.home.name}</Text>
              </TouchableOpacity>

              {/* SKÓRE */}
              <View style={styles.scoreContainer}>
                <Text style={styles.bigScore}>
                  {match.goals.home} : {match.goals.away}
                </Text>
              </View>

              {/* HOSTIA */}
              <TouchableOpacity
                onPress={() => goToTeam(match.teams.away.id)}
                style={styles.teamContainer}
              >
                <Image
                  source={{ uri: match.teams.away.logo }}
                  style={styles.bigLogo}
                  resizeMode="contain"
                />
                <Text style={styles.teamName}>{match.teams.away.name}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* INFO O ZÁPASE */}
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>📊 Informácie o zápase</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Liga</Text>
              <Text style={styles.detailValue}>
                {match.league?.name}{" "}
                {match.league?.season ? `(${match.league.season})` : ""}
              </Text>
            </View>

            {match.league?.round && (
              <>
                <View style={styles.separator} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Kolo</Text>
                  <Text style={styles.detailValue}>{match.league.round}</Text>
                </View>
              </>
            )}

            <View style={styles.separator} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={styles.detailValue}>
                {match.fixture.status.long}
              </Text>
            </View>

            {match.score?.halftime?.home !== null &&
              match.score?.halftime?.away !== null && (
                <>
                  <View style={styles.separator} />
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Polčas</Text>
                    <Text style={styles.detailValue}>
                      {match.score.halftime.home} :{" "}
                      {match.score.halftime.away}
                    </Text>
                  </View>
                </>
              )}
          </View>

          {/* MIESTO A ČAS */}
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>📍 Miesto a Čas</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Dátum</Text>
              <Text style={styles.detailValue}>{matchDate}</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Štadión</Text>
              <Text style={styles.detailValue}>
                {match.fixture.venue.name || "Neznámy"}
              </Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mesto</Text>
              <Text style={styles.detailValue}>
                {match.fixture.venue.city || "Neznáme"}
              </Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rozhodca</Text>
              <Text style={styles.detailValue}>
                {match.fixture.referee || "Neznámy"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    alignItems: "center",
  },
  maxWidthContainer: {
    width: "100%",
    maxWidth: 600,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
  },

  backButton: {
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  backText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  leagueHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 12,
    borderRadius: 12,
  },
  leagueLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
  },
  leagueName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  leagueCountry: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: "uppercase",
  },

  scoreCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusLive: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  statusFinished: {
    backgroundColor: "rgba(100, 100, 100, 0.2)",
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    textTransform: "uppercase",
  },

  teamsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },

  teamContainer: {
    flex: 1,
    alignItems: "center",
  },

  bigLogo: {
    width: 64,
    height: 64,
    marginBottom: 10,
  },

  teamName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },

  scoreContainer: {
    paddingHorizontal: 10,
  },

  bigScore: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.accent,
  },

  detailsCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },

  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 16,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },

  detailLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  detailValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },

  separator: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 4,
  },
});
