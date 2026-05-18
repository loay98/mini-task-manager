import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LoginScreen } from "./src/features/auth";
import { TasksScreen } from "./src/features/tasks";
import { useAuthBootstrap } from "./src/hooks/useAuthBootstrap";
import { useAuthStore } from "./src/store/authStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function AppContent() {
  const hydrating = useAuthBootstrap();
  const token = useAuthStore((state) => state.token);

  if (hydrating) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#1f6feb" />
      </SafeAreaView>
    );
  }

  return token ? <TasksScreen /> : <LoginScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <View style={styles.root}>
          <StatusBar style="dark" />
          <AppContent />
        </View>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f4f7fb",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f7fb",
  },
});
