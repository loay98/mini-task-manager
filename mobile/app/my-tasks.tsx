import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Appbar, Button, Card, Chip, Text } from "react-native-paper";
import { api } from "../src/lib/api";
import { useAuthStore } from "../src/store/auth-store";
import type { ApiEnvelope, PaginatedResponse, Task } from "../src/types/api";

export default function MyTasksScreen() {
  const { logout, user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTasks = useCallback(async () => {
    try {
      setError("");
      const response = await api.get<ApiEnvelope<PaginatedResponse<Task>>>("/my-tasks");
      setTasks(response.data.data.items);
    } catch {
      setError("Unable to load assigned tasks.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const completeTask = async (taskId: number) => {
    try {
      await api.patch(`/tasks/${taskId}/complete`);
      await fetchTasks();
    } catch {
      setError("Failed to mark task as completed.");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const onLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <View style={styles.root}>
      <Appbar.Header>
        <Appbar.Content title="My Tasks" subtitle={user?.name ?? "Worker"} />
        <Appbar.Action icon="logout" onPress={onLogout} />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? <Text>Loading tasks...</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && tasks.length === 0 ? (
          <Text>No assigned tasks right now.</Text>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Text variant="titleMedium">{task.title}</Text>
                <Chip compact>{task.status}</Chip>
                {task.status === "pending" ? (
                  <Button mode="contained" onPress={() => completeTask(task.id)}>
                    Mark Completed
                  </Button>
                ) : (
                  <Button mode="outlined" disabled>
                    Completed
                  </Button>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f5f7f4",
  },
  container: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderRadius: 12,
  },
  cardContent: {
    gap: 10,
  },
  error: {
    color: "#c03a2b",
  },
});
