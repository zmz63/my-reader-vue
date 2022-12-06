import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/layout'
import Books from '@/pages/books'
import Empty from '@/pages/empty'

export const tabValues = [
  { path: 'books', component: Books, text: '全部书籍' },
  { path: 'favorite', component: Empty, text: '我的收藏' },
  { path: 'recent', component: Empty, text: '最近阅读' },
  { path: 'notes', component: Empty, text: '我的笔记' }
  // { path: 'private', component: Empty, text: '私密书库' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'layout',
      component: Layout,
      redirect: '/books',
      children: tabValues.map(({ path, component }) => ({
        path,
        name: path,
        component
      }))
    }
  ]
})

export default router
