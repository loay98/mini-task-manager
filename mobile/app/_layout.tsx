import { Slot, usePathname, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import { useAuthStore } from "../src/store/auth-store";

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { hydrated, token, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!token && pathname !== "/login") {
      router.replace("/login");
      return;
    }

    if (token && pathname === "/login") {
      router.replace("/my-tasks");
    }
  }, [hydrated, token, pathname, router]);

  if (!hydrated) {
    return (
      <PaperProvider>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <Slot />
    </PaperProvider>
  );
}
