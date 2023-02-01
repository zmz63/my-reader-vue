import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: 'book',
    name: 'BOOK',
    component: () => import('@/pages/book'),
    meta: {
      label: '全部书本'
    }
  },
  {
    path: 'favorite',
    name: 'FAVORITE',
    component: () => import('@/pages/book'),
    meta: {
      label: '我的收藏'
    }
  },
  {
    path: 'recent',
    name: 'RECENT',
    component: () => import('@/pages/book'),
    meta: {
      label: '最近阅读'
    }
  },
  {
    path: 'note',
    name: 'NOTE',
    component: () => import('@/pages/book'),
    meta: {
      label: '我的笔记'
    }
  }
] as (RouteRecordRaw & {
  meta: {
    label: string
  }
})[]
