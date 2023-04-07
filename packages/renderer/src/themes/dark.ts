import { type ThemeCommonVars, commonDark } from 'naive-ui'
import { type CustomThemeCommonVars, common } from './common'

export const dark: Partial<ThemeCommonVars & CustomThemeCommonVars> = {
  ...commonDark,
  ...common
}
