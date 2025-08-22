import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
    component: () => import('@/layouts/AdminLayout.vue'),
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        meta: { title: '仪表盘', icon: 'Monitor' },
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: '/system',
        name: 'System',
        meta: { title: '系统管理', icon: 'Setting' },
        redirect: '/system/user',
        children: [
          {
            path: '/system/user',
            name: 'User',
            meta: { title: '用户管理', icon: 'User' },
            component: () => import('@/views/system/User.vue')
          },
          {
            path: '/system/role',
            name: 'Role',
            meta: { title: '角色管理', icon: 'UserFilled' },
            component: () => import('@/views/system/Role.vue')
          },
          {
            path: '/system/menu',
            name: 'Menu',
            meta: { title: '菜单管理', icon: 'Menu' },
            component: () => import('@/views/system/Menu.vue')
          }
        ]
      },
      {
        path: '/content',
        name: 'Content',
        meta: { title: '内容管理', icon: 'Document' },
        redirect: '/content/article',
        children: [
          {
            path: '/content/article',
            name: 'Article',
            meta: { title: '文章管理', icon: 'Document' },
            component: () => import('@/views/content/Article.vue')
          },
          {
            path: '/content/category',
            name: 'Category',
            meta: { title: '分类管理', icon: 'Folder' },
            component: () => import('@/views/content/Category.vue')
          }
        ]
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router