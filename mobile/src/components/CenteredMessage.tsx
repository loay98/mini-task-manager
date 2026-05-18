import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface CenteredMessageProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
}

export function CenteredMessage({ title, subtitle, loading = false }: CenteredMessageProps) {
  return (
    <View style={styles.root}>
      {loading ? <ActivityIndicator size="large" color="#1f6feb" style={styles.spinner} /> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  spinner: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});
