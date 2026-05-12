/**
 * Skeleton primitive with a shared pulse animation.
 * All instances on screen pulse in sync.
 *
 * Use "100%" for widths that should fill their parent — the parent
 * must have a defined width (flex or fixed) for this to work.
 */
import { useEffect } from "react";
import { Animated, type ViewStyle } from "react-native";
import { colors, radius as themeRadius, duration } from "@/styles/theme";

type SkeletonProps = {
  width: number | `${number}%`;
  height: number;
  /** Key from theme radius or a raw number */
  radius?: keyof typeof themeRadius | number;
  style?: ViewStyle;
};

// ─── Shared animation ─────────────────────────────────────────────────────────
// One Animated.Value drives all skeletons so they pulse together.
const pulse = new Animated.Value(1);
let running = false;

function ensureRunning() {
  if (running) return;
  running = true;
  Animated.loop(
    Animated.sequence([
      Animated.timing(pulse, {
        toValue: 0.35,
        duration: duration.slow,
        useNativeDriver: true,
      }),
      Animated.timing(pulse, {
        toValue: 1,
        duration: duration.slow,
        useNativeDriver: true,
      }),
    ])
  ).start();
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Skeleton({ width, height, radius = "md", style }: SkeletonProps) {
  useEffect(() => { ensureRunning(); }, []);

  const borderRadius =
    typeof radius === "number" ? radius : themeRadius[radius as keyof typeof themeRadius];

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.surfaceContainerHigh,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
}
