/**
 * Mirrors the exact layout of app/(user)/index.tsx.
 * Uses the same StyleSheet values so every element sits in the same position.
 */
import { View, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Skeleton from "@/components/ui/Skeleton";
import { colors, spacing, radius, shadows } from "@/styles/theme";

// ── Mirrors styles.categoryChip + styles.categoryIconBox + categoryName text ──
function CategoryChipSkeleton() {
  return (
    <View style={s.categoryChip}>
      {/* categoryIconBox: 44×44 */}
      <Skeleton width={44} height={44} radius="lg" />
      {/* categoryName text: labelBold ~13px tall, maxWidth 80 */}
      <Skeleton width={64} height={13} radius="md" />
    </View>
  );
}

// ── Mirrors ProductCard: image (aspectRatio 1) + info padding ─────────────────
function ProductCardSkeleton() {
  return (
    <View style={s.productCard}>
      {/* imageBox: width "100%", aspectRatio 1 — height driven by width */}
      <View style={s.imageBox} />
      <View style={s.productInfo}>
        {/* productName: labelBold, 2 lines */}
        <Skeleton width="90%" height={13} radius="md" />
        <Skeleton width="65%" height={13} radius="md" style={s.gap6} />
        {/* price */}
        <Skeleton width="45%" height={15} radius="md" style={s.gap4} />
      </View>
    </View>
  );
}

export default function HomeScreenSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={[s.scroll, { paddingTop: insets.top + spacing.lg }]}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Greeting — mirrors styles.greeting ── */}
      <View style={s.greeting}>
        {/* greetingText: headlineLg ~32px */}
        <Skeleton width="55%" height={32} radius="lg" />
        {/* greetingSubtitle: bodyMd ~16px */}
        <Skeleton width="75%" height={16} radius="md" style={s.gap8} />
      </View>

      {/* ── Categories section ── */}
      <View style={s.section}>
        {/* sectionHeader */}
        <View style={s.sectionHeader}>
          <Skeleton width="35%" height={24} radius="md" />
          <Skeleton width="18%" height={14} radius="md" />
        </View>
        {/* Horizontal chip row — mirrors categoryList paddingHorizontal */}
        <View style={s.categoryList}>
          {[...Array(5)].map((_, i) => <CategoryChipSkeleton key={i} />)}
        </View>
      </View>

      {/* ── Featured products section ── */}
      <View style={s.section}>
        {/* sectionHeader */}
        <View style={s.sectionHeader}>
          <Skeleton width="28%" height={24} radius="md" />
          <Skeleton width="18%" height={14} radius="md" />
        </View>
        {/* productGrid: flexWrap row, productCell width "47%" */}
        <View style={s.productGrid}>
          {[...Array(6)].map((_, i) => (
            <View key={i} style={s.productCell}>
              <ProductCardSkeleton />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  // Mirrors styles.container + styles.scroll
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xxl, gap: spacing.xl },

  // Mirrors styles.greeting
  greeting: { paddingHorizontal: spacing.lg, gap: spacing.xs },

  // Mirrors styles.section
  section: { gap: spacing.md },

  // Mirrors styles.sectionHeader
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },

  // Mirrors FlatList contentContainerStyle={styles.categoryList}
  categoryList: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },

  // Mirrors styles.categoryChip
  categoryChip: {
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    minWidth: 80,
    ...shadows.sm,
  },

  // Mirrors styles.productGrid
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },

  // Mirrors styles.productCell
  productCell: { width: "47%" },

  // Mirrors ProductCard card style
  productCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...shadows.sm,
  },

  // Mirrors ProductCard imageBox: width "100%", aspectRatio 1
  imageBox: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.surfaceContainerHigh,
  },

  // Mirrors ProductCard info padding
  productInfo: { padding: spacing.sm, gap: spacing.xs },

  // Spacing helpers
  gap4: { marginTop: 4 },
  gap6: { marginTop: 6 },
  gap8: { marginTop: 8 },
});
