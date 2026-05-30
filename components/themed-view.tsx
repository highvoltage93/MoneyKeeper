import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  glass?: boolean;
};

export function ThemedView({ style, lightColor, darkColor, glass, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  // preserve existing behavior; `glass` flag can be used by screens to wrap content
  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
