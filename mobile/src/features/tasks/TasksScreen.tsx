import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { CenteredMessage } from "../../components/CenteredMessage";
import { Toast } from "../../components/Toast";
import type { ToastMessage } from "../../components/Toast";
import { TaskCard } from "../../components/TaskCard";
import { useAuthStore } from "../../store/authStore";
import type { Task } from "../../types/task";
import { getErrorMessage } from "../../utils/errors";
import { tasksQueryKey, tasksCountsQueryKey, useCompleteTaskMutation, useTasksQuery, useTasksCountQuery } from "./useTasks";

type StatusFilter = "all" | "pending" | "completed";

export function TasksScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [completingTaskId, setCompletingTaskId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const [lastErrorSeen, setLastErrorSeen] = useState<string | null>(null);

  const tasksQuery = useTasksQuery(statusFilter, searchText.trim());
  const tasksCountQuery = useTasksCountQuery();
  const completeTaskMutation = useCompleteTaskMutation();

  const tasks = useMemo(
    () => tasksQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [tasksQuery.data]
  );

  // No client-side filtering - all filtering is done by the API

  const taskCounts = useMemo(() => {
    return tasksCountQuery.data ?? { all: 0, pending: 0, completed: 0 };
  }, [tasksCountQuery.data]);

  // Watch for completion errors and show toast
  useEffect(() => {
    if (completeTaskMutation.error) {
      const errorMsg = getErrorMessage(completeTaskMutation.error, "Failed to mark task as completed.");
      if (errorMsg !== lastErrorSeen) {
        setToastMessage({
          id: `error-${Date.now()}`,
          text: errorMsg,
          type: "error",
          duration: 4000,
        });
        setLastErrorSeen(errorMsg);
      }
    }
  }, [completeTaskMutation.error, lastErrorSeen]);

  // Watch for task fetch errors and show toast
  useEffect(() => {
    if (tasksQuery.error) {
      const errorMsg = getErrorMessage(tasksQuery.error, "Failed to load tasks.");
      if (errorMsg !== lastErrorSeen) {
        setToastMessage({
          id: `error-${Date.now()}`,
          text: errorMsg,
          type: "error",
          duration: 4000,
        });
        setLastErrorSeen(errorMsg);
      }
    }
  }, [tasksQuery.error, lastErrorSeen]);

  const onLogout = async () => {
    await logout();
    queryClient.removeQueries({ queryKey: tasksQueryKey(statusFilter, searchText.trim()) });
    queryClient.removeQueries({ queryKey: tasksCountsQueryKey });
  };

  const onComplete = async (taskId: number) => {
    Alert.alert(
      "Mark as Completed?",
      "Are you sure you want to mark this task as completed?",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Complete",
          onPress: async () => {
            try {
              setCompletingTaskId(taskId);
              await completeTaskMutation.mutateAsync(taskId);
              // Show success toast
              setToastMessage({
                id: `success-${Date.now()}`,
                text: "Task marked as completed!",
                type: "success",
                duration: 2500,
              });
              setLastErrorSeen(null);
            } catch {
              // Error toast handled by useEffect
            } finally {
              setCompletingTaskId(null);
            }
          },
        },
      ]
    );
  };

  const topError = tasksQuery.error
    ? getErrorMessage(tasksQuery.error, "Unable to load tasks.")
    : completeTaskMutation.error
      ? getErrorMessage(completeTaskMutation.error, "Unable to update task.")
      : "";

  if (tasksQuery.isPending) {
    return (
      <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
        <CenteredMessage title="Loading tasks" subtitle="Please wait a moment." loading />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 6) }]}>
        <View>
          <Text style={styles.heading}>My Tasks</Text>
          <Text style={styles.subheading}>{user?.name ?? "Worker"}</Text>
        </View>
        <Pressable onPress={onLogout} style={({ pressed }) => [styles.logoutButton, pressed && styles.buttonPressed]}>
          <Text style={styles.logoutLabel}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search by task title or task ID"
          placeholderTextColor="#9ca3af"
          style={styles.searchInput}
        />
        <View style={styles.filterRow}>
          {(["all", "pending", "completed"] as const).map((filter) => {
            const selected = statusFilter === filter;
            const count = taskCounts[filter];
            return (
              <Pressable
                key={filter}
                onPress={() => setStatusFilter(filter)}
                style={({ pressed }) => [
                  styles.filterChip,
                  selected && styles.filterChipSelected,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={selected ? styles.filterLabelSelected : styles.filterLabel}>
                  {filter[0].toUpperCase() + filter.slice(1)} ({count})
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {(tasksQuery.isRefetching || completeTaskMutation.isPending) ? (
        <View style={styles.topLoaderRow}>
          <ActivityIndicator size="small" color="#1f6feb" />
          <Text style={styles.topLoaderText}>Syncing tasks...</Text>
        </View>
      ) : null}

      {topError ? <Text style={styles.error}>{topError}</Text> : null}

      <FlatList<Task>
        data={tasks}
        keyExtractor={(item) => `task-${item.id}`}
        contentContainerStyle={[
          styles.listContent,
          tasks.length === 0 && styles.emptyListContent,
        ]}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            disabled={completeTaskMutation.isPending}
            isCompleting={completingTaskId === item.id}
            onComplete={onComplete}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={tasksQuery.isRefetching}
            onRefresh={() => {
              void tasksQuery.refetch();
            }}
          />
        }
        onEndReachedThreshold={0.2}
        onEndReached={() => {
          if (tasksQuery.hasNextPage && !tasksQuery.isFetchingNextPage) {
            void tasksQuery.fetchNextPage();
          }
        }}
        ListEmptyComponent={
          <CenteredMessage
            title={tasks.length === 0 ? "No assigned tasks" : "No matching tasks"}
            subtitle={
              tasks.length === 0
                ? "You are all caught up. Pull down to refresh."
                : "Try a different search term."
            }
          />
        }
        ListFooterComponent={
          tasksQuery.isFetchingNextPage ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color="#1f6feb" />
              <Text style={styles.footerText}>Loading more tasks...</Text>
            </View>
          ) : null
        }
      />

      <View style={[styles.toastContainer, { top: insets.top + 20, left: 0, right: 0 }]}>
        <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f4f7fb",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  heading: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  subheading: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
  },
  logoutLabel: {
    color: "#374151",
    fontWeight: "700",
    fontSize: 13,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  filterRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#ffffff",
  },
  filterChipSelected: {
    borderColor: "#1f6feb",
    backgroundColor: "#e8f0fe",
  },
  filterLabel: {
    color: "#4b5563",
    fontSize: 13,
    fontWeight: "600",
  },
  filterLabelSelected: {
    color: "#1e40af",
    fontSize: 13,
    fontWeight: "700",
  },
  topLoaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#eef2ff",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  topLoaderText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  footerLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 13,
    color: "#6b7280",
  },
  error: {
    marginHorizontal: 16,
    marginTop: 10,
    color: "#b91c1c",
    fontSize: 13,
  },
  toastContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    pointerEvents: "none",
  },
});
