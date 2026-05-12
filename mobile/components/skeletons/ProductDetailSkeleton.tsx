/**
 * Mirrors the layout of app/(user)/product/[id].tsx exactly.
 * Same imageBox aspectRatio, same info padding, same bottomBar position.
 */
import { View, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Skeleton from "@/components/ui/Skeleton";
import { colors, spacing, radius, shadows } from "@/styles/theme";

export default function ProductDetailSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    // Mirrors styles.container
    <View style={s.container}>
      <ScrollView scrollEnabled={false} showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* backBtn: position absolute, top = insets.top + spacing.sm, 40×40 circle */}
        <View style={[s.backBtn, { top: insets.top + spacing.sm }]}>
          <Skeleton width={40} height={40} radius="full" />
        </View>

        {/* imageBox: width "100%", aspectRatio 1 — mirrors styles.imageBox */}
        <View style={s.imageBox} />

        {/* info: padding spacing.lg, gap spacing.md — mirrors styles.info */}
        <View style={s.info}>

          {/* name: headlineLg ~32px, 2 lines */}
          <Skeleton width="80%" height={32} radius="lg" />
          <Skeleton width="55%" height={32} radius="lg" style={s.gap8} />

          {/* priceRow: row, gap spacing.sm */}
          <View style={s.row}>
            {/* price: headlineMd ~24px */}
            <Skeleton width="30%" height={24} radius="md" />
            {/* originalPrice: bodyLg ~18px */}
            <Skeleton width="22%" height={18} radius="md" />
          </View>

          {/* stockRow: row, gap spacing.xs */}
          <View style={s.rowXs}>
            <Skeleton width={16} height={16} radius="full" />
            <Skeleton width="35%" height={14} radius="md" />
          </View>

          {/* divider: height 1 */}
          <View style={s.divider} />

          {/* descLabel: labelBold ~14px */}
          <Skeleton width="28%" height={14} radius="md" />

          {/* description: bodyMd, 4 lines */}
          <View style={s.descBlock}>
            <Skeleton width="100%" height={14} radius="md" />
            <Skeleton width="100%" height={14} radius="md" />
            <Skeleton width="100%" height={14} radius="md" />
            <Skeleton width="70%" height={14} radius="md" />
          </View>

          {/* divider */}
          <View style={s.divider} />

          {/* Quantity label */}
          <Skeleton width="22%" height={14} radius="md" />

          {/* qtyRow: row, gap spacing.lg */}
          <View style={s.qtyRow}>
            <Skeleton width={40} height={40} radius="full" />
            <Skeleton width={32} height={28} radius="md" />
            <Skeleton width={40} height={40} radius="full" />
          </View>
        </View>
      </ScrollView>

      {/* bottomBar: absolute bottom, mirrors styles.bottomBar */}
      <View style={[s.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <Skeleton width="100%" height={52} radius="lg" />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  // Mirrors styles.container
  container: { flex: 1, backgroundColor: colors.background },

  // Mirrors styles.scroll
  scroll: { paddingBottom: 100 },

  // Mirrors styles.backBtn (absolute, zIndex 10)
  backBtn: {
    position: "absolute",
    left: spacing.lg,
    zIndex: 10,
  },

  // Mirrors styles.imageBox: width "100%", aspectRatio 1
  imageBox: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.surfaceContainerHigh,
  },

  // Mirrors styles.info
  info: { padding: spacing.lg, gap: spacing.md },

  // Mirrors styles.priceRow
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },

  // Mirrors styles.stockRow
  rowXs: { flexDirection: "row", alignItems: "center", gap: spacing.xs },

  // Mirrors styles.divider
  divider: { height: 1, backgroundColor: colors.outlineVariant },

  // Description block
  descBlock: { gap: spacing.sm },

  // Mirrors styles.qtyRow
  qtyRow: { flexDirection: "row", alignItems: "center", gap: spacing.lg },

  // Mirrors styles.bottomBar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    ...shadows.lg,
  },

  gap8: { marginTop: 8 },
});
