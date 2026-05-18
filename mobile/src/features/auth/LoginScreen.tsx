import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLoginMutation } from "./useLoginMutation";
import { getErrorMessage } from "../../utils/errors";

export function LoginScreen() {
  const loginMutation = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");

  const onSubmit = async () => {
    setErrorText("");

    try {
      await loginMutation.mutateAsync({ email: email.trim(), password });
    } catch (error) {
      setErrorText(getErrorMessage(error, "Login failed. Please try again."));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={styles.root}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Task Manager</Text>
        <Text style={styles.subtitle}>Sign in to view and complete your assigned tasks.</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="email"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          secureTextEntry
          placeholder="password"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        {errorText ? <Text style={styles.error}>{errorText}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={onSubmit}
          disabled={loginMutation.isPending}
        >
          <Text style={styles.buttonLabel}>{loginMutation.isPending ? "Signing In..." : "Sign In"}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#f4f7fb",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#4b5563",
    marginBottom: 8,
  },
  label: {
    fontWeight: "600",
    color: "#374151",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111827",
    fontSize: 15,
    backgroundColor: "#ffffff",
  },
  error: {
    color: "#b91c1c",
    fontSize: 13,
    marginTop: 2,
  },
  button: {
    marginTop: 8,
    backgroundColor: "#1f6feb",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonLabel: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
