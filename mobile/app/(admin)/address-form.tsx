import { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { addressService } from "@/services/api/addressService";
import { Alert, Input, Button } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { colors, typography, spacing } from "@/styles/theme";

type AddressFormParams = {
  addressId: string;
  street: string;
  buildingName?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
};

export default function AddressFormScreen() {
  const params = useLocalSearchParams<AddressFormParams>();
  const [form, setForm] = useState({
    street: params.street ?? "",
    buildingName: params.buildingName ?? "",
    city: params.city ?? "",
    state: params.state ?? "",
    country: params.country ?? "",
    pincode: params.pincode ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();
  const { show } = useToast();

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.street.trim()) newErrors.street = "Street is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state.trim()) newErrors.state = "State is required";
    if (!form.country.trim()) newErrors.country = "Country is required";
    if (!form.pincode.trim()) newErrors.pincode = "Pincode is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setSaving(true);
      setApiError(null);
      await addressService.update(parseInt(params.addressId), form);
      show({ message: "Address updated", variant: "success" });
      router.back();
    } catch (err: any) {
      setApiError(err.response?.data?.message || "Failed to update address");
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
        <Text style={styles.title}>Edit Address</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {apiError && <Alert variant="error" message={apiError} />}

        <Input
          label="Street"
          placeholder="Enter street"
          value={form.street}
          onChangeText={(text) => setForm({ ...form, street: text })}
          error={errors.street}
        />
        <Input
          label="Building Name (optional)"
          placeholder="Enter building name"
          value={form.buildingName}
          onChangeText={(text) => setForm({ ...form, buildingName: text })}
        />
        <Input
          label="City"
          placeholder="Enter city"
          value={form.city}
          onChangeText={(text) => setForm({ ...form, city: text })}
          error={errors.city}
        />
        <Input
          label="State"
          placeholder="Enter state"
          value={form.state}
          onChangeText={(text) => setForm({ ...form, state: text })}
          error={errors.state}
        />
        <Input
          label="Country"
          placeholder="Enter country"
          value={form.country}
          onChangeText={(text) => setForm({ ...form, country: text })}
          error={errors.country}
        />
        <Input
          label="Pincode"
          placeholder="Enter pincode"
          value={form.pincode}
          onChangeText={(text) => setForm({ ...form, pincode: text })}
          error={errors.pincode}
        />

        <Button
          label="Update Address"
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
