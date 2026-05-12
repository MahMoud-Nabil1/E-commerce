import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { categoryService } from "@/services/api/categoryService";
import type { CategoryDTO } from "@/services/api/types";
import { colors, typography, spacing, radius, shadows } from "@/styles/theme";
import { CategoryGridSkeleton } from "@/components/skeletons";

const PAGE_SIZE = 20;

const CATEGORY_ICONS: Array<keyof typeof Ionicons.glyphMap> = [
  "phone-portrait-outline",
  "shirt-outline",
  "home-outline",
  "football-outline",
  "book-outline",
  "color-palette-outline",
  "game-controller-outline",
  "restaurant-outline",
  "leaf-outline",
  "diamond-outline",
  "construct-outline",
  "musical-notes-outline",
  "paw-outline",
  "airplane-outline",
  "pizza-outline",
  "bag-handle-outline",
];

export default function CategoriesScreen() {
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);

  const pageRef = useRef(0);
  const keywordRef = useRef("");

  const fetchPage = useCallback(async (page: number, append: boolean) => {
    try {
      const res = await categoryService.getAll({
        pageNumber: page,
        pageSize: PAGE_SIZE,
        sortBy: "categoryName",
        sortOrder: "asc",
      });
      const filtered = keywordRef.current
        ? res.content.filter((c) =>
            c.categoryName.toLowerCase().includes(keywordRef.current.toLowerCase())
          )
        : res.content;
      setCategories((prev) => (append ? [...prev, ...filtered] : filtered));
      setHasMore(!res.lastPage);
      pageRef.current = page;
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
      setFetchingMore(false);
    }
  }, []);

  useEffect(() => { fetchPage(0, false); }, [fetchPage]);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleSearch(text: string) {
    setKeyword(text);
    keywordRef.current = text;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setLoading(true);
      pageRef.current = 0;
      fetchPage(0, false);
    }, 350);
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    pageRef.current = 0;
    fetchPage(0, false);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (fetchingMore || !hasMore) return;
    setFetchingMore(true);
    fetchPage(pageRef.current + 1, true);
  }, [fetchingMore, hasMore, fetchPage]);

  function goToCategory(cat: CategoryDTO) {
    router.push({ pathname: "/(user)/category/[id]", params: { id: cat.categoryId, categoryName: cat.categoryName } });
  }

  const ListHeader = (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={colors.secondary} />
        <Text style={styles.title}>All Categories</Text>
      </TouchableOpacity>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={colors.outline} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories..."
          placeholderTextColor={colors.outline}
          value={keyword}
          onChangeText={handleSearch}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {keyword.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons name="close-circle" size={18} color={colors.outline} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.categoryId)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={
          fetchingMore
            ? <ActivityIndicator color={colors.secondary} style={styles.footerLoader} />
            : !hasMore && categories.length > 0
            ? <Text style={styles.endText}>All categories loaded</Text>
            : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyBox}>
              <Ionicons name="pricetags-outline" size={56} color={colors.outlineVariant} />
              <Text style={styles.emptyText}>No categories found</Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.card} onPress={() => goToCategory(item)} activeOpacity={0.8}>
            <View style={styles.cardIconBox}>
              <Ionicons
                name={CATEGORY_ICONS[index % CATEGORY_ICONS.length]}
                size={32}
                color={colors.secondary}
              />
            </View>
            <Text style={styles.cardName} numberOfLines={2}>{item.categoryName}</Text>
          </TouchableOpacity>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.secondary} />}
        showsVerticalScrollIndicator={false}
      />

      {loading && categories.length === 0 && <CategoryGridSkeleton />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingBottom: spacing.xxl },
  header: {
    paddingTop: spacing.xxl + spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  backRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  title: { ...typography.headlineLg, color: colors.onSurface },
  searchBox: {
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
  row: { paddingHorizontal: spacing.lg, gap: spacing.md, marginBottom: spacing.md },
  card: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
    ...shadows.sm,
  },
  cardIconBox: {
    width: 60,
    height: 60,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceContainerLow,
    justifyContent: "center",
    alignItems: "center",
  },
  cardName: { ...typography.labelBold, color: colors.onSurface, textAlign: "center" },
  footerLoader: { paddingVertical: spacing.xl },
  endText: { ...typography.labelSm, color: colors.outline, textAlign: "center", paddingVertical: spacing.xl },
  emptyBox: { alignItems: "center", paddingTop: spacing.xxl, gap: spacing.md },
  emptyText: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  fullLoader: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
});