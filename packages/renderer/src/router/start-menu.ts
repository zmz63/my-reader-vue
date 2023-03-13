import type { RouteRecordRaw } from 'vue-router'

export const startMenuRoutes: RouteRecordRaw[] = [
  {
    path: 'recent',
    name: 'START_RECENT',
    component: () => import('@/pages/start/recent')
  }
]
