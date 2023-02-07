import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: 'book',
    name: 'BOOK',
    component: () => import('@/pages/book'),
    meta: {
      label: '啦啦啦1',
      icon: 'ic_fluent_library_24_filled'
    }
  },
  {
    path: 'favorite',
    name: 'FAVORITE',
    component: () => import('@/pages/book'),
    meta: {
      label: '啦啦啦2',
      icon: 'ic_fluent_star_line_horizontal_3_24_filled'
    }
  }
] as (RouteRecordRaw & {
  meta: {
    label: string
  }
})[]
