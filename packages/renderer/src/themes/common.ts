import type { ThemeCommonVars } from 'naive-ui'

export interface CustomThemeCommonVars {
  appColor: string
  topBarColor: string
}

export const common: Partial<ThemeCommonVars & CustomThemeCommonVars> = {
  fontFamily:
    'v-sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  fontFamilyMono: 'v-mono, SFMono-Regular, Menlo, Consolas, Courier, monospace',
  fontWeight: '400',
  fontWeightStrong: '600',
  cubicBezierEaseInOut: 'cubic-bezier(.4, 0, .2, 1)',
  cubicBezierEaseOut: 'cubic-bezier(0, 0, .2, 1)',
  cubicBezierEaseIn: 'cubic-bezier(.4, 0, 1, 1)',
  borderRadius: '3px',
  borderRadiusSmall: '2px',
  fontSize: '14px',
  fontSizeMini: '12px',
  fontSizeTiny: '12px',
  fontSizeSmall: '13px',
  fontSizeMedium: '15px',
  fontSizeLarge: '16px',
  fontSizeHuge: '18px',
  lineHeight: '1.6',
  heightMini: '16px',
  heightTiny: '22px',
  heightSmall: '28px',
  heightMedium: '34px',
  heightLarge: '40px',
  heightHuge: '46px'
}
