import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Button, Input, Alert } from "@/components/ui";
import { addressService } from "@/services/api/addressService";
import type { AddressDTO } from "@/services/api/types";
import type { ApiError } from "@/services/api";
import { colors, typography, spacing, radius, shadows } from "@/styles/theme";
import { ProfileSkeleton } from "@/components/skeletons";

// ─── Address form state ───────────────────────────────────────────────────────

type AddressForm = Omit<AddressDTO, "addressId">;

const emptyForm = (): AddressForm => ({
  street: "",
  buildingName: "",
  city: "",
  state: "",
  country: "",
  pincode: "",
});

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  label: {
    ...typography.labelBold,
    color: colors.onSurfaceVariant,
  },
  value: {
    ...typography.bodyMd,
    color: colors.onSurface,
    flexShrink: 1,
    textAlign: "right",
  },
});

// ─── Address card ─────────────────────────────────────────────────────────────

function AddressCard({
  address,
  onEdit,
  onDelete,
}: {
  address: AddressDTO;
  onEdit: (a: AddressDTO) => void;
  onDelete: (id: number) => void;
}) {
  const lines = [
    address.street,
    address.buildingName,
    `${address.city}, ${address.state}`,
    `${address.country} ${address.pincode}`,
  ].filter(Boolean);

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.body}>
        {lines.map((line, i) => (
          <Text key={i} style={cardStyles.line}>
            {line}
          </Text>
        ))}
      </View>
      <View style={cardStyles.actions}>
        <TouchableOpacity onPress={() => onEdit(address)} style={cardStyles.btn}>
          <Text style={cardStyles.editText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => address.addressId && onDelete(address.addressId)}
          style={cardStyles.btn}
        >
          <Text style={cardStyles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    gap: spacing.sm,
    ...shadows.sm,
  },
  body: { gap: 2 },
  line: { ...typography.bodyMd, color: colors.onSurface },
  actions: { flexDirection: "row", gap: spacing.md },
  btn: { paddingVertical: spacing.xs },
  editText: { ...typography.labelBold, color: colors.secondary },
  deleteText: { ...typography.labelBold, color: colors.error },
});

// ─── Address modal ────────────────────────────────────────────────────────────

function AddressModal({
  visible,
  initial,
  onClose,
  onSave,
}: {
  visible: boolean;
  initial: AddressForm;
  onClose: () => void;
  onSave: (form: AddressForm) => Promise<void>;
}) {
  const [form, setForm] = useState<AddressForm>(initial);
  const [errors, setErrors] = useState<Partial<AddressForm>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initial);
    setErrors({});
  }, [initial, visible]);

  function set(field: keyof AddressForm) {
    return (value: string) => setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const e: Partial<AddressForm> = {};
    if (!form.street.trim()) e.street = "Street is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state.trim()) e.state = "State is required";
    if (!form.country.trim()) e.country = "Country is required";
    if (!form.pincode.trim()) e.pincode = "Pincode is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={modalStyles.container}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>
            {initial.street ? "Edit Address" : "New Address"}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={modalStyles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Input
            label="Street"
            placeholder="123 Main St"
            value={form.street}
            onChangeText={set("street")}
            error={errors.street}
          />
          <Input
            label="Building / Apt (optional)"
            placeholder="Apt 4B"
            value={form.buildingName}
            onChangeText={set("buildingName")}
          />
          <Input
            label="City"
            placeholder="Cairo"
            value={form.city}
            onChangeText={set("city")}
            error={errors.city}
          />
          <Input
            label="State"
            placeholder="Cairo Governorate"
            value={form.state}
            onChangeText={set("state")}
            error={errors.state}
          />
          <Input
            label="Country"
            placeholder="Egypt"
            value={form.country}
            onChangeText={set("country")}
            error={errors.country}
          />
          <Input
            label="Pincode"
            placeholder="11511"
            keyboardType="numeric"
            value={form.pincode}
            onChangeText={set("pincode")}
            error={errors.pincode}
          />

          <Button
            label="Save Address"
            variant="primary"
            size="lg"
            fullWidth
            loading={saving}
            onPress={handleSave}
            style={modalStyles.saveBtn}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  scroll: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  saveBtn: {
    marginTop: spacing.md,
  },
});

