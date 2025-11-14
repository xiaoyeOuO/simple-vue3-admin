import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 定义权限常量
export const PERMISSIONS = {
  // 系统管理权限
  SYSTEM_USER_MANAGE: 'system:user:manage',
  SYSTEM_ROLE_MANAGE: 'system:role:manage',
  SYSTEM_MENU_MANAGE: 'system:menu:manage',
  
  // 内容管理权限
  CONTENT_ARTICLE_CREATE: 'content:article:create',
  CONTENT_ARTICLE_EDIT: 'content:article:edit',
  CONTENT_ARTICLE_DELETE: 'content:article:delete',
  CONTENT_CATEGORY_MANAGE: 'content:category:manage',
  
  // 项目管理权限
  PROJECT_CREATE: 'project:create',
  PROJECT_EDIT: 'project:edit',
  PROJECT_DELETE: 'project:delete',
  PROJECT_VIEW: 'project:view',
  
  // 报表权限
  REPORT_VIEW: 'report:view',
  REPORT_EXPORT: 'report:export',
  REPORT_CONFIG: 'report:config',
  
  // 开发管理权限
  CODING_PROJECT_MANAGE: 'coding:project:manage',
  CODING_CONFIG_MANAGE: 'coding:config:manage'
}

// 定义角色权限映射
export const ROLE_PERMISSIONS = {
  admin: [
    // 管理员拥有所有权限
    ...Object.values(PERMISSIONS)
  ],
  manager: [
    // 项目经理权限
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_EDIT,
    PERMISSIONS.PROJECT_VIEW,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.CONTENT_ARTICLE_CREATE,
    PERMISSIONS.CONTENT_ARTICLE_EDIT,
    PERMISSIONS.CODING_PROJECT_MANAGE
  ],
  editor: [
    // 编辑权限
    PERMISSIONS.CONTENT_ARTICLE_CREATE,
    PERMISSIONS.CONTENT_ARTICLE_EDIT,
    PERMISSIONS.CONTENT_CATEGORY_MANAGE,
    PERMISSIONS.PROJECT_VIEW,
    PERMISSIONS.REPORT_VIEW
  ],
  user: [
    // 普通用户权限
    PERMISSIONS.PROJECT_VIEW,
    PERMISSIONS.REPORT_VIEW
  ]
}

// 定义角色信息
export const ROLES = {
  admin: { name: '管理员', description: '拥有所有权限的系统管理员' },
  manager: { name: '项目经理', description: '负责项目管理和报表查看' },
  editor: { name: '编辑', description: '负责内容管理和编辑工作' },
  user: { name: '普通用户', description: '只能查看项目和报表' }
}

export const usePermissionStore = defineStore('permission', () => {
  // 当前用户角色
  const currentRole = ref('user') // 默认为普通用户
  
  // 当前用户权限列表
  const permissions = computed(() => {
    return ROLE_PERMISSIONS[currentRole.value] || []
  })
  
  // 获取当前角色信息
  const currentRoleInfo = computed(() => {
    return ROLES[currentRole.value] || { name: '未知角色', description: '' }
  })
  
  // 检查是否有某个权限
  const hasPermission = (permission) => {
    return permissions.value.includes(permission)
  }
  
  // 检查是否有任意一个权限
  const hasAnyPermission = (permissionList) => {
    return permissionList.some(permission => hasPermission(permission))
  }
  
  // 检查是否拥有所有指定权限
  const hasAllPermissions = (permissionList) => {
    return permissionList.every(permission => hasPermission(permission))
  }
  
  // 切换用户角色
  const switchRole = (newRole) => {
    if (ROLES[newRole]) {
      currentRole.value = newRole
      return true
    }
    return false
  }
  
  // 获取所有可用角色
  const getAvailableRoles = () => {
    return Object.entries(ROLES).map(([key, info]) => ({
      key,
      ...info
    }))
  }
  
  // 获取当前角色的权限列表
  const getCurrentPermissions = () => {
    return permissions.value.map(permission => ({
      code: permission,
      description: getPermissionDescription(permission)
    }))
  }
  
  // 获取权限描述
  const getPermissionDescription = (permission) => {
    const descriptions = {
      [PERMISSIONS.SYSTEM_USER_MANAGE]: '用户管理',
      [PERMISSIONS.SYSTEM_ROLE_MANAGE]: '角色管理',
      [PERMISSIONS.SYSTEM_MENU_MANAGE]: '菜单管理',
      [PERMISSIONS.CONTENT_ARTICLE_CREATE]: '创建文章',
      [PERMISSIONS.CONTENT_ARTICLE_EDIT]: '编辑文章',
      [PERMISSIONS.CONTENT_ARTICLE_DELETE]: '删除文章',
      [PERMISSIONS.CONTENT_CATEGORY_MANAGE]: '分类管理',
      [PERMISSIONS.PROJECT_CREATE]: '创建项目',
      [PERMISSIONS.PROJECT_EDIT]: '编辑项目',
      [PERMISSIONS.PROJECT_DELETE]: '删除项目',
      [PERMISSIONS.PROJECT_VIEW]: '查看项目',
      [PERMISSIONS.REPORT_VIEW]: '查看报表',
      [PERMISSIONS.REPORT_EXPORT]: '导出报表',
      [PERMISSIONS.REPORT_CONFIG]: '报表配置',
      [PERMISSIONS.CODING_PROJECT_MANAGE]: '项目管理',
      [PERMISSIONS.CODING_CONFIG_MANAGE]: '配置管理'
    }
    return descriptions[permission] || permission
  }
  
  return {
    currentRole,
    permissions,
    currentRoleInfo,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    switchRole,
    getAvailableRoles,
    getCurrentPermissions,
    getPermissionDescription
  }
})