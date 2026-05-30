import { useThemeColor } from "@/hooks/use-theme-color";
import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";

type GlassViewProps = ViewProps & {
  intensity?: number;
  tint?: "light" | "dark" | "default";
};

export function GlassView({ style, children, intensity = 80, tint = "default", ...rest }: GlassViewProps) {
  const glassBg = useThemeColor({ light: undefined, dark: undefined }, "glassBackground");

  return (
    <View style={[styles.wrapper, { backgroundColor: glassBg }, style]} {...rest}>
      <BlurView intensity={intensity} tint={tint} style={styles.blur} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 12,
    overflow: "hidden",
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: "relative",
  },
});

export default GlassView;