// ─── Main ProfileScreen ───────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user, logout, isAdmin, isSeller } = useAuth();
  const { show } = useToast();

  const [addresses, setAddresses] = useState<AddressDTO[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressDTO | null>(null);

  // ─── Load addresses ──────────────────────────────────────────────────────

  const loadAddresses = useCallback(async () => {
    try {
      const data = await addressService.getMyAddresses();
      setAddresses(data);
    } catch {
      // Non-critical — silently fail
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAddresses();
    setRefreshing(false);
  }, [loadAddresses]);

  // ─── Address CRUD ────────────────────────────────────────────────────────

  function openNew() {
    setEditingAddress(null);
    setModalVisible(true);
  }

  function openEdit(address: AddressDTO) {
    setEditingAddress(address);
    setModalVisible(true);
  }

  async function handleSaveAddress(form: AddressForm) {
    try {
      if (editingAddress?.addressId) {
        const updated = await addressService.update(editingAddress.addressId, form);
        setAddresses((prev) =>
          prev.map((a) => (a.addressId === updated.addressId ? updated : a))
        );
        show({ message: "Address updated", variant: "success" });
      } else {
        const created = await addressService.create(form);
        setAddresses((prev) => [...prev, created]);
        show({ message: "Address added", variant: "success" });
      }
      setModalVisible(false);
    } catch (err) {
      const e = err as ApiError;
      show({ message: e.message ?? "Failed to save address", variant: "error" });
      throw err; // keep modal open
    }
  }

  async function handleDeleteAddress(addressId: number) {
    try {
      await addressService.delete(addressId);
      setAddresses((prev) => prev.filter((a) => a.addressId !== addressId));
      show({ message: "Address removed", variant: "info" });
    } catch (err) {
      const e = err as ApiError;
      show({ message: e.message ?? "Failed to delete address", variant: "error" });
    }
  }

  // ─── Logout ──────────────────────────────────────────────────────────────

  async function handleLogout() {
    await logout();
    show({ message: "Signed out successfully", variant: "info" });
  }

  // ─── Role badge ──────────────────────────────────────────────────────────

  const roleLabel = isAdmin ? "Admin" : isSeller ? "Seller" : "Customer";
  const roleBg = isAdmin
    ? colors.primaryContainer
    : isSeller
    ? colors.secondaryContainer
    : colors.surfaceContainerHigh;
  const roleColor = isAdmin
    ? colors.onPrimaryContainer
    : isSeller
    ? colors.onSecondaryContainer
    : colors.onSurfaceVariant;

  // ─── Render ──────────────────────────────────────────────────────────────

  const modalInitial: AddressForm = editingAddress
    ? {
        street: editingAddress.street,
        buildingName: editingAddress.buildingName ?? "",
        city: editingAddress.city,
        state: editingAddress.state,
        country: editingAddress.country,
        pincode: editingAddress.pincode,
      }
    : emptyForm();

  // Show full skeleton on first load (before any addresses are known)
  if (loadingAddresses) {
    return <ProfileSkeleton />;
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.secondary}
          />
        }
      >
        {/* ── Avatar + name ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.username?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>
          <Text style={styles.username}>{user?.username}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleBg }]}>
            <Text style={[styles.roleText, { color: roleColor }]}>{roleLabel}</Text>
          </View>
        </View>

        {/* ── Account info ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <InfoRow label="Username" value={user?.username ?? "—"} />
            <InfoRow label="Email" value={user?.email ?? "—"} />
            <InfoRow label="Role" value={roleLabel} />
          </View>
        </View>

        {/* ── Addresses ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Addresses</Text>
            <TouchableOpacity onPress={openNew} style={styles.addBtn}>
              <Ionicons name="add" size={18} color={colors.secondary} />
              <Text style={styles.addLink}>Add</Text>
            </TouchableOpacity>
          </View>

          {apiError && (
            <Alert
              variant="error"
              message={apiError}
              onDismiss={() => setApiError(null)}
            />
          )}

          {addresses.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No addresses yet.</Text>
              <Button
                label="Add Address"
                variant="outline"
                size="sm"
                onPress={openNew}
              />
            </View>
          ) : (
            <View style={styles.addressList}>
              {addresses.map((addr) => (
                <AddressCard
                  key={addr.addressId}
                  address={addr}
                  onEdit={openEdit}
                  onDelete={handleDeleteAddress}
                />
              ))}
            </View>
          )}
        </View>

        {/* ── Sign out ── */}
        <Button
          label="Sign Out"
          variant="outline"
          size="lg"
          fullWidth
          onPress={handleLogout}
          style={styles.logoutBtn}
        />
      </ScrollView>

      {/* ── Address modal ── */}
      <AddressModal
        visible={modalVisible}
        initial={modalInitial}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveAddress}
      />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  // Avatar
  avatarSection: {
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.md,
  },
  avatarText: {
    ...typography.headlineLg,
    color: colors.onPrimaryContainer,
  },
  username: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  roleBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  roleText: {
    ...typography.labelBold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  // Sections
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  addLink: {
    ...typography.labelBold,
    color: colors.secondary,
  },
  // Info card
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...shadows.sm,
  },
  // Addresses
  addressList: {
    gap: spacing.md,
  },
  emptyBox: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  loader: {
    paddingVertical: spacing.xl,
  },
  logoutBtn: {
    marginTop: spacing.sm,
  },
});
