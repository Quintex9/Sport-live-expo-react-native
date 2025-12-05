import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

interface InfoCardProps {
  fixture: any;
  league: any;
  isFromDB: boolean;
  match: any;
  events: any[];
  statistics: any[];
  lineups: any[];
}

export const InfoCard = ({ fixture, league, isFromDB, match, events, statistics, lineups }: InfoCardProps) => {
  return (
    <>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Štadión</Text>
        <Text style={styles.infoValue}>{fixture.venue?.name || '-'}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Mesto</Text>
        <Text style={styles.infoValue}>{fixture.venue?.city || '-'}</Text>
      </View>
      {fixture.referee ? (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Rozhodca</Text>
          <Text style={styles.infoValue}>{fixture.referee}</Text>
        </View>
      ) : null}
      {league?.round ? (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Kolo</Text>
          <Text style={styles.infoValue}>{league.round}</Text>
        </View>
      ) : null}
      {league?.season ? (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Sezóna</Text>
          <Text style={styles.infoValue}>{league.season}</Text>
        </View>
      ) : null}
      {league?.country ? (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Krajina</Text>
          <Text style={styles.infoValue}>{league.country}</Text>
        </View>
      ) : null}
      {fixture.timezone && fixture.timezone !== 'UTC' ? (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Časové pásmo</Text>
          <Text style={styles.infoValue}>{fixture.timezone}</Text>
        </View>
      ) : null}
      {isFromDB && (match as any).dbInfo ? (
        <>
          {(match as any).dbInfo.updated_at ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Aktualizované</Text>
              <Text style={styles.infoValue}>
                {new Date((match as any).dbInfo.updated_at).toLocaleString('sk-SK', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          ) : null}
          {(match as any).dbInfo.details_synced_at ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Detaily synchronizované</Text>
              <Text style={styles.infoValue}>
                {new Date((match as any).dbInfo.details_synced_at).toLocaleString('sk-SK', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          ) : null}
          {(match as any).dbInfo.created_at ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vytvorené</Text>
              <Text style={styles.infoValue}>
                {new Date((match as any).dbInfo.created_at).toLocaleDateString('sk-SK', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
          ) : null}
          {events.length > 0 ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Eventy</Text>
              <Text style={styles.infoValue}>{events.length} udalostí</Text>
            </View>
          ) : null}
          {statistics.length > 0 ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Štatistiky</Text>
              <Text style={styles.infoValue}>{statistics.length} tímov</Text>
            </View>
          ) : null}
          {lineups.length > 0 ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Zostavy</Text>
              <Text style={styles.infoValue}>{lineups.length} tímov</Text>
            </View>
          ) : null}
          {(match as any).dbInfo.fixture_id ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID zápasu</Text>
              <Text style={styles.infoValue}>{(match as any).dbInfo.fixture_id}</Text>
            </View>
          ) : null}
        </>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  infoLabel: { color: colors.textSecondary, fontSize: 13 },
  infoValue: { color: "#fff", fontSize: 13, fontWeight: "500" },
});

