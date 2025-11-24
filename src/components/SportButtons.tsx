import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

const SPORTS = [
  { id: "football", label: "Futbal" },
  { id: "baseball", label: "Baseball" },
  { id: "basketball", label: "Basketbal" },
  { id: "nfl", label: "NFL" },
  { id: "hockey", label: "Hokej" },
  { id: "handball", label: "Hádzaná" },
];

type SportType =
  | "football"
  | "basketball"
  | "baseball"
  | "nfl"
  | "hockey"
  | "handball";

interface SportButtonsProps {
  sport: SportType;
  onChange: (sport: SportType) => void;
}

export const SportButtons = ({ sport, onChange }: SportButtonsProps) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={SPORTS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const active = item.id === sport;
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onChange(item.id as SportType)}
              style={[styles.chip, active && styles.activeChip]}
            >
              <Text style={[styles.label, active && styles.activeLabel]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  chip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 6,
    backgroundColor: "#1f2638",
  },

  activeChip: {
    backgroundColor: colors.accent,
  },

  label: {
    color: "#a7b0c0",
    fontWeight: "600",
    fontSize: 14,
  },

  activeLabel: {
    color: "#fff",
    fontWeight: "700",
  },
});
