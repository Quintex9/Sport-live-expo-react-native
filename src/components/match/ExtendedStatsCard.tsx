import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

interface ExtendedStatsCardProps {
  statistics: any[];
  teams: any;
}

export const ExtendedStatsCard = ({ statistics, teams }: ExtendedStatsCardProps) => {
  return (
    <>
      {statistics.map((stat: any, idx: number) => {
        const teamName = stat.team?.name || (idx === 0 ? teams?.home?.name : teams?.away?.name) || '';
        const rawStats = stat.dbInfo?.raw;
        return (
          <View key={idx} style={styles.extendedStatsSection}>
            <Text style={styles.extendedStatsTeam}>{teamName}</Text>
            {rawStats ? (
              <View style={styles.extendedStatsGrid}>
                {rawStats.shots_total !== null ? (
                  <View style={styles.extendedStatItem}>
                    <Text style={styles.extendedStatLabel}>Strely celkom</Text>
                    <Text style={styles.extendedStatValue}>{rawStats.shots_total}</Text>
                  </View>
                ) : null}
                {rawStats.shots_on_target !== null ? (
                  <View style={styles.extendedStatItem}>
                    <Text style={styles.extendedStatLabel}>Na bránu</Text>
                    <Text style={styles.extendedStatValue}>{rawStats.shots_on_target}</Text>
                  </View>
                ) : null}
                {rawStats.shots_off_target !== null ? (
                  <View style={styles.extendedStatItem}>
                    <Text style={styles.extendedStatLabel}>Vedľa brány</Text>
                    <Text style={styles.extendedStatValue}>{rawStats.shots_off_target}</Text>
                  </View>
                ) : null}
                {rawStats.shots_blocked !== null ? (
                  <View style={styles.extendedStatItem}>
                    <Text style={styles.extendedStatLabel}>Blokované</Text>
                    <Text style={styles.extendedStatValue}>{rawStats.shots_blocked}</Text>
                  </View>
                ) : null}
                {rawStats.shots_inside_box !== null ? (
                  <View style={styles.extendedStatItem}>
                    <Text style={styles.extendedStatLabel}>V pokutovom území</Text>
                    <Text style={styles.extendedStatValue}>{rawStats.shots_inside_box}</Text>
                  </View>
                ) : null}
                {rawStats.shots_outside_box !== null ? (
                  <View style={styles.extendedStatItem}>
                    <Text style={styles.extendedStatLabel}>Mimo pokutového územia</Text>
                    <Text style={styles.extendedStatValue}>{rawStats.shots_outside_box}</Text>
                  </View>
                ) : null}
                {rawStats.passes_total !== null ? (
                  <View style={styles.extendedStatItem}>
                    <Text style={styles.extendedStatLabel}>Prihrávky celkom</Text>
                    <Text style={styles.extendedStatValue}>{rawStats.passes_total}</Text>
                  </View>
                ) : null}
                {rawStats.passes_accurate !== null ? (
                  <View style={styles.extendedStatItem}>
                    <Text style={styles.extendedStatLabel}>Presné prihrávky</Text>
                    <Text style={styles.extendedStatValue}>{rawStats.passes_accurate}</Text>
                  </View>
                ) : null}
                {rawStats.expected_goals_xg !== null ? (
                  <View style={styles.extendedStatItem}>
                    <Text style={styles.extendedStatLabel}>Očakávané góly (xG)</Text>
                    <Text style={styles.extendedStatValue}>{parseFloat(rawStats.expected_goals_xg).toFixed(2)}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  extendedStatsSection: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  extendedStatsTeam: { color: colors.accent, fontSize: 13, fontWeight: '600', marginBottom: 12 },
  extendedStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  extendedStatItem: { 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    padding: 8, 
    borderRadius: 8, 
    minWidth: '30%',
    flex: 1,
    maxWidth: '48%',
  },
  extendedStatLabel: { color: colors.textSecondary, fontSize: 10, marginBottom: 4 },
  extendedStatValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

