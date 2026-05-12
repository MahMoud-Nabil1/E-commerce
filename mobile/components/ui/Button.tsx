import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type TouchableOpacityProps,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radius } from "@/styles/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

type ButtonProps = TouchableOpacityProps & {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
};

// ─── Variant maps ─────────────────────────────────────────────────────────────

const containerVariant: Record<Variant, ViewStyle> = {
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: colors.transparent,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: colors.transparent,
  },
  danger: {
    backgroundColor: colors.error,
  },
  destructive: {
    backgroundColor: colors.transparent,
    borderWidth: 1.5,
    borderColor: colors.error,
  },
};

const labelVariant: Record<Variant, TextStyle> = {
  primary: { color: colors.onPrimary },
  secondary: { color: colors.onSecondary },
  outline: { color: colors.primary },
  ghost: { color: colors.primary },
  danger: { color: colors.onError },
  destructive: { color: colors.error },
};

const containerSize: Record<Size, ViewStyle> = {
  sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  md: { paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg },
  lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
  icon: { width: 36, height: 36, padding: 0 },
};

const labelSize: Record<Size, TextStyle> = {
  sm: { ...typography.labelBold, fontSize: 13 },
  md: { ...typography.labelBold },
  lg: { ...typography.bodyMd, fontWeight: "700" },
  icon: { fontSize: 0 },
};

const iconSize: Record<Size, number> = {
  sm: 16,
  md: 20,
  lg: 24,
  icon: 20,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Button({
  label,
  icon,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const iconColor =
    variant === "outline" || variant === "ghost"
      ? colors.primary
      : variant === "destructive"
      ? colors.error
      : variant === "danger"
      ? colors.onError
      : colors.onPrimary;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={isDisabled}
      style={[
        styles.base,
        containerVariant[variant],
        containerSize[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style as ViewStyle,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={iconColor}
        />
      ) : icon ? (
        <Ionicons name={icon} size={iconSize[size]} color={iconColor} />
      ) : label ? (
        <Text
          style={[styles.label, labelVariant[variant], labelSize[size]]}
          numberOfLines={1}
        >
          {label}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    minWidth: 36,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    textAlign: "center",
  },
});
