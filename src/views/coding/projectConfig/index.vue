<template>
  <div class="project-config-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>项目任务与模块配置</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增任务
      </el-button>
    </div>

    <!-- 树形表格 -->
    <el-card shadow="hover">
      <vxe-table
        ref="xTable"
        :data="treeData"
        border
        row-key
        :tree-config="{ children: 'children', expandAll: true }"
        :column-config="{ resizable: true }"
        height="600"
      >
        <vxe-column type="seq" title="序号" width="60" align="center" tree-node />
        
        <vxe-column field="name" title="名称" min-width="300">
          <template #default="{ row }">
            <div class="name-cell">
              <el-icon v-if="row.type === 'task'" class="type-icon task-icon">
                <Folder />
              </el-icon>
              <el-icon v-else class="type-icon module-icon">
                <Document />
              </el-icon>
              <span>{{ row.name }}</span>
              <el-tag 
                :type="row.type === 'task' ? 'primary' : 'success'" 
                size="small" 
                class="type-tag"
              >
                {{ row.type === 'task' ? '任务' : '模块' }}
              </el-tag>
            </div>
          </template>
        </vxe-column>

        <vxe-column field="id" title="ID" width="180" />
        <vxe-column field="projectName" title="关联项目" width="200">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.projectName || '未设置' }}</el-tag>
          </template>
        </vxe-column>
        <vxe-column field="createTime" title="创建时间" width="150">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </vxe-column>
        <vxe-column field="updateTime" title="更新时间" width="150">
          <template #default="{ row }">
            {{ formatDate(row.updateTime) }}
          </template>
        </vxe-column>
        
        <vxe-column title="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button 
              type="danger" 
              link 
              @click="handleDelete(row)"
              :disabled="row.children && row.children.length > 0"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </vxe-column>
      </vxe-table>
    </el-card>

    <!-- 编辑对话框 -->
    <edit-dialog
      v-model="editVisible"
      :edit-data="currentEditData"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Folder, Document } from '@element-plus/icons-vue'
import EditDialog from './edit.vue'

// 表格引用
const xTable = ref()

// 树形数据
const treeData = ref([])

// 编辑相关
const editVisible = ref(false)
const currentEditData = ref(null)

// 模拟数据生成
const generateMockData = () => {
  return [
    {
      id: 'task-001',
      name: '智慧园区管理系统',
      type: 'task',
      projectName: '智慧园区项目',
      createTime: '2024-01-15 10:00:00',
      updateTime: '2024-01-20 14:30:00',
      children: [
        {
          id: 'module-001',
          name: '用户管理模块',
          type: 'module',
          projectName: '智慧园区项目',
          createTime: '2024-01-15 11:00:00',
          updateTime: '2024-01-18 09:15:00',
          children: [
            {
              id: 'module-001-01',
              name: '用户注册功能',
              type: 'module',
              projectName: '智慧园区项目',
              createTime: '2024-01-16 14:00:00',
              updateTime: '2024-01-17 16:45:00'
            },
            {
              id: 'module-001-02',
              name: '用户登录功能',
              type: 'module',
              projectName: '智慧园区项目',
              createTime: '2024-01-16 15:30:00',
              updateTime: '2024-01-18 10:20:00'
            }
          ]
        },
        {
          id: 'module-002',
          name: '设备管理模块',
          type: 'module',
          projectName: '智慧园区项目',
          createTime: '2024-01-15 13:20:00',
          updateTime: '2024-01-19 11:30:00',
          children: [
            {
              id: 'module-002-01',
              name: '设备列表查询',
              type: 'module',
              projectName: '智慧园区项目',
              createTime: '2024-01-17 09:00:00',
              updateTime: '2024-01-19 14:15:00'
            }
          ]
        }
      ]
    },
    {
      id: 'task-002',
      name: '企业微信小程序',
      type: 'task',
      projectName: '小程序开发项目',
      createTime: '2024-01-20 09:00:00',
      updateTime: '2024-01-21 16:00:00',
      children: [
        {
          id: 'module-003',
          name: '首页展示模块',
          type: 'module',
          projectName: '小程序开发项目',
          createTime: '2024-01-20 10:30:00',
          updateTime: '2024-01-21 11:45:00'
        }
      ]
    },
    {
      id: 'task-003',
      name: '数据可视化平台',
      type: 'task',
      projectName: '数据分析项目',
      createTime: '2024-01-22 08:30:00',
      updateTime: '2024-01-22 15:20:00',
      children: []
    }
  ]
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 加载数据
const loadData = () => {
  treeData.value = generateMockData()
}

// 事件处理
const handleAdd = () => {
  currentEditData.value = null
  editVisible.value = true
}

const handleEdit = (row) => {
  currentEditData.value = {
    id: row.id,
    name: row.name,
    type: row.type
  }
  editVisible.value = true
}

const handleDelete = async (row) => {
  // 如果有子项，不允许删除
  if (row.children && row.children.length > 0) {
    ElMessage.warning('该节点下有子节点，无法直接删除')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除${row.type === 'task' ? '任务' : '模块'} "${row.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 从树中删除节点
    const deleteNode = (data, id) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === id) {
          data.splice(i, 1)
          return true
        }
        if (data[i].children && data[i].children.length > 0) {
          if (deleteNode(data[i].children, id)) {
            return true
          }
        }
      }
      return false
    }

    deleteNode(treeData.value, row.id)
    ElMessage.success('删除成功')
  } catch (error) {
    // 用户取消删除
  }
}

const handleEditSuccess = (data) => {
  const updateNode = (nodes) => {
    for (let node of nodes) {
      if (node.id === data.id) {
        node.name = data.name
        node.projectName = data.projectName
        node.updateTime = new Date().toLocaleString('zh-CN')
        return true
      }
      if (node.children && node.children.length > 0) {
        if (updateNode(node.children)) {
          return true
        }
      }
    }
    return false
  }

  if (updateNode(treeData.value)) {
    ElMessage.success('更新成功')
  }
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.project-config-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-icon {
  font-size: 16px;
}

.task-icon {
  color: #409eff;
}

.module-icon {
  color: #67c23a;
}

.type-tag {
  margin-left: 8px;
}

:deep(.vxe-tree-cell) {
  padding-left: 8px;
}
</style>