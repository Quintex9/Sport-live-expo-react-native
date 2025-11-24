import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useLiveMatches } from './src/hooks/useLiveMatches';
import { MatchCard } from './src/components/MatchCard';
import { colors } from './src/theme/colors';
import { SportButtons } from './src/components/SportButtons';
import { Header } from './src/components/Header';


export default function App() {
  //State pre zistenie aktuálneho športu
  const [sport, setSport] = useState<'football' | 'basketball' | 'baseball' | 'nfl' | 'hockey' | 'handball'>('football');

  // Načítanie dát z custom hooku
  const { data, loading, refreshing, onRefresh } = useLiveMatches(sport);

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
        key={numColumns} // Zmena kľúča vynúti re-render pri zmene layoutu
        data={data}
        keyExtractor={(item) => String(item.fixture?.id ?? item.id)}
        renderItem={({ item }) => <MatchCard match={item} />}
        numColumns={numColumns}
        contentContainerStyle={[styles.listContent, isCompact && styles.listContentCompact]}
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
        showsVerticalScrollIndicator={false}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Žiadne živé zápasy</Text>
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
          <Header sport={sport} count={data.length}></Header>

          {/* Športové menu */}
          <SportButtons sport={sport} onChange={setSport}  />

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 10,
  },
  headerCompact: {
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: 'bold',
    fontSize: 12,
  },
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
