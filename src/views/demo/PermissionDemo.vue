<template>
  <div class="permission-demo">
    <el-card class="role-switcher">
      <template #header>
        <div class="card-header">
          <span>角色权限模拟演示</span>
          <el-tag :type="getRoleTagType(currentRole)" size="large">
            {{ currentRoleInfo.name }}
          </el-tag>
        </div>
      </template>
      
      <div class="role-selector">
        <h3>切换用户角色</h3>
        <el-radio-group v-model="currentRole" @change="handleRoleChange" size="large">
          <el-radio-button 
            v-for="role in availableRoles" 
            :key="role.key" 
            :label="role.key"
            :disabled="currentRole === role.key"
          >
            <el-icon style="margin-right: 4px">
              <User v-if="role.key === 'user'"/>
              <EditPen v-if="role.key === 'editor'"/>
              <Management v-if="role.key === 'manager'"/>
              <Avatar v-if="role.key === 'admin'"/>
            </el-icon>
            {{ role.name }}
          </el-radio-button>
        </el-radio-group>
        
        <div class="role-description">
          <el-alert :title="currentRoleInfo.description" type="info" :closable="false"/>
        </div>
      </div>
    </el-card>

    <el-card class="permission-showcase">
      <template #header>
        <span>权限功能演示</span>
      </template>
      
      <div class="permission-groups">
        <!-- 系统管理权限 -->
        <div class="permission-group">
          <h4>系统管理</h4>
          <div class="permission-buttons">
            <el-button 
              type="primary" 
              :disabled="!hasPermission('system:user:manage')"
              @click="handlePermissionClick('用户管理')"
            >
              <el-icon><User/></el-icon>
              用户管理
            </el-button>
            <el-button 
              type="primary" 
              :disabled="!hasPermission('system:role:manage')"
              @click="handlePermissionClick('角色管理')"
            >
              <el-icon><Avatar/></el-icon>
              角色管理
            </el-button>
            <el-button 
              type="primary" 
              :disabled="!hasPermission('system:menu:manage')"
              @click="handlePermissionClick('菜单管理')"
            >
              <el-icon><Menu/></el-icon>
              菜单管理
            </el-button>
          </div>
        </div>

        <!-- 内容管理权限 -->
        <div class="permission-group">
          <h4>内容管理</h4>
          <div class="permission-buttons">
            <el-button 
              type="success" 
              :disabled="!hasPermission('content:article:create')"
              @click="handlePermissionClick('创建文章')"
            >
              <el-icon><Plus/></el-icon>
              创建文章
            </el-button>
            <el-button 
              type="warning" 
              :disabled="!hasPermission('content:article:edit')"
              @click="handlePermissionClick('编辑文章')"
            >
              <el-icon><Edit/></el-icon>
              编辑文章
            </el-button>
            <el-button 
              type="danger" 
              :disabled="!hasPermission('content:article:delete')"
              @click="handlePermissionClick('删除文章')"
            >
              <el-icon><Delete/></el-icon>
              删除文章
            </el-button>
            <el-button 
              type="info" 
              :disabled="!hasPermission('content:category:manage')"
              @click="handlePermissionClick('分类管理')"
            >
              <el-icon><Folder/></el-icon>
              分类管理
            </el-button>
          </div>
        </div>

        <!-- 项目管理权限 -->
        <div class="permission-group">
          <h4>项目管理</h4>
          <div class="permission-buttons">
            <el-button 
              type="success" 
              :disabled="!hasPermission('project:create')"
              @click="handlePermissionClick('创建项目')"
            >
              <el-icon><Plus/></el-icon>
              创建项目
            </el-button>
            <el-button 
              type="warning" 
              :disabled="!hasPermission('project:edit')"
              @click="handlePermissionClick('编辑项目')"
            >
              <el-icon><Edit/></el-icon>
              编辑项目
            </el-button>
            <el-button 
              type="danger" 
              :disabled="!hasPermission('project:delete')"
              @click="handlePermissionClick('删除项目')"
            >
              <el-icon><Delete/></el-icon>
              删除项目
            </el-button>
            <el-button 
              type="info" 
              :disabled="!hasPermission('project:view')"
              @click="handlePermissionClick('查看项目')"
            >
              <el-icon><View/></el-icon>
              查看项目
            </el-button>
          </div>
        </div>

        <!-- 报表权限 -->
        <div class="permission-group">
          <h4>报表中心</h4>
          <div class="permission-buttons">
            <el-button 
              type="primary" 
              :disabled="!hasPermission('report:view')"
              @click="handlePermissionClick('查看报表')"
            >
              <el-icon><View/></el-icon>
              查看报表
            </el-button>
            <el-button 
              type="success" 
              :disabled="!hasPermission('report:export')"
              @click="handlePermissionClick('导出报表')"
            >
              <el-icon><Download/></el-icon>
              导出报表
            </el-button>
            <el-button 
              type="warning" 
              :disabled="!hasPermission('report:config')"
              @click="handlePermissionClick('报表配置')"
            >
              <el-icon><Setting/></el-icon>
              报表配置
            </el-button>
          </div>
        </div>

        <!-- 开发管理权限 -->
        <div class="permission-group">
          <h4>开发管理</h4>
          <div class="permission-buttons">
            <el-button 
              type="primary" 
              :disabled="!hasPermission('coding:project:manage')"
              @click="handlePermissionClick('项目管理')"
            >
              <el-icon><Folder/></el-icon>
              项目管理
            </el-button>
            <el-button 
              type="info" 
              :disabled="!hasPermission('coding:config:manage')"
              @click="handlePermissionClick('配置管理')"
            >
              <el-icon><Setting/></el-icon>
              配置管理
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="permission-info">
      <template #header>
        <span>当前权限详情</span>
      </template>
      
      <div class="permission-details">
        <div class="permission-stats">
          <el-statistic title="总权限数" :value="currentPermissions.length"/>
          <el-statistic title="角色类型" :value="currentRoleInfo.name"/>
        </div>
        
        <div class="permission-list">
          <h4>当前拥有的权限：</h4>
          <el-tag
            v-for="permission in currentPermissions"
            :key="permission.code"
            type="success"
            effect="plain"
            style="margin: 4px"
          >
            {{ permission.description }}
          </el-tag>
        </div>
        
        <div class="permission-test" v-if="false">
          <h4>权限测试：</h4>
          <el-space>
            <el-button size="small" @click="testPermission('content:article:create')">测试创建文章权限</el-button>
            <el-button size="small" @click="testPermission('system:user:manage')">测试用户管理权限</el-button>
            <el-button size="small" @click="testPermission('project:delete')">测试删除项目权限</el-button>
          </el-space>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePermissionStore, PERMISSIONS, ROLES } from '@/stores/permission'
