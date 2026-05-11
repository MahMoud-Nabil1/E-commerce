import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type TouchableOpacityProps,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { colors, typography, spacing, radius, duration } from "@/styles/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type ButtonProps = TouchableOpacityProps & {
  label: string;
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
};

const containerVariantPressed: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.primaryContainer },
  secondary: { backgroundColor: colors.secondaryContainer },
  outline: { backgroundColor: colors.surfaceContainerLow },
  ghost: { backgroundColor: colors.surfaceContainerLow },
  danger: { backgroundColor: colors.errorContainer },
};

const labelVariant: Record<Variant, TextStyle> = {
  primary: { color: colors.onPrimary },
  secondary: { color: colors.onSecondary },
  outline: { color: colors.primary },
  ghost: { color: colors.primary },
  danger: { color: colors.onError },
};

const containerSize: Record<Size, ViewStyle> = {
  sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  md: { paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg },
  lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
};

const labelSize: Record<Size, TextStyle> = {
  sm: { ...typography.labelBold, fontSize: 13 },
  md: { ...typography.labelBold },
  lg: { ...typography.bodyMd, fontWeight: "700" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Button({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

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
          color={
            variant === "outline" || variant === "ghost"
              ? colors.primary
              : colors.onPrimary
          }
        />
      ) : (
        <Text
          style={[styles.label, labelVariant[variant], labelSize[size]]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
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
    minWidth: 64,
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
