import { useCallback, useEffect, useMemo, useState } from "react";
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
type SortBy = "id" | "title" | "created_at" | "updated_at" | "due_date";
type SortOrder = "asc" | "desc";

const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: "Task ID", value: "id" },
  { label: "Name", value: "title" },
  { label: "Assigned Date", value: "created_at" },
  { label: "Updated", value: "updated_at" },
  { label: "Due Date", value: "due_date" },
];

export function TasksScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const [lastErrorSeen, setLastErrorSeen] = useState<string | null>(null);

  const tasksQuery = useTasksQuery(statusFilter, searchText.trim(), sortBy, sortOrder);
  const tasksCountQuery = useTasksCountQuery();
  const completeTaskMutation = useCompleteTaskMutation();

  const tasks = useMemo(() => {
    const allTasks = (tasksQuery.data?.pages as Array<{ items: Task[] }> | undefined)?.flatMap((page) => page.items) ?? [];
    // Deduplicate by id to prevent duplicate keys
    const seen = new Set<number>();
    return allTasks.filter((task) => {
      if (seen.has(task.id)) {
        return false;
      }
      seen.add(task.id);
      return true;
    });
  }, [tasksQuery.data]);

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

  const onLogout = useCallback(async () => {
    await logout();
    queryClient.removeQueries({ queryKey: tasksQueryKey(statusFilter, searchText.trim(), sortBy, sortOrder) });
    queryClient.removeQueries({ queryKey: tasksCountsQueryKey });
  }, [logout, queryClient, statusFilter, searchText.trim(), sortBy, sortOrder]);

  const onComplete = useCallback(async (taskId: number) => {
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
  }, [completeTaskMutation]);

  const topError = tasksQuery.error
    ? getErrorMessage(tasksQuery.error, "Unable to load tasks.")
    : completeTaskMutation.error
      ? getErrorMessage(completeTaskMutation.error, "Unable to update task.")
      : "";

  const renderTaskCard = useCallback(
    ({ item }: { item: Task }) => (
      <TaskCard
        task={item}
        disabled={completeTaskMutation.isPending}
        isCompleting={completingTaskId === item.id}
        onComplete={onComplete}
      />
    ),
    [completeTaskMutation.isPending, completingTaskId, onComplete]
  );

  const keyExtractor = useCallback(
    (item: Task) => `task-${item.id}-${statusFilter}`,
    [statusFilter]
  );

  return (
    <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 6) }]}>
        <View>
          <Text style={styles.heading}>My Tasks</Text>
          <Text style={styles.subheading}>{user?.name ?? "Worker"}</Text>
        </View>
        <Pressable onPress={onLogout} style={({ pressed }) => [styles.logoutButton, pressed && styles.buttonPressed]} disabled={isLoggingOut}>
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.logoutLabel}>Logout</Text>
          )}
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

        {/* Sort Controls */}
        <View style={styles.sortContainer}>
          <Pressable
            onPress={() => setShowSortMenu(!showSortMenu)}
            style={({ pressed }) => [styles.sortButton, pressed && styles.buttonPressed]}
          >
            <View style={styles.sortButtonContent}>
              <Text style={styles.sortButtonText}>Sort: {SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "Task ID"}</Text>
              <Text style={styles.sortButtonIcon}>{sortOrder === "asc" ? "▲" : "▼"}</Text>
            </View>
          </Pressable>

          {showSortMenu && (
            <View style={styles.sortMenu}>
              {SORT_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    setSortBy(option.value);
                    setShowSortMenu(false);
                  }}
                  style={({ pressed }) => [
                    styles.sortMenuItem,
                    sortBy === option.value && styles.sortMenuItemSelected,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={sortBy === option.value ? styles.sortMenuLabelSelected : styles.sortMenuLabel}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
              <View style={styles.sortOrderRow}>
                <Pressable
                  onPress={() => {
                    setSortOrder("asc");
                    setShowSortMenu(false);
                  }}
                  style={({ pressed }) => [
                    styles.sortOrderButton,
                    sortOrder === "asc" && styles.sortOrderButtonSelected,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={sortOrder === "asc" ? styles.sortOrderLabelSelected : styles.sortOrderLabel}>ASC</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setSortOrder("desc");
                    setShowSortMenu(false);
                  }}
                  style={({ pressed }) => [
                    styles.sortOrderButton,
                    sortOrder === "desc" && styles.sortOrderButtonSelected,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={sortOrder === "desc" ? styles.sortOrderLabelSelected : styles.sortOrderLabel}>DESC</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>

      {tasksQuery.isPending ? (
        <CenteredMessage title="Loading tasks" subtitle="Please wait a moment." loading />
      ) : (
        <>
          {(tasksQuery.isRefetching || completeTaskMutation.isPending) ? (
            <View style={styles.topLoaderRow}>
              <ActivityIndicator size="small" color="#1f6feb" />
              <Text style={styles.topLoaderText}>Syncing tasks...</Text>
            </View>
          ) : null}

          {topError ? <Text style={styles.error}>{topError}</Text> : null}

          <FlatList<Task>
            key={`tasks-${statusFilter}`}
            data={tasks}
            extraData={statusFilter}
            keyExtractor={keyExtractor}
            contentContainerStyle={[
              styles.listContent,
              tasks.length === 0 && styles.emptyListContent,
            ]}
            renderItem={renderTaskCard}
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
        </>
      )}

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
    borderColor: "#fecaca",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fef2f2",
  },
  logoutLabel: {
    color: "#dc2626",
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
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
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
  sortContainer: {
    marginTop: 12,
    position: "relative",
  },
  sortButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f9fafb",
    width: "100%",
  },
  sortButtonContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sortButtonText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "600",
  },
  sortButtonIcon: {
    color: "#6b7280",
    fontSize: 12,
    marginLeft: 8,
  },
  sortMenu: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 8,
    zIndex: 100,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  sortMenuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  sortMenuItemSelected: {
    backgroundColor: "#e8f0fe",
  },
  sortMenuLabel: {
    color: "#4b5563",
    fontSize: 14,
  },
  sortMenuLabelSelected: {
    color: "#1e40af",
    fontWeight: "600",
  },
  sortOrderRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  sortOrderButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  sortOrderButtonSelected: {
    backgroundColor: "#1f6feb",
  },
  sortOrderLabel: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "600",
  },
  sortOrderLabelSelected: {
    color: "#ffffff",
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
