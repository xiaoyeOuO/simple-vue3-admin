<template>
  <div class="module-pane">
    <div class="tab-header">
      <div class="header-left">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增模块
        </el-button>
        <el-button-group>
          <el-button 
            :type="viewMode === 'table' ? 'primary' : 'default'" 
            @click="switchView('table')"
          >
            <el-icon><Grid /></el-icon>
            列表视图
          </el-button>
          <el-button 
            :type="viewMode === 'gantt' ? 'primary' : 'default'" 
            @click="switchView('gantt')"
          >
            <el-icon><Calendar /></el-icon>
            甘特图视图
          </el-button>
        </el-button-group>
      </div>
      <el-dropdown @command="handleColumnCommand" v-if="viewMode === 'table'">
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
    
    <!-- 列表视图 -->
    <div v-if="viewMode === 'table'" class="table-view">
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
        <vxe-column field="testStartTime" title="测试开始时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.testStartTime) }}
          </template>
        </vxe-column>
        <vxe-column field="testCompleteTime" title="测试完成时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.testCompleteTime) }}
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
    </div>

    <!-- 甘特图视图 -->
    <div v-else-if="viewMode === 'gantt'" class="gantt-view">
      <div class="gantt-container">
        <!-- 左侧表格 -->
        <div class="gantt-left">
          <vxe-table
            ref="ganttTable"
            :data="flattenModulesData"
            border
            row-key="id"
            :column-config="{ resizable: true }"
            height="500"
            :row-class-name="getRowClassName"
            @cell-click="handleTableCellClick"
          >
            <vxe-column field="moduleName" title="模块名称" min-width="200">
              <template #default="{ row }">
                <div class="module-name-cell" :style="{ paddingLeft: (row.level * 20) + 'px' }">
                  <!-- 展开/折叠图标 -->
                  <span 
                    v-if="row.children && row.children.length" 
                    class="expand-icon"
                    @click.stop="toggleExpanded(row)"
                  >
                    <el-icon v-if="expandedKeys.has(row.id)" class="expand-icon-open">
                      <ArrowDown />
                    </el-icon>
                    <el-icon v-else class="expand-icon-close">
                      <ArrowRight />
                    </el-icon>
                  </span>
                  <span v-else class="expand-icon-placeholder"></span>
                  
                  <el-icon v-if="row.children && row.children.length" class="module-icon">
                    <Folder />
                  </el-icon>
                  <el-icon v-else class="module-icon">
                    <Document />
                  </el-icon>
                  {{ row.moduleName }}
                </div>
              </template>
            </vxe-column>
            <vxe-column field="state" title="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getStateType(row.state)" size="small">
                  {{ getStateName(row.state) }}
                </el-tag>
              </template>
            </vxe-column>
            <vxe-column field="planStartTime" title="开始时间" width="120">
              <template #default="{ row }">
                {{ formatDate(row.planStartTime) }}
              </template>
            </vxe-column>
            <vxe-column field="planCompleteTime" title="结束时间" width="120">
              <template #default="{ row }">
                {{ formatDate(row.planCompleteTime) }}
              </template>
            </vxe-column>
            <vxe-column field="testStartTime" title="测试开始" width="120">
              <template #default="{ row }">
                {{ formatDate(row.testStartTime) }}
              </template>
            </vxe-column>
            <vxe-column field="testCompleteTime" title="测试结束" width="120">
              <template #default="{ row }">
                {{ formatDate(row.testCompleteTime) }}
              </template>
            </vxe-column>
          </vxe-table>
        </div>
        
        <!-- 右侧甘特图 -->
        <div class="gantt-right">
          <div class="gantt-chart-container" :style="{ minWidth: ganttContainerWidth }">
            <!-- 调试信息 -->
            <!-- <div v-if="ganttConfig.startDate" class="gantt-debug" style="position: absolute; top: 5px; right: 10px; font-size: 12px; color: #666; z-index: 100;">
              时间范围: {{ ganttConfig.startDate.format('MM/DD') }} - {{ ganttConfig.endDate.format('MM/DD') }}
              (共{{ ganttConfig.totalDays }}天)
            </div> -->
            <!-- 甘特图时间轴头部 -->
            <div class="gantt-header">
              <div class="gantt-timeline">
                <div 
                  v-for="timePoint in timelineData" 
                  :key="timePoint.date"
                  class="timeline-item"
                  :class="{ 'timeline-weekend': timePoint.isWeekend }"
                  :style="{ width: timePoint.width + 'px' }"
                >
                  <div class="timeline-date">{{ timePoint.label }}</div>
                  <div class="timeline-day">{{ timePoint.dayOfWeek }}</div>
                </div>
              </div>
            </div>
            
            <!-- 甘特图条形图 -->
            <div class="gantt-body">
              <div 
                v-for="item in flattenModulesData" 
                :key="item.id"
                class="gantt-row"
                :class="{ 'gantt-row-selected': selectedRowId === item.id }"
                @click="handleGanttRowClick(item)"
              >
                <div 
                  v-if="item.planStartTime && item.planCompleteTime"
                  class="gantt-bar-container"
                >
                  <!-- 开发阶段甘特条 -->
                  <div 
                    class="gantt-bar gantt-bar-development"
                    :style="getGanttBarStyle(item, 'development')"
                    :class="getGanttBarClass(item)"
                  >
                    <div class="gantt-bar-content">
                      <span class="gantt-bar-text">{{ item.moduleName }} - 开发</span>
                    </div>
                    <!-- 进度条 -->
                    <div 
                      class="gantt-bar-progress"
                      :style="{ width: (item.progress || 0) + '%' }"
                    ></div>
                  </div>
                  
                  <!-- 测试阶段甘特条 -->
                  <div 
                    v-if="item.testStartTime && item.testCompleteTime"
                    class="gantt-bar gantt-bar-testing"
                    :style="getGanttBarStyle(item, 'testing')"
                    :class="getGanttBarClass(item)"
                  >
                    <div class="gantt-bar-content">
                      <span class="gantt-bar-text">{{ item.moduleName }} - 测试</span>
                    </div>
                    <!-- 测试进度条（假设测试进度为80%） -->
                    <div 
                      class="gantt-bar-progress"
                      :style="{ width: '80%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
