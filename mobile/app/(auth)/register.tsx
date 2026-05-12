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

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { show } = useToast();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(field: keyof typeof form) {
    return (value: string) => setForm((f) => ({ ...f, [field]: value }));
  }

  // ─── Validation ─────────────────────────────────────────────────────────────

  function validate() {
    const e: Partial<typeof form> = {};

    if (!form.username.trim()) {
      e.username = "Username is required";
    } else if (form.username.trim().length < 3) {
      e.username = "Username must be at least 3 characters";
    }

    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Enter a valid email address";
    }

    if (!form.password) {
      e.password = "Password is required";
    } else if (form.password.length < 6) {
      e.password = "Password must be at least 6 characters";
    }

    if (!form.confirmPassword) {
      e.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = "Passwords do not match";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ─── Submit ─────────────────────────────────────────────────────────────────

  async function handleRegister() {
    setApiError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await register(form.username.trim(), form.email.trim(), form.password);
      show({ message: "Account created! Please sign in.", variant: "success" });
      router.replace("/(auth)/login");
    } catch (err) {
      const e = err as ApiError;
      setApiError(e.message ?? "Registration failed. Please try again.");
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
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join us — it only takes a minute</Text>
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
            placeholder="Choose a username"
            autoCapitalize="none"
            autoCorrect={false}
            value={form.username}
            onChangeText={set("username")}
            error={errors.username}
            returnKeyType="next"
          />

          <Input
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={form.email}
            onChangeText={set("email")}
            error={errors.email}
            returnKeyType="next"
          />

          <Input
            label="Password"
            placeholder="At least 6 characters"
            secureTextEntry
            value={form.password}
            onChangeText={set("password")}
            error={errors.password}
            returnKeyType="next"
          />

          <Input
            label="Confirm Password"
            placeholder="Repeat your password"
            secureTextEntry
            value={form.confirmPassword}
            onChangeText={set("confirmPassword")}
            error={errors.confirmPassword}
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />

          <Button
            label="Create Account"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            onPress={handleRegister}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Text
            style={styles.footerLink}
            onPress={() => router.replace("/(auth)/login")}
          >
            Sign in
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
