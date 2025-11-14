import {
  permissionDirective,
  permissionDisableDirective,
  permissionReadonlyDirective
} from './permission'

export default {
  install(app) {
    // 注册权限控制指令
    app.directive('permission', permissionDirective)
    app.directive('permission-disable', permissionDisableDirective)
    app.directive('permission-readonly', permissionReadonlyDirective)
    
    // 提供全局权限检查方法
    app.config.globalProperties.$hasPermission = function(permission) {
      const { usePermissionStore } = require('@/stores/permission')
      const permissionStore = usePermissionStore()
      return permissionStore.hasPermission(permission)
    }
    
    app.config.globalProperties.$hasAnyPermission = function(permissions) {
      const { usePermissionStore } = require('@/stores/permission')
      const permissionStore = usePermissionStore()
      return permissionStore.hasAnyPermission(permissions)
    }
    
    app.config.globalProperties.$hasAllPermissions = function(permissions) {
      const { usePermissionStore } = require('@/stores/permission')
      const permissionStore = usePermissionStore()
      return permissionStore.hasAllPermissions(permissions)
    }
  }
}