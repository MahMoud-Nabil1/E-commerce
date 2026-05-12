import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Button, Input, Alert } from "@/components/ui";
import { colors, typography, spacing } from "@/styles/theme";
import type { ApiError } from "@/services/api";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { show } = useToast();
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ─── Validation ─────────────────────────────────────────────────────────────

  function validate() {
    const e: typeof errors = {};
    if (!username.trim()) e.username = "Username is required";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ─── Submit ─────────────────────────────────────────────────────────────────

  async function handleLogin() {
    setApiError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await login(username.trim(), password);
      // NavigationGuard in _layout.tsx handles the redirect automatically
      show({ message: "Welcome back!", variant: "success" });
    } catch (err) {
      const e = err as ApiError;
      const msg =
        e.status === 401
          ? "Invalid username or password"
          : e.message ?? "Something went wrong. Please try again.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {apiError && (
            <Alert
              variant="error"
              message={apiError}
              onDismiss={() => setApiError(null)}
            />
          )}

          <Input
            label="Username"
            placeholder="Enter your username"
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
            error={errors.username}
            returnKeyType="next"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <Button
            label="Sign In"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            onPress={handleLogin}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Text
            style={styles.footerLink}
            onPress={() => router.push("/(auth)/register")}
          >
            Sign up
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  header: {
    marginBottom: spacing.xxl,
    gap: spacing.xs,
  },
  title: {
    ...typography.headlineLg,
    color: colors.onSurface,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  form: {
    gap: spacing.lg,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xxl,
  },
  footerText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  footerLink: {
    ...typography.bodyMd,
    color: colors.secondary,
    fontWeight: "700",
  },
});