import { ref, computed, defineEmits, onMounted, watch } from 'vue'
import { Plus, Edit, Delete, Folder, Document, Grid, Calendar, Setting, ArrowDown, ArrowRight } from '@element-plus/icons-vue'
import moment from 'moment'

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
const ganttTable = ref()
const columnsVisible = ref({
  taskCount: true,
  workingHours: true,
  userCount: true
})

const viewMode = ref('table')
const selectedRowId = ref(null)

// 树形结构展开状态管理
const expandedKeys = ref(new Set())

// 甘特图相关数据
const timelineData = ref([])
const ganttConfig = ref({
  dayWidth: 30, // 每天的宽度（像素）
  startDate: null,
  endDate: null,
  totalDays: 0,
  minWidth: 20 // 甘特条最小宽度
})

// 详情弹窗状态
const taskDetailDialogVisible = ref(false)
const workingHoursDialogVisible = ref(false)
const userDetailDialogVisible = ref(false)
const currentDetailTitle = ref('')
const currentDetailData = ref([])

// 计算属性：甘特图容器宽度
const ganttContainerWidth = computed(() => {
  if (timelineData.value.length === 0) return '800px'
  const totalWidth = timelineData.value.length * ganttConfig.value.dayWidth
  return `${Math.max(totalWidth, 800)}px`
})

// 计算属性：展平模块数据（为甘特图使用）
const flattenModulesData = computed(() => {
  const flatten = (items, level = 0) => {
    let result = []
    items.forEach(item => {
      const flatItem = {
        ...item,
        level,
        id: item.id || item.softId || Math.random().toString(36).substr(2, 9)
      }
      result.push(flatItem)
      // 只有在展开状态下才显示子级
      if (item.children && item.children.length > 0 && expandedKeys.value.has(flatItem.id)) {
        result = result.concat(flatten(item.children, level + 1))
      }
    })
    return result
  }
  return flatten(props.modulesData)
})

// 初始化展开状态（默认展开所有父级节点）
const initExpandedKeys = () => {
  const traverse = (items) => {
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        const id = item.id || item.softId || Math.random().toString(36).substr(2, 9)
        expandedKeys.value.add(id)
        traverse(item.children)
      }
    })
  }
  traverse(props.modulesData)
}

// 切换节点展开/折叠状态
const toggleExpanded = (item) => {
  if (item.children && item.children.length > 0) {
    if (expandedKeys.value.has(item.id)) {
      expandedKeys.value.delete(item.id)
    } else {
      expandedKeys.value.add(item.id)
    }
  }
}

