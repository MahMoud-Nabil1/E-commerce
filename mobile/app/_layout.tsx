import { useEffect } from "react";
import { useRouter, useSegments, Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ToastProvider } from "@/components/ui/Toast";

// ─── Navigation guard ─────────────────────────────────────────────────────────
// Runs on every auth state change and redirects to the correct route group.

function NavigationGuard() {
  const { user, isLoading, isAdmin, isSeller } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user) {
      // Not signed in — send to login
      if (!inAuthGroup) router.replace("/(auth)/login");
    } else {
      // Signed in — redirect to the correct home based on role
      if (inAuthGroup || segments[0] === undefined) {
        if (isAdmin) router.replace("/(admin)");
        else if (isSeller) router.replace("/(seller)");
        else router.replace("/(user)");
      }
    }
  }, [user, isLoading, isAdmin, isSeller, segments]);

  return <Slot />;
}

// ─── Root layout ──────────────────────────────────────────────────────────────

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <NavigationGuard />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
