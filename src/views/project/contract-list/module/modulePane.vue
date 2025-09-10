<template>
  <div class="module-pane">
    <div class="tab-header">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增模块
      </el-button>
      <el-dropdown @command="handleColumnCommand">
        <el-button type="default">
          <el-icon><Setting /></el-icon>
          列设置
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="toggleTaskCount">
              <el-checkbox v-model="columnsVisible.taskCount" @click.stop>任务数</el-checkbox>
            </el-dropdown-item>
            <el-dropdown-item command="toggleWorkingHours">
              <el-checkbox v-model="columnsVisible.workingHours" @click.stop>工作记录时长</el-checkbox>
            </el-dropdown-item>
            <el-dropdown-item command="toggleUserCount">
              <el-checkbox v-model="columnsVisible.userCount" @click.stop>处理人数</el-checkbox>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    
    <vxe-table
      ref="xTable"
      :data="modulesData"
      border
      row-key
      :tree-config="{ children: 'children', expandAll: true }"
      :column-config="{ resizable: true }"
      height="500"
    >
      <vxe-column type="seq" title="序号" width="60" align="center" tree-node />
      <vxe-column field="moduleName" title="模块名称" min-width="200">
        <template #default="{ row }">
          <span class="module-name-cell">
            <el-icon v-if="row.children && row.children.length" class="module-icon">
              <Folder />
            </el-icon>
            <el-icon v-else class="module-icon">
              <Document />
            </el-icon>
            {{ row.moduleName }}
          </span>
        </template>
      </vxe-column>
      <vxe-column field="softId" title="模块编码" min-width="150" />
      <vxe-column field="state" title="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStateType(row.state)">
            {{ getStateName(row.state) }}
          </el-tag>
        </template>
      </vxe-column>
      <vxe-column field="briefIntroduction" title="简介" min-width="200" show-overflow />
      <vxe-column field="planStartTime" title="计划开始时间" width="120">
        <template #default="{ row }">
          {{ formatDate(row.planStartTime) }}
        </template>
      </vxe-column>
      <vxe-column field="planCompleteTime" title="计划完成时间" width="120">
        <template #default="{ row }">
          {{ formatDate(row.planCompleteTime) }}
        </template>
      </vxe-column>
      <vxe-column field="sort" title="排序" width="80" align="center" />
      <vxe-column v-if="columnsVisible.taskCount" field="statistic.allCount" title="任务数" width="100" align="center">
        <template #default="{ row }">
          <el-button 
            type="primary" 
            link 
            @click="showTaskDetail(row)"
            :disabled="!row.statistic?.allCount"
          >
            {{ row.statistic?.allCount || 0 }}
          </el-button>
        </template>
      </vxe-column>
      <vxe-column v-if="columnsVisible.workingHours" field="statistic.allWorkingHours" title="工作记录时长" width="120" align="center">
        <template #default="{ row }">
          <el-button 
            type="primary" 
            link 
            @click="showWorkingHours(row)"
            :disabled="!row.statistic?.allWorkingHours"
          >
            {{ row.statistic?.allWorkingHours || 0 }}h
          </el-button>
        </template>
      </vxe-column>
      <vxe-column v-if="columnsVisible.userCount" field="statistic.userCount" title="处理人数" width="100" align="center">
        <template #default="{ row }">
          <el-button 
            type="primary" 
            link 
            @click="showUserDetail(row)"
            :disabled="!row.statistic?.userCount"
          >
            {{ row.statistic?.userCount || 0 }}
          </el-button>
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

    <!-- 任务详情弹窗 -->
    <el-dialog
      v-model="taskDetailDialogVisible"
      :title="currentDetailTitle"
      width="800px"
      :close-on-click-modal="false"
    >
      <vxe-table
        :data="currentDetailData"
        border
        row-key
        :tree-config="{ children: 'children', expandAll: true }"
        height="400"
      >
        <vxe-column type="seq" title="序号" width="60" align="center" tree-node />
        <vxe-column field="title" title="任务标题" min-width="200" tree-node />
        <vxe-column field="assignee" title="处理人" width="120" />
        <vxe-column field="status" title="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getTaskStatusType(row.status)" size="small">
              {{ row.statusName }}
            </el-tag>
          </template>
        </vxe-column>
        <vxe-column field="priority" title="优先级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)" size="small">
              {{ row.priorityName }}
            </el-tag>
          </template>
        </vxe-column>
        <vxe-column field="progress" title="进度" width="100" align="center">
          <template #default="{ row }">
            <span>{{ row.progress }}%</span>
          </template>
        </vxe-column>
      </vxe-table>
    </el-dialog>

    <!-- 工作时长详情弹窗 -->
    <el-dialog
      v-model="workingHoursDialogVisible"
      :title="currentDetailTitle"
      width="700px"
      :close-on-click-modal="false"
    >
      <vxe-table
        :data="currentDetailData"
        border
        row-key
        :tree-config="{ children: 'children', expandAll: true }"
        height="400"
      >
        <vxe-column type="seq" title="序号" width="60" align="center" tree-node />
        <vxe-column field="userName" title="人员" width="120" />
        <vxe-column field="taskName" title="任务" min-width="200" />
        <vxe-column field="hours" title="工作时长(小时)" width="120" align="center" />
        <vxe-column field="date" title="日期" width="120" />
      </vxe-table>
    </el-dialog>

    <!-- 处理人详情弹窗 -->
    <el-dialog
      v-model="userDetailDialogVisible"
      :title="currentDetailTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <vxe-table
        :data="currentDetailData"
        border
        row-key
        :tree-config="{ children: 'children', expandAll: true }"
        height="400"
      >
        <vxe-column type="seq" title="序号" width="60" align="center" tree-node />
        <vxe-column field="userName" title="姓名" width="120" />
        <vxe-column field="role" title="角色" width="120" />
        <vxe-column field="taskCount" title="任务数" width="100" align="center" />
        <vxe-column field="totalHours" title="总工时(小时)" width="120" align="center" />
      </vxe-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import { Plus, Edit, Delete, Folder, Document } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  modulesData: {
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
  taskCount: true,
  workingHours: true,
  userCount: true
})

