import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { categoryService } from "@/services/api/categoryService";
import { productService } from "@/services/api/productService";
import { Alert, Input, Button } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { validateProductForm } from "@/utils/adminUtils";
import type { CategoryDTO } from "@/services/api/types";
import { colors, typography, spacing, radius } from "@/styles/theme";

type ProductFormParams = {
  productId?: string;
  productName?: string;
  description?: string;
  quantity?: string;
  price?: string;
  discount?: string;
  categoryId?: string;
};

export default function ProductFormScreen() {
  const params = useLocalSearchParams<ProductFormParams>();
  const [form, setForm] = useState({
    productName: params.productName ?? "",
    description: params.description ?? "",
    quantity: params.quantity ?? "",
    price: params.price ?? "",
    discount: params.discount ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    params.categoryId ? parseInt(params.categoryId) : null
  );
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const router = useRouter();
  const { show } = useToast();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryService.getAll({ pageSize: 100 });
        setCategories(response.content);
      } catch (err: any) {
        setApiError(err.response?.data?.message || "Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async () => {
    const validation = validateProductForm(form);
    setErrors(validation.errors);

    if (!selectedCategoryId) {
      setErrors({ ...validation.errors, category: "Please select a category" });
      return;
    }

    if (!validation.isValid) return;

    try {
      setSaving(true);
      setApiError(null);
      const data = {
        productName: form.productName,
        description: form.description,
        quantity: Number(form.quantity),
        price: Number(form.price),
        discount: Number(form.discount),
        categoryId: selectedCategoryId,
      };
      if (params.productId) {
        await productService.updateAdmin(parseInt(params.productId), data);
      } else {
        await productService.createAdmin(selectedCategoryId, data);
      }
      show({ message: "Product saved", variant: "success" });
      router.back();
    } catch (err: any) {
      setApiError(err.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          label=""
          icon="arrow-back"
          variant="ghost"
          onPress={() => router.back()}
          style={styles.backBtn}
        />
        <Text style={styles.title}>{params.productId ? "Edit Product" : "Add Product"}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {apiError && <Alert variant="error" message={apiError} />}

        <Input
          label="Product Name"
          placeholder="Enter product name"
          value={form.productName}
          onChangeText={(text) => setForm({ ...form, productName: text })}
          error={errors.productName}
        />
        <Input
          label="Description"
          placeholder="Enter description"
          value={form.description}
          onChangeText={(text) => setForm({ ...form, description: text })}
          error={errors.description}
          multiline
        />
        <Input
          label="Quantity"
          placeholder="Enter quantity"
          value={form.quantity}
          onChangeText={(text) => setForm({ ...form, quantity: text })}
          error={errors.quantity}
          keyboardType="numeric"
        />
        <Input
          label="Price"
          placeholder="Enter price"
          value={form.price}
          onChangeText={(text) => setForm({ ...form, price: text })}
          error={errors.price}
          keyboardType="decimal-pad"
        />
        <Input
          label="Discount (%)"
          placeholder="Enter discount (0-100)"
          value={form.discount}
          onChangeText={(text) => setForm({ ...form, discount: text })}
          error={errors.discount}
          keyboardType="decimal-pad"
        />

        <View style={styles.categorySection}>
          <Text style={styles.label}>Category</Text>
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
          {loadingCategories ? (
            <Text style={styles.loadingText}>Loading categories...</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.categoryId}
                  style={[
                    styles.categoryChip,
                    selectedCategoryId === cat.categoryId && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategoryId(cat.categoryId)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategoryId === cat.categoryId && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.categoryName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <Button
          label={params.productId ? "Update Product" : "Create Product"}
          loading={saving}
          disabled={saving}
          onPress={handleSubmit}
          style={styles.submitBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: spacing.xxl + spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  backBtn: { padding: 0 },
  title: { ...typography.headlineMd, color: colors.onSurface },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  categorySection: { gap: spacing.sm },
  label: { ...typography.labelBold, color: colors.onSurface },
  errorText: { ...typography.labelSm, color: colors.error },
  loadingText: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  categoryScroll: { marginVertical: spacing.xs },
  categoryChip: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginRight: spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: colors.secondaryContainer,
  },
  categoryChipText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  categoryChipTextActive: {
    color: colors.onSecondary,
    fontWeight: "700",
  },
  submitBtn: { marginTop: spacing.lg },
});
