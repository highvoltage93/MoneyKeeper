import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";

export function DollarFABTab(_props: BottomTabBarButtonProps) {
    const router = useRouter();

    const onPress = () => {
        if (Platform.OS === "ios") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        router.push("/modal");
    };

    return (
        <View style={styles.wrapper}>
            <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.88} accessibilityLabel="Додати транзакцію">
                <View style={styles.halo} />
                <LinearGradient colors={["#2E75B6", "#16A085"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
                    <MaterialIcons name="add" size={32} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        top: -22,
        alignItems: "center",
        justifyContent: "center",
    },
    fab: {
        width: 62,
        height: 62,
        borderRadius: 31,
        shadowColor: "#14324D",
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.28,
        shadowRadius: 20,
        elevation: 14,
    },
    halo: {
        position: "absolute",
        top: -7,
        left: -7,
        right: -7,
        bottom: -7,
        borderRadius: 38,
        backgroundColor: "rgba(46,117,182,0.12)",
    },
    gradient: {
        flex: 1,
        borderRadius: 31,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 5,
        borderColor: "rgba(255,255,255,0.96)",
    },
});
