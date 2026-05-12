import { HomeScreenSkeleton } from "@/components/skeletons";

// ...existing imports...
import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import ProductCard from "@/components/product/ProductCard";
import { categoryService } from "@/services/api/categoryService";
import { productService } from "@/services/api/productService";
import type { CategoryDTO, ProductDTO } from "@/services/api/types";
import { colors, typography, spacing, radius, shadows } from "@/styles/theme";

const TOP_CATEGORIES_COUNT = 6;
const FEATURED_PRODUCTS_COUNT = 6;

// Fixed icon palette cycled by index
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

export default function UserHome() {
  const { user } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        categoryService.getAll({ pageSize: TOP_CATEGORIES_COUNT, sortBy: "categoryId" }),
        productService.getAll({ pageSize: FEATURED_PRODUCTS_COUNT, sortBy: "productId" }),
      ]);
      setCategories(catRes.content);
      setProducts(prodRes.content);
    } catch {
      // non-critical
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, [fetchData]);

  function goToAllProducts() { router.push("/(user)/products"); }
  function goToAllCategories() { router.push("/(user)/categories"); }
  function goToCategory(cat: CategoryDTO) {
    router.push({ pathname: "/(user)/category/[id]", params: { id: cat.categoryId, categoryName: cat.categoryName } });
  }
  function goToProduct(product: ProductDTO) {
    router.push({ pathname: "/(user)/product/[id]", params: { id: product.productId } });
  }

  if (loading) {
    return <HomeScreenSkeleton />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.secondary} />}
    >
      {/* ── Greeting ── */}
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>Hello, {user?.username}</Text>
        <Text style={styles.greetingSubtitle}>What are you looking for today?</Text>
      </View>

      {/* ── Categories ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity style={styles.viewAllRow} onPress={goToAllCategories}>
            <Text style={styles.viewAll}>View all</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        {categories.length === 0 ? (
          <Text style={styles.emptyText}>No categories available</Text>
        ) : (
          <FlatList
            data={categories}
            keyExtractor={(item) => String(item.categoryId)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item, index }) => (
              <TouchableOpacity style={styles.categoryChip} onPress={() => goToCategory(item)}>
                <View style={styles.categoryIconBox}>
                  <Ionicons
                    name={CATEGORY_ICONS[index % CATEGORY_ICONS.length]}
                    size={22}
                    color={colors.secondary}
                  />
                </View>
                <Text style={styles.categoryName} numberOfLines={1}>{item.categoryName}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* ── Featured Products ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured</Text>
          <TouchableOpacity style={styles.viewAllRow} onPress={goToAllProducts}>
            <Text style={styles.viewAll}>View all</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        {products.length === 0 ? (
          <Text style={styles.emptyText}>No products available</Text>
        ) : (
          <View style={styles.productGrid}>
            {products.map((product) => (
              <View key={product.productId} style={styles.productCell}>
                <ProductCard product={product} onPress={goToProduct} />
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingTop: spacing.xxl + spacing.lg, paddingBottom: spacing.xxl, gap: spacing.xl },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },  greeting: { paddingHorizontal: spacing.lg, gap: spacing.xs },
  greetingText: { ...typography.headlineLg, color: colors.onSurface },
  greetingSubtitle: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  section: { gap: spacing.md },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: { ...typography.headlineMd, color: colors.onSurface },
  viewAllRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  viewAll: { ...typography.labelBold, color: colors.secondary },
  emptyText: { ...typography.bodyMd, color: colors.onSurfaceVariant, paddingHorizontal: spacing.lg },
  categoryList: { paddingHorizontal: spacing.lg, gap: spacing.sm },
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
  categoryIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLow,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryName: { ...typography.labelBold, color: colors.onSurface, maxWidth: 80, textAlign: "center" },
  productGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: spacing.lg, gap: spacing.md },
  productCell: { width: "47%" },
});
