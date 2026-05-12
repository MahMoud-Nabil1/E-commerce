import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { orderService } from "@/services/api/orderService";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, Button } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { updateOrderStatus } from "@/utils/adminUtils";
import { AdminListSkeleton } from "@/components/skeletons";
import type { OrderDTO } from "@/services/api/types";
import { colors, typography, spacing, radius, shadows } from "@/styles/theme";

type SortBy = "orderId" | "orderDate" | "totalAmount";
type SortOrder = "asc" | "desc";

const ORDER_STATUSES = ["Order Accepted", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function OrdersScreen() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("orderId");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<OrderDTO | null>(null);
  const pageRef = useRef(0);
  const { logout } = useAuth();
  const { show } = useToast();

  const loadOrders = useCallback(async (page: number, isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const response = await orderService.getAllAdmin({
        pageNumber: page,
        pageSize: 10,
        sortBy,
        sortOrder,
      });
      setOrders(prev => isRefresh ? response.content : [...prev, ...response.content]);
      setHasMore(!response.lastPage);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 401) {
        await logout();
        return;
      } else if (err.response?.status === 403) {
        show({ message: "Access denied", variant: "error" });
      } else {
        setError(err.response?.data?.message || "Failed to load orders");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sortBy, sortOrder, logout, show]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    pageRef.current = 0;
    loadOrders(0, true);
  }, [loadOrders]);

  const handleEndReached = useCallback(() => {
    if (hasMore && !loading) {
      pageRef.current += 1;
      loadOrders(pageRef.current);
    }
  }, [hasMore, loading, loadOrders]);

  const handleFilterChange = useCallback(() => {
    pageRef.current = 0;
    loadOrders(0, true);
  }, [loadOrders]);

  const handleUpdateStatus = useCallback(async (newStatus: string) => {
    if (!selectedOrderForStatus) return;
    try {
      setUpdatingStatusId(selectedOrderForStatus.orderId);
      await orderService.updateStatusAdmin(selectedOrderForStatus.orderId, { status: newStatus });
      setOrders((prev) => updateOrderStatus(prev, selectedOrderForStatus.orderId, newStatus));
      show({ message: "Order status updated", variant: "success" });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingStatusId(null);
      setStatusModalVisible(false);
      setSelectedOrderForStatus(null);
    }
  }, [selectedOrderForStatus, show]);

  useEffect(() => {
    loadOrders(0, true);
  }, [sortBy, sortOrder, loadOrders]);

  useFocusEffect(
    useCallback(() => {
      handleRefresh();
    }, [handleRefresh])
  );

  const renderItem = ({ item }: { item: OrderDTO }) => {
    const isExpanded = expandedOrderId === item.orderId;
    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={() => setExpandedOrderId(isExpanded ? null : item.orderId)}
      >
        <View style={styles.rowHeader}>
          <View style={styles.rowContent}>
            <Text style={styles.orderId}>Order #{item.orderId}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <Text style={styles.date}>{new Date(item.orderDate).toLocaleDateString()}</Text>
            <Text style={styles.total}>Total: ${item.totalAmount.toFixed(2)}</Text>
            <View style={[styles.statusBadge, getStatusBadgeStyle(item.orderStatus)]}>
              <Text style={[styles.statusText, getStatusTextStyle(item.orderStatus)]}>
                {item.orderStatus}
              </Text>
            </View>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={24}
            color={colors.onSurfaceVariant}
          />
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.orderItems}>
              <Text style={styles.sectionTitle}>Items:</Text>
              {item.orderItems.map((orderItem) => (
                <View key={orderItem.orderItemId} style={styles.orderItemRow}>
                  <Text style={styles.orderItemName}>{orderItem.product.productName}</Text>
                  <View style={styles.orderItemDetails}>
                    <Text style={styles.orderItemQty}>Qty: {orderItem.quantity}</Text>
                    <Text style={styles.orderItemPrice}>${orderItem.orderedProductPrice.toFixed(2)}</Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.paymentSection}>
              <Text style={styles.sectionTitle}>Payment:</Text>
              <Text style={styles.paymentMethod}>{item.payment.paymentMethod}</Text>
            </View>
            <View style={styles.addressSection}>
              <Text style={styles.sectionTitle}>Address ID:</Text>
              <Text style={styles.addressId}>{item.addressId}</Text>
            </View>
            <Button
              icon="create-outline"
              variant="outline"
              size="icon"
              loading={updatingStatusId === item.orderId}
              disabled={updatingStatusId === item.orderId}
              onPress={() => {
                setSelectedOrderForStatus(item);
                setStatusModalVisible(true);
              }}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const ListHeader = (
    <View style={styles.listHeader}>
      <Text style={styles.title}>Orders</Text>
      <View style={styles.filterBar}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Sort By:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={sortBy}
              onValueChange={(itemValue) => {
                setSortBy(itemValue as SortBy);
                handleFilterChange();
              }}
              style={styles.picker}
              dropdownIconColor={colors.onSurfaceVariant}
            >
              <Picker.Item label="ID" value="orderId" />
              <Picker.Item label="Date" value="orderDate" />
              <Picker.Item label="Amount" value="totalAmount" />
            </Picker>
          </View>
        </View>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Order:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={sortOrder}
              onValueChange={(itemValue) => {
                setSortOrder(itemValue as SortOrder);
                handleFilterChange();
              }}
              style={styles.picker}
              dropdownIconColor={colors.onSurfaceVariant}
            >
              <Picker.Item label="Asc" value="asc" />
              <Picker.Item label="Desc" value="desc" />
            </Picker>
          </View>
        </View>
      </View>
      {error && <Alert variant="error" message={error} onRetry={handleRefresh} />}
    </View>
  );

  const ListEmptyComponent = !loading && orders.length === 0 ? (
    <View style={styles.emptyBox}>
      <Ionicons name="receipt-outline" size={56} color={colors.outlineVariant} />
      <Text style={styles.emptyText}>No orders found</Text>
    </View>
  ) : null;

  return (
    <View style={styles.container}>
      {loading && orders.length === 0 ? (
        <AdminListSkeleton />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.orderId)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={
            loading && orders.length > 0 ? (
              <ActivityIndicator color={colors.secondary} style={styles.footerLoader} />
            ) : null
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.secondary} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={statusModalVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setStatusModalVisible(false)}>
          <View style={styles.statusSheet}>
            <Text style={styles.statusSheetTitle}>Update Status</Text>
            {ORDER_STATUSES.map((status) => (
              <TouchableOpacity
                key={status}
                style={styles.statusOption}
                onPress={() => handleUpdateStatus(status)}
              >
                <Text style={styles.statusOptionText}>{status}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function getStatusBadgeStyle(status: string) {
  switch (status) {
    case "Order Accepted":
      return { backgroundColor: colors.primaryContainer };
    case "Processing":
      return { backgroundColor: colors.secondaryContainer };
    case "Shipped":
      return { backgroundColor: colors.surfaceContainer };
    case "Delivered":
      return { backgroundColor: colors.surfaceContainerHigh };
    case "Cancelled":
      return { backgroundColor: colors.errorContainer };
    default:
      return { backgroundColor: colors.surfaceContainer };
  }
}

function getStatusTextStyle(status: string) {
  switch (status) {
    case "Order Accepted":
      return { color: colors.onPrimaryContainer };
    case "Processing":
      return { color: colors.onSecondaryContainer };
    case "Shipped":
      return { color: colors.onSurface };
    case "Delivered":
      return { color: colors.onSurface };
    case "Cancelled":
      return { color: colors.error };
    default:
      return { color: colors.onSurface };
  }
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
  filterBar: { gap: spacing.sm },
  filterRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  filterLabel: { ...typography.labelSm, color: colors.onSurfaceVariant, minWidth: 70 },
  pickerContainer: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    flex: 1,
  },
  picker: {
    color: colors.onSurface,
  },
  row: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  rowContent: { gap: spacing.xs, flex: 1, marginRight: spacing.md },
  orderId: { ...typography.bodyLg, color: colors.onSurface, fontWeight: "700" },
  email: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  date: { ...typography.labelSm, color: colors.onSurfaceVariant },
  total: { ...typography.labelBold, color: colors.secondary },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginTop: spacing.xs,
  },
  statusText: { ...typography.labelSm, fontWeight: "700" },
  expandedContent: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    gap: spacing.md,
  },
  sectionTitle: { ...typography.labelBold, color: colors.onSurface },
  orderItems: { gap: spacing.sm },
  orderItemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderItemName: { ...typography.bodyMd, color: colors.onSurface, flex: 1 },
  orderItemDetails: { flexDirection: "row", gap: spacing.md },
  orderItemQty: { ...typography.labelSm, color: colors.onSurfaceVariant },
  orderItemPrice: { ...typography.labelBold, color: colors.secondary },
  paymentSection: { gap: spacing.xs },
  paymentMethod: { ...typography.bodyMd, color: colors.onSurface },
  addressSection: { gap: spacing.xs },
  addressId: { ...typography.bodyMd, color: colors.onSurface },
  emptyBox: { alignItems: "center", paddingTop: spacing.xxl, gap: spacing.md },
  emptyText: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  footerLoader: { paddingVertical: spacing.xl },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  statusSheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xs,
    ...shadows.xl,
  },
  statusSheetTitle: { ...typography.headlineMd, color: colors.onSurface, marginBottom: spacing.sm },
  statusOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
  },
  statusOptionText: { ...typography.bodyMd, color: colors.onSurface },
});
