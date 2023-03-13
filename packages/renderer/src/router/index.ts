import { createRouter, createWebHashHistory } from 'vue-router'
import { startMenuRoutes } from './start-menu'
import Layout from '@/layout'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'layout',
      component: Layout,
      redirect: '/start',
      children: [
        {
          path: 'start',
          name: 'START',
          component: () => import('@/pages/start'),
          redirect: '/start/recent',
          children: startMenuRoutes
        },
        {
          path: 'empty',
          name: 'EMPTY',
          component: () => import('@/pages/empty')
        }
      ]
    }
  ]
})

router.beforeEach(to => {
  // TODO
  console.log(to)
})

export default router
