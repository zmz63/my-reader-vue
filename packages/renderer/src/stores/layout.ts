import { type Raw, markRaw, reactive } from 'vue'
import { defineStore } from 'pinia'
import type { GlobalThemeOverrides, ThemeCommonVars } from 'naive-ui'
import { type CustomThemeCommonVars, dark, light } from '@/themes'

type ThemeMode = 'light' | 'dark'

const initTheme = () => {
  const mode = (localStorage.getItem('APP-THEME') || 'light') as ThemeMode

  if (mode === 'dark') {
    document.documentElement.setAttribute('theme', 'dark')
  } else {
    document.documentElement.removeAttribute('theme')
  }

  return mode
}

export const useLayoutStore = defineStore('layout', () => {
  const themeData = reactive({
    mode: initTheme(),
    themeMap: markRaw({
      light,
      dark
    }) as Raw<Record<ThemeMode, Partial<ThemeCommonVars & CustomThemeCommonVars>>>
  })

  const theme = reactive<GlobalThemeOverrides>({
    common: themeData.themeMap[themeData.mode]
  })

  const changeTheme = (mode: ThemeMode) => {
    if (mode === 'dark') {
      document.documentElement.setAttribute('theme', 'dark')
    } else {
      document.documentElement.removeAttribute('theme')
    }

    themeData.mode = mode
    theme.common = themeData.themeMap[mode]

    localStorage.setItem('APP-THEME', mode)
  }

  return { theme, themeData, changeTheme }
})
