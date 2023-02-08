import type { RouteRecordRaw } from 'vue-router'

type MetaData = {
  label: string
  icon: string
}

export default [
  {
    path: 'books',
    name: 'BOOKS',
    component: () => import('@/pages/books'),
    meta: {
      label: '啦啦啦1',
      icon: 'ic_fluent_library_24_filled'
    }
  },
  {
    path: 'favorite',
    name: 'FAVORITE',
    component: () => import('@/pages/empty'),
    meta: {
      label: '啦啦啦2',
      icon: 'ic_fluent_star_line_horizontal_3_24_filled'
    }
  }
] as (RouteRecordRaw & { meta: MetaData })[]
