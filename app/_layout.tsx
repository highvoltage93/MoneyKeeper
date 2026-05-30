import { CategoriesProvider } from "@/context/categories-context";
import { ExpensesProvider } from "@/context/expenses-context";
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  Montserrat_900Black,
  useFonts,
} from "@expo-google-fonts/montserrat";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { FontFamily } from "@/constants/theme";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_900Black,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [error, loaded]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <CategoriesProvider>
        <ExpensesProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: "modal", title: "Транзакція", headerTitleStyle: { fontFamily: FontFamily.bold } }} />
          </Stack>
          <StatusBar style="auto" />
        </ExpensesProvider>
      </CategoriesProvider>
    </ThemeProvider>
  );
}
