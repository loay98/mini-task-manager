import { memo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { Task } from "../types/task";

interface TaskCardProps {
  task: Task;
  disabled?: boolean;
  isCompleting?: boolean;
  onComplete: (taskId: number) => void;
}

function formatDateTime(dateValue?: string | null): string | null {
  if (!dateValue) {
    return null;
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toLocaleString();
}

export const TaskCard = memo(function TaskCard({
  task,
  disabled = false,
  isCompleting = false,
  onComplete,
}: TaskCardProps) {
  const normalizedStatus = task.status.toLowerCase();
  const isCompleted = normalizedStatus === "completed";
  const dueDateLabel = formatDateTime(task.due_date);
  const assignedDateLabel = formatDateTime(task.created_at);
  const assignedByLabel = task.assigned_by?.name ?? "N/A";

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>#{task.id} {task.title}</Text>
        <View style={[styles.badge, isCompleted ? styles.badgeCompleted : styles.badgePending]}>
          <Text style={styles.badgeLabel}>{task.status}</Text>
        </View>
      </View>

      {task.description ? <Text style={styles.description}>{task.description}</Text> : null}
      {dueDateLabel ? <Text style={styles.meta}>Due: {dueDateLabel}</Text> : null}
      {assignedDateLabel ? <Text style={styles.meta}>Assigned date: {assignedDateLabel}</Text> : null}
      <Text style={styles.meta}>Assigned by: {assignedByLabel}</Text>

      <Pressable
        disabled={disabled || isCompleted}
        onPress={() => onComplete(task.id)}
        style={({ pressed }) => [
          styles.button,
          isCompleted ? styles.buttonCompleted : styles.buttonPending,
          (pressed || disabled) && styles.buttonPressed,
        ]}
      >
        {isCompleting ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#ffffff" />
            <Text style={styles.buttonLabelPending}>Updating...</Text>
          </View>
        ) : (
          <Text style={isCompleted ? styles.buttonLabelCompleted : styles.buttonLabelPending}>
            {isCompleted ? "Completed" : "Mark as Completed"}
          </Text>
        )}
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  description: {
    color: "#4b5563",
    fontSize: 14,
    lineHeight: 20,
  },
  meta: {
    color: "#6b7280",
    fontSize: 13,
  },
  badge: {
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  badgePending: {
    backgroundColor: "#ffedd5",
  },
  badgeCompleted: {
    backgroundColor: "#dcfce7",
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    textTransform: "capitalize",
  },
  button: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonPending: {
    backgroundColor: "#1f6feb",
  },
  buttonCompleted: {
    backgroundColor: "#eef2ff",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonLabelPending: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  buttonLabelCompleted: {
    color: "#4f46e5",
    fontWeight: "700",
    fontSize: 14,
  },
});
