<template>
  <div class="contract-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-page-header @back="handleBack" :content="pageTitle" />
    </div>

    <!-- 项目基本信息卡片 -->
    <el-card class="base-info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span><i class="el-icon-info"></i> 合同项目基本信息</span>
        </div>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="项目名称">{{ projectInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="项目编码">{{ projectInfo.code }}</el-descriptions-item>
        <el-descriptions-item label="项目类型">{{ projectInfo.typeName }}</el-descriptions-item>
        <el-descriptions-item label="年度">{{ projectInfo.year }}</el-descriptions-item>
        <el-descriptions-item label="区域">{{ projectInfo.area }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(projectInfo.status)">
            {{ projectInfo.statusName }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="负责人">{{ projectInfo.managerName }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ projectInfo.createTime }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ projectInfo.description || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 标签页内容 -->
    <el-card class="content-card" shadow="hover">
      <el-tabs v-model="activeTab" class="detail-tabs">
        <!-- 模块列表 -->
        <el-tab-pane label="模块列表" name="modules">
          <div class="tab-content">
            <div class="tab-header">
              <div class="header-left">
                <el-button type="primary" @click="handleAddModule">
                  <el-icon><Plus /></el-icon>
                  新增模块
                </el-button>
              </div>
              <div class="header-right">
                <el-radio-group v-model="moduleViewType" size="small">
                  <el-radio-button label="tree">树形视图</el-radio-button>
                  <el-radio-button label="gantt">甘特图</el-radio-button>
                </el-radio-group>
              </div>
            </div>
            
            <!-- 树形视图 -->
            <vxe-table
              v-if="moduleViewType === 'tree'"
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
              <vxe-column field="planCompleteTime" title="计划完成时间" width="120">
                <template #default="{ row }">
                  {{ formatDate(row.planCompleteTime) }}
                </template>
              </vxe-column>
              <vxe-column field="sort" title="排序" width="80" align="center" />
              <vxe-column title="操作" width="150" fixed="right" align="center">
                <template #default="{ row }">
                  <el-button type="primary" link @click="handleEditModule(row)">
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  <el-button type="danger" link @click="handleDeleteModule(row)">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </template>
              </vxe-column>
            </vxe-table>

            <!-- 甘特图视图 -->
            <div v-else-if="moduleViewType === 'gantt'" class="gantt-container">
              <div ref="ganttChart" class="gantt-chart"></div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 任务列表 -->
        <el-tab-pane label="任务列表" name="tasks">
          <div class="tab-content">
            <div class="tab-header">
              <el-button type="primary" @click="handleAddTask">
                <el-icon><Plus /></el-icon>
                新增任务
              </el-button>
            </div>
            
            <vxe-table
              :data="tasksData"
              border
              stripe
              row-key
              :tree-config="{ children: 'children', expandAll: true }"
              height="500"
            >
              <vxe-column type="seq" title="序号" width="60" align="center" tree-node />
              <vxe-column field="title" title="任务标题" min-width="200" tree-node />
              <vxe-column field="moduleName" title="所属模块" min-width="150" />
              <vxe-column field="typeName" title="任务类型" width="100" align="center">
                <template #default="{ row }">
                  <el-tag type="info" size="small">
                    {{ row.typeName }}
                  </el-tag>
                </template>
              </vxe-column>
              <vxe-column field="assignee" title="处理人" width="120" />
              <vxe-column field="priority" title="优先级" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="getPriorityType(row.priority)" size="small">
                    {{ row.priorityName }}
                  </el-tag>
                </template>
              </vxe-column>
              <vxe-column field="status" title="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="getTaskStatusType(row.status)" size="small">
                    {{ row.statusName }}
                  </el-tag>
                </template>
              </vxe-column>
              <vxe-column field="startDate" title="开始时间" width="120" />
              <vxe-column field="endDate" title="结束时间" width="120" />
              <vxe-column field="progress" title="完成进度" width="100" align="center">
                <template #default="{ row }">
                  <el-progress 
                    :percentage="row.progress" 
                    :status="getProgressStatus(row.progress)"
                    :stroke-width="12"
                  />
                </template>
              </vxe-column>
              <vxe-column title="操作" width="150" fixed="right" align="center">
                <template #default="{ row }">
                  <el-button type="primary" link @click="handleEditTask(row)">
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  <el-button type="danger" link @click="handleDeleteTask(row)">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </template>
              </vxe-column>
            </vxe-table>
          </div>
        </el-tab-pane>

        <!-- 缺陷列表 -->
        <el-tab-pane label="缺陷列表" name="bugs">
          <div class="tab-content">
            <div class="tab-header">
              <el-button type="primary" @click="handleAddBug">
                <el-icon><Plus /></el-icon>
                新增缺陷
              </el-button>
            </div>
            
            <el-table :data="bugsData" border stripe style="width: 100%">
              <el-table-column type="index" label="序号" width="60" align="center" />
              <el-table-column prop="title" label="缺陷标题" min-width="200" />
              <el-table-column prop="moduleName" label="所属模块" min-width="150" />
              <el-table-column prop="severity" label="严重程度" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="getSeverityType(row.severity)">
                    {{ row.severityName }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="priority" label="优先级" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="getPriorityType(row.priority)">
                    {{ row.priorityName }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="getBugStatusType(row.status)">
                    {{ row.statusName }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="reporter" label="报告人" width="120" />
              <el-table-column prop="assignee" label="处理人" width="120" />
              <el-table-column prop="createDate" label="创建时间" width="120" />
              <el-table-column label="操作" width="150" fixed="right" align="center">
                <template #default="{ row }">
                  <el-button type="primary" link @click="handleEditBug(row)">
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  <el-button type="danger" link @click="handleDeleteBug(row)">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>

  <!-- 模块编辑抽屉 -->
  <module-edit
    v-model:visible="moduleEditVisible"
    :data="currentModule"
    :mode="moduleEditMode"
    :all-modules="modulesData"
    :project-id="projectId"
    @success="handleModuleSuccess"
  />

  <!-- 任务编辑抽屉 -->
  <task-edit
    v-model:visible="taskEditVisible"
    :data="currentTask"
    :mode="taskEditMode"
    :project-id="projectId"
    :module-tree-data="modulesData"
    @success="handleTaskSuccess"
  />
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Folder, Document } from '@element-plus/icons-vue'
import ModuleEdit from './moduleEdit.vue'
import TaskEdit from './taskEdit.vue'

const route = useRoute()
const router = useRouter()

// 项目ID
const projectId = computed(() => route.params.id)

// 页面标题
const pageTitle = computed(() => {
  return projectInfo.value?.name || '合同项目详情'
})

// 标签页控制
const activeTab = ref('modules')

// 项目信息
const projectInfo = ref({
  name: '智慧园区建设项目',
  code: 'CP-2024-001',
  typeName: '智慧建筑',
  year: '2024',
  area: '北京市',
  status: 1,
  statusName: '进行中',
  managerName: '张经理',
  createTime: '2024-01-15',
  description: '这是一个大型智慧园区建设项目，包含智能楼宇、安防监控、能源管理等多个子系统。'
})

// 模块编辑控制
const moduleEditVisible = ref(false)
const moduleEditMode = ref('add')
const currentModule = ref(null)

// 任务编辑控制
const taskEditVisible = ref(false)
const taskEditMode = ref('add')
const currentTask = ref(null)

// 模块视图控制
const moduleViewType = ref('tree')
const ganttChart = ref(null)
let ganttInstance = null

// 模块数据（树形结构）
const modulesData = ref([
  {
    id: 1,
    moduleName: '智能楼宇系统',
    softId: 'MOD-001',
    state: 1,
    briefIntroduction: '楼宇自动化控制系统，包含HVAC、照明、电梯等子系统',
    planCompleteTime: '2024-04-20',
    startTime: '2024-01-15',
    endTime: '2024-04-20',
    progress: 65,
    sort: 1,
    projectId: projectId.value,
    children: [
      {
        id: 11,
        moduleName: 'HVAC控制模块',
        softId: 'MOD-001-01',
        state: 1,
        briefIntroduction: '空调通风控制系统',
        planCompleteTime: '2024-03-15',
        startTime: '2024-01-20',
        endTime: '2024-03-15',
        progress: 80,
        sort: 1,
        parentId: 1,
        projectId: projectId.value,
        children: []
      },
      {
        id: 12,
        moduleName: '照明控制模块',
        softId: 'MOD-001-02',
        state: 2,
        briefIntroduction: '智能照明控制系统',
        planCompleteTime: '2024-03-30',
        startTime: '2024-02-01',
        endTime: '2024-03-30',
        progress: 100,
        sort: 2,
        parentId: 1,
        projectId: projectId.value,
        children: []
      },
      {
        id: 13,
        moduleName: '电梯控制模块',
        softId: 'MOD-001-03',
        state: 0,
        briefIntroduction: '电梯智能调度系统',
        planCompleteTime: '2024-04-10',
        startTime: '2024-02-15',
        endTime: '2024-04-10',
        progress: 0,
        sort: 3,
        parentId: 1,
        projectId: projectId.value,
        children: []
      }
    ]
  },
  {
    id: 2,
    moduleName: '安防监控系统',
    softId: 'MOD-002',
    state: 1,
    briefIntroduction: '视频监控、门禁控制、报警系统',
    planCompleteTime: '2024-05-01',
    startTime: '2024-02-01',
    endTime: '2024-05-01',
    progress: 45,
    sort: 2,
    projectId: projectId.value,
    children: [
      {
        id: 21,
        moduleName: '视频监控模块',
        softId: 'MOD-002-01',
        state: 1,
        briefIntroduction: '高清视频监控系统',
        planCompleteTime: '2024-04-15',
        startTime: '2024-02-05',
        endTime: '2024-04-15',
        progress: 60,
        sort: 1,
        parentId: 2,
        projectId: projectId.value,
        children: []
      },
      {
        id: 22,
        moduleName: '门禁控制模块',
        softId: 'MOD-002-02',
        state: 2,
        briefIntroduction: '智能门禁管理系统',
        planCompleteTime: '2024-03-25',
        startTime: '2024-02-10',
        endTime: '2024-03-25',
        progress: 100,
        sort: 2,
        parentId: 2,
        projectId: projectId.value,
        children: []
      },
      {
        id: 23,
        moduleName: '报警系统模块',
        softId: 'MOD-002-03',
        state: 0,
        briefIntroduction: '智能报警联动系统',
        planCompleteTime: '2024-04-30',
        startTime: '2024-03-01',
        endTime: '2024-04-30',
        progress: 20,
        sort: 3,
        parentId: 2,
        projectId: projectId.value,
        children: []
      }
    ]
  },
  {
    id: 3,
    moduleName: '能源管理系统',
    softId: 'MOD-003',
    state: 2,
    briefIntroduction: '能耗监测、分析、优化管理系统',
    planCompleteTime: '2024-02-15',
    startTime: '2024-01-10',
    endTime: '2024-02-15',
    progress: 100,
    sort: 3,
    projectId: projectId.value,
    children: []
  },
  {
    id: 4,
    moduleName: '网络基础设施',
    softId: 'MOD-004',
    state: 1,
    briefIntroduction: '网络布线、交换机、路由器等基础设施',
    planCompleteTime: '2024-03-20',
    startTime: '2024-01-25',
    endTime: '2024-03-20',
    progress: 75,
    sort: 4,
    projectId: projectId.value,
    children: []
  },
  {
    id: 5,
    moduleName: '数据中心建设',
    softId: 'MOD-005',
    state: 0,
    briefIntroduction: '服务器机房、存储系统、备份系统',
    planCompleteTime: '2024-06-30',
    startTime: '2024-03-01',
    endTime: '2024-06-30',
    progress: 10,
    sort: 5,
    projectId: projectId.value,
    children: [
      {
        id: 51,
        moduleName: '服务器部署',
        softId: 'MOD-005-01',
        state: 0,
        briefIntroduction: '服务器硬件安装配置',
        planCompleteTime: '2024-05-15',
        startTime: '2024-03-10',
        endTime: '2024-05-15',
        progress: 15,
        sort: 1,
        parentId: 5,
        projectId: projectId.value,
        children: []
      },
      {
        id: 52,
        moduleName: '存储系统',
        softId: 'MOD-005-02',
        state: 0,
        briefIntroduction: '存储阵列配置部署',
        planCompleteTime: '2024-06-15',
        startTime: '2024-04-01',
        endTime: '2024-06-15',
        progress: 5,
        sort: 2,
        parentId: 5,
        projectId: projectId.value,
        children: []
      }
    ]
  }
])

// 任务数据（树形结构）
const tasksData = ref([
  {
    id: 1,
    title: '楼宇自动化系统开发',
    moduleName: '智能楼宇系统',
    assignee: '王工程师',
    assigneeUserId: 2,
    priority: 1,
    priorityName: '高',
    status: 2,
    statusName: '进行中',
    startDate: '2024-01-20',
    endDate: '2024-03-20',
    dueDate: '2024-03-20',
    progress: 60,
    typeKey: 1,
    typeName: '需求开发',
    parentId: null,
    content: '开发楼宇自动化系统的核心功能模块',
    children: [
      {
        id: 11,
        title: 'HVAC控制模块开发',
        moduleName: '智能楼宇系统',
        assignee: '张开发',
        assigneeUserId: 4,
        priority: 1,
        priorityName: '高',
        status: 2,
        statusName: '进行中',
        startDate: '2024-01-20',
        endDate: '2024-02-15',
        dueDate: '2024-02-15',
        progress: 80,
        typeKey: 1,
        typeName: '需求开发',
        parentId: 1,
        content: '开发HVAC温湿度控制模块'
      },
      {
        id: 12,
        title: '照明控制模块开发',
        moduleName: '智能楼宇系统',
        assignee: '李开发',
        assigneeUserId: 5,
        priority: 2,
        priorityName: '中',
        status: 1,
        statusName: '待开始',
        startDate: '2024-01-25',
        endDate: '2024-02-20',
        dueDate: '2024-02-20',
        progress: 0,
        typeKey: 1,
        typeName: '需求开发',
        parentId: 1,
        content: '开发智能照明控制模块'
      }
    ]
  },
  {
    id: 2,
    title: '监控摄像头安装',
    moduleName: '安防监控系统',
    assignee: '李技术员',
    assigneeUserId: 3,
    priority: 2,
    priorityName: '中',
    status: 1,
    statusName: '待开始',
    startDate: '2024-02-01',
    endDate: '2024-04-01',
    dueDate: '2024-04-01',
    progress: 0,
    typeKey: 3,
    typeName: '测试任务',
    parentId: null,
    content: '完成监控摄像头的安装和调试工作',
    children: [
      {
        id: 21,
        title: '摄像头点位勘察',
        moduleName: '安防监控系统',
        assignee: '王勘察',
        assigneeUserId: 6,
        priority: 1,
        priorityName: '高',
        status: 2,
        statusName: '进行中',
        startDate: '2024-02-01',
        endDate: '2024-02-10',
        dueDate: '2024-02-10',
        progress: 50,
        typeKey: 2,
        typeName: '调研任务',
        parentId: 2,
        content: '完成所有摄像头安装点位的现场勘察'
      }
    ]
  }
])

// 缺陷数据
const bugsData = ref([
  {
    id: 1,
    title: '楼宇系统响应延迟',
    moduleName: '智能楼宇系统',
    severity: 2,
    severityName: '严重',
    priority: 1,
    priorityName: '高',
    status: 1,
    statusName: '新建',
    reporter: '测试人员A',
    assignee: '王工程师',
    createDate: '2024-02-10'
  },
  {
    id: 2,
    title: '监控画面显示异常',
    moduleName: '安防监控系统',
    severity: 3,
    severityName: '一般',
    priority: 2,
    priorityName: '中',
    status: 2,
    statusName: '处理中',
    reporter: '测试人员B',
    assignee: '李技术员',
    createDate: '2024-02-12'
  }
])

// 样式方法
const getStatusType = (status) => {
  const map = { 1: 'primary', 2: 'success', 3: 'warning', 4: 'danger', 5: 'info' }
  return map[status] || 'info'
}

const getPriorityType = (priority) => {
  const map = { 1: 'danger', 2: 'warning', 3: 'info' }
  return map[priority] || 'info'
}

const getModuleStatusType = (status) => {
  const map = { 1: 'info', 2: 'primary', 3: 'success', 4: 'danger' }
  return map[status] || 'info'
}

const getTaskStatusType = (status) => {
  const map = { 
    1: 'info',      // 待开始
    2: 'primary',   // 进行中
    3: 'success',   // 已完成
    4: 'warning',   // 已暂停
    5: 'danger'     // 已取消
  }
  return map[status] || 'info'
}

const getBugStatusType = (status) => {
  const map = { 
    1: 'info',      // 新建
    2: 'primary',   // 处理中
    3: 'success',   // 已解决
    4: 'warning',   // 重新打开
    5: 'danger'     // 已关闭
  }
  return map[status] || 'info'
}

const getSeverityType = (severity) => {
  const map = { 1: 'danger', 2: 'warning', 3: 'info' }
  return map[severity] || 'info'
}

const getProgressStatus = (progress) => {
  if (progress === 100) return 'success'
  if (progress >= 50) return 'primary'
  return 'warning'
}

// 模块状态方法
const getStateType = (state) => {
  const map = { 0: 'info', 1: 'primary', 2: 'success', 3: 'warning', 4: 'danger' }
  return map[state] || 'info'
}

const getStateName = (state) => {
  const map = { 0: '待开始', 1: '进行中', 2: '已完成', 3: '已暂停', 4: '已取消' }
  return map[state] || '未知'
}

// 工具方法
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

// 甘特图相关方法
const initGanttChart = () => {
  if (!ganttChart.value) return

  // 扁平化模块数据用于甘特图
  const ganttData = []
  const flattenModules = (items, level = 0) => {
    items.forEach(item => {
      ganttData.push({
        id: item.id.toString(),
        label: item.moduleName,
        start: new Date(item.startTime).getTime(),
        end: new Date(item.endTime).getTime(),
        progress: item.progress / 100,
        type: 'task',
        level: level,
        description: item.briefIntroduction,
        state: item.state,
        children: item.children || []
      })
      if (item.children && item.children.length) {
        flattenModules(item.children, level + 1)
      }
    })
  }
  
  flattenModules(modulesData.value)

  // 创建甘特图配置
  const config = {
    headerHeight: 50,
    rowHeight: 40,
    barHeight: 30,
    handleWidth: 8,
    timeStart: new Date('2024-01-01').getTime(),
    timeEnd: new Date('2024-07-01').getTime(),
    timeUnit: 'day',
    timeFormat: 'YYYY-MM-DD',
    tasks: ganttData,
    onTaskClick: (task) => {
      console.log('Task clicked:', task)
    }
  }

  // 创建甘特图实例
  if (ganttInstance) {
    ganttInstance.destroy()
  }
  
  // 使用简单的甘特图实现
  renderSimpleGantt(ganttData)
}

const renderSimpleGantt = (tasks) => {
  const container = ganttChart.value
  if (!container) return

  // 清空容器
  container.innerHTML = ''

  // 创建甘特图容器
  const ganttContainer = document.createElement('div')
  ganttContainer.className = 'simple-gantt'
  ganttContainer.style.cssText = `
    width: 100%;
    height: 500px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    overflow: auto;
  `

  // 创建表头
  const header = document.createElement('div')
  header.className = 'gantt-header'
  header.style.cssText = `
    display: flex;
    border-bottom: 1px solid #e4e7ed;
    background: #f5f7fa;
    font-weight: bold;
  `

  // 任务列表列
  const taskListHeader = document.createElement('div')
  taskListHeader.style.cssText = `
    width: 300px;
    padding: 12px;
    border-right: 1px solid #e4e7ed;
  `
  taskListHeader.textContent = '模块名称'
  header.appendChild(taskListHeader)

  // 时间轴
  const timelineHeader = document.createElement('div')
  timelineHeader.style.cssText = `
    flex: 1;
    display: flex;
    overflow-x: auto;
  `

  // 生成时间轴
  const startDate = new Date('2024-01-01')
  const endDate = new Date('2024-07-01')
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
  
  for (let i = 0; i < days; i += 7) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
    const dayHeader = document.createElement('div')
    dayHeader.style.cssText = `
      min-width: 100px;
      padding: 12px;
      border-right: 1px solid #e4e7ed;
      text-align: center;
      font-size: 12px;
    `
    dayHeader.textContent = date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    timelineHeader.appendChild(dayHeader)
  }

  header.appendChild(timelineHeader)
  ganttContainer.appendChild(header)

  // 创建任务行
  tasks.forEach(task => {
    const row = document.createElement('div')
    row.style.cssText = `
      display: flex;
      border-bottom: 1px solid #e4e7ed;
      height: 40px;
      align-items: center;
    `

    // 任务名称
    const taskName = document.createElement('div')
    taskName.style.cssText = `
      width: 300px;
      padding: 8px 12px;
      border-right: 1px solid #e4e7ed;
      font-size: 14px;
      padding-left: ${12 + task.level * 20}px;
    `
    taskName.textContent = task.label
    row.appendChild(taskName)

    // 任务条
    const timeline = document.createElement('div')
    timeline.style.cssText = `
      flex: 1;
      position: relative;
      height: 100%;
      background: repeating-linear-gradient(
        90deg,
        #f9fafb,
        #f9fafb 99px,
        #e4e7ed 99px,
        #e4e7ed 100px
      );
    `

    const startDate = new Date('2024-01-01')
    const taskStart = new Date(task.start)
    const taskEnd = new Date(task.end)
    
    const startOffset = Math.ceil((taskStart - startDate) / (1000 * 60 * 60 * 24))
    const duration = Math.ceil((taskEnd - taskStart) / (1000 * 60 * 60 * 24))
    
    const taskBar = document.createElement('div')
    taskBar.style.cssText = `
      position: absolute;
      left: ${startOffset * 14.28}px;
      width: ${duration * 14.28}px;
      top: 8px;
      height: 24px;
      background: ${getTaskColor(task.progress, task.state)};
      border-radius: 12px;
      border: 1px solid ${getTaskBorderColor(task.state)};
      color: white;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
    `
    taskBar.textContent = `${Math.round(task.progress * 100)}%`
    taskBar.title = `${task.label}: ${taskStart.toLocaleDateString()} - ${taskEnd.toLocaleDateString()}`
    
    taskBar.addEventListener('mouseenter', () => {
      taskBar.style.opacity = '0.8'
    })
    taskBar.addEventListener('mouseleave', () => {
      taskBar.style.opacity = '1'
    })
    
    timeline.appendChild(taskBar)
    row.appendChild(timeline)
    ganttContainer.appendChild(row)
  })

  container.appendChild(ganttContainer)
}

const getTaskColor = (progress, state) => {
  const colors = {
    0: '#909399', // 待开始
    1: '#409EFF', // 进行中
    2: '#67C23A', // 已完成
    3: '#E6A23C', // 已暂停
    4: '#F56C6C'  // 已取消
  }
  return colors[state] || '#409EFF'
}

const getTaskBorderColor = (state) => {
  const colors = {
    0: '#606266',
    1: '#1890ff',
    2: '#52c41a',
    3: '#faad14',
    4: '#ff4d4f'
  }
  return colors[state] || '#1890ff'
}

// 监听视图切换
watch(moduleViewType, (newType) => {
  if (newType === 'gantt') {
    nextTick(() => {
      initGanttChart()
    })
  }
})

const getLevel = (row) => {
  let level = 0
  let current = row
  while (current.parentId) {
    level++
    current = modulesData.value.find(m => m.id === current.parentId) || {}
  }
  return level
}

// 扁平化模块数据（用于父模块选择）
const flatModules = computed(() => {
  const result = []
  const flatten = (items) => {
    items.forEach(item => {
      result.push(item)
      if (item.children && item.children.length) {
        flatten(item.children)
      }
    })
  }
  flatten(modulesData.value)
  return result
})

// 返回
const handleBack = () => {
  router.push('/project/contract-list')
}

// 模块操作
const handleAddModule = () => {
  moduleEditMode.value = 'add'
  currentModule.value = null
  moduleEditVisible.value = true
}

const handleEditModule = (row) => {
  moduleEditMode.value = 'edit'
  currentModule.value = row
  moduleEditVisible.value = true
}

const handleDeleteModule = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认删除模块 "${row.moduleName}" 吗？删除后其子模块也会被删除。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟删除操作
    const deleteModule = (items, id) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
          items.splice(i, 1)
          return true
        }
        if (items[i].children && items[i].children.length) {
          if (deleteModule(items[i].children, id)) {
            return true
          }
        }
      }
      return false
    }
    
    deleteModule(modulesData.value, row.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 模块编辑成功回调
const handleModuleSuccess = (moduleData) => {
  if (moduleEditMode.value === 'add') {
    // 新增模块
    const newModule = {
      ...moduleData,
      id: Date.now(), // 临时ID
      children: []
    }
    
    if (newModule.parentId) {
      // 添加到父模块的子模块中
      const addToParent = (items) => {
        for (let item of items) {
          if (item.id === newModule.parentId) {
            item.children.push(newModule)
            return true
          }
          if (item.children && item.children.length) {
            if (addToParent(item.children)) {
              return true
            }
          }
        }
        return false
      }
      addToParent(modulesData.value)
    } else {
      // 添加到顶级模块
      modulesData.value.push(newModule)
    }
  } else {
    // 编辑模块
    const updateModule = (items) => {
      for (let item of items) {
        if (item.id === moduleData.id) {
          Object.assign(item, moduleData)
          return true
        }
        if (item.children && item.children.length) {
          if (updateModule(item.children)) {
            return true
          }
        }
      }
      return false
    }
    updateModule(modulesData.value)
  }
  
  ElMessage.success(moduleEditMode.value === 'add' ? '新增成功' : '更新成功')
}

// 任务操作
const handleAddTask = () => {
  taskEditMode.value = 'add'
  currentTask.value = null
  taskEditVisible.value = true
}

const handleEditTask = (row) => {
  taskEditMode.value = 'edit'
  currentTask.value = row
  taskEditVisible.value = true
}

const handleDeleteTask = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认删除任务 "${row.title}" 吗？删除后无法恢复。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟删除操作
    const index = tasksData.value.findIndex(task => task.id === row.id)
    if (index > -1) {
      tasksData.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 任务编辑成功回调
const handleTaskSuccess = (taskData) => {
  if (taskEditMode.value === 'add') {
    // 新增任务
    tasksData.value.push(taskData)
  } else {
    // 编辑任务
    const index = tasksData.value.findIndex(task => task.id === taskData.id)
    if (index > -1) {
      tasksData.value[index] = { ...tasksData.value[index], ...taskData }
    }
  }
  
  ElMessage.success(taskEditMode.value === 'add' ? '创建成功' : '更新成功')
}

// 缺陷操作
const handleAddBug = () => {
  ElMessage.success('新增缺陷功能待实现')
}

const handleEditBug = (row) => {
  ElMessage.success(`编辑缺陷：${row.title}`)
}

const handleDeleteBug = (row) => {
  ElMessage.success(`删除缺陷：${row.title}`)
}

// 初始化
onMounted(() => {
  console.log('合同项目详情页面，项目ID:', projectId.value)
})
</script>

<style scoped>
.contract-detail-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
}

.base-info-card {
  margin-bottom: 20px;
}

.content-card {
  margin-bottom: 20px;
}

.tab-content {
  padding: 20px 0;
}

.tab-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.module-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.module-icon {
  font-size: 16px;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-card__header) {
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: #ebeef5;
}
</style>

<style scoped>
.simple-gantt {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.gantt-header {
  position: sticky;
  top: 0;
  z-index: 10;
}

.simple-gantt > div:last-child {
  border-bottom: none;
}

.simple-gantt::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.simple-gantt::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.simple-gantt::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.simple-gantt::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>