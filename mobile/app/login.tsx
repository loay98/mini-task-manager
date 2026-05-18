import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { api } from "../src/lib/api";
import { useAuthStore } from "../src/store/auth-store";
import type { ApiEnvelope, LoginResponse } from "../src/types/api";

export default function LoginScreen() {
  const { login } = useAuthStore();
  const [email, setEmail] = useState("worker@test.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      const response = await api.post<ApiEnvelope<LoginResponse>>("/auth/login", { email, password });

      if (response.data.data.user.role !== "worker") {
        Alert.alert("Access denied", "Only worker accounts can use this mobile app.");
        return;
      }

      await login(response.data.data.token, response.data.data.user);
      router.replace("/my-tasks");
    } catch {
      Alert.alert("Login failed", "Please verify your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={styles.root}>
      <View style={styles.container}>
        <Card>
          <Card.Title title="Worker Login" subtitle="Sign in to view assigned tasks" />
          <Card.Content style={styles.form}>
            <TextInput label="Email" mode="outlined" value={email} onChangeText={setEmail} autoCapitalize="none" />
            <TextInput label="Password" mode="outlined" secureTextEntry value={password} onChangeText={setPassword} />
            <Button mode="contained" onPress={onSubmit} loading={loading} disabled={loading}>
              Sign In
            </Button>
            <Text variant="bodySmall">Seed worker: worker@test.com / password</Text>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f5f7f4",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  form: {
    gap: 12,
  },
});
