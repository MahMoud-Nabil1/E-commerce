import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { colors, typography, spacing, radius, shadows } from "@/styles/theme";

const QUICK_ACCESS_TABS = [
  { name: "sellers", title: "Sellers", icon: "people" },
  { name: "categories", title: "Categories", icon: "pricetags" },
  { name: "products", title: "Products", icon: "cube" },
  { name: "carts", title: "Carts", icon: "cart" },
  { name: "addresses", title: "Addresses", icon: "location" },
  { name: "orders", title: "Orders", icon: "receipt" },
];

export default function AdminHome() {
  const { user, logout } = useAuth();
  const { show } = useToast();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    show({ message: "Signed out successfully", variant: "info" });
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.username} 👋</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.role}>Admin</Text>
          </View>
        </View>

        <View style={styles.cardsGrid}>
          {QUICK_ACCESS_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.name}
              style={styles.card}
              onPress={() => router.push(`/(admin)/${tab.name}`)}
            >
              <View style={[styles.iconBox, { backgroundColor: colors.primaryContainer }]}>
                <Ionicons name={tab.icon} size={28} color={colors.secondaryFixed} />
              </View>
              <Text style={styles.cardTitle}>{tab.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Sign Out"
          variant="outline"
          onPress={handleLogout}
          style={styles.logoutBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: spacing.xxl + spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.headlineLg,
    color: colors.onSurface,
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  role: {
    ...typography.labelBold,
    color: colors.onSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  card: {
    width: "47%",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.md,
    ...shadows.sm,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    ...typography.labelBold,
    color: colors.onSurface,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  logoutBtn: {
    alignSelf: "stretch",
  },
});
