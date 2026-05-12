import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cartService } from "@/services/api/cartService";
import { useAuth } from "@/contexts/AuthContext";
import { Alert } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { AdminListSkeleton } from "@/components/skeletons";
import type { CartDTO } from "@/services/api/types";
import { colors, typography, spacing, radius, shadows } from "@/styles/theme";

export default function CartsScreen() {
  const [carts, setCarts] = useState<CartDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCartId, setExpandedCartId] = useState<number | null>(null);
  const { logout } = useAuth();
  const { show } = useToast();

  const loadCarts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cartService.getAllCarts();
      setCarts(response);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 401) {
        await logout();
        return;
      } else if (err.response?.status === 403) {
        show({ message: "Access denied", variant: "error" });
      } else {
        setError(err.response?.data?.message || "Failed to load carts");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [logout, show]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadCarts();
  }, [loadCarts]);

  const renderItem = ({ item }: { item: CartDTO }) => {
    const isExpanded = expandedCartId === item.cartId;
    return (
      <TouchableOpacity
        style={styles.row}
        testID={`cart-row-${item.cartId}`}
        onPress={() => setExpandedCartId(isExpanded ? null : item.cartId)}
      >
        <View style={styles.rowHeader}>
          <View style={styles.rowContent}>
            <Text style={styles.cartId}>Cart #{item.cartId}</Text>
            <Text style={styles.totalPrice}>Total: ${item.totalPrice.toFixed(2)}</Text>
            <Text style={styles.productCount}>{item.products?.length ?? 0} items</Text>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={24}
            color={colors.onSurfaceVariant}
          />
        </View>
        {isExpanded && item.products && item.products.length > 0 && (
          <View style={styles.productsList}>
            {item.products.map((product) => (
              <View key={product.productId} style={styles.productItem}>
                <Text style={styles.productName}>{product.productName}</Text>
                <View style={styles.productDetails}>
                  <Text style={styles.productQty}>Qty: {product.quantity}</Text>
                  <Text style={styles.productPrice}>${product.specialPrice.toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const ListHeader = (
    <View style={styles.listHeader}>
      <Text style={styles.title}>Carts</Text>
      {error && <Alert variant="error" message={error} onRetry={handleRefresh} />}
    </View>
  );

  const ListEmptyComponent = !loading && carts.length === 0 ? (
    <View style={styles.emptyBox}>
      <Ionicons name="cart-outline" size={56} color={colors.outlineVariant} />
      <Text style={styles.emptyText}>No carts found</Text>
    </View>
  ) : null;

  return (
    <View style={styles.container}>
      {loading && carts.length === 0 ? (
        <AdminListSkeleton />
      ) : (
        <FlatList
          data={carts}
          keyExtractor={(item) => String(item.cartId)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmptyComponent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.secondary} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingBottom: spacing.xxl },
  listHeader: {
    paddingTop: spacing.xxl + spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  title: { ...typography.headlineMd, color: colors.onSurface },
  row: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowContent: { gap: spacing.xs },
  cartId: { ...typography.bodyLg, color: colors.onSurface, fontWeight: "700" },
  totalPrice: { ...typography.bodyMd, color: colors.secondary },
  productCount: { ...typography.labelSm, color: colors.onSurfaceVariant },
  productsList: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    gap: spacing.sm,
  },
  productItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  productName: { ...typography.bodyMd, color: colors.onSurface, flex: 1 },
  productDetails: { flexDirection: "row", gap: spacing.md },
  productQty: { ...typography.labelSm, color: colors.onSurfaceVariant },
  productPrice: { ...typography.labelBold, color: colors.secondary },
  emptyBox: { alignItems: "center", paddingTop: spacing.xxl, gap: spacing.md },
  emptyText: { ...typography.bodyMd, color: colors.onSurfaceVariant },
});
