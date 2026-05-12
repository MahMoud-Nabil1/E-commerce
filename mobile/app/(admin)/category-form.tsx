import { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { categoryService } from "@/services/api/categoryService";
import { Alert, Input, Button } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { validateCategoryForm } from "@/utils/adminUtils";
import { colors, typography, spacing } from "@/styles/theme";

export default function CategoryFormScreen() {
  const { categoryId, categoryName } = useLocalSearchParams<{ categoryId?: string; categoryName?: string }>();
  const [name, setName] = useState(categoryName ?? "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();
  const { show } = useToast();

  const handleSubmit = async () => {
    const validation = validateCategoryForm(name);
    setNameError(validation.nameError);
    if (!validation.isValid) return;

    try {
      setSaving(true);
      setApiError(null);
      if (categoryId) {
        await categoryService.update(parseInt(categoryId), { categoryName: name });
      } else {
        await categoryService.create({ categoryName: name });
      }
      show({ message: "Category saved", variant: "success" });
      router.back();
    } catch (err: any) {
      setApiError(err.response?.data?.message || "Failed to save category");
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
        <Text style={styles.title}>{categoryId ? "Edit Category" : "Add Category"}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {apiError && <Alert variant="error" message={apiError} />}

        <Input
          label="Category Name"
          placeholder="Enter category name"
          value={name}
          onChangeText={setName}
          error={nameError}
          autoCapitalize="words"
        />

        <Button
          label={categoryId ? "Update Category" : "Create Category"}
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
  submitBtn: { marginTop: spacing.lg },
});
