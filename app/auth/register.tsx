import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { SupabaseClient } from "../../lib/supabase";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister() {
    const { error } = await SupabaseClient.auth.signUp({
      email,
      password,
    });

    if (error) return alert(error.message);

    alert("Registrácia úspešná! Teraz sa môžeš prihlásiť.");
    router.replace("/auth/login");
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <View style={styles.inner}>

        <Text style={styles.title}>Registrácia</Text>
        <Text style={styles.subtitle}>Vytvor si účet </Text>

        {/* EMAIL */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="zadaj email"
          placeholderTextColor="#777"
          onChangeText={setEmail}
          value={email}
        />

        {/* HESLO */}
        <Text style={styles.label}>Heslo</Text>
        <TextInput
          style={styles.input}
          placeholder="•••••••••"
          placeholderTextColor="#777"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Registrovať sa</Text>
        </TouchableOpacity>

        <View style={styles.switchWrap}>
          <Text style={styles.switchText}>Už máš účet?</Text>
          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <Text style={styles.switchLink}>Prihlásiť sa</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0E",
  },

  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  title: {
    color: "#F5F5F7",
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: 6,
  },

  subtitle: {
    color: "#8F9094",
    textAlign: "center",
    marginBottom: 40,
    fontSize: 16,
    letterSpacing: 0.2,
  },

  label: {
    color: "#C1C1C3",
    fontSize: 15,
    marginBottom: 8,
    fontWeight: "500",
  },

  input: {
    backgroundColor: "#111216",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    color: "#F3F3F4",
    fontSize: 16,
    marginBottom: 22,

    // veľmi jemný profesionálny tieň (takmer neviditeľný)
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },

  button: {
    backgroundColor: "#5B5AF5",
    paddingVertical: 18,
    borderRadius: 18,
    marginTop: 16,

    // hladký hlboký glow (senior-level)
    shadowColor: "#5B5AF5",
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 17,
    letterSpacing: 0.5,
    textAlign: "center",
  },

  switchWrap: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 28,
  },

  switchText: {
    color: "#9A9A9C",
    marginRight: 6,
    fontSize: 14.5,
  },

  switchLink: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    textDecorationLine: "underline",
  },
});
