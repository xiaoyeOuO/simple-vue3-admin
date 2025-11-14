<template>
  <div class="directive-demo">
    <el-card class="role-switcher">
      <template #header>
        <div class="card-header">
          <span>自定义指令权限控制演示</span>
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
            {{ role.name }}
          </el-radio-button>
        </el-radio-group>
      </div>
    </el-card>

    <el-card class="directive-showcase">
      <template #header>
        <span>v-permission 指令演示（无权限时隐藏元素）</span>
      </template>
      
      <div class="demo-section">
        <h4>系统管理功能</h4>
        <div class="button-group">
          <el-button type="primary" v-permission="'system:user:manage'">
            <el-icon><User/></el-icon>
            用户管理（需要用户管理权限）
          </el-button>
          
          <el-button type="primary" v-permission="'system:role:manage'">
            <el-icon><Avatar/></el-icon>
            角色管理（需要角色管理权限）
          </el-button>
          
          <el-button type="primary" v-permission="'system:menu:manage'">
            <el-icon><Menu/></el-icon>
            菜单管理（需要菜单管理权限）
          </el-button>
          
          <!-- 数组形式：拥有任意一个权限即可显示 -->
          <el-button type="success" v-permission="['system:user:manage', 'system:role:manage']">
            <el-icon><Setting/></el-icon>
            系统设置（需要用户或角色管理权限）
          </el-button>
        </div>
      </div>

      <div class="demo-section">
        <h4>内容管理功能</h4>
        <div class="button-group">
          <el-button type="success" v-permission="'content:article:create'">
            <el-icon><Plus/></el-icon>
            创建文章
          </el-button>
          
          <el-button type="warning" v-permission="'content:article:edit'">
            <el-icon><Edit/></el-icon>
            编辑文章
          </el-button>
          
          <el-button type="danger" v-permission="'content:article:delete'">
            <el-icon><Delete/></el-icon>
            删除文章
          </el-button>
        </div>
      </div>

      <div class="demo-section">
        <h4>复杂权限控制</h4>
        <div class="button-group">
          <!-- 对象形式：需要同时拥有所有权限 -->
          <el-button 
            type="primary" 
            v-permission="{ permissions: ['content:article:create', 'content:article:edit'], mode: 'all' }"
          >
            高级编辑（需要同时有创建和编辑权限）
          </el-button>
          
          <!-- 对象形式：拥有任意一个权限即可 -->
          <el-button 
            type="warning" 
            v-permission="{ permissions: ['project:delete', 'content:article:delete'], mode: 'any' }"
          >
            删除操作（项目或文章删除权限）
          </el-button>
        </div>
      </div>
    </el-card>

    <el-card class="directive-disable-demo">
      <template #header>
        <span>v-permission-disable 指令演示（无权限时禁用元素）</span>
      </template>
      
      <div class="demo-section">
        <h4>项目管理功能（禁用模式）</h4>
        <div class="button-group">
          <el-button type="success" v-permission-disable="'project:create'">
            <el-icon><Plus/></el-icon>
            创建项目
          </el-button>
          
          <el-button type="warning" v-permission-disable="'project:edit'">
            <el-icon><Edit/></el-icon>
            编辑项目
          </el-button>
          
          <el-button type="danger" v-permission-disable="'project:delete'">
            <el-icon><Delete/></el-icon>
            删除项目
          </el-button>
          
          <el-button type="info" v-permission-disable="'project:view'">
            <el-icon><View/></el-icon>
            查看项目
          </el-button>
        </div>
      </div>

      <div class="demo-section">
        <h4>报表功能（禁用模式）</h4>
        <div class="button-group">
          <el-button type="primary" v-permission-disable="'report:view'">
            <el-icon><View/></el-icon>
            查看报表
          </el-button>
          
          <el-button type="success" v-permission-disable="'report:export'">
            <el-icon><Download/></el-icon>
            导出报表
          </el-button>
          
          <el-button type="warning" v-permission-disable="'report:config'">
            <el-icon><Setting/></el-icon>
            报表配置
          </el-button>
        </div>
      </div>
    </el-card>

    <el-card class="directive-readonly-demo">
      <template #header>
        <span>v-permission-readonly 指令演示（无权限时设为只读）</span>
      </template>
      
      <div class="demo-section">
        <h4>表单输入控制</h4>
        <el-form :model="formData" label-width="120px">
          <el-form-item label="项目名称">
            <el-input 
              v-model="formData.projectName" 
              placeholder="项目名称"
              v-permission-readonly="'project:edit'"
            />
          </el-form-item>
          
          <el-form-item label="项目描述">
            <el-input 
              v-model="formData.projectDesc" 
              type="textarea"
              placeholder="项目描述"
              v-permission-readonly="'project:edit'"
            />
          </el-form-item>
          
          <el-form-item label="项目状态">
            <el-select 
              v-model="formData.projectStatus" 
              placeholder="选择项目状态"
              v-permission-readonly="'project:edit'"
            >
              <el-option label="进行中" value="active" />
              <el-option label="已完成" value="completed" />
              <el-option label="已暂停" value="paused" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="管理员备注">
            <el-input 
              v-model="formData.adminNote" 
              type="textarea"
              placeholder="管理员备注（需要管理员权限）"
              v-permission-readonly="'system:user:manage'"
            />
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card class="code-example">
      <template #header>
        <span>使用示例代码</span>
      </template>
      
      <el-tabs>
        <el-tab-pane label="基本用法" name="basic">
          <pre><code>&lt;!-- 单个权限检查 --&gt;
