import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

interface EventsListProps {
  events: any[];
  teams: any;
  isFromDB: boolean;
  getIcon: (e: any) => string;
}

export const EventsList = ({ events, teams, isFromDB, getIcon }: EventsListProps) => {
  if (events.length === 0) {
    return (
      <Text style={styles.noEventsText}>
        {isFromDB ? 'Žiadne eventy v databáze pre tento zápas' : 'Žiadne eventy dostupné'}
      </Text>
    );
  }

  return (
    <>
      {events.slice(0, 30).map((e: any, i: number) => {
        const isHome = e.team?.id === teams?.home?.id;
        const timeDisplay = e.time?.extra ? `${e.time.elapsed || 0}+${e.time.extra}'` : `${e.time?.elapsed || 0}'`;
        return (
          <View key={i} style={[styles.eventRow, isHome ? styles.eventLeft : styles.eventRight]}>
            {isHome ? (
              <View style={styles.eventTextContainer}>
                <Text style={styles.eventText}>
                  {e.player?.name || 'Neznámy hráč'}
                  {e.assist?.name ? <Text style={styles.eventAssist}> ({e.assist.name})</Text> : null}
                  {e.detail ? <Text style={styles.eventDetail}> • {e.detail}</Text> : null}
                </Text>
                {e.comments ? <Text style={styles.eventComments}>{e.comments}</Text> : null}
                {e.period ? <Text style={styles.eventPeriod}>{e.period}</Text> : null}
              </View>
            ) : null}
            <View style={styles.eventBadge}>
              <Text style={styles.eventIcon}>{getIcon(e)}</Text>
              <Text style={styles.eventTime}>{timeDisplay}</Text>
            </View>
            {!isHome ? (
              <View style={styles.eventTextContainer}>
                <Text style={styles.eventText}>
                  {e.player?.name || 'Neznámy hráč'}
                  {e.assist?.name ? <Text style={styles.eventAssist}> ({e.assist.name})</Text> : null}
                  {e.detail ? <Text style={styles.eventDetail}> • {e.detail}</Text> : null}
                </Text>
                {e.comments ? <Text style={styles.eventComments}>{e.comments}</Text> : null}
                {e.period ? <Text style={styles.eventPeriod}>{e.period}</Text> : null}
              </View>
            ) : null}
          </View>
        );
      })}
      {events.length > 30 ? (
        <Text style={styles.moreEventsText}>+ {events.length - 30} ďalších eventov</Text>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  eventRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  eventLeft: { justifyContent: "flex-start" },
  eventRight: { justifyContent: "flex-end" },
  eventBadge: { alignItems: "center", marginHorizontal: 12, minWidth: 40 },
  eventIcon: { fontSize: 16 },
  eventTime: { color: colors.textSecondary, fontSize: 10 },
  eventText: { color: "#fff", fontSize: 12, flex: 1 },
  eventTextContainer: { flex: 1 },
  eventDetail: { color: colors.textSecondary, fontSize: 11 },
  eventAssist: { color: colors.accent, fontSize: 11 },
  eventComments: { color: colors.textSecondary, fontSize: 10, fontStyle: 'italic', marginTop: 2 },
  eventPeriod: { color: colors.textSecondary, fontSize: 9, marginTop: 2 },
  moreEventsText: { color: colors.textSecondary, fontSize: 11, textAlign: 'center', marginTop: 8, fontStyle: 'italic' },
  noEventsText: { color: colors.textSecondary, fontSize: 12, textAlign: "center", paddingVertical: 8 },
});

