import { type ThemeCommonVars, commonLight } from 'naive-ui'
import { type CustomThemeCommonVars, common } from './common'

export const light: Partial<ThemeCommonVars & CustomThemeCommonVars> = {
  ...commonLight,
  ...common
}
