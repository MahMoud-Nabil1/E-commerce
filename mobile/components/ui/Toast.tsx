import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import {
  Animated,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { colors, typography, spacing, radius, duration, layout } from "@/styles/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastVariant = "info" | "success" | "warning" | "error";

type ToastOptions = {
  message: string;
  variant?: ToastVariant;
  /** Duration in ms before auto-dismiss. Default: 3000 */
  duration?: number;
};

type ToastContextValue = {
  show: (options: ToastOptions) => void;
};

// ─── Variant config ───────────────────────────────────────────────────────────

const variantConfig: Record<
  ToastVariant,
  { bg: string; color: string; icon: string }
> = {
  info: {
    bg: colors.primaryContainer,
    color: colors.inverseOnSurface,
    icon: "ℹ",
  },
  success: {
    bg: "#1b5e38",
    color: "#ffffff",
    icon: "✓",
  },
  warning: {
    bg: "#92400e",
    color: "#ffffff",
    icon: "⚠",
  },
  error: {
    bg: colors.error,
    color: colors.onError,
    icon: "✕",
  },
};

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(ToastOptions & { variant: ToastVariant }) | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: duration.fast,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 20,
        duration: duration.fast,
        useNativeDriver: true,
      }),
    ]).start(() => setToast(null));
  }, [opacity, translateY]);

  const show = useCallback(
    (options: ToastOptions) => {
      // Cancel any existing toast
      if (hideTimer.current) clearTimeout(hideTimer.current);

      setToast({ variant: "info", ...options });

      // Reset animation values before starting
      opacity.setValue(0);
      translateY.setValue(20);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration.base,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: duration.base,
          useNativeDriver: true,
        }),
      ]).start();

      hideTimer.current = setTimeout(hide, options.duration ?? 3000);
    },
    [opacity, translateY, hide]
  );

  const cfg = toast ? variantConfig[toast.variant] : variantConfig.info;

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      {toast && (
        <Animated.View
          style={[
            styles.toast,
            { backgroundColor: cfg.bg, opacity, transform: [{ translateY }] },
          ]}
          pointerEvents="none"
        >
          <Text style={[styles.icon, { color: cfg.color }]}>{cfg.icon}</Text>
          <Text style={[styles.message, { color: cfg.color }]} numberOfLines={2}>
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 48 : 32,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
    // Shadow
    shadowColor: "#1a2b4c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
    // Keep above everything
    zIndex: 9999,
  },
  icon: {
    ...typography.labelBold,
    fontSize: 15,
  },
  message: {
    ...typography.labelBold,
    flex: 1,
  },
});
