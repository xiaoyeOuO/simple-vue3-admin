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
          <!-- 项目看板 -->
          <el-tab-pane label="项目看板" name="dashboard">
            <dashboard-pane 
              ref="dashboardRef"
              :bugs-data="bugsData"
              :tasks-data="tasksData"
              :project-id="projectId"
            />
          </el-tab-pane>

          <!-- 模块列表 -->
          <el-tab-pane label="模块列表" name="modules">
            <module-pane 
              :modules-data="modulesData"
              :project-id="projectId"
              @module-success="handleModuleSuccess"
            />
          </el-tab-pane>

          <!-- 任务列表 -->
          <el-tab-pane label="任务列表" name="tasks">
            <task-pane 
              :tasks-data="tasksData"
              :modules-data="modulesData"
              :project-id="projectId"
              @task-success="handleTaskSuccess"
            />
          </el-tab-pane>

          <!-- 缺陷列表 -->
          <el-tab-pane label="缺陷列表" name="bugs">
            <bug-pane 
              :bugs-data="bugsData"
              :modules-data="modulesData"
              :project-id="projectId"
            />
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
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Folder, Document } from '@element-plus/icons-vue'
import ModulePane from './module/modulePane.vue'
import TaskPane from './task/taskPane.vue'
import BugPane from './bug/bugPane.vue'
import DashboardPane from './dashboard/dashboardPane.vue'

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
const dashboardRef = ref()

// 监听标签页切换
watch(activeTab, (newTab) => {
  if (newTab === 'dashboard' && dashboardRef.value) {
    // 延迟执行确保DOM已经渲染完成
    setTimeout(() => {
      dashboardRef.value.forceResize()
    }, 100)
  }
})

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

// 模块编辑相关状态
const moduleEditVisible = ref(false)
const moduleEditMode = ref('add')
const currentModule = ref(null)

// 任务编辑相关状态
const taskEditVisible = ref(false)
const taskEditMode = ref('add')
const currentTask = ref(null)



