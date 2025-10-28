import { createRouter, createWebHashHistory } from 'vue-router'

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
        redirect: '/dashboard/overview',
        children: [
          {
            path: '/dashboard/overview',
            name: 'DashboardOverview',
            meta: { title: '总览', icon: 'Monitor' },
            component: () => import('@/views/Dashboard.vue')
          },
          {
            path: '/dashboard/sjs',
            name: 'SjsDashboard',
            meta: { title: '设计所指标', icon: 'DataAnalysis' },
            component: () => import('@/views/dashboard/sjs.vue')
          }
        ]
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
          },
          {
            path: '/system/const',
            name: 'Const',
            meta: { title: '字典管理', icon: 'Collection' },
            component: () => import('@/views/system/const/index.vue')
          },
          {
            path: '/system/worktime',
            name: 'Worktime',
            meta: { title: '工时管理', icon: 'Clock' },
            component: () => import('@/views/system/workTime/index.vue')
          },
          {
            path: '/system/personnelProfile',
            name: 'PersonnelProfile',
            meta: { title: '人员档案', icon: 'Avatar' },
            component: () => import('@/views/system/personnelProfile/index.vue')
          },
          {
            path: '/system/workTimeWarning',
            name: 'WorkTimeWarning',
            meta: { title: '工时预警', icon: 'Warning' },
            component: () => import('@/views/system/workTimeWarning/index.vue')
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
          meta: { title: '合同项目详情', icon: 'DocumentCopy', hidden: true }
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
        meta: { title: '报表中心', icon: 'DataAnalysis' },
        redirect: '/report/todo',
        children: [
          {
            path: '/report/todo',
            name: 'ReportTodo',
            component: () => import('@/views/report/todo/index.vue'),
            meta: { title: '我的待办', icon: 'List' }
          },
          {
            path: '/report/config',
            name: 'ReportConfig',
            component: () => import('@/views/report/config/index.vue'),
            meta: { title: '报表配置', icon: 'Setting' }
          },
          {
            path: '/report/index',
            name: 'ReportIndex',
            component: () => import('@/views/report/index.vue'),
            meta: { title: '日报管理', icon: 'Document', hidden: true }
          },
          {
            path: '/report/fill/:id',
            name: 'ReportFill',
            component: () => import('@/views/report/fill/index.vue'),
            meta: { title: '填写报表', icon: 'Edit', hidden: true }
          },
          {
            path: '/report/instance/:id',
            name: 'ReportInstance',
            component: () => import('@/views/report/instance/index.vue'),
            meta: { title: '实例管理', icon: 'Monitor', hidden: true }
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
      },
      {
        path: '/coding',
        name: 'Coding',
        meta: { title: '开发管理', icon: 'Monitor' },
        redirect: '/coding/projectConfig',
        children: [
          {
        path: '/coding/projectConfig',
        name: 'ProjectConfig',
        component: () => import('@/views/coding/projectConfig/index.vue'),
        meta: { title: '项目任务配置', icon: 'Setting' }
      },
      {
        path: '/coding/modulePush',
        name: 'ModulePush',
        component: () => import('@/views/coding/modulePush/index.vue'),
        meta: { title: '模块推送', icon: 'Promotion' }
      },
      {
        path: '/coding/projectList',
        name: 'ProjectList',
        component: () => import('@/views/coding/projectList/index.vue'),
        meta: { title: '项目列表管理', icon: 'List' }
      },
      {
        path: '/coding/softProjectBind',
        name: 'SoftProjectBind',
        component: () => import('@/views/coding/softProjectBind/index.vue'),
        meta: { title: '软件项目绑定', icon: 'Connection' }
      }
        ]
      },
      {
        path: '/data',
        name: 'Data',
        meta: { title: '数据分析', icon: 'DataLine' },
        redirect: '/data/bigData',
        children: [
          {
            path: '/data/bigData',
            name: 'BigData',
            meta: { title: '大数据展示', icon: 'DataLine' },
            component: () => import('@/views/bigData/index.vue')
          }
        ]
      },
      {
        path: '/workspace',
        name: 'Workspace',
        meta: { title: '工作中心', icon: 'Monitor' },
        redirect: '/workspace/todo',
        children: [
          {
            path: '/workspace/todo',
            name: 'WorkspaceTodo',
            meta: { title: '我的待办', icon: 'List' },
            component: () => import('@/views/workplace/index.vue')
          },
          {
            path: '/workspace/personal/:id',
            name: 'WorkspacePersonal',
            meta: { title: '个人中心', icon: 'User' },
            component: () => import('@/views/personal/home/index.vue')
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
  history: createWebHashHistory(),
  routes
})

export default router