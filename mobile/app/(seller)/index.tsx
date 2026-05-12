import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { colors, typography, spacing } from "@/styles/theme";

export default function SellerHome() {
  const { user, logout } = useAuth();
  const { show } = useToast();

  async function handleLogout() {
    await logout();
    show({ message: "Signed out successfully", variant: "info" });
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.greeting}>Hello, {user?.username} 👋</Text>
        <Text style={styles.role}>Seller</Text>
        <Text style={styles.hint}>
          Your seller dashboard goes here.
        </Text>
      </View>

      <Button
        label="Sign Out"
        variant="outline"
        onPress={handleLogout}
        style={styles.logoutBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.xxl,
  },
  content: {
    flex: 1,
    gap: spacing.sm,
  },
  greeting: {
    ...typography.headlineLg,
    color: colors.onSurface,
  },
  role: {
    ...typography.labelBold,
    color: colors.secondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  hint: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: spacing.md,
  },
  logoutBtn: {
    alignSelf: "stretch",
  },
});
