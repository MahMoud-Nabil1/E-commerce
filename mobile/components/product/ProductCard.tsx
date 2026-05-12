import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radius, shadows } from "@/styles/theme";
import { BASE_URL } from "@/services/api/client";
import type { ProductDTO } from "@/services/api/types";

type Props = {
  product: ProductDTO;
  onPress: (product: ProductDTO) => void;
};

export default function ProductCard({ product, onPress }: Props) {
  const imageUri = product.image
    ? `${BASE_URL}/public/products/images/${product.image}`
    : null;

  const hasDiscount = product.discount > 0;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(product)} activeOpacity={0.85}>
      {/* Image */}
      <View style={styles.imageBox}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="cube-outline" size={40} color={colors.outline} />
          </View>
        )}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discount}%</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.productName}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>${product.specialPrice.toFixed(2)}</Text>
          {hasDiscount && (
            <Text style={styles.originalPrice}>${product.price.toFixed(2)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
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
    backgroundColor: colors.surfaceContainerLow,
  },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  discountBadge: {
    position: "absolute",
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.error,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  discountText: { ...typography.labelSm, color: colors.onError, fontWeight: "700" },
  info: { padding: spacing.sm, gap: spacing.xs },
  name: { ...typography.labelBold, color: colors.onSurface },
  priceRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  price: { ...typography.labelBold, color: colors.secondary, fontSize: 15 },
  originalPrice: { ...typography.labelSm, color: colors.outline, textDecorationLine: "line-through" },
});