// 初始化甘特图时间轴
const initGanttTimeline = () => {
  const modules = flattenModulesData.value
  if (modules.length === 0) return
  
  // 获取所有模块的时间范围（包括开发和测试时间）
  let startDates = []
  let endDates = []
  
  modules.forEach(module => {
    // 开发时间
    if (module.planStartTime) {
      startDates.push(moment(module.planStartTime))
    }
    if (module.planCompleteTime) {
      endDates.push(moment(module.planCompleteTime))
    }
    // 测试时间
    if (module.testStartTime) {
      startDates.push(moment(module.testStartTime))
    }
    if (module.testCompleteTime) {
      endDates.push(moment(module.testCompleteTime))
    }
  })
  
  if (startDates.length === 0 || endDates.length === 0) return
  
  // 计算时间范围
  const startDate = moment.min(startDates)
  const endDate = moment.max(endDates)
  
  // 扩展时间范围，给两端留出一些空间
  ganttConfig.value.startDate = startDate.clone().subtract(3, 'days')
  ganttConfig.value.endDate = endDate.clone().add(3, 'days')
  ganttConfig.value.totalDays = ganttConfig.value.endDate.diff(ganttConfig.value.startDate, 'days') + 1
  
  // 生成时间轴数据
  generateTimelineData()
}

// 生成时间轴数据
const generateTimelineData = () => {
  const timeline = []
  const startDate = ganttConfig.value.startDate.clone()
  const endDate = ganttConfig.value.endDate.clone()
  
  let currentDate = startDate.clone()
  while (currentDate.isSameOrBefore(endDate)) {
    timeline.push({
      date: currentDate.format('YYYY-MM-DD'),
      label: currentDate.format('MM/DD'),
      dayOfWeek: currentDate.format('dd'),
      width: ganttConfig.value.dayWidth,
      isWeekend: currentDate.day() === 0 || currentDate.day() === 6 // 周末
    })
    currentDate.add(1, 'day')
  }
  
  timelineData.value = timeline
  
  console.log('时间轴数据:', {
    startDate: ganttConfig.value.startDate.format('YYYY-MM-DD'),
    endDate: ganttConfig.value.endDate.format('YYYY-MM-DD'),
    totalDays: ganttConfig.value.totalDays,
    timelineLength: timeline.length
  })
}

// 获取甘特图条的样式
const getGanttBarStyle = (item, phase = 'development') => {
  if (!ganttConfig.value.startDate) {
    return { display: 'none' }
  }
  
  let startTime, endTime
  
  if (phase === 'development') {
    if (!item.planStartTime || !item.planCompleteTime) {
      console.log('缺少开发时间数据:', item.moduleName)
      return { display: 'none' }
    }
    startTime = item.planStartTime
    endTime = item.planCompleteTime
  } else if (phase === 'testing') {
    if (!item.testStartTime || !item.testCompleteTime) {
      console.log('缺少测试时间数据:', item.moduleName)
      return { display: 'none' }
    }
    startTime = item.testStartTime
    endTime = item.testCompleteTime
  }
  
  const startDate = moment(startTime)
  const endDate = moment(endTime)
  const ganttStartDate = ganttConfig.value.startDate
  
  // 计算位置和宽度（以天为单位）
  const daysDiff = startDate.diff(ganttStartDate, 'days')
  const duration = endDate.diff(startDate, 'days') + 1 // +1 包括开始天
  
  const left = daysDiff * ganttConfig.value.dayWidth
  const width = duration * ganttConfig.value.dayWidth
  
  // 根据阶段调整垂直位置
  let top = '50%'
  let transform = 'translateY(-50%)'
  
  if (phase === 'development') {
    top = '25%' // 开发阶段在上方
    transform = 'translateY(-50%)'
  } else if (phase === 'testing') {
    top = '75%' // 测试阶段在下方
    transform = 'translateY(-50%)'
  }
  
  console.log(`甘特条样式计算(${phase}):`, item.moduleName, {
    startDate: startDate.format('YYYY-MM-DD'),
    endDate: endDate.format('YYYY-MM-DD'),
    ganttStartDate: ganttStartDate.format('YYYY-MM-DD'),
    daysDiff,
    duration,
    left: `${left}px`,
    width: `${Math.max(width, ganttConfig.value.minWidth)}px`,
    top
  })
  
  return {
    left: `${left}px`,
    width: `${Math.max(width, ganttConfig.value.minWidth)}px`,
    top,
    transform
  }
}

