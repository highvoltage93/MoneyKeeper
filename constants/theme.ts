/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
    light: {
        text: "#11181C",
        background: "#fff",
        tint: tintColorLight,
        icon: "#687076",
        tabIconDefault: "#687076",
        tabIconSelected: tintColorLight,
        glassBackground: "rgba(255,255,255,0.6)",
        glassBorder: "rgba(255,255,255,0.4)",
    },
    dark: {
        text: "#ECEDEE",
        background: "#151718",
        tint: tintColorDark,
        icon: "#9BA1A6",
        tabIconDefault: "#9BA1A6",
        tabIconSelected: tintColorDark,
        glassBackground: "rgba(20,20,20,0.36)",
        glassBorder: "rgba(255,255,255,0.06)",
    },
};

export const FontFamily = {
    regular: "Montserrat_400Regular",
    medium: "Montserrat_500Medium",
    semiBold: "Montserrat_600SemiBold",
    bold: "Montserrat_700Bold",
    extraBold: "Montserrat_800ExtraBold",
    black: "Montserrat_900Black",
} as const;

export const Fonts = {
    sans: FontFamily.regular,
    serif: FontFamily.regular,
    rounded: FontFamily.bold,
    mono: FontFamily.medium,
} as const;
