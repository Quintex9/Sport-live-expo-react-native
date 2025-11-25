import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { colors } from "../../src/theme/colors";

import {
    getTeamHeader,
    getTeamStatistics,
    getTeamPlayers,
    getStandings,
} from "../../lib/api";
import TeamPlayers from "../../src/components/TeamPlayers";
import TeamStatistics from "../../src/components/Teamstatistics";
import TeamStandings from "../../src/components/TeamStandings";
import TeamHeader from "../../src/components/TeamHeader";

export default function TeamDetail() {
    const router = useRouter();
    const { id, league, season } = useLocalSearchParams();

    const [header, setHeader] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [players, setPlayers] = useState<any[]>([]);
    const [standing, setStanding] = useState<any>(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadAll() {
            try {
                const [h, s, p, st] = await Promise.all([
                    getTeamHeader(id as string),
                    getTeamStatistics(id as string, league as string, season as string),
                    getTeamPlayers(id as string, season as string),
                    getStandings(league as string, season as string),
                ]);

                setHeader(h);
                setStats(s);
                setPlayers(p);

                const found = st.find((t: any) => t.team.id == id);
                setStanding(found ?? null);
            } catch (e) {
                console.log("TEAM DETAIL ERROR:", e);
            } finally {
                setLoading(false);
            }
        }

        loadAll();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    if (!header) {
        return (
            <View style={styles.center}>
                <Text style={{ color: "#fff" }}>Tím sa nenašiel.</Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: header.team.name,
                    headerTintColor: "#fff",
                    headerStyle: { backgroundColor: colors.background },
                }}
            />

            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <View style={styles.contentWrapper}>
                    {/* TLAČÍTKO SPÄŤ */}
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Späť</Text>
                    </TouchableOpacity>

                    {/* TEAM HEADER */}
                    <TeamHeader team={header.team} />

                    {/*  STATISTICS */}
                    <TeamStatistics stats={stats} />

                    {/* PLAYERS */}
                    <TeamPlayers players={players} />

                    {/*  STANDINGS */}
                    <TeamStandings standing={standing} />
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background,
    },
    scrollContent: {
        alignItems: "center",
        padding: 20,
    },
    contentWrapper: {
        width: "100%",
        maxWidth: 600,
    },
    center: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
    },
    backButton: {
        paddingVertical: 8,
        marginBottom: 8,
    },
    backButtonText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
});
