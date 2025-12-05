import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions
} from 'react-native';
import { colors } from '../theme/colors';

const SCREEN_HEIGHT = Dimensions.get('window').height;

type LeagueSelectorProps = {
  leagues: any[];
  selectedLeague: string | null;
  onSelect: (leagueId: string | null) => void;
};

export const LeagueSelector = ({
  leagues,
  selectedLeague,
  onSelect,
}: LeagueSelectorProps) => {

  const [expanded, setExpanded] = useState(false);

  return (
    <View style={{ zIndex: 20 }}>
      {/* Tlačidlo */}
      <TouchableOpacity
        style={styles.leagueButton}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.leagueButtonText}>
          {selectedLeague
            ? leagues.find(l => String(l?.id) === selectedLeague)?.name || 'Všetky ligy'
            : 'Všetky ligy'}
        </Text>

        <Text style={styles.leagueButtonArrow}>
          {expanded ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {/* Rozbalený zoznam */}
      {expanded && (
        <ScrollView
          style={styles.leagueList}
          nestedScrollEnabled
          showsVerticalScrollIndicator
        >
          {/* Všetky ligy */}
          <TouchableOpacity
            style={styles.leagueItem}
            onPress={() => {
              onSelect(null);
              setExpanded(false);
            }}
          >
            <Text style={styles.leagueItemText}>Všetky ligy</Text>
          </TouchableOpacity>

          {/* Ostatné ligy */}
          {leagues.length > 0 ? (
            leagues.map((league) => (
              <TouchableOpacity
                key={league?.id}
                style={styles.leagueItem}
                onPress={() => {
                  onSelect(String(league?.id));
                  setExpanded(false);
                }}
              >
                <Text style={styles.leagueItemText}>{league?.name || `Liga ${league?.id}`}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.leagueItem}>
              <Text style={[styles.leagueItemText, { color: colors.textSecondary }]}>Žiadne ligy</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  leagueButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  leagueButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  leagueButtonArrow: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  leagueList: {
    maxHeight: SCREEN_HEIGHT * 0.4,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    paddingVertical: 6,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    overflow: 'hidden',
    zIndex: 20,
  },

  leagueItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  leagueItemText: {
    color: colors.textPrimary,
    fontSize: 15,
  },
});
