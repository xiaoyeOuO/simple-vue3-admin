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
              <el-button type="primary" @click="handleAddModule">
                <el-icon><Plus /></el-icon>
                新增模块
              </el-button>
            </div>
            
            <el-table :data="modulesData" border stripe style="width: 100%">
              <el-table-column type="index" label="序号" width="60" align="center" />
              <el-table-column prop="name" label="模块名称" min-width="200" />
              <el-table-column prop="code" label="模块编码" min-width="150" />
              <el-table-column prop="priority" label="优先级" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="getPriorityType(row.priority)">
                    {{ row.priorityName }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="getModuleStatusType(row.status)">
                    {{ row.statusName }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="progress" label="进度" width="120" align="center">
                <template #default="{ row }">
                  <el-progress :percentage="row.progress" :status="getProgressStatus(row.progress)" />
                </template>
              </el-table-column>
              <el-table-column prop="startDate" label="开始时间" width="120" />
              <el-table-column prop="endDate" label="结束时间" width="120" />
              <el-table-column label="操作" width="150" fixed="right" align="center">
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
              </el-table-column>
            </el-table>
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
            
            <el-table :data="tasksData" border stripe style="width: 100%">
              <el-table-column type="index" label="序号" width="60" align="center" />
              <el-table-column prop="title" label="任务标题" min-width="200" />
              <el-table-column prop="moduleName" label="所属模块" min-width="150" />
              <el-table-column prop="assignee" label="负责人" width="120" />
              <el-table-column prop="priority" label="优先级" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="getPriorityType(row.priority)">
                    {{ row.priorityName }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="getTaskStatusType(row.status)">
                    {{ row.statusName }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="startDate" label="开始时间" width="120" />
              <el-table-column prop="dueDate" label="截止时间" width="120" />
              <el-table-column prop="progress" label="完成进度" width="100" align="center">
                <template #default="{ row }">
                  {{ row.progress }}%
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right" align="center">
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
              </el-table-column>
            </el-table>
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
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'

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

// 模块数据
const modulesData = ref([
  {
    id: 1,
    name: '智能楼宇系统',
    code: 'MOD-001',
    priority: 1,
    priorityName: '高',
    status: 2,
    statusName: '进行中',
    progress: 75,
    startDate: '2024-01-20',
    endDate: '2024-04-20'
  },
  {
    id: 2,
    name: '安防监控系统',
    code: 'MOD-002',
    priority: 2,
    priorityName: '中',
    status: 1,
    statusName: '待开始',
    progress: 0,
    startDate: '2024-02-01',
    endDate: '2024-05-01'
  },
  {
    id: 3,
    name: '能源管理系统',
    code: 'MOD-003',
    priority: 3,
    priorityName: '低',
    status: 3,
    statusName: '已完成',
    progress: 100,
    startDate: '2024-01-15',
    endDate: '2024-02-15'
  }
])

// 任务数据
const tasksData = ref([
  {
    id: 1,
    title: '楼宇自动化系统开发',
    moduleName: '智能楼宇系统',
    assignee: '王工程师',
    priority: 1,
    priorityName: '高',
    status: 2,
    statusName: '进行中',
    startDate: '2024-01-20',
    dueDate: '2024-03-20',
    progress: 60
  },
  {
    id: 2,
    title: '监控摄像头安装',
    moduleName: '安防监控系统',
    assignee: '李技术员',
    priority: 2,
    priorityName: '中',
    status: 1,
    statusName: '待开始',
    startDate: '2024-02-01',
    dueDate: '2024-04-01',
    progress: 0
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
  const map = { 1: 'info', 2: 'primary', 3: 'success', 4: 'warning', 5: 'danger' }
  return map[status] || 'info'
}

const getBugStatusType = (status) => {
  const map = { 1: 'info', 2: 'primary', 3: 'success', 4: 'warning', 5: 'danger' }
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

// 返回
const handleBack = () => {
  router.push('/project/contract-list')
}

// 模块操作
const handleAddModule = () => {
  ElMessage.success('新增模块功能待实现')
}

const handleEditModule = (row) => {
  ElMessage.success(`编辑模块：${row.name}`)
}

const handleDeleteModule = (row) => {
  ElMessage.success(`删除模块：${row.name}`)
}

// 任务操作
const handleAddTask = () => {
  ElMessage.success('新增任务功能待实现')
}

const handleEditTask = (row) => {
  ElMessage.success(`编辑任务：${row.title}`)
}

const handleDeleteTask = (row) => {
  ElMessage.success(`删除任务：${row.title}`)
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