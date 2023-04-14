import type { RouteRecordRaw } from 'vue-router'
import Recent from '@/pages/start/recent'
import Bookrack from '@/pages/start/bookrack'
import Setting from '@/pages/start/setting'
import Search from '@/pages/start/search'

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
  },
  {
    path: 'setting',
    name: 'START_SETTING',
    component: Setting
  },
  {
    path: 'search',
    name: 'START_SEARCH',
    component: Search
  }
]
