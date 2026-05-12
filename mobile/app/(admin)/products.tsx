import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert as RNAlert,
  Image,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { productService } from "@/services/api/productService";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, Button } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { removeById, isImageTooLarge } from "@/utils/adminUtils";
import { AdminListSkeleton } from "@/components/skeletons";
import type { ProductDTO } from "@/services/api/types";
import { colors, typography, spacing, radius, shadows } from "@/styles/theme";

export default function ProductsScreen() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const pageRef = useRef(0);
  const { logout } = useAuth();
  const { show } = useToast();
  const router = useRouter();

  const loadProducts = useCallback(async (page: number, isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const response = await productService.getAllAdmin({ pageNumber: page });
      setProducts(prev => isRefresh ? response.content : [...prev, ...response.content]);
      setHasMore(!response.lastPage);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 401) {
        await logout();
        return;
      } else if (err.response?.status === 403) {
        show({ message: "Access denied", variant: "error" });
      } else {
        setError(err.response?.data?.message || "Failed to load products");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [logout, show]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    pageRef.current = 0;
    loadProducts(0, true);
  }, [loadProducts]);

  const handleEndReached = useCallback(() => {
    if (hasMore && !loading) {
      pageRef.current += 1;
      loadProducts(pageRef.current);
    }
  }, [hasMore, loading, loadProducts]);

  const handleDelete = useCallback((productId: number, productName: string) => {
    RNAlert.alert(
      "Delete Product",
      `Are you sure you want to delete "${productName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(productId);
              await productService.deleteAdmin(productId);
              setProducts((prev) => removeById(prev, "productId", productId));
              show({ message: "Product deleted", variant: "success" });
            } catch (err: any) {
              setError(err.response?.data?.message || "Failed to delete product");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  }, [show]);

  const handleUploadImage = useCallback(async (productId: number) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        if (asset.fileSize && isImageTooLarge(asset.fileSize)) {
          setError("Image is too large (max 10 MB)");
          return;
        }

        setUploadingId(productId);
        const blob = await fetch(asset.uri).then((res) => res.blob());
        const filename = asset.fileName || `product-${productId}.jpg`;
        const updatedProduct = await productService.uploadImageAdmin(productId, blob, filename);
        setProducts((prev) =>
          prev.map((p) => (p.productId === productId ? updatedProduct : p))
        );
        show({ message: "Image uploaded", variant: "success" });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingId(null);
    }
  }, [show]);

  useFocusEffect(
    useCallback(() => {
      handleRefresh();
    }, [handleRefresh])
  );

  const renderItem = ({ item }: { item: ProductDTO }) => (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <View style={styles.rowContent}>
          <Text style={styles.productName}>{item.productName}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>${item.specialPrice.toFixed(2)}</Text>
            {item.discount > 0 && <Text style={styles.originalPrice}>${item.price.toFixed(2)}</Text>}
          </View>
          <Text style={styles.quantity}>Qty: {item.quantity}</Text>
          {item.quantity === 0 && (
            <View style={styles.outOfStockBadge} testID="out-of-stock-badge">
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.actionsCol}>
        <Button
          icon="create-outline"
          variant="outline"
          size="icon"
          onPress={() =>
            router.push({
              pathname: "/(admin)/product-form",
              params: {
                productId: String(item.productId),
                productName: item.productName,
                description: item.description,
                quantity: String(item.quantity),
                price: String(item.price),
                discount: String(item.discount),
                categoryId: String(item.categoryId),
              },
            })
          }
        />
        <Button
          icon="cloud-upload-outline"
          variant="outline"
          size="icon"
          loading={uploadingId === item.productId}
          disabled={uploadingId === item.productId}
          onPress={() => handleUploadImage(item.productId)}
        />
        <Button
          icon="trash-outline"
          variant="destructive"
          size="icon"
          loading={deletingId === item.productId}
          disabled={deletingId === item.productId}
          onPress={() => handleDelete(item.productId, item.productName)}
        />
      </View>
    </View>
  );

  const ListHeader = (
    <View style={styles.listHeader}>
      <Text style={styles.title}>Products</Text>
      <Button
        label="Add Product"
        icon="add"
        onPress={() => router.push("/(admin)/product-form")}
      />
      {error && <Alert variant="error" message={error} onRetry={handleRefresh} />}
    </View>
  );

  const ListEmptyComponent = !loading && products.length === 0 ? (
    <View style={styles.emptyBox}>
      <Ionicons name="cube-outline" size={56} color={colors.outlineVariant} />
      <Text style={styles.emptyText}>No products found</Text>
    </View>
  ) : null;

  return (
    <View style={styles.container}>
      {loading && products.length === 0 ? (
        <AdminListSkeleton />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.productId)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={
            loading && products.length > 0 ? (
              <ActivityIndicator color={colors.secondary} style={styles.footerLoader} />
            ) : null
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
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
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  rowLeft: { flexDirection: "row", gap: spacing.md, flex: 1 },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainer,
  },
  rowContent: { flex: 1, gap: spacing.xs },
  productName: { ...typography.bodyLg, color: colors.onSurface, fontWeight: "700" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  price: { ...typography.bodyMd, color: colors.secondary, fontWeight: "700" },
  originalPrice: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textDecorationLine: "line-through",
  },
  quantity: { ...typography.labelSm, color: colors.onSurfaceVariant },
  outOfStockBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.errorContainer,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginTop: spacing.xs,
  },
  outOfStockText: { ...typography.labelSm, color: colors.error, fontWeight: "700" },
  actionsCol: { gap: spacing.sm },
  emptyBox: { alignItems: "center", paddingTop: spacing.xxl, gap: spacing.md },
  emptyText: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  footerLoader: { paddingVertical: spacing.xl },
});
