import React from 'react';
import { View, Text, StyleSheet, Image, Platform, TouchableOpacity } from 'react-native';
import { Match } from '../types/match';
import { colors } from '../theme/colors';
import { Link } from 'expo-router';

export const MatchCard = ({ match, source }: { match: Match; source?: string }) => {
  if (!match || !match.fixture || !match.teams) return null;

  const { teams, goals, fixture } = match;
  const statusShort = fixture?.status?.short ?? "NS";
  const elapsed = fixture?.status?.elapsed ?? 0;

  const isLive = statusShort !== "FT" && statusShort !== "NS";

  const Logo = ({ uri, name }: { uri?: string; name?: string }) => (
    <View style={styles.logoBox}>
      {uri ? (
        <Image source={{ uri }} style={styles.logo} resizeMode="contain" />
      ) : (
        <Text style={styles.initials}>{name?.slice(0, 2).toUpperCase()}</Text>
      )}
    </View>
  );

  const href = source
    ? `/match/${fixture?.id}?source=${source}`
    : `/match/${fixture?.id}`;

  return (
    <Link href={href as any} style={styles.link} asChild>
      <TouchableOpacity style={styles.wrap}>
        <View style={styles.card}>
          
          {/* Horná hlavička – live / čas / dátum pri history */}
          <View style={styles.head}>

            {isLive ? (
              // LIVE zápas
              <View style={styles.liveBadge}>
                <View style={styles.dot} />
                <Text style={styles.liveTxt}>{elapsed}'</Text>
              </View>
            ) : source === 'history' ? (
              // HISTORY (finished) 
              <Text style={styles.historyDate}>
                {fixture?.date
                  ? new Date(fixture.date).toLocaleDateString('sk-SK', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                  : ''}
              </Text>
            ) : (
              // UPCOMING 
              <Text style={styles.time}>
                {fixture?.date
                  ? new Date(fixture.date).toLocaleTimeString('sk-SK', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '-'}
              </Text>
            )}

          </View>

          {/* Tímy + skóre */}
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
      </TouchableOpacity>
    </Link>
  );
};

const styles = StyleSheet.create({
  link: {
    flex: 1,
  },
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

  /* UPCOMING time */
  time: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },

  /* FINISHED date */
  historyDate: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },

  /* LIVE badge */
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
    borderRadius: 18,
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
    minHeight: 32,
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
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
});
