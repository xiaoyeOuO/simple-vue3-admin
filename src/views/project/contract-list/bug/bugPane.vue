<template>
  <div class="bug-pane">
    <div class="tab-header">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增Bug
      </el-button>
      <el-dropdown @command="handleColumnCommand">
        <el-button type="default">
          <el-icon><Setting /></el-icon>
          列设置
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="toggleSeverity">
              <el-checkbox v-model="columnsVisible.severity" @click.stop>严重程度</el-checkbox>
            </el-dropdown-item>
            <el-dropdown-item command="togglePriority">
              <el-checkbox v-model="columnsVisible.priority" @click.stop>优先级</el-checkbox>
            </el-dropdown-item>
            <el-dropdown-item command="toggleReporter">
              <el-checkbox v-model="columnsVisible.reporter" @click.stop>报告人</el-checkbox>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    
    <vxe-table
      ref="xTable"
      :data="bugsData"
      border
      row-key
      :tree-config="{ children: 'children', expandAll: true }"
      :column-config="{ resizable: true }"
      height="500"
    >
      <vxe-column type="seq" title="序号" width="60" align="center" tree-node />
      <vxe-column field="title" title="Bug标题" min-width="200" tree-node>
        <template #default="{ row }">
          <span class="bug-title-cell">
            <el-icon v-if="row.children && row.children.length" class="bug-icon">
              <Folder />
            </el-icon>
            <el-icon v-else class="bug-icon">
              <Document />
            </el-icon>
            {{ row.title }}
          </span>
        </template>
      </vxe-column>
      <vxe-column field="assignee" title="处理人" width="120" />
      <vxe-column field="status" title="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusName(row.status) }}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column v-if="columnsVisible.severity" field="severity" title="严重程度" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getSeverityType(row.severity)" size="small">
            {{ getSeverityName(row.severity) }}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column v-if="columnsVisible.priority" field="priority" title="优先级" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getPriorityType(row.priority)" size="small">
            {{ getPriorityName(row.priority) }}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column v-if="columnsVisible.reporter" field="reporter" title="报告人" width="120" />
      <vxe-column field="moduleName" title="所属模块" width="150" />
      <vxe-column field="createdTime" title="创建时间" width="120">
        <template #default="{ row }">
          {{ formatDate(row.createdTime) }}
        </template>
      </vxe-column>
      <vxe-column title="操作" width="150" fixed="right" align="center">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button type="danger" link @click="handleDelete(row)">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </template>
      </vxe-column>
    </vxe-table>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import { Plus, Edit, Delete, Folder, Document } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  bugsData: {
    type: Array,
    default: () => []
  },
  projectId: {
    type: [String, Number],
    required: true
  }
})

// Emits
const emit = defineEmits(['add', 'edit', 'delete', 'update:data'])

// 状态管理
const xTable = ref()
const columnsVisible = ref({
  severity: true,
  priority: true,
  reporter: true
})

// 方法定义
const handleAdd = () => {
  emit('add')
}

const handleEdit = (row) => {
  emit('edit', row)
}

const handleDelete = (row) => {
  emit('delete', row)
}

const handleColumnCommand = (command) => {
  // 列设置命令处理
}

// 状态相关方法
const getStatusType = (status) => {
  const map = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'danger'
  }
  return map[status] || 'info'
}

const getStatusName = (status) => {
  const map = {
    0: '待修复',
    1: '修复中',
    2: '已修复',
    3: '已关闭'
  }
  return map[status] || '未知'
}

const getSeverityType = (severity) => {
  const map = {
    0: 'danger',
    1: 'warning',
    2: 'success',
    3: 'info'
  }
  return map[severity] || 'info'
}

const getSeverityName = (severity) => {
  const map = {
    0: '致命',
    1: '严重',
    2: '一般',
    3: '轻微'
  }
  return map[severity] || '未知'
}

const getPriorityType = (priority) => {
  const map = {
    0: 'danger',
    1: 'warning',
    2: 'success',
    3: 'info'
  }
  return map[priority] || 'info'
}

const getPriorityName = (priority) => {
  const map = {
    0: '紧急',
    1: '高',
    2: '中',
    3: '低'
  }
  return map[priority] || '未知'
}

const formatDate = (date) => {
  return date || '-'
}
</script>

<style scoped>
.bug-pane {
  padding: 0;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.bug-title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bug-icon {
  color: #F56C6C;
}
</style>