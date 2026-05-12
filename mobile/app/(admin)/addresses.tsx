import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert as RNAlert,
  TextInput,
  Keyboard,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { addressService } from "@/services/api/addressService";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, Button } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { removeById } from "@/utils/adminUtils";
import { AdminListSkeleton } from "@/components/skeletons";
import type { AddressDTO } from "@/services/api/types";
import { colors, typography, spacing, radius, shadows } from "@/styles/theme";

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<AddressDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchId, setSearchId] = useState("");
  const [searchResult, setSearchResult] = useState<AddressDTO | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const { logout } = useAuth();
  const { show } = useToast();
  const router = useRouter();

  const loadAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await addressService.getAll();
      setAddresses(response);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 401) {
        await logout();
        return;
      } else if (err.response?.status === 403) {
        show({ message: "Access denied", variant: "error" });
      } else {
        setError(err.response?.data?.message || "Failed to load addresses");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [logout, show]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadAddresses();
  }, [loadAddresses]);

  const handleSearch = useCallback(async () => {
    if (!searchId.trim()) return;
    try {
      setSearching(true);
      setSearchError(null);
      const id = parseInt(searchId);
      const address = await addressService.getById(id);
      setSearchResult(address);
      Keyboard.dismiss();
    } catch (err: any) {
      if (err.response?.status === 404) {
        setSearchError("Address not found");
      } else {
        setSearchError(err.response?.data?.message || "Failed to search address");
      }
      setSearchResult(null);
    } finally {
      setSearching(false);
    }
  }, [searchId]);

  const handleDelete = useCallback((addressId: number) => {
    RNAlert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(addressId);
              await addressService.delete(addressId);
              setAddresses((prev) => removeById(prev, "addressId", addressId));
              if (searchResult?.addressId === addressId) {
                setSearchResult(null);
              }
              show({ message: "Address deleted", variant: "success" });
            } catch (err: any) {
              setError(err.response?.data?.message || "Failed to delete address");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  }, [show, searchResult]);

  useFocusEffect(
    useCallback(() => {
      handleRefresh();
    }, [handleRefresh])
  );

  const renderItem = ({ item }: { item: AddressDTO }) => (
    <View style={styles.row} testID={`address-row-${item.addressId}`}>
      <View style={styles.rowContent}>
        <Text style={styles.addressId}>#{item.addressId}</Text>
        <Text style={styles.street}>{item.street}</Text>
        {item.buildingName && <Text style={styles.building}>{item.buildingName}</Text>}
        <Text style={styles.cityState}>
          {item.city}, {item.state}, {item.country} - {item.pincode}
        </Text>
      </View>
      <View style={styles.actionsRow}>
        <Button
          icon="create-outline"
          variant="outline"
          size="icon"
          onPress={() =>
            router.push({
              pathname: "/(admin)/address-form",
              params: {
                addressId: String(item.addressId!),
                street: item.street,
                buildingName: item.buildingName ?? "",
                city: item.city,
                state: item.state,
                country: item.country,
                pincode: item.pincode,
              },
            })
          }
        />
        <Button
          icon="trash-outline"
          variant="destructive"
          size="icon"
          loading={deletingId === item.addressId}
          disabled={deletingId === item.addressId}
          onPress={() => handleDelete(item.addressId!)}
        />
      </View>
    </View>
  );

  const ListHeader = (
    <View style={styles.listHeader}>
      <Text style={styles.title}>Addresses</Text>
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Address ID"
          value={searchId}
          onChangeText={setSearchId}
          keyboardType="numeric"
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Button
          label="Search"
          loading={searching}
          disabled={searching}
          onPress={handleSearch}
          style={styles.searchBtn}
        />
      </View>
      {searchError && <Alert variant="error" message={searchError} />}
      {searchResult && (
        <View style={styles.searchResultCard}>
          <Text style={styles.searchResultTitle}>Search Result</Text>
          <Text style={styles.searchResultStreet}>{searchResult.street}</Text>
          {searchResult.buildingName && (
            <Text style={styles.searchResultBuilding}>{searchResult.buildingName}</Text>
          )}
          <Text style={styles.searchResultCityState}>
            {searchResult.city}, {searchResult.state}, {searchResult.country} - {searchResult.pincode}
          </Text>
        </View>
      )}
      {error && <Alert variant="error" message={error} onRetry={handleRefresh} />}
    </View>
  );

  const ListEmptyComponent = !loading && addresses.length === 0 ? (
    <View style={styles.emptyBox}>
      <Ionicons name="location-outline" size={56} color={colors.outlineVariant} />
      <Text style={styles.emptyText}>No addresses found</Text>
    </View>
  ) : null;

  return (
    <View style={styles.container}>
      {loading && addresses.length === 0 ? (
        <AdminListSkeleton />
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => String(item.addressId)}
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
  searchSection: { flexDirection: "row", gap: spacing.sm },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  searchBtn: { minWidth: 100 },
  searchResultCard: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  searchResultTitle: { ...typography.labelBold, color: colors.onSecondaryContainer },
  searchResultStreet: { ...typography.bodyMd, color: colors.onPrimary },
  searchResultBuilding: { ...typography.bodySm, color: colors.onPrimaryContainer },
  searchResultCityState: { ...typography.labelSm, color: colors.onPrimaryContainer, marginTop: spacing.xs },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  rowContent: { flex: 1, gap: spacing.xs, marginRight: spacing.md },
  addressId: { ...typography.labelSm, color: colors.onSurfaceVariant },
  street: { ...typography.bodyLg, color: colors.onSurface, fontWeight: "700" },
  building: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  cityState: { ...typography.labelSm, color: colors.onSurfaceVariant },
  actionsRow: { gap: spacing.sm },
  emptyBox: { alignItems: "center", paddingTop: spacing.xxl, gap: spacing.md },
  emptyText: { ...typography.bodyMd, color: colors.onSurfaceVariant },
});
