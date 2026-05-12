import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useInfiniteProducts } from "@/hooks/useInfiniteProducts";
import ProductCard from "@/components/product/ProductCard";
import { Alert } from "@/components/ui";
import type { ProductDTO } from "@/services/api/types";
import { colors, typography, spacing, radius, shadows } from "@/styles/theme";
import { ProductGridSkeleton } from "@/components/skeletons";

type SortOption = { label: string; sortBy: string; sortOrder: "asc" | "desc" };

const SORT_OPTIONS: SortOption[] = [
  { label: "Newest",      sortBy: "productId",    sortOrder: "desc" },
  { label: "Oldest",      sortBy: "productId",    sortOrder: "asc"  },
  { label: "Price: Low",  sortBy: "specialPrice", sortOrder: "asc"  },
  { label: "Price: High", sortBy: "specialPrice", sortOrder: "desc" },
  { label: "Name: A–Z",   sortBy: "productName",  sortOrder: "asc"  },
  { label: "Name: Z–A",   sortBy: "productName",  sortOrder: "desc" },
];

export default function ProductsScreen() {
  const router = useRouter();
  const { categoryId, categoryName } = useLocalSearchParams<{ categoryId?: string; categoryName?: string }>();

  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [sortIndex, setSortIndex] = useState(0);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const sort = SORT_OPTIONS[sortIndex];
  const { products, loading, refreshing, hasMore, error, loadMore, refresh, reset } = useInfiniteProducts();

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleKeywordChange(text: string) {
    setKeyword(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedKeyword(text), 400);
  }

  useEffect(() => {
    reset({
      keyword: debouncedKeyword || undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder,
      pageSize: 10,
    });
  }, [debouncedKeyword, categoryId, sortIndex]);

  function handleProductPress(product: ProductDTO) {
    router.push({ pathname: "/(user)/product/[id]", params: { id: product.productId } });
  }

  const ListHeader = (
    <View style={styles.listHeader}>
      {categoryName && (
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.secondary} />
          <Text style={styles.backLabel}>{categoryName}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={colors.outline}
            value={keyword}
            onChangeText={handleKeywordChange}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {keyword.length > 0 && (
            <TouchableOpacity onPress={() => { setKeyword(""); setDebouncedKeyword(""); }}>
              <Ionicons name="close-circle" size={18} color={colors.outline} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.sortBtn} onPress={() => setSortModalVisible(true)}>
          <Ionicons name="options-outline" size={20} color={colors.onSurface} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sortLabel}>Sorted by: {sort.label}</Text>
      {error && <Alert variant="error" message={error} />}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.productId)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={
          loading && products.length > 0
            ? <ActivityIndicator color={colors.secondary} style={styles.footerLoader} />
            : !hasMore && products.length > 0
            ? <Text style={styles.endText}>You've seen everything</Text>
            : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyBox}>
              <Ionicons name="search-outline" size={56} color={colors.outlineVariant} />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <ProductCard product={item} onPress={handleProductPress} />
          </View>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.secondary} />}
        showsVerticalScrollIndicator={false}
      />

      {loading && products.length === 0 && <ProductGridSkeleton />}

      {/* Sort bottom sheet */}
      <Modal visible={sortModalVisible} transparent animationType="slide" onRequestClose={() => setSortModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSortModalVisible(false)}>
          <View style={styles.sortSheet}>
            <Text style={styles.sortSheetTitle}>Sort by</Text>
            {SORT_OPTIONS.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.sortOption, i === sortIndex && styles.sortOptionActive]}
                onPress={() => { setSortIndex(i); setSortModalVisible(false); }}
              >
                <Text style={[styles.sortOptionText, i === sortIndex && styles.sortOptionTextActive]}>
                  {opt.label}
                </Text>
                {i === sortIndex && <Ionicons name="checkmark" size={18} color={colors.secondary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  backRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  backLabel: { ...typography.headlineMd, color: colors.onSurface },
  searchRow: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
    paddingVertical: spacing.sm + 2,
  },
  sortBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.sm,
  },
  sortLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  row: { paddingHorizontal: spacing.lg, gap: spacing.md, marginBottom: spacing.md },
  cell: { flex: 1 },
  footerLoader: { paddingVertical: spacing.xl },
  endText: { ...typography.labelSm, color: colors.outline, textAlign: "center", paddingVertical: spacing.xl },
  emptyBox: { alignItems: "center", paddingTop: spacing.xxl, gap: spacing.md },
  emptyText: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  fullLoader: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sortSheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xs,
    ...shadows.xl,
  },
  sortSheetTitle: { ...typography.headlineMd, color: colors.onSurface, marginBottom: spacing.sm },
  sortOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
  },
  sortOptionActive: { backgroundColor: colors.surfaceContainerLow },
  sortOptionText: { ...typography.bodyMd, color: colors.onSurface },
  sortOptionTextActive: { color: colors.secondary, fontWeight: "700" },
});
