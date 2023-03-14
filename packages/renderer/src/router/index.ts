import { createRouter, createWebHashHistory } from 'vue-router'
import { startMenuRoutes } from './start-menu'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'START',
      component: () => import('@/pages/start'),
      redirect: '/recent',
      children: startMenuRoutes
    },
    {
      path: '/reader',
      name: 'READER',
      component: () => import('@/pages/reader')
    },
    {
      path: '/empty',
      name: 'EMPTY',
      component: () => import('@/pages/empty')
    }
  ]
})

router.beforeEach(to => {
  // TODO
  console.log(to)
})

export default router
