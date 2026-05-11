import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, typography, spacing, radius } from "@/styles/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

type AlertVariant = "info" | "success" | "warning" | "error";

type AlertProps = {
  variant?: AlertVariant;
  title?: string;
  message: string;
  onDismiss?: () => void;
};

// ─── Variant config ───────────────────────────────────────────────────────────

const variantConfig: Record<
  AlertVariant,
  { bg: string; border: string; titleColor: string; messageColor: string; icon: string }
> = {
  info: {
    bg: colors.surfaceContainerLow,
    border: colors.secondary,
    titleColor: colors.primary,
    messageColor: colors.onSurfaceVariant,
    icon: "ℹ",
  },
  success: {
    bg: "#edfaf1",
    border: "#2e7d52",
    titleColor: "#1b5e38",
    messageColor: "#2e7d52",
    icon: "✓",
  },
  warning: {
    bg: "#fff8e1",
    border: "#f59e0b",
    titleColor: "#92400e",
    messageColor: "#b45309",
    icon: "⚠",
  },
  error: {
    bg: colors.errorContainer,
    border: colors.error,
    titleColor: colors.onErrorContainer,
    messageColor: colors.error,
    icon: "✕",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Alert({
  variant = "info",
  title,
  message,
  onDismiss,
}: AlertProps) {
  const cfg = variantConfig[variant];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: cfg.bg, borderLeftColor: cfg.border },
      ]}
    >
      <Text style={[styles.icon, { color: cfg.border }]}>{cfg.icon}</Text>

      <View style={styles.body}>
        {title && (
          <Text style={[styles.title, { color: cfg.titleColor }]}>{title}</Text>
        )}
        <Text style={[styles.message, { color: cfg.messageColor }]}>
          {message}
        </Text>
      </View>

      {onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.dismiss}
        >
          <Text style={[styles.dismissText, { color: cfg.border }]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderLeftWidth: 4,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  icon: {
    ...typography.bodyMd,
    fontWeight: "700",
    marginTop: 1,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.labelBold,
  },
  message: {
    ...typography.labelSm,
    lineHeight: 18,
  },
  dismiss: {
    marginTop: 1,
  },
  dismissText: {
    ...typography.labelBold,
    fontSize: 13,
  },
});