// 详情弹窗状态
const taskDetailDialogVisible = ref(false)
const workingHoursDialogVisible = ref(false)
const userDetailDialogVisible = ref(false)
const currentDetailTitle = ref('')
const currentDetailData = ref([])

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

const showTaskDetail = (row) => {
  if (row.statistic?.allTask) {
    currentDetailData.value = row.statistic.allTask
    currentDetailTitle.value = `模块 ${row.moduleName} 的任务详情`
    taskDetailDialogVisible.value = true
  }
}

const showWorkingHours = (row) => {
  if (row.statistic?.allWorkingHoursDetails) {
    currentDetailData.value = row.statistic.allWorkingHoursDetails
    currentDetailTitle.value = `模块 ${row.moduleName} 的工作时长详情`
    workingHoursDialogVisible.value = true
  }
}

const showUserDetail = (row) => {
  if (row.statistic?.allUser) {
    currentDetailData.value = row.statistic.allUser
    currentDetailTitle.value = `模块 ${row.moduleName} 的处理人详情`
    userDetailDialogVisible.value = true
  }
}

// 状态相关方法
const getStateType = (state) => {
  const map = {
    0: 'info',
    1: 'success',
    2: 'warning',
    3: 'danger'
  }
  return map[state] || 'info'
}

const getStateName = (state) => {
  const map = {
    0: '待开始',
    1: '进行中',
    2: '已完成',
    3: '已暂停'
  }
  return map[state] || '未知'
}

const getTaskStatusType = (status) => {
  const map = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'danger'
  }
  return map[status] || 'info'
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

const formatDate = (date) => {
  return date || '-'
}
</script>

<style scoped>
.module-pane {
  padding: 0;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.module-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.module-icon {
  color: #409EFF;
}
</style>