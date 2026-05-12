import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "@/services/api/authService";
import { useAuth } from "@/contexts/AuthContext";
import { Alert } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { AdminListSkeleton } from "@/components/skeletons";
import { colors, typography, spacing, radius, shadows } from "@/styles/theme";

type SellerInfo = {
  userId: number;
  username: string;
  email: string;
  roles: string[];
};

export default function SellersScreen() {
  const [sellers, setSellers] = useState<SellerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef(0);
  const { logout } = useAuth();
  const { show } = useToast();

  const loadSellers = useCallback(async (page: number, isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const response = await authService.getSellers(page);
      const data = response as unknown as { content: SellerInfo[]; lastPage: boolean };
      setSellers(prev => isRefresh ? data.content : [...prev, ...data.content]);
      setHasMore(!data.lastPage);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 401) {
        await logout();
        return;
      } else if (err.response?.status === 403) {
        show({ message: "Access denied", variant: "error" });
      } else {
        setError(err.response?.data?.message || "Failed to load sellers");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [logout, show]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    pageRef.current = 0;
    loadSellers(0, true);
  }, [loadSellers]);

  const handleEndReached = useCallback(() => {
    if (hasMore && !loading) {
      pageRef.current += 1;
      loadSellers(pageRef.current);
    }
  }, [hasMore, loading, loadSellers]);

  useFocusEffect(
    useCallback(() => {
      handleRefresh();
    }, [handleRefresh])
  );

  const renderItem = ({ item }: { item: SellerInfo }) => (
    <View style={styles.row} testID={`seller-row-${item.userId}`}>
      <View style={styles.rowContent}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <View style={styles.rolesContainer}>
          {item.roles.map((role, i) => (
            <View key={i} style={styles.roleChip}>
              <Text style={styles.roleText}>{role.replace("ROLE_", "")}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const ListHeader = (
    <View style={styles.listHeader}>
      <Text style={styles.title}>Sellers</Text>
      {error && <Alert variant="error" message={error} onRetry={handleRefresh} />}
    </View>
  );

  const ListEmptyComponent = !loading && sellers.length === 0 ? (
    <View style={styles.emptyBox}>
      <Ionicons name="people-outline" size={56} color={colors.outlineVariant} />
      <Text style={styles.emptyText}>No sellers found</Text>
    </View>
  ) : null;

  return (
    <View style={styles.container}>
      {loading && sellers.length === 0 ? (
        <AdminListSkeleton />
      ) : (
        <FlatList
          data={sellers}
          keyExtractor={(item) => String(item.userId)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={
            loading && sellers.length > 0 ? (
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
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  rowContent: { gap: spacing.xs },
  username: { ...typography.bodyLg, color: colors.onSurface, fontWeight: "700" },
  email: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  rolesContainer: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  roleChip: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  roleText: { ...typography.labelSm, color: colors.secondary },
  emptyBox: { alignItems: "center", paddingTop: spacing.xxl, gap: spacing.md },
  emptyText: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  footerLoader: { paddingVertical: spacing.xl },
});
