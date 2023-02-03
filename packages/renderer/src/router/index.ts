import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/layout'
import menu from './menu'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'layout',
      component: Layout,
      redirect: '/book',
      children: menu
    }
  ]
})

export default router
