import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui";
import { BASE_URL } from "@/services/api/client";
import type { ProductDTO } from "@/services/api/types";
import type { ApiError } from "@/services/api";
import { colors, typography, spacing, radius, shadows } from "@/styles/theme";

// ─── Cart item row ────────────────────────────────────────────────────────────

function CartItemRow({
  product,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  product: ProductDTO;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}) {
  const imageUri = product.image
    ? `${BASE_URL}/public/products/images/${product.image}`
    : null;

  return (
    <View style={itemStyles.row}>
      <View style={itemStyles.thumb}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={itemStyles.image} resizeMode="cover" />
        ) : (
          <Ionicons name="cube-outline" size={28} color={colors.outline} />
        )}
      </View>

      <View style={itemStyles.details}>
        <Text style={itemStyles.name} numberOfLines={2}>{product.productName}</Text>
        <Text style={itemStyles.price}>${product.specialPrice.toFixed(2)}</Text>

        <View style={itemStyles.qtyRow}>
          <TouchableOpacity style={itemStyles.qtyBtn} onPress={onDecrement}>
            <Ionicons name="remove" size={16} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={itemStyles.qtyValue}>{product.quantity}</Text>
          <TouchableOpacity style={itemStyles.qtyBtn} onPress={onIncrement}>
            <Ionicons name="add" size={16} color={colors.onSurface} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={itemStyles.removeBtn}
        onPress={onRemove}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="trash-outline" size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );
}

const itemStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...shadows.sm,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLow,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  image: { width: "100%", height: "100%" },
  details: { flex: 1, gap: spacing.xs },
  name: { ...typography.labelBold, color: colors.onSurface },
  price: { ...typography.bodyMd, color: colors.secondary, fontWeight: "700" },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.xs },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceContainerHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyValue: { ...typography.labelBold, color: colors.onSurface, minWidth: 20, textAlign: "center" },
  removeBtn: { padding: spacing.xs },
});

// ─── Cart screen ──────────────────────────────────────────────────────────────

export default function CartScreen() {
  const router = useRouter();
  const { cart, increment, decrement, removeItem, refresh } = useCart();
  const { show } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const products = cart?.products ?? [];
  const total = cart?.totalPrice ?? 0;
  const isEmpty = products.length === 0;

  async function handleIncrement(productId: number) {
    try { await increment(productId); }
    catch (err) { show({ message: (err as ApiError).message ?? "Error", variant: "error" }); }
  }

  async function handleDecrement(productId: number) {
    try { await decrement(productId); }
    catch (err) { show({ message: (err as ApiError).message ?? "Error", variant: "error" }); }
  }

  async function handleRemove(productId: number) {
    try {
      await removeItem(productId);
      show({ message: "Item removed", variant: "info" });
    } catch (err) {
      show({ message: (err as ApiError).message ?? "Error", variant: "error" });
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cart</Text>
        {!isEmpty && (
          <Text style={styles.itemCount}>{products.length} item{products.length !== 1 ? "s" : ""}</Text>
        )}
      </View>

      {isEmpty ? (
        <View style={styles.emptyBox}>
          <Ionicons name="cart-outline" size={72} color={colors.outlineVariant} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add some products to get started</Text>
          <Button
            label="Browse Products"
            variant="primary"
            onPress={() => router.push("/(user)/products")}
          />
        </View>
      ) : (
        <>
          <FlatList
            data={products}
            keyExtractor={(item) => String(item.productId)}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.secondary} />
            }
            renderItem={({ item }) => (
              <CartItemRow
                product={item}
                onIncrement={() => handleIncrement(item.productId)}
                onDecrement={() => handleDecrement(item.productId)}
                onRemove={() => handleRemove(item.productId)}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          />

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
            </View>
            <Button
              label="Proceed to Checkout"
              variant="primary"
              size="lg"
              fullWidth
              onPress={() => show({ message: "Checkout coming soon!", variant: "info" })}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  title: { ...typography.headlineLg, color: colors.onSurface },
  itemCount: { ...typography.labelBold, color: colors.onSurfaceVariant },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  emptyBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: { ...typography.headlineMd, color: colors.onSurface },
  emptySubtitle: { ...typography.bodyMd, color: colors.onSurfaceVariant, textAlign: "center" },
  summary: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === "ios" ? 32 : spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    gap: spacing.md,
    ...shadows.lg,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { ...typography.bodyLg, color: colors.onSurfaceVariant },
  summaryValue: { ...typography.headlineMd, color: colors.onSurface },
});
