import { GlassView } from "@/components/glass-view";
import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";

type GlassCardProps = ViewProps & {
  padding?: number;
};

export function GlassCard({ children, style, padding = 12, ...rest }: GlassCardProps) {
  return (
    <GlassView style={[styles.card, { padding }, style]} {...rest}>
      <View>{children}</View>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
});

export default GlassCard;