// 获取甘特图条的样式类
const getGanttBarClass = (item) => {
  const classes = ['gantt-bar-item']
  
  // 根据状态添加不同的样式
  switch (item.state) {
    case 0:
      classes.push('gantt-bar-pending')
      break
    case 1:
      classes.push('gantt-bar-progress')
      break
    case 2:
      classes.push('gantt-bar-completed')
      break
    case 3:
      classes.push('gantt-bar-paused')
      break
    default:
      classes.push('gantt-bar-default')
  }
  
  // 根据层级添加样式
  if (item.level > 0) {
    classes.push('gantt-bar-child')
  }
  
  return classes
}

// 获取表格行的样式类
const getRowClassName = ({ row, rowIndex }) => {
  const classes = []
  if (row.level > 0) {
    classes.push('gantt-table-child-row')
  }
  if (selectedRowId.value === row.id) {
    classes.push('gantt-table-selected-row')
  }
  return classes.join(' ')
}

// 处理表格单元格点击
const handleTableCellClick = ({ row }) => {
  selectedRowId.value = row.id
}

// 处理甘特图行点击
const handleGanttRowClick = (item) => {
  selectedRowId.value = item.id
}
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

const switchView = (mode) => {
  viewMode.value = mode
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
  return date ? moment(date).format('MM-DD') : '-'
}

// 生命周期钩子
onMounted(() => {
  initExpandedKeys()
  initGanttTimeline()
})

// 监听数据变化
watch(() => props.modulesData, () => {
  initExpandedKeys()
  initGanttTimeline()
}, { deep: true })
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

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.module-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.expand-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.expand-icon:hover {
  background-color: #f0f0f0;
  border-radius: 2px;
}

.expand-icon-placeholder {
  width: 16px;
  height: 16px;
}

.expand-icon-open,
.expand-icon-close {
  font-size: 14px;
  color: #606266;
}

.module-icon {
  color: #409EFF;
}

.gantt-view {
  height: 500px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.gantt-container {
  display: flex;
  height: 100%;
}

.gantt-left {
  width: 400px;
  border-right: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.gantt-right {
  flex: 1;
  overflow-x: auto;
  background-color: #fafafa;
}

.gantt-chart-container {
  height: 100%;
  min-width: 800px;
  position: relative;
}

.gantt-header {
  height: 60px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #f5f7fa;
}

.gantt-timeline {
  display: flex;
  height: 100%;
  align-items: stretch;
}

.timeline-item {
  height: 100%;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #606266;
  font-weight: 500;
  min-width: 30px;
  padding: 4px 2px;
}

.timeline-weekend {
  background-color: #f0f0f0;
  color: #999;
}

.timeline-date {
  font-weight: 600;
  margin-bottom: 2px;
}

.timeline-day {
  font-size: 10px;
  color: #999;
}

.gantt-body {
  height: calc(100% - 60px);
  overflow-y: auto;
}

.gantt-row {
  height: 54px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
}

.gantt-row:hover {
  background-color: #f5f7fa;
}

.gantt-row-selected {
  background-color: #e3f2fd !important;
}

.gantt-bar-container {
  position: relative;
  height: 100%;
  width: 100%;
}

.gantt-bar {
  position: absolute;
  height: 18px;
  border-radius: 9px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.gantt-bar-development {
  background: linear-gradient(90deg, #409eff, #66b3ff) !important;
  border: 1px solid #337ecc;
}

.gantt-bar-testing {
  background: linear-gradient(90deg, #f56c6c, #f78989) !important;
  border: 1px solid #c45656;
}

.gantt-bar-content {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 8px;
  position: relative;
  z-index: 2;
}

.gantt-bar-text {
  color: white;
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* .gantt-bar-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.3);
  z-index: 1;
  transition: width 0.3s;
  border-radius: inherit;
} */

/* 不同状态的颜色 */
.gantt-bar-pending {
  background: linear-gradient(90deg, #909399, #b1b3b8);
}

.gantt-bar-progress {
  background: linear-gradient(90deg, #409eff, #66b3ff);
}

.gantt-bar-completed {
  background: linear-gradient(90deg, #67c23a, #85ce61);
}

.gantt-bar-paused {
  background: linear-gradient(90deg, #f56c6c, #f78989);
}

.gantt-bar-default {
  background: linear-gradient(90deg, #e6a23c, #eebe77);
}

/* 子级模块样式 */
.gantt-bar-child {
  height: 14px !important;
  opacity: 0.9;
}

.gantt-bar-child .gantt-bar-text {
  font-size: 9px;
}

/* 表格样式 */
.gantt-table-child-row {
  background-color: #fafbfc;
}

.gantt-table-selected-row {
  background-color: #e3f2fd !important;
}

.gantt-placeholder {
  text-align: center;
}

.table-view {
  height: 500px;
}
</style>