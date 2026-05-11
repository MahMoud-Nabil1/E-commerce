import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { colors, typography, spacing, radius } from "@/styles/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  /** Renders a tappable element on the right side (e.g. show/hide password icon) */
  rightElement?: React.ReactNode;
  containerStyle?: ViewStyle;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Input({
  label,
  error,
  hint,
  rightElement,
  containerStyle,
  secureTextEntry,
  style,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry ?? false);

  const hasError = !!error;

  const borderColor = hasError
    ? colors.error
    : focused
    ? colors.secondary
    : colors.outlineVariant;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.inputRow, { borderColor }]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.outline}
          selectionColor={colors.secondary}
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {/* Auto show/hide toggle for password fields */}
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setHidden((h) => !h)}
            style={styles.rightSlot}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.toggleText}>{hidden ? "Show" : "Hide"}</Text>
          </TouchableOpacity>
        )}

        {/* Custom right element (non-password fields) */}
        {!secureTextEntry && rightElement && (
          <View style={styles.rightSlot}>{rightElement}</View>
        )}
      </View>

      {hasError && <Text style={styles.error}>{error}</Text>}
      {!hasError && hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    ...typography.labelBold,
    color: colors.onSurface,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
    paddingVertical: spacing.sm + 2,
  },
  rightSlot: {
    paddingLeft: spacing.sm,
  },
  toggleText: {
    ...typography.labelBold,
    color: colors.secondary,
  },
  error: {
    ...typography.labelSm,
    color: colors.error,
  },
  hint: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
});
