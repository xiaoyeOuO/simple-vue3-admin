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
      },
      {
        path: '/project',
        name: 'Project',
        meta: { title: '项目管理', icon: 'Briefcase' },
        redirect: '/project/contract-list',
        children: [
          {
          path: '/project/contract-list',
          name: 'ContractProjectList',
          component: () => import('@/views/project/contract-list/index.vue'),
          meta: { title: '合同项目列表', icon: 'list' }
        },
        {
          path: '/project/contract-list/detail/:id',
          name: 'ContractProjectDetail',
          component: () => import('@/views/project/contract-list/detail.vue'),
          meta: { title: '合同项目详情', icon: 'detail', hidden: true }
        },
          {
            path: '/project/contract-type',
            name: 'ContractProjectType',
            component: () => import('@/views/project/contract-type/index.vue'),
            meta: { title: '合同项目类型', icon: 'Collection' }
          },
          {
            path: '/project/business-project',
            name: 'BusinessProject',
            component: () => import('@/views/project/business-project/index.vue'),
            meta: { title: '经营项目列表', icon: 'Collection' }
          }
        ]
      },
      {
        path: '/report',
        name: 'Report',
        meta: { title: '数据洞察中心', icon: 'DataAnalysis' },
        redirect: '/report/config',
        children: [
          {
            path: '/report/config',
            name: 'ReportConfig',
            component: () => import('@/views/report/config/index.vue'),
            meta: { title: '日报月报配置', icon: 'Setting' }
          }
        ]
      },
      {
        path: '/supplier',
        name: 'Supplier',
        meta: { title: '客商管理', icon: 'User' },
        redirect: '/supplier/infos',
        children: [
          {
            path: '/supplier/infos',
            name: 'SupplierInfos',
            component: () => import('@/views/supplier/infos/index.vue'),
            meta: { title: '客商信息', icon: 'User' }
          },
          {
            path: '/supplier/contacts',
            name: 'SupplierContacts',
            component: () => import('@/views/supplier/contacts/index.vue'),
            meta: { title: '客商联系人', icon: 'Phone' }
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