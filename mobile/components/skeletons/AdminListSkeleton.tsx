import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Skeleton from "@/components/ui/Skeleton";
import { colors, spacing, radius, shadows } from "@/styles/theme";

function AdminRowSkeleton() {
  return (
    <View style={s.row}>
      <View style={s.rowContent}>
        <Skeleton width="30%" height={14} radius="md" />
        <Skeleton width="70%" height={18} radius="md" style={s.gap4} />
        <Skeleton width="50%" height={14} radius="md" style={s.gap4} />
      </View>
      <View style={s.actionsRow}>
        <Skeleton width={70} height={36} radius="lg" />
        <Skeleton width={70} height={36} radius="lg" />
      </View>
    </View>
  );
}

export default function AdminListSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[StyleSheet.absoluteFillObject, s.container]}>
      <View style={[s.listHeader, { paddingTop: insets.top + spacing.xxl + spacing.lg }]}>
        <Skeleton width="40%" height={28} radius="md" />
        <Skeleton width="100%" height={44} radius="lg" style={s.gap6} />
      </View>

      <View style={s.list}>
        {[...Array(5)].map((_, i) => (
          <AdminRowSkeleton key={i} />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { backgroundColor: colors.background },
  listHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  rowContent: { gap: spacing.xs, flex: 1, marginRight: spacing.md },
  actionsRow: { flexDirection: "row", gap: spacing.sm },
  gap4: { marginTop: 4 },
  gap6: { marginTop: 6 },
});
