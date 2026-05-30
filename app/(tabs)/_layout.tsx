import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

import { DollarFABTab } from "@/components/dollar-fab-tab";
import { HapticTab } from "@/components/haptic-tab";
import { FontFamily } from "@/constants/theme";
import { APP_PRIMARY } from "@/shared/config";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

function ModernTabIcon({
    name,
    color,
    focused,
}: {
    name: keyof typeof MaterialIcons.glyphMap;
    color: string;
    focused: boolean;
}) {
    return (
        <View style={[styles.iconShell, focused && styles.iconShellActive]}>
            <MaterialIcons name={name} size={focused ? 24 : 23} color={color} />
        </View>
    );
}

function TabBarBackground() {
    return (
        <View style={styles.tabBackground}>
            <BlurView intensity={86} tint="light" style={StyleSheet.absoluteFill} />
            <LinearGradient
                colors={["rgba(255,255,255,0.92)", "rgba(239,247,255,0.84)", "rgba(246,242,255,0.82)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
        </View>
    );
}

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarHideOnKeyboard: true,
                tabBarBackground: TabBarBackground,
                tabBarActiveTintColor: APP_PRIMARY,
                tabBarInactiveTintColor: "#8B96A8",
                tabBarLabelStyle: {
                    fontFamily: FontFamily.bold,
                    fontSize: 9.5,
                    marginTop: 0,
                    letterSpacing: 0,
                },
                tabBarStyle: {
                    position: "absolute",
                    left: 16,
                    right: 16,
                    bottom: 10,
                    height: 66,
                    paddingTop: 5,
                    paddingBottom: 6,
                    borderTopWidth: 0,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.72)",
                    borderRadius: 26,
                    backgroundColor: "rgba(255,255,255,0.72)",
                    shadowColor: "#1A1A2E",
                    shadowOffset: { width: 0, height: 18 },
                    shadowOpacity: 0.16,
                    shadowRadius: 28,
                    elevation: 22,
                    overflow: "visible",
                },
                tabBarItemStyle: {
                    borderRadius: 24,
                    paddingVertical: 2,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Головна",
                    tabBarIcon: ({ color, focused }) => <ModernTabIcon name="home" color={color} focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="statistic"
                options={{
                    title: "Аналітика",
                    tabBarIcon: ({ color, focused }) => <ModernTabIcon name="insert-chart" color={color} focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="add"
                options={{
                    title: "",
                    tabBarLabel: "",
                    tabBarButton: (props) => <DollarFABTab {...props} />,
                }}
            />
            <Tabs.Screen
                name="accounts"
                options={{
                    title: "Рахунки",
                    tabBarIcon: ({ color, focused }) => <ModernTabIcon name="account-balance-wallet" color={color} focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="more"
                options={{
                    title: "Більше",
                    tabBarIcon: ({ color, focused }) => <ModernTabIcon name="tune" color={color} focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="categories"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBackground: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 26,
        overflow: "hidden",
    },
    iconShell: {
        width: 38,
        height: 28,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    iconShellActive: {
        backgroundColor: "rgba(46,117,182,0.12)",
        borderWidth: 1,
        borderColor: "rgba(46,117,182,0.14)",
    },
});
