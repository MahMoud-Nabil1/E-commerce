/**
 * Mirrors the layout of app/(user)/categories.tsx.
 * Positioned absolutely over the FlatList.
 */
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Skeleton from "@/components/ui/Skeleton";
import { colors, spacing, radius, shadows } from "@/styles/theme";

function CategoryCardSkeleton() {
  return (
    // Mirrors styles.card: flex 1, padding spacing.lg, alignItems center, gap spacing.sm
    <View style={s.card}>
      {/* cardIconBox: 60×60 */}
      <Skeleton width={60} height={60} radius="xl" />
      {/* cardName: labelBold, 2 lines */}
      <Skeleton width="70%" height={13} radius="md" />
      <Skeleton width="50%" height={13} radius="md" />
    </View>
  );
}

export default function CategoryGridSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[StyleSheet.absoluteFillObject, s.container]}>
      {/* header: mirrors styles.header */}
      <View style={[s.header, { paddingTop: insets.top + spacing.xxl + spacing.lg }]}>
        {/* backRow: arrow + title */}
        <View style={s.backRow}>
          <Skeleton width={22} height={22} radius="full" />
          {/* title: headlineLg ~32px */}
          <Skeleton width="55%" height={32} radius="lg" />
        </View>
        {/* searchBox: full width, height 44 */}
        <Skeleton width="100%" height={44} radius="lg" />
      </View>

      {/* Grid — mirrors styles.row + styles.card */}
      <View style={s.grid}>
        {[...Array(8)].map((_, i) => (
          <View key={i} style={s.cell}>
            <CategoryCardSkeleton />
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { backgroundColor: colors.background },

  // Mirrors styles.header
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },

  // Mirrors styles.backRow
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  // Mirrors styles.row (columnWrapper) + grid layout
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cell: { flex: 1, minWidth: "47%", maxWidth: "47%" },

  // Mirrors styles.card
  card: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
    ...shadows.sm,
  },
});
