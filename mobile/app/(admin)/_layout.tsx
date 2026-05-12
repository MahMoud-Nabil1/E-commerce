import { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography } from "@/styles/theme";
import { useAuth } from "@/contexts/AuthContext";

const TABS = [
  { name: "index", title: "Dashboard", icon: "grid" },
  { name: "sellers", title: "Sellers", icon: "people" },
  { name: "categories", title: "Categories", icon: "pricetags" },
  { name: "products", title: "Products", icon: "cube" },
  { name: "orders", title: "Orders", icon: "receipt" },
] as const;

export default function AdminLayout() {
  const { isLoading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace("/(auth)/login");
    }
  }, [isLoading, isAdmin, router]);

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
        tabBarLabelStyle: {
          ...typography.labelSm,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? tab.icon : `${tab.icon}-outline`}
                size={24}
                color={color}
              />
            ),
          }}
        />
      ))}
      <Tabs.Screen name="carts" options={{ href: null }} />
      <Tabs.Screen name="addresses" options={{ href: null }} />
      <Tabs.Screen name="category-form" options={{ href: null }} />
      <Tabs.Screen name="product-form" options={{ href: null }} />
      <Tabs.Screen name="address-form" options={{ href: null }} />
    </Tabs>
  );
}
