import { useEffect, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export interface ToastMessage {
  id: string;
  text: string;
  type: "success" | "error" | "info";
  duration?: number;
}

interface ToastProps {
  message: ToastMessage | null;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (!message) {
      return;
    }

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(message.duration ?? 3000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  }, [message, fadeAnim, onDismiss]);

  if (!message) {
    return null;
  }

  const bgColor =
    message.type === "success"
      ? "#dcfce7"
      : message.type === "error"
        ? "#fee2e2"
        : "#eff6ff";

  const textColor =
    message.type === "success"
      ? "#166534"
      : message.type === "error"
        ? "#991b1b"
        : "#1e40af";

  return (
    <Animated.View style={[styles.toast, { backgroundColor: bgColor, opacity: fadeAnim }]}>
      <Text style={[styles.text, { color: textColor }]}>{message.text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
  },
});
