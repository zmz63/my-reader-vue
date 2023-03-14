import type { RouteRecordRaw } from 'vue-router'
import Recent from '@/pages/start/recent'
import Bookrack from '@/pages/start/bookrack'

export const startMenuRoutes: RouteRecordRaw[] = [
  {
    path: 'recent',
    name: 'START_RECENT',
    component: Recent
  },
  {
    path: 'bookrack',
    name: 'START_BOOKRACK',
    component: Bookrack
  }
]
