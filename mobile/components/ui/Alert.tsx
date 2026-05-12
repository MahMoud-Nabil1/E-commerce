import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radius } from "@/styles/theme";

type AlertVariant = "info" | "success" | "warning" | "error";

type AlertProps = {
  variant?: AlertVariant;
  title?: string;
  message: string;
  onDismiss?: () => void;
};

type VariantConfig = {
  bg: string;
  border: string;
  titleColor: string;
  messageColor: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const variantConfig: Record<AlertVariant, VariantConfig> = {
  info: {
    bg: colors.surfaceContainerLow,
    border: colors.secondary,
    titleColor: colors.primary,
    messageColor: colors.onSurfaceVariant,
    icon: "information-circle",
  },
  success: {
    bg: "#edfaf1",
    border: "#2e7d52",
    titleColor: "#1b5e38",
    messageColor: "#2e7d52",
    icon: "checkmark-circle",
  },
  warning: {
    bg: "#fff8e1",
    border: "#f59e0b",
    titleColor: "#92400e",
    messageColor: "#b45309",
    icon: "warning",
  },
  error: {
    bg: colors.errorContainer,
    border: colors.error,
    titleColor: colors.onErrorContainer,
    messageColor: colors.error,
    icon: "close-circle",
  },
};

export default function Alert({ variant = "info", title, message, onDismiss }: AlertProps) {
  const cfg = variantConfig[variant];

  return (
    <View style={[styles.container, { backgroundColor: cfg.bg, borderLeftColor: cfg.border }]}>
      <Ionicons name={cfg.icon} size={20} color={cfg.border} style={styles.icon} />

      <View style={styles.body}>
        {title && <Text style={[styles.title, { color: cfg.titleColor }]}>{title}</Text>}
        <Text style={[styles.message, { color: cfg.messageColor }]}>{message}</Text>
      </View>

      {onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.dismiss}
        >
          <Ionicons name="close" size={16} color={cfg.border} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderLeftWidth: 4,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  icon: { marginTop: 1 },
  body: { flex: 1, gap: spacing.xs },
  title: { ...typography.labelBold },
  message: { ...typography.labelSm, lineHeight: 18 },
  dismiss: { marginTop: 1 },
});
