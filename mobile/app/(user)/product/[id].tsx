import { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { productService } from "@/services/api/productService";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui";
import { BASE_URL } from "@/services/api/client";
import type { ProductDTO } from "@/services/api/types";
import type { ApiError } from "@/services/api";
import { colors, typography, spacing, radius, shadows } from "@/styles/theme";
import { ProductDetailSkeleton } from "@/components/skeletons";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { cart, addItem, loading: cartLoading } = useCart();
  const { show } = useToast();

  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const inCart = !!cart?.products?.find((p) => p.productId === Number(id));

  useEffect(() => {
    if (!id) return;
    // Reset state immediately so the previous product never shows while loading
    setProduct(null);
    setLoading(true);
    setQuantity(1);
    productService
      .getById(Number(id))
      .then(setProduct)
      .catch(() => show({ message: "Failed to load product", variant: "error" }))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddToCart() {
    if (!product) return;
    try {
      await addItem(product.productId, quantity);
      show({ message: `${product.productName} added to cart`, variant: "success" });
    } catch (err) {
      show({ message: (err as ApiError).message ?? "Failed to add to cart", variant: "error" });
    }
  }

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.outline} />
        <Text style={styles.errorText}>Product not found</Text>
        <Button label="Go back" variant="outline" onPress={() => router.back()} />
      </View>
    );
  }

  const imageUri = product.image ? `${BASE_URL}/public/products/images/${product.image}` : null;
  const hasDiscount = product.discount > 0;
  const outOfStock = product.quantity === 0;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>

        {/* Image */}
        <View style={styles.imageBox}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="cube-outline" size={80} color={colors.outlineVariant} />
            </View>
          )}
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}% OFF</Text>
            </View>
          )}
          {outOfStock && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name}>{product.productName}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.specialPrice.toFixed(2)}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>${product.price.toFixed(2)}</Text>
            )}
          </View>

          <View style={styles.stockRow}>
            <Ionicons
              name={outOfStock ? "close-circle-outline" : "checkmark-circle-outline"}
              size={16}
              color={outOfStock ? colors.error : "#2e7d52"}
            />
            <Text style={[styles.stock, outOfStock && styles.stockOut]}>
              {outOfStock ? "Out of stock" : `${product.quantity} in stock`}
            </Text>
          </View>

          <View style={styles.divider} />
          <Text style={styles.descLabel}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          {!outOfStock && !inCart && (
            <>
              <View style={styles.divider} />
              <Text style={styles.descLabel}>Quantity</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Ionicons name="remove" size={20} color={colors.onSurface} />
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{quantity}</Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, quantity >= product.quantity && styles.qtyBtnDisabled]}
                  onPress={() => setQuantity((q) => Math.min(product.quantity, q + 1))}
                  disabled={quantity >= product.quantity}
                >
                  <Ionicons name="add" size={20} color={colors.onSurface} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.bottomBar}>
        {inCart ? (
          <Button
            label="View Cart"
            variant="secondary"
            size="lg"
            fullWidth
            onPress={() => router.push("/(user)/cart")}
          />
        ) : (
          <Button
            label={outOfStock ? "Out of Stock" : "Add to Cart"}
            variant="primary"
            size="lg"
            fullWidth
            disabled={outOfStock}
            loading={cartLoading}
            onPress={handleAddToCart}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: spacing.md, backgroundColor: colors.background },
  errorText: { ...typography.bodyLg, color: colors.onSurfaceVariant },
  scroll: { paddingBottom: 100 },
  backBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 40,
    left: spacing.lg,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLowest,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.md,
  },
  imageBox: { width: "100%", aspectRatio: 1, backgroundColor: colors.surfaceContainerLow },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  discountBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.error,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  discountText: { ...typography.labelBold, color: colors.onError },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  outOfStockText: { ...typography.headlineMd, color: "#fff" },
  info: { padding: spacing.lg, gap: spacing.md },
  name: { ...typography.headlineLg, color: colors.onSurface },
  priceRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  price: { ...typography.headlineMd, color: colors.secondary },
  originalPrice: { ...typography.bodyLg, color: colors.outline, textDecorationLine: "line-through" },
  stockRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  stock: { ...typography.labelBold, color: "#2e7d52" },
  stockOut: { color: colors.error },
  divider: { height: 1, backgroundColor: colors.outlineVariant },
  descLabel: { ...typography.labelBold, color: colors.onSurfaceVariant },
  description: { ...typography.bodyMd, color: colors.onSurface, lineHeight: 24 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyBtnDisabled: { opacity: 0.35 },
  qtyValue: { ...typography.headlineMd, color: colors.onSurface, minWidth: 32, textAlign: "center" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: Platform.OS === "ios" ? 32 : spacing.lg,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    ...shadows.lg,
  },
});
