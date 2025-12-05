import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useLiveMatches } from '../src/hooks/useLiveMatches';
import { useMatches } from '../src/hooks/useMatches';
import { MatchCard } from '../src/components/MatchCard';
import { colors } from '../src/theme/colors';
import { Header } from '../src/components/Header';
import { LeagueSelector } from '../src/components/LeagueSelector';

// Globálny stav pre zachovanie módu pri navigácii
let savedMode: 'live' | 'history' = 'live';

export default function App() {
  // State pre prepínanie medzi Live a History
  const [mode, setModeState] = useState(savedMode);
  const setMode = (m: typeof mode) => { 
    savedMode = m; 
    setModeState(m);
    // Resetuj filter pri zmene módu
    setSelectedLeague(null);
  };

  // State pre typ zápasov (upcoming/finished) - len pre history mód
  const [matchType, setMatchType] = useState<'upcoming' | 'finished'>('upcoming');

  // Načítanie dát z hookov
  const liveData = useLiveMatches("football");
  const historyData = useMatches(matchType);
  const activeData = mode === 'live' ? liveData : historyData;
  const { data, loading, refreshing, onRefresh, error } = activeData;

  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);

  // Extrahovanie unikátnych lig z dát
  const leagues: any[] = [];
  const leagueMap = new Map();
  (data || []).forEach((m: any) => {
    const id = m.league?.id;
    if (id && !leagueMap.has(id)) {
      leagueMap.set(id, true);
      // Použi názov ligy, ak je prázdny alebo neexistuje, použij fallback
      const leagueName = (m.league?.name && m.league.name.trim() !== '') 
        ? m.league.name 
        : `Liga ${id}`;
      leagues.push({
        id: id,
        name: leagueName,
        logo: m.league?.logo,
        country: m.league?.country,
      });
    }
  });

  // Filtrovanie dát podľa vybranej ligy
  const filteredData = selectedLeague
    ? (data || []).filter((m: any) => String(m.league?.id) === selectedLeague)
    : (data || []);

  // Responzívny layout
  const { width } = useWindowDimensions();
  const isCompact = width < 640;
  const numColumns = isCompact ? 1 : 2;

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Načítavam zápasy...</Text>
        </View>
      );
    }

    return (
      <FlatList
        key={`${mode}-${numColumns}`}
        data={filteredData}
        keyExtractor={(item, index) => {
          const key = String(item.fixture?.id ?? item.id ?? index);
          return key;
        }}
        renderItem={({ item, index }) => {
          return (
            <MatchCard match={item} source={mode === 'history' ? 'history' : undefined} />
          );
        }}
        numColumns={numColumns}
        contentContainerStyle={[styles.listContent, isCompact && styles.listContentCompact]}
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
        showsVerticalScrollIndicator={false}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {mode === 'live' ? 'Žiadne živé zápasy' : 'Žiadne zápasy'}
            </Text>
            {error && (
              <Text style={[styles.emptySubText, { color: colors.live, marginTop: 8 }]}>
                Chyba: {error}
              </Text>
            )}
            <Text style={styles.emptySubText}>Skúste potiahnuť pre obnovenie</Text>
          </View>
        }
      />
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar style="light" backgroundColor={colors.background} />

        <View style={[styles.shell, isCompact && styles.shellCompact]}>

          {/* Hlavička */}
          <Header sport="football" count={filteredData.length} mode={mode} />

          {/* Prepínač Live / Zápasy */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'live' && styles.modeButtonActive]}
              onPress={() => setMode('live')}
            >
              <View style={[styles.liveDot, mode === 'live' && styles.liveDotActive]} />
              <Text style={[styles.modeButtonText, mode === 'live' && styles.modeButtonTextActive]}>
                Live
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'history' && styles.modeButtonActive]}
              onPress={() => setMode('history')}
            >
              <Text style={[styles.modeButtonText, mode === 'history' && styles.modeButtonTextActive]}>
                Zápasy
              </Text>
            </TouchableOpacity>
          </View>

          {/* Prepínač Upcoming / Finished - len pre history mód */}
          {mode === 'history' && (
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeButton, matchType === 'upcoming' && styles.modeButtonActive]}
                onPress={() => {
                  setMatchType('upcoming');
                  setSelectedLeague(null);
                }}
              >
                <Text style={[styles.modeButtonText, matchType === 'upcoming' && styles.modeButtonTextActive]}>
                  Budúce
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, matchType === 'finished' && styles.modeButtonActive]}
                onPress={() => {
                  setMatchType('finished');
                  setSelectedLeague(null);
                }}
              >
                <Text style={[styles.modeButtonText, matchType === 'finished' && styles.modeButtonTextActive]}>
                  Odohraté
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Dropdown / Výber lig */}
          <LeagueSelector
            leagues={leagues}
            selectedLeague={selectedLeague}
            onSelect={(id) => setSelectedLeague(id)}
          />


          {renderContent()}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  shell: {
    flex: 1,
    width: '100%',
    maxWidth: 1024,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  shellCompact: {
    paddingHorizontal: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
    fontSize: 14,
  },

  // Prepínač
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  modeButtonActive: {
    backgroundColor: colors.surface,
  },
  modeButtonText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  modeButtonTextActive: {
    color: colors.textPrimary,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textSecondary,
    marginRight: 6,
  },
  liveDotActive: {
    backgroundColor: colors.accent,
  },

  // Zápasy
  listContent: {
    paddingHorizontal: 6,
    paddingBottom: 48,
    paddingTop: 6,
  },
  listContentCompact: {
    paddingHorizontal: 0,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    columnGap: 16,
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
    padding: 20,
  },
  emptyText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
