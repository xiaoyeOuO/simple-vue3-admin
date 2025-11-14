import { usePermissionStore } from '@/stores/permission'

/**
 * 权限控制指令 v-permission
 * 用法：v-permission="'system:user:manage'" 或 v-permission="['system:user:manage', 'system:role:manage']"
 * 功能：当没有权限时隐藏元素
 */
export const permissionDirective = {
  mounted(el, binding) {
    const { value } = binding
    const permissionStore = usePermissionStore()
    
    let hasPermission = false
    
    if (Array.isArray(value)) {
      // 数组形式：拥有任意一个权限即可
      hasPermission = permissionStore.hasAnyPermission(value)
    } else if (typeof value === 'string') {
      // 字符串形式：需要指定权限
      hasPermission = permissionStore.hasPermission(value)
    } else if (typeof value === 'object' && value !== null) {
      // 对象形式：支持更复杂的配置
      const { permissions, mode = 'any' } = value
      if (mode === 'all') {
        hasPermission = permissionStore.hasAllPermissions(permissions)
      } else {
        hasPermission = permissionStore.hasAnyPermission(permissions)
      }
    }
    
    if (!hasPermission) {
      el.style.display = 'none'
      el.setAttribute('data-permission-hidden', 'true')
    }
  },
  
  updated(el, binding) {
    const { value } = binding
    const permissionStore = usePermissionStore()
    
    let hasPermission = false
    
    if (Array.isArray(value)) {
      hasPermission = permissionStore.hasAnyPermission(value)
    } else if (typeof value === 'string') {
      hasPermission = permissionStore.hasPermission(value)
    } else if (typeof value === 'object' && value !== null) {
      const { permissions, mode = 'any' } = value
      if (mode === 'all') {
        hasPermission = permissionStore.hasAllPermissions(permissions)
      } else {
        hasPermission = permissionStore.hasAnyPermission(permissions)
      }
    }
    
    if (hasPermission) {
      if (el.getAttribute('data-permission-hidden') === 'true') {
        el.style.display = ''
        el.removeAttribute('data-permission-hidden')
      }
    } else {
      el.style.display = 'none'
      el.setAttribute('data-permission-hidden', 'true')
    }
  }
}

/**
 * 权限禁用指令 v-permission-disable
 * 用法：v-permission-disable="'system:user:manage'"
 * 功能：当没有权限时禁用元素（添加 disabled 属性）
 */
export const permissionDisableDirective = {
  mounted(el, binding) {
    const { value } = binding
    const permissionStore = usePermissionStore()
    
    let hasPermission = false
    
    if (Array.isArray(value)) {
      hasPermission = permissionStore.hasAnyPermission(value)
    } else if (typeof value === 'string') {
      hasPermission = permissionStore.hasPermission(value)
    } else if (typeof value === 'object' && value !== null) {
      const { permissions, mode = 'any' } = value
      if (mode === 'all') {
        hasPermission = permissionStore.hasAllPermissions(permissions)
      } else {
        hasPermission = permissionStore.hasAnyPermission(permissions)
      }
    }
    
    if (!hasPermission) {
      el.disabled = true
      el.setAttribute('data-permission-disabled', 'true')
      // 为按钮添加禁用样式
      if (el.classList.contains('el-button')) {
        el.classList.add('is-disabled')
      }
    }
  },
  
  updated(el, binding) {
    const { value } = binding
    const permissionStore = usePermissionStore()
    
    let hasPermission = false
    
    if (Array.isArray(value)) {
      hasPermission = permissionStore.hasAnyPermission(value)
    } else if (typeof value === 'string') {
      hasPermission = permissionStore.hasPermission(value)
    } else if (typeof value === 'object' && value !== null) {
      const { permissions, mode = 'any' } = value
      if (mode === 'all') {
        hasPermission = permissionStore.hasAllPermissions(permissions)
      } else {
        hasPermission = permissionStore.hasAnyPermission(permissions)
      }
    }
    
    if (hasPermission) {
      el.disabled = false
      el.removeAttribute('data-permission-disabled')
      if (el.classList.contains('el-button')) {
        el.classList.remove('is-disabled')
      }
    } else {
      el.disabled = true
      el.setAttribute('data-permission-disabled', 'true')
      if (el.classList.contains('el-button')) {
        el.classList.add('is-disabled')
      }
    }
  }
}

/**
 * 权限只读指令 v-permission-readonly
 * 用法：v-permission-readonly="'system:user:manage'"
 * 功能：当没有权限时将输入框设为只读
 */
export const permissionReadonlyDirective = {
  mounted(el, binding) {
    const { value } = binding
    const permissionStore = usePermissionStore()
    
    let hasPermission = false
    
    if (Array.isArray(value)) {
      hasPermission = permissionStore.hasAnyPermission(value)
    } else if (typeof value === 'string') {
      hasPermission = permissionStore.hasPermission(value)
    }
    
    if (!hasPermission) {
      // 处理不同类型的输入元素
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
        el.readOnly = true
        el.classList.add('permission-readonly')
      } else {
        // 查找子元素中的输入控件
        const inputs = el.querySelectorAll('input, textarea, select')
        inputs.forEach(input => {
          input.readOnly = true
          input.classList.add('permission-readonly')
        })
      }
      el.setAttribute('data-permission-readonly', 'true')
    }
  },
  
  updated(el, binding) {
    const { value } = binding
    const permissionStore = usePermissionStore()
    
    let hasPermission = false
    
    if (Array.isArray(value)) {
      hasPermission = permissionStore.hasAnyPermission(value)
    } else if (typeof value === 'string') {
      hasPermission = permissionStore.hasPermission(value)
    }
    
    const isReadonly = el.getAttribute('data-permission-readonly') === 'true'
    
    if (hasPermission && isReadonly) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
        el.readOnly = false
        el.classList.remove('permission-readonly')
      } else {
        const inputs = el.querySelectorAll('input, textarea, select')
        inputs.forEach(input => {
          input.readOnly = false
          input.classList.remove('permission-readonly')
        })
      }
      el.removeAttribute('data-permission-readonly')
    } else if (!hasPermission && !isReadonly) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
        el.readOnly = true
        el.classList.add('permission-readonly')
      } else {
        const inputs = el.querySelectorAll('input, textarea, select')
        inputs.forEach(input => {
          input.readOnly = true
          input.classList.add('permission-readonly')
        })
      }
      el.setAttribute('data-permission-readonly', 'true')
    }
  }
}