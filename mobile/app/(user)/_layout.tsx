import { View, Text, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "@/contexts/CartContext";
import { colors, typography, radius } from "@/styles/theme";

function CartTabIcon({ color, focused }: { color: string; focused: boolean }) {
  const { itemCount } = useCart();
  return (
    <View>
      <Ionicons
        name={focused ? "cart" : "cart-outline"}
        size={24}
        color={color}
      />
      {itemCount > 0 && (
        <View style={badge.container}>
          <Text style={badge.text}>{itemCount > 9 ? "9+" : itemCount}</Text>
        </View>
      )}
    </View>
  );
}

const badge = StyleSheet.create({
  container: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: radius.full,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  text: {
    color: colors.onError,
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 14,
  },
});

export default function UserLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.outline,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainerLowest,
          borderTopColor: colors.outlineVariant,
        },
        tabBarLabelStyle: { ...typography.labelSm },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: (props) => <CartTabIcon {...props} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
          ),
        }}
      />

      {/* Screens without a tab bar entry */}
      <Tabs.Screen name="products"      options={{ href: null }} />
      <Tabs.Screen name="categories"    options={{ href: null }} />
      <Tabs.Screen name="category/[id]" options={{ href: null }} />
      <Tabs.Screen name="product/[id]"  options={{ href: null }} />
    </Tabs>
  );
}
