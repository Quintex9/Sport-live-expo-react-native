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
import { colors } from "../../src/theme/colors";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const { error } = await SupabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return alert(error.message);

    router.replace("/"); // domovská stránka
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <View style={styles.inner}>

        <TouchableOpacity style={styles.button1} onPress={()=>router.push('/')}><Text style={styles.buttonText}>Späť</Text></TouchableOpacity>

        <Text style={styles.title}>Prihlásenie</Text>

        {/* EMAIL */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="zadaj email"
          placeholderTextColor={colors.textSecondary}
          onChangeText={setEmail}
          value={email}
        />

        {/* HESLO */}
        <Text style={styles.label}>Heslo</Text>
        <TextInput
          style={styles.input}
          placeholder="•••••••••"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Prihlásiť sa</Text>
        </TouchableOpacity>

        <View style={styles.switchWrap}>
          <Text style={styles.switchText}>Nemáš účet?</Text>
          <TouchableOpacity onPress={() => router.push("/auth/register")}>
            <Text style={styles.switchLink}>Registrovať sa</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    width: "100%",
    maxWidth: 1024,
    alignSelf: "center",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: 6,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 15,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: 22,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 18,
    borderRadius: 18,
    marginTop: 16,
  },
  button1: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    width: 100,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: colors.background,
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
    color: colors.textSecondary,
    marginRight: 6,
    fontSize: 14.5,
  },
  switchLink: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 15,
    textDecorationLine: "underline",
  },
});