&lt;el-button v-permission="'system:user:manage'"&gt;用户管理&lt;/el-button&gt;

&lt;!-- 多个权限检查（任意一个） --&gt;
&lt;el-button v-permission="['system:user:manage', 'system:role:manage']"&gt;系统管理&lt;/el-button&gt;

&lt;!-- 复杂权限配置 --&gt;
&lt;el-button v-permission="{ permissions: ['content:create', 'content:edit'], mode: 'all' }"&gt;
  高级编辑
&lt;/el-button&gt;</code></pre>
        </el-tab-pane>
        
        <el-tab-pane label="禁用模式" name="disable">
          <pre><code>&lt;!-- 无权限时禁用按钮 --&gt;
&lt;el-button v-permission-disable="'project:create'"&gt;创建项目&lt;/el-button&gt;

&lt;!-- 无权限时禁用输入框 --&gt;
&lt;el-input v-permission-disable="'user:edit'" v-model="username" /&gt;</code></pre>
        </el-tab-pane>
        
        <el-tab-pane label="只读模式" name="readonly">
          <pre><code>&lt;!-- 无权限时设为只读 --&gt;
&lt;el-input v-permission-readonly="'project:edit'" v-model="projectName" /&gt;

&lt;!-- 无权限时设为只读（对表单容器使用） --&gt;
&lt;el-form v-permission-readonly="'form:edit'"&gt;
  &lt;el-input v-model="data1" /&gt;
  &lt;el-input v-model="data2" /&gt;
&lt;/el-form&gt;</code></pre>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { usePermissionStore, ROLES } from '@/stores/permission'
import {
  User,
  Avatar,
  Menu,
  Plus,
  Edit,
  Delete,
  View,
  Setting,
  Download
} from '@element-plus/icons-vue'

const permissionStore = usePermissionStore()

// 当前角色
const currentRole = ref(permissionStore.currentRole)

// 计算属性
const currentRoleInfo = computed(() => permissionStore.currentRoleInfo)
const availableRoles = computed(() => permissionStore.getAvailableRoles())

// 表单数据
const formData = ref({
  projectName: '示例项目',
  projectDesc: '这是一个示例项目描述',
  projectStatus: 'active',
  adminNote: '管理员专用备注信息'
})

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
</script>

<style scoped>
.directive-demo {
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

.directive-showcase,
.directive-disable-demo,
.directive-readonly-demo,
.code-example {
  margin-bottom: 20px;
}

.demo-section {
  margin-bottom: 30px;
}

.demo-section:last-child {
  margin-bottom: 0;
}

.demo-section h4 {
  margin-bottom: 15px;
  color: #303133;
  font-size: 16px;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.button-group .el-button {
  min-width: 140px;
}

.code-example pre {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0;
}

.code-example code {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}

/* 权限只读样式 */
:deep(.permission-readonly) {
  background-color: #f5f7fa !important;
  border-color: #e4e7ed !important;
  color: #c0c4cc !important;
  cursor: not-allowed !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .button-group {
    justify-content: center;
  }
  
  .button-group .el-button {
    min-width: 120px;
    font-size: 12px;
  }
}
</style>