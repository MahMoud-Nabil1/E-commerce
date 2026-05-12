/**
 * Mirrors the layout of app/(user)/products.tsx (and category/[id].tsx).
 * Positioned absolutely over the FlatList so it covers it exactly.
 */
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Skeleton from "@/components/ui/Skeleton";
import { colors, spacing, radius, shadows } from "@/styles/theme";

function ProductCardSkeleton() {
  return (
    <View style={s.card}>
      {/* imageBox: width "100%", aspectRatio 1 */}
      <View style={s.imageBox} />
      <View style={s.cardInfo}>
        <Skeleton width="90%" height={13} radius="md" />
        <Skeleton width="65%" height={13} radius="md" style={s.gap6} />
        <Skeleton width="45%" height={15} radius="md" style={s.gap4} />
      </View>
    </View>
  );
}

export default function ProductGridSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    // Mirrors styles.container — absolute fill so it sits on top of the FlatList
    <View style={[StyleSheet.absoluteFillObject, s.container]}>
      {/* listHeader: paddingTop matches screen, paddingHorizontal: spacing.lg */}
      <View style={[s.listHeader, { paddingTop: insets.top + spacing.xxl + spacing.lg }]}>
        {/* searchRow: flex row, gap spacing.sm */}
        <View style={s.searchRow}>
          {/* searchBox: flex 1, height 44 */}
          <Skeleton width="100%" height={44} radius="lg" style={s.searchFlex} />
          {/* sortBtn: 44×44 */}
          <Skeleton width={44} height={44} radius="lg" />
        </View>
        {/* sortLabel: labelSm ~12px */}
        <Skeleton width="40%" height={12} radius="md" />
      </View>

      {/* Grid — mirrors row + cell styles */}
      <View style={s.grid}>
        {[...Array(6)].map((_, i) => (
          <View key={i} style={s.cell}>
            <ProductCardSkeleton />
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { backgroundColor: colors.background },

  // Mirrors styles.listHeader
  listHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },

  // Mirrors styles.searchRow
  searchRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },

  searchFlex: { flex: 1 },

  // Mirrors styles.row + styles.cell
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cell: { flex: 1, minWidth: "47%", maxWidth: "47%" },

  // Mirrors ProductCard
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...shadows.sm,
  },
  imageBox: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.surfaceContainerHigh,
  },
  cardInfo: { padding: spacing.sm, gap: spacing.xs },

  gap4: { marginTop: 4 },
  gap6: { marginTop: 6 },
});
