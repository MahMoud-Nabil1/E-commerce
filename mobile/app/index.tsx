import { View, ActivityIndicator, StyleSheet } from "react-native";
import { colors } from "@/styles/theme";

// This screen is shown for a brief moment while the NavigationGuard
// in _layout.tsx determines where to redirect the user.
export default function Index() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.secondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});