import {
  User,
  Avatar,
  Menu,
  Plus,
  Edit,
  Delete,
  View,
  Folder,
  Download,
  Setting,
  Management,
  EditPen
} from '@element-plus/icons-vue'

const permissionStore = usePermissionStore()

// 当前角色
const currentRole = ref(permissionStore.currentRole)

// 计算属性
const currentRoleInfo = computed(() => permissionStore.currentRoleInfo)
const availableRoles = computed(() => permissionStore.getAvailableRoles())
const currentPermissions = computed(() => permissionStore.getCurrentPermissions())

// 权限检查方法
const hasPermission = (permission) => {
  return permissionStore.hasPermission(permission)
}

// 角色标签类型
const getRoleTagType = (role) => {
  const types = {
    admin: 'danger',
    manager: 'warning',
    editor: 'success',
    user: 'info'
  }
  return types[role] || 'info'
}

// 角色切换处理
const handleRoleChange = (newRole) => {
  if (permissionStore.switchRole(newRole)) {
    ElMessage.success(`已切换到 ${ROLES[newRole].name} 角色`)
  }
}

// 权限按钮点击处理
const handlePermissionClick = (permissionName) => {
  ElMessageBox.alert(
    `您点击了 "${permissionName}" 功能，当前角色 "${currentRoleInfo.value.name}" 拥有此权限！`,
    '权限功能演示',
    {
      confirmButtonText: '确定',
      type: 'success'
    }
  )
}

// 权限测试（调试用）
const testPermission = (permission) => {
  const has = hasPermission(permission)
  ElMessage({
    message: `权限 "${permission}": ${has ? '✅ 有权限' : '❌ 无权限'}`,
    type: has ? 'success' : 'error',
    duration: 2000
  })
}
</script>

<style scoped>
.permission-demo {
  padding: 20px;
}

.role-switcher {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role-selector {
  text-align: center;
}

.role-selector h3 {
  margin-bottom: 20px;
  color: #303133;
}

.role-description {
  margin-top: 20px;
}

.permission-showcase {
  margin-bottom: 20px;
}

.permission-groups {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.permission-group h4 {
  margin-bottom: 15px;
  color: #303133;
  font-size: 16px;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}

.permission-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.permission-buttons .el-button {
  min-width: 120px;
}

.permission-info {
  margin-bottom: 20px;
}

.permission-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.permission-stats {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.permission-list h4 {
  margin-bottom: 10px;
  color: #303133;
}

.permission-test h4 {
  margin-bottom: 10px;
  color: #303133;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .permission-buttons {
    justify-content: center;
  }
  
  .permission-stats {
    flex-direction: column;
    gap: 20px;
  }
}
</style>