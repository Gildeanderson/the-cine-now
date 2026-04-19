/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    background: '#ffffff', // obsidian claro
    text: '#05070a', // on-surface
    tint: '#5d34f0', // electric-indigo claro
    icon: '#3d4155', // on-surface-variant claro
    tabIconDefault: '#3d4155',
    tabIconSelected: '#5d34f0',
    surface: '#f3f5ff',
    outline: '#cbd2f8',
  },
  dark: {
    background: '#05070a', // obsidian
    text: '#f0f2ff', // on-surface
    tint: '#a3a6ff', // electric-indigo
    icon: '#9499b0', // on-surface-variant
    tabIconDefault: '#9499b0',
    tabIconSelected: '#a3a6ff',
    surface: '#0a0c14',
    outline: '#3a3f55',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
