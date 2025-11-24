import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { Match } from '../types/match';
import { colors } from '../theme/colors';

// Komponent pre zobrazenie jedného zápasu
export const MatchCard = ({ match }: { match: Match }) => {
  const { teams, goals, fixture } = match;
  
  const statusShort = fixture?.status?.short ?? "NS";
  const elapsed = fixture?.status?.elapsed ?? 0;

  const isLive = statusShort !== "FT" && statusShort !== "NS";


  // Helper komponent pre logo tímu (rieši aj chýbajúce logo)
  const Logo = ({ uri, name }: { uri?: string; name?: string }) => (
    <View style={styles.logoBox}>
      {uri ? (
        <Image source={{ uri }} style={styles.logo} resizeMode="contain" />
      ) : (
        <Text style={styles.initials}>{name?.slice(0, 2).toUpperCase()}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        {/* Hlavička: Čas alebo Live indikátor */}
        <View style={styles.head}>
          {isLive ? (
            <View style={styles.liveBadge}>
              <View style={styles.dot} />
              <Text style={styles.liveTxt}>{fixture?.status.elapsed}'</Text>
            </View>
          ) : (
            <Text style={styles.time}>
              {new Date(fixture.date).toLocaleTimeString('sk-SK', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}
        </View>
        {/* Obsah zápasu: Domáci - Skóre - Hostia */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Logo uri={teams.home.logo} name={teams.home.name} />
            <Text style={styles.name} numberOfLines={2}>
              {teams.home.name}
            </Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.score}>
              {goals.home ?? 0} : {goals.away ?? 0}
            </Text>
          </View>
          <View style={styles.col}>
            <Logo uri={teams.away.logo} name={teams.away.name} />
            <Text style={styles.name} numberOfLines={2}>
              {teams.away.name}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minWidth: 160,
    padding: 6,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    // Platformovo špecifické tiene
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      },
    }),
  },
  head: {
    alignItems: 'center',
    marginBottom: 12,
    height: 20,
    justifyContent: 'center',
  },
  time: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.live,
    marginRight: 6,
  },
  liveTxt: {
    color: colors.live,
    fontSize: 11,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  col: {
    flex: 1,
    alignItems: 'center',
    maxWidth: '38%',
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#252f40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18, // Kruhové orezanie loga
  },
  initials: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 14,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    minHeight: 32, // Fixná výška pre max 2 riadky textu
  },
  scoreBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginTop: 12,
  },
  score: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'], // Zarovnanie číslic
    letterSpacing: 1,
  },
});
