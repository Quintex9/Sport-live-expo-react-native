import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

const STAT_NAMES: Record<string, string> = { 
  'Ball Possession': 'Držanie lopty', 
  'Total Shots': 'Strely', 
  'Shots on Goal': 'Na bránu', 
  'Shots off Goal': 'Vedľa brány',
  'Shots Blocked': 'Blokované',
  'Shots insidebox': 'V pokutovom území',
  'Shots outsidebox': 'Mimo pokutového územia',
  'Corner Kicks': 'Rohy', 
  'Fouls': 'Fauly', 
  'Offsides': 'Ofsajdy', 
  'Yellow Cards': 'Žlté karty',
  'Red Cards': 'Červené karty',
  'Total passes': 'Prihrávky celkom',
  'Passes accurate': 'Presné prihrávky',
  'Passes %': 'Prihrávky %',
  'expected_goals': 'Očakávané góly (xG)',
};

interface StatisticsCardProps {
  homeStats: any[];
  awayStats: any[];
  statistics: any[];
  isFromDB: boolean;
  getStat: (stats: any[], type: string) => any;
}

export const StatisticsCard = ({ homeStats, awayStats, statistics, isFromDB, getStat }: StatisticsCardProps) => {
  if (homeStats.length === 0) {
    return (
      <Text style={styles.noEventsText}>
        {isFromDB ? 'Žiadne štatistiky v databáze pre tento zápas' : 'Žiadne štatistiky dostupné'}
      </Text>
    );
  }

  return (
    <>
      {['Ball Possession', 'Total Shots', 'Shots on Goal', 'Shots off Goal', 'Shots Blocked', 'Shots insidebox', 'Shots outsidebox', 'Corner Kicks', 'Fouls', 'Offsides', 'Yellow Cards', 'Red Cards', 'Total passes', 'Passes accurate', 'Passes %', 'expected_goals'].map((type) => {
        const home = getStat(homeStats, type);
        const away = getStat(awayStats, type);
        const homeNum = parseInt(String(home).replace('%', '').replace('.', '')) || parseFloat(String(home)) || 0;
        const awayNum = parseInt(String(away).replace('%', '').replace('.', '')) || parseFloat(String(away)) || 0;
        const total = homeNum + awayNum || 1;
        const statLabel = STAT_NAMES[type] || type.replace(/([A-Z])/g, ' $1').trim();
        return (
          <View key={type} style={styles.statRow}>
            <Text style={styles.statValue}>{home}</Text>
            <View style={styles.statCenter}>
              <Text style={styles.statLabel}>{statLabel}</Text>
              <View style={styles.statBarBg}>
                <View style={[styles.statBarHome, { width: `${(homeNum / total) * 100}%` }]} />
              </View>
            </View>
            <Text style={styles.statValue}>{away}</Text>
          </View>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  statRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  statValue: { color: "#fff", fontSize: 13, fontWeight: "600", width: 45, textAlign: "center" },
  statCenter: { flex: 1, marginHorizontal: 8 },
  statLabel: { color: colors.textSecondary, fontSize: 10, textAlign: "center", marginBottom: 4 },
  statBarBg: { height: 4, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2 },
  statBarHome: { height: 4, backgroundColor: colors.accent, borderRadius: 2 },
  noEventsText: { color: colors.textSecondary, fontSize: 12, textAlign: "center", paddingVertical: 8 },
});

