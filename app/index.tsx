import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, useWindowDimensions, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useLiveMatches } from '../src/hooks/useLiveMatches';
import { useMatches } from '../src/hooks/useMatches';
import { MatchCard } from '../src/components/MatchCard';
import { colors } from '../src/theme/colors';
import { SportButtons } from '../src/components/SportButtons';
import { Header } from '../src/components/Header';

// Globálny stav pre zachovanie módu pri navigácii
let savedMode: 'live' | 'history' = 'live';
let savedSport: 'football' | 'basketball' | 'baseball' | 'nfl' | 'hockey' | 'handball' = 'football';

export default function App() {
  // State pre zistenie aktuálneho športu
  const [sport, setSportState] = useState(savedSport);
  const setSport = (s: typeof sport) => { savedSport = s; setSportState(s); };
  
  // State pre prepínanie medzi Live a History
  const [mode, setModeState] = useState(savedMode);
  const setMode = (m: typeof mode) => { savedMode = m; setModeState(m); };

  // Načítanie dát z hookov
  const liveData = useLiveMatches(sport);
  const historyData = useMatches();

  // Vyber aktívne dáta podľa módu
  const activeData = mode === 'live' ? liveData : historyData;
  const { data, loading, refreshing, onRefresh } = activeData;

  // Responzívny layout (1 stĺpec pre mobil, 2 pre tablet/desktop)
  const { width } = useWindowDimensions();
  const isCompact = width < 640;
  const numColumns = isCompact ? 1 : 2;

  // Renderovanie obsahu podľa stavu (loading / data)
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
        key={`${mode}-${numColumns}`} // Zmena kľúča vynúti re-render pri zmene layoutu alebo módu
        data={data}
        keyExtractor={(item) => String(item.fixture?.id ?? item.id)}
        renderItem={({ item }) => <MatchCard match={item} source={mode === 'history' ? 'history' : undefined} />}
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
        {/* Shell obmedzuje maximálnu šírku na veľkých obrazovkách */}
        <View style={[styles.shell, isCompact && styles.shellCompact]}>

          {/* Hlavička aplikácie */}
          <Header sport={sport} count={data.length} mode={mode} />

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

          {/* Športové menu - zobraz len pre Live mód */}
          {mode === 'live' && <SportButtons sport={sport} onChange={setSport} />}

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
  // Prepínač Live / History
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
  // Ostatné štýly
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
