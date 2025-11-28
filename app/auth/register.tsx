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
        <Text style={styles.subtitle}>Vytvor si účet 🚀</Text>

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
    backgroundColor: "#0D0D0D",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 26,
  },
  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    color: "#999",
    textAlign: "center",
    marginBottom: 30,
  },
  label: {
    color: "#aaa",
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    color: "#fff",
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
  switchWrap: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },
  switchText: {
    color: "#aaa",
    marginRight: 6,
  },
  switchLink: {
    color: "#fff",
    fontWeight: "700",
  },
});
