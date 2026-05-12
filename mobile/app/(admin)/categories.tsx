import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert as RNAlert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { categoryService } from "@/services/api/categoryService";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, Button } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { removeById } from "@/utils/adminUtils";
import { AdminListSkeleton } from "@/components/skeletons";
import type { CategoryDTO } from "@/services/api/types";
import { colors, typography, spacing, radius, shadows } from "@/styles/theme";

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const pageRef = useRef(0);
  const { logout } = useAuth();
  const { show } = useToast();
  const router = useRouter();

  const loadCategories = useCallback(async (page: number, isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const response = await categoryService.getAll({ pageNumber: page });
      setCategories(prev => isRefresh ? response.content : [...prev, ...response.content]);
      setHasMore(!response.lastPage);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 401) {
        await logout();
        return;
      } else if (err.response?.status === 403) {
        show({ message: "Access denied", variant: "error" });
      } else {
        setError(err.response?.data?.message || "Failed to load categories");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [logout, show]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    pageRef.current = 0;
    loadCategories(0, true);
  }, [loadCategories]);

  const handleEndReached = useCallback(() => {
    if (hasMore && !loading) {
      pageRef.current += 1;
      loadCategories(pageRef.current);
    }
  }, [hasMore, loading, loadCategories]);

  const handleDelete = useCallback((categoryId: number, categoryName: string) => {
    RNAlert.alert(
      "Delete Category",
      `Are you sure you want to delete "${categoryName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(categoryId);
              await categoryService.delete(categoryId);
              setCategories((prev) => removeById(prev, "categoryId", categoryId));
              show({ message: "Category deleted", variant: "success" });
            } catch (err: any) {
              setError(err.response?.data?.message || "Failed to delete category");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  }, [show]);

  useFocusEffect(
    useCallback(() => {
      handleRefresh();
    }, [handleRefresh])
  );

  const renderItem = ({ item }: { item: CategoryDTO }) => (
    <View style={styles.row}>
      <View style={styles.rowContent}>
        <Text style={styles.categoryId}>#{item.categoryId}</Text>
        <Text style={styles.categoryName}>{item.categoryName}</Text>
      </View>
      <View style={styles.actionsRow}>
        <Button
          icon="create-outline"
          variant="outline"
          size="icon"
          onPress={() => router.push({ pathname: "/(admin)/category-form", params: { categoryId: String(item.categoryId), categoryName: item.categoryName } })}
        />
        <Button
          icon="trash-outline"
          variant="destructive"
          size="icon"
          loading={deletingId === item.categoryId}
          disabled={deletingId === item.categoryId}
          onPress={() => handleDelete(item.categoryId, item.categoryName)}
        />
      </View>
    </View>
  );

  const ListHeader = (
    <View style={styles.listHeader}>
      <Text style={styles.title}>Categories</Text>
      <Button
        label="Add Category"
        icon="add"
        onPress={() => router.push("/(admin)/category-form")}
      />
      {error && <Alert variant="error" message={error} onRetry={handleRefresh} />}
    </View>
  );

  const ListEmptyComponent = !loading && categories.length === 0 ? (
    <View style={styles.emptyBox}>
      <Ionicons name="pricetags-outline" size={56} color={colors.outlineVariant} />
      <Text style={styles.emptyText}>No categories found</Text>
    </View>
  ) : null;

  return (
    <View style={styles.container}>
      {loading && categories.length === 0 ? (
        <AdminListSkeleton />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => String(item.categoryId)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={
            loading && categories.length > 0 ? (
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
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  rowContent: { gap: spacing.xs },
  categoryId: { ...typography.labelSm, color: colors.onSurfaceVariant },
  categoryName: { ...typography.bodyLg, color: colors.onSurface, fontWeight: "700" },
  actionsRow: { flexDirection: "row", gap: spacing.sm },
  emptyBox: { alignItems: "center", paddingTop: spacing.xxl, gap: spacing.md },
  emptyText: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  footerLoader: { paddingVertical: spacing.xl },
});
