import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { Animated, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radius, duration } from "@/styles/theme";

type ToastVariant = "info" | "success" | "warning" | "error";

type ToastOptions = {
  message: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastContextValue = {
  show: (options: ToastOptions) => void;
};

type VariantConfig = {
  bg: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const variantConfig: Record<ToastVariant, VariantConfig> = {
  info: {
    bg: colors.primaryContainer,
    color: colors.inverseOnSurface,
    icon: "information-circle",
  },
  success: {
    bg: "#1b5e38",
    color: "#ffffff",
    icon: "checkmark-circle",
  },
  warning: {
    bg: "#92400e",
    color: "#ffffff",
    icon: "warning",
  },
  error: {
    bg: colors.error,
    color: colors.onError,
    icon: "close-circle",
  },
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(ToastOptions & { variant: ToastVariant }) | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: duration.fast, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 20, duration: duration.fast, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [opacity, translateY]);

  const show = useCallback((options: ToastOptions) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setToast({ variant: "info", ...options });
    opacity.setValue(0);
    translateY.setValue(20);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: duration.base, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: duration.base, useNativeDriver: true }),
    ]).start();
    hideTimer.current = setTimeout(hide, options.duration ?? 3000);
  }, [opacity, translateY, hide]);

  const cfg = toast ? variantConfig[toast.variant] : variantConfig.info;

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <Animated.View
          style={[styles.toast, { backgroundColor: cfg.bg, opacity, transform: [{ translateY }] }]}
          pointerEvents="none"
        >
          <Ionicons name={cfg.icon} size={18} color={cfg.color} />
          <Text style={[styles.message, { color: cfg.color }]} numberOfLines={2}>
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

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
    shadowColor: "#1a2b4c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 9999,
  },
  message: { ...typography.labelBold, flex: 1 },
});
