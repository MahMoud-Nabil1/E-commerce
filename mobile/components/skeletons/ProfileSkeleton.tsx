/**
 * Mirrors the layout of components/profile/ProfileScreen.tsx exactly.
 * Same scroll padding, same section gaps, same card structure.
 */
import { View, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Skeleton from "@/components/ui/Skeleton";
import { colors, spacing, radius, shadows } from "@/styles/theme";

// Mirrors AddressCard: card padding, body lines, actions row
function AddressCardSkeleton() {
  return (
    <View style={s.addressCard}>
      {/* body: gap 2, 4 lines of bodyMd */}
      <View style={s.addressBody}>
        <Skeleton width="65%" height={16} radius="md" />
        <Skeleton width="45%" height={16} radius="md" />
        <Skeleton width="75%" height={16} radius="md" />
        <Skeleton width="55%" height={16} radius="md" />
      </View>
      {/* actions: row, gap spacing.md */}
      <View style={s.addressActions}>
        <Skeleton width={36} height={14} radius="md" />
        <Skeleton width={48} height={14} radius="md" />
      </View>
    </View>
  );
}

// Mirrors InfoRow: row, justifyContent space-between, paddingVertical spacing.sm
function InfoRowSkeleton() {
  return (
    <View style={s.infoRow}>
      <Skeleton width="28%" height={14} radius="md" />
      <Skeleton width="40%" height={14} radius="md" />
    </View>
  );
}

export default function ProfileSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={[
        s.scroll,
        { paddingTop: insets.top + spacing.xxl + spacing.lg },
      ]}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
    >
      {/* ── avatarSection: alignItems center, gap spacing.sm ── */}
      <View style={s.avatarSection}>
        {/* avatar: 80×80 circle */}
        <Skeleton width={80} height={80} radius="full" />
        {/* username: headlineMd ~24px */}
        <Skeleton width="45%" height={24} radius="lg" />
        {/* roleBadge: paddingH spacing.md, paddingV spacing.xs, radius full */}
        <Skeleton width="22%" height={28} radius="full" />
      </View>

      {/* ── Account section ── */}
      <View style={s.section}>
        {/* sectionTitle: headlineMd ~24px */}
        <Skeleton width="28%" height={24} radius="md" />
        {/* card: mirrors styles.card */}
        <View style={s.infoCard}>
          <InfoRowSkeleton />
          <InfoRowSkeleton />
          <InfoRowSkeleton />
        </View>
      </View>

      {/* ── Addresses section ── */}
      <View style={s.section}>
        {/* sectionHeader: row, space-between */}
        <View style={s.sectionHeader}>
          <Skeleton width="30%" height={24} radius="md" />
          <Skeleton width="14%" height={16} radius="md" />
        </View>
        <AddressCardSkeleton />
        <AddressCardSkeleton />
      </View>

      {/* Sign out button: full width, height 52 (lg button) */}
      <Skeleton width="100%" height={52} radius="lg" />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  // Mirrors styles.container + styles.scroll
  container: { flex: 1, backgroundColor: colors.background },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },

  // Mirrors styles.avatarSection
  avatarSection: { alignItems: "center", gap: spacing.sm },

  // Mirrors styles.section
  section: { gap: spacing.md },

  // Mirrors styles.sectionHeader
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Mirrors styles.card (info card)
  infoCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...shadows.sm,
  },

  // Mirrors infoStyles.row
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },

  // Mirrors cardStyles.card
  addressCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    gap: spacing.sm,
    ...shadows.sm,
  },

  // Mirrors cardStyles.body
  addressBody: { gap: 2 },

  // Mirrors cardStyles.actions
  addressActions: { flexDirection: "row", gap: spacing.md },
});
