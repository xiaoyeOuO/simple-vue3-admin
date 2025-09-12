<template>
  <div class="personal-home">
    <!-- 头部信息 -->
    <div class="header-section">
      <div class="user-info">
        <el-avatar :size="80" :src="userInfo.avatar" class="user-avatar">
          {{ userInfo.name.charAt(0) }}
        </el-avatar>
        <div class="user-details">
          <h2>{{ userInfo.name }}</h2>
          <p class="position">{{ userInfo.position }}</p>
          <p class="department">{{ userInfo.department }}</p>
        </div>
      </div>
      <div class="stats-overview">
        <div class="stat-item">
          <div class="stat-value">{{ userStats.taskTotal }}</div>
          <div class="stat-label">任务总数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ userStats.defectTotal }}</div>
          <div class="stat-label">缺陷总数</div>
        </div>
      </div>
    </div>

    <!-- 数值面板 -->
    <div class="panels-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-panel">
            <div class="panel-icon">
              <el-icon><Folder /></el-icon>
            </div>
            <div class="panel-content">
              <div class="panel-number">{{ userStats.projectCount }}</div>
              <div class="panel-title">参与项目个数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-panel">
            <div class="panel-icon">
              <el-icon><Check /></el-icon>
            </div>
            <div class="panel-content">
              <div class="panel-number">{{ userStats.completedTasks }}/{{ userStats.totalTasks }}</div>
              <div class="panel-title">任务完成情况</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-panel">
            <div class="panel-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="panel-content">
              <div class="panel-number">{{ userStats.workHours }}h</div>
              <div class="panel-title">登记工时</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-panel">
            <div class="panel-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="panel-content">
              <div class="panel-number">{{ userStats.requirementCount }}</div>
              <div class="panel-title">需求处理情况</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 我的任务列表 -->
    <div class="task-section">
      <div class="section-header">
        <h3>我的任务列表</h3>
        <el-button type="primary" @click="refreshTasks">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
      
      <div class="task-table">
        <vxe-table
          ref="taskTable"
          :data="taskList"
          :tree-config="{ children: 'children', expandAll: true }"
          :loading="loading"
          height="500"
          border
          stripe
          resizable
        >
          <vxe-column type="seq" width="60" title="序号" />
          <vxe-column field="name" title="任务名称" tree-node min-width="200" />
          <vxe-column field="status" title="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </vxe-column>
          <vxe-column field="priority" title="优先级" width="100">
            <template #default="{ row }">
              <el-tag :type="getPriorityType(row.priority)" effect="plain">
                {{ getPriorityText(row.priority) }}
              </el-tag>
            </template>
          </vxe-column>
          <vxe-column field="progress" title="进度" width="120">
            <template #default="{ row }">
              {{ row.progress }}%
            </template>
          </vxe-column>
          <vxe-column field="deadline" title="截止日期" width="120" />
          <vxe-column title="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                size="small"
                @click="viewTaskDetail(row)"
              >
                查看详情
              </el-button>
            </template>
          </vxe-column>
        </vxe-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const loading = ref(false)
const taskTable = ref()

// 用户信息
const userInfo = reactive({
  id: '',
  name: '张三',
  position: '高级前端工程师',
  department: '研发部',
  avatar: ''
})

// 用户统计
const userStats = reactive({
  taskTotal: 28,
  defectTotal: 5,
  projectCount: 8,
  completedTasks: 22,
  totalTasks: 28,
  workHours: 168,
  requirementCount: 15
})

// 任务列表
const taskList = ref([
  {
    id: 1,
    name: '项目A任务',
    status: 'in_progress',
    priority: 'high',
    progress: 75,
    assignee: '张三',
    deadline: '2024-01-15',
    children: [
      {
        id: 11,
        name: '需求分析',
        status: 'completed',
        priority: 'high',
        progress: 100,
        assignee: '张三',
        deadline: '2024-01-10'
      },
      {
        id: 12,
        name: '前端开发',
        status: 'in_progress',
        priority: 'high',
        progress: 80,
        assignee: '张三',
        deadline: '2024-01-15'
      },
      {
        id: 13,
        name: '测试验证',
        status: 'pending',
        priority: 'medium',
        progress: 30,
        assignee: '张三',
        deadline: '2024-01-20'
      }
    ]
  },
  {
    id: 2,
    name: '项目B优化',
    status: 'completed',
    priority: 'medium',
    progress: 100,
    assignee: '张三',
    deadline: '2024-01-08',
    children: [
      {
        id: 21,
        name: '性能优化',
        status: 'completed',
        priority: 'high',
        progress: 100,
        assignee: '张三',
        deadline: '2024-01-05'
      },
      {
        id: 22,
        name: 'UI改进',
        status: 'completed',
        priority: 'medium',
        progress: 100,
        assignee: '张三',
        deadline: '2024-01-08'
      }
    ]
  },
  {
    id: 3,
    name: '项目C新功能',
    status: 'pending',
    priority: 'low',
    progress: 0,
    assignee: '张三',
    deadline: '2024-01-25',
    children: [
      {
        id: 31,
        name: '技术调研',
        status: 'pending',
        priority: 'medium',
        progress: 0,
        assignee: '张三',
        deadline: '2024-01-12'
      }
    ]
  }
])



// 状态相关方法
const getStatusType = (status) => {
  const map = {
    'completed': 'success',
    'in_progress': 'primary',
    'pending': 'warning'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    'completed': '已完成',
    'in_progress': '进行中',
    'pending': '待处理'
  }
  return map[status] || status
}

const getPriorityType = (priority) => {
  const map = {
    'high': 'danger',
    'medium': 'warning',
    'low': 'info'
  }
  return map[priority] || 'info'
}

const getPriorityText = (priority) => {
  const map = {
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return map[priority] || priority
}

// 方法
const refreshTasks = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('任务列表已刷新')
  }, 1000)
}

const viewTaskDetail = (row) => {
  ElMessage.info(`查看任务详情: ${row.name}`)
}

const fetchUserData = () => {
  const userId = route.params.id
  if (userId) {
    userInfo.id = userId
    // 这里可以根据用户ID获取真实数据
  }
}

onMounted(() => {
  fetchUserData()
})
</script>

<style scoped>
.personal-home {
  padding: 20px;
}

.header-section {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-avatar {
  flex-shrink: 0;
}

.user-details h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
}

.user-details .position {
  margin: 0 0 4px 0;
  color: #409EFF;
  font-size: 16px;
  font-weight: 500;
}

.user-details .department {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.stats-overview {
  display: flex;
  gap: 40px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.panels-section {
  margin-bottom: 20px;
}

.stat-panel {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.stat-panel:hover {
  transform: translateY(-2px);
}

.panel-icon {
  width: 60px;
  height: 60px;
  background: #f0f9ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409EFF;
  font-size: 30px;
}

.panel-content {
  flex: 1;
}

.panel-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.panel-title {
  font-size: 14px;
  color: #909399;
}

.task-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.task-table {
  height: 500px;
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  
  .stats-overview {
    width: 100%;
    justify-content: space-around;
  }
  
  .panels-section .el-col {
    margin-bottom: 15px;
  }
}
</style>