// 模块数据（树形结构）
const modulesData = ref([
  {
    id: 1,
    moduleName: '智能楼宇系统',
    softId: 'MOD-001',
    state: 1,
    briefIntroduction: '楼宇自动化控制系统，包含HVAC、照明、电梯等子系统',
    planStartTime: '2024-01-15',
    planCompleteTime: '2024-04-20',
    sort: 1,
    projectId: projectId.value,
    statistic: {
      allCount: 8,
      allTask: [
        {
          id: 101,
          title: 'HVAC控制器开发',
          assignee: '张工程师',
          status: 2,
          statusName: '进行中',
          priority: 1,
          priorityName: '高',
          progress: 75,
          children: [
            {
              id: 1011,
              title: '温度传感器集成',
              assignee: '李开发',
              status: 3,
              statusName: '已完成',
              priority: 2,
              priorityName: '中',
              progress: 100
            }
          ]
        },
        {
          id: 102,
          title: '照明系统开发',
          assignee: '赵工程师',
          status: 1,
          statusName: '待开始',
          priority: 2,
          priorityName: '中',
          progress: 0
        }
      ],
      userCount: 5,
      allUser: [
        { userName: '张工程师', role: '主要负责人', taskCount: 3, totalHours: 45 },
        { userName: '李开发', role: '开发工程师', taskCount: 2, totalHours: 25 },
        { userName: '赵工程师', role: '开发工程师', taskCount: 2, totalHours: 30 }
      ],
      allWorkingHours: 120,
      allWorkingHoursDetails: [
        { userName: '张工程师', taskName: 'HVAC控制器开发', hours: 45, date: '2024-01-15' },
        { userName: '李开发', taskName: '温度传感器集成', hours: 25, date: '2024-01-10' },
        { userName: '赵工程师', taskName: '照明系统开发', hours: 30, date: '2024-01-20' }
      ]
    },
    children: [
      {
        id: 11,
        moduleName: 'HVAC控制模块',
        softId: 'MOD-001-01',
        state: 1,
        briefIntroduction: '空调通风控制系统',
        planStartTime: '2024-01-20',
        planCompleteTime: '2024-03-15',
        sort: 1,
        parentId: 1,
        projectId: projectId.value,
        statistic: {
          allCount: 5,
          allTask: [
            {
              id: 111,
              title: '温度传感器集成',
              assignee: '李开发',
              status: 3,
              statusName: '已完成',
              priority: 2,
              priorityName: '中',
              progress: 100
            }
          ],
          userCount: 3,
          allUser: [
            { userName: '李开发', role: '开发工程师', taskCount: 2, totalHours: 25 }
          ],
          allWorkingHours: 45,
          allWorkingHoursDetails: [
            { userName: '李开发', taskName: '温度传感器集成', hours: 25, date: '2024-01-10' }
          ]
        },
        children: []
      },
      {
        id: 12,
        moduleName: '照明控制模块',
        softId: 'MOD-001-02',
        state: 2,
        briefIntroduction: '智能照明控制系统',
        planStartTime: '2024-02-01',
        planCompleteTime: '2024-03-30',
        sort: 2,
        parentId: 1,
        projectId: projectId.value,
        statistic: {
          allCount: 3,
          allTask: [
            {
              id: 121,
              title: '照明控制器开发',
              assignee: '赵工程师',
              status: 1,
              statusName: '待开始',
              priority: 2,
              priorityName: '中',
              progress: 0
            }
          ],
          userCount: 2,
          allUser: [
            { userName: '赵工程师', role: '开发工程师', taskCount: 2, totalHours: 30 }
          ],
          allWorkingHours: 30,
          allWorkingHoursDetails: [
            { userName: '赵工程师', taskName: '照明控制器开发', hours: 30, date: '2024-01-20' }
          ]
        },
        children: []
      }
    ]
  },
  {
    id: 2,
    moduleName: '安防监控系统',
    softId: 'MOD-002',
    state: 0,
    briefIntroduction: '视频监控、门禁控制、报警系统',
    planStartTime: '2024-02-15',
    planCompleteTime: '2024-05-01',
    sort: 2,
    projectId: projectId.value,
    statistic: {
      allCount: 6,
      allTask: [
        {
          id: 201,
          title: '监控摄像头安装',
          assignee: '孙工程师',
          status: 2,
          statusName: '进行中',
          priority: 1,
          priorityName: '高',
          progress: 40
        }
      ],
      userCount: 4,
      allUser: [
        { userName: '孙工程师', role: '主要负责人', taskCount: 3, totalHours: 50 }
      ],
      allWorkingHours: 85,
      allWorkingHoursDetails: [
        { userName: '孙工程师', taskName: '监控摄像头安装', hours: 50, date: '2024-02-01' }
      ]
    },
    children: []
  },
  {
    id: 3,
    moduleName: '能源管理系统',
    softId: 'MOD-003',
    state: 2,
    briefIntroduction: '能耗监测、分析、优化管理系统',
    planStartTime: '2024-01-05',
    planCompleteTime: '2024-02-15',
    sort: 3,
    projectId: projectId.value,
    statistic: {
      allCount: 0,
      allTask: [],
      userCount: 0,
      allUser: [],
      allWorkingHours: 0,
      allWorkingHoursDetails: []
    },
    children: []
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

// 状态类型映射
const getStatusType = (status) => {
  const statusMap = {
    0: 'info',    // 待开始
    1: 'primary', // 进行中
    2: 'warning', // 暂停
    3: 'success', // 已完成
    4: 'danger'   // 已取消
  }
  return statusMap[status] || 'info'
}

// 优先级类型映射
const getPriorityType = (priority) => {
  const priorityMap = {
    1: 'danger',  // 高
    2: 'warning', // 中
    3: 'info'     // 低
  }
  return priorityMap[priority] || 'info'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}



// 返回
const handleBack = () => {
  router.push('/project/contract-list')
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