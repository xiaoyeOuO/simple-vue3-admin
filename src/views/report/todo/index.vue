<template>
  <div class="todo-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>我的待办</h2>
      <p class="page-desc">查看需要填写的日报、周报、月报任务</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="stat-card daily" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ dailyCount }}</div>
                <div class="stat-label">待填日报</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card weekly" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ weeklyCount }}</div>
                <div class="stat-label">待填周报</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card monthly" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ monthlyCount }}</div>
                <div class="stat-label">待填月报</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <el-card shadow="never">
        <el-row :gutter="20" align="middle">
          <el-col :span="6">
            <el-select v-model="filterType" placeholder="报表类型" clearable>
            <el-option label="日报" :value="1" />
            <el-option label="周报" :value="2" />
            <el-option label="月报" :value="3" />
          </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filterStatus" placeholder="状态" clearable>
              <el-option label="待填写" value="pending" />
              <el-option label="已逾期" value="overdue" />
              <el-option label="即将到期" value="upcoming" />
            </el-select>
          </el-col>
          <el-col :span="8">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索项目名称"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="handleSearch">
              搜索
            </el-button>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 待办列表 -->
    <div class="todo-list">
      <el-card shadow="never">
        <el-table
          :data="filteredTodos"
          style="width: 100%"
          v-loading="loading"
        >
          <el-table-column type="index" width="60" label="#" />
          <el-table-column prop="title" label="任务名称" min-width="200">
            <template #default="{ row }">
              <div class="task-title">
                <el-tag :type="row.type === 1 ? 'success' : row.type === 2 ? 'primary' : 'warning'" size="small">
                  {{ row.type === 1 ? '日报' : row.type === 2 ? '周报' : '月报' }}
                </el-tag>
                <span class="title-text">{{ row.title }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="project" label="所属项目" width="150" />
          <el-table-column prop="deadline" label="截止日期" width="120">
            <template #default="{ row }">
              <span :class="getDeadlineClass(row.deadline)">
                {{ formatDate(row.deadline) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="priority" label="优先级" width="100">
            <template #default="{ row }">
              <el-tag :type="getPriorityTag(row.priority)">
                {{ getPriorityText(row.priority) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="handleFill(row)"
                :disabled="row.status === 'completed'"
              >
                填写
              </el-button>
              <el-button size="small" @click="handleRemind(row)">
                提醒
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && filteredTodos.length === 0" class="empty-state">
      <el-empty
        image="/empty.svg"
        description="暂无待办任务"
      >
        <el-button type="primary" @click="handleRefresh">
          刷新
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Calendar, Search, Warning, Clock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 筛选条件
const filterType = ref('')
const filterStatus = ref('')
const searchKeyword = ref('')

// 待办任务数据
const todoList = ref([
  {
    id: 1,
    title: '2024-01-15 开发日报',
    type: 1,
    project: 'Vue3管理系统',
    deadline: '2024-01-15',
    priority: 'high',
    status: 'pending'
  },
  {
    id: 2,
    title: '第3周周报',
    type: 2,
    project: 'React电商后台',
    deadline: '2024-01-21',
    priority: 'medium',
    status: 'pending'
  },
  {
    id: 3,
    title: '2024年1月月报',
    type: 3,
    project: 'Node.js API服务',
    deadline: '2024-01-31',
    priority: 'low',
    status: 'upcoming'
  },
  {
    id: 4,
    title: '2024-01-14 开发日报',
    type: 1,
    project: '小程序商城',
    deadline: '2024-01-14',
    priority: 'high',
    status: 'overdue'
  },
  {
    id: 5,
    title: '2024-01-16 开发日报',
    type: 1,
    project: 'Vue3管理系统',
    deadline: '2024-01-16',
    priority: 'medium',
    status: 'pending'
  }
])

// 计算属性
const dailyCount = computed(() =>
  todoList.value.filter(item => item.type === 1).length
)
const weeklyCount = computed(() =>
  todoList.value.filter(item => item.type === 2).length
)
const monthlyCount = computed(() =>
  todoList.value.filter(item => item.type === 3).length
)

const filteredTodos = computed(() => {
  let filtered = todoList.value

  // 按类型筛选
  if (filterType.value) {
    filtered = filtered.filter(item => item.type === filterType.value)
  }

  // 按状态筛选
  if (filterStatus.value) {
    filtered = filtered.filter(item => item.status === filterStatus.value)
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.title.toLowerCase().includes(keyword) ||
      item.project.toLowerCase().includes(keyword)
    )
  }

  // 分页
  total.value = filtered.length
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filtered.slice(start, end)
})

// 方法
const getTypeTag = (type) => {
  const map = {
    daily: 'primary',
    weekly: 'success',
    monthly: 'warning'
  }
  return map[type] || 'info'
}

const getTypeText = (type) => {
  const map = {
    daily: '日报',
    weekly: '周报',
    monthly: '月报'
  }
  return map[type] || type
}

const getPriorityTag = (priority) => {
  const map = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return map[priority] || 'info'
}

const getPriorityText = (priority) => {
  const map = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return map[priority] || priority
}

const getDeadlineClass = (deadline) => {
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'overdue'
  if (diffDays <= 1) return 'urgent'
  return 'normal'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const handleFill = (row) => {
  router.push({
    path: `/report/fill/${row.id}`,
    query: {
      type: row.type,
      title: row.title,
      project: row.project
    }
  })
}

const handleRemind = (row) => {
  // 设置提醒
  ElMessage.success(`已设置${getTypeText(row.type)}提醒`)
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const handleRefresh = () => {
  loading.value = true
  // 模拟刷新数据
  setTimeout(() => {
    loading.value = false
    ElMessage.success('数据已刷新')
  }, 1000)
}

// 生命周期
onMounted(() => {
  // 实际项目中这里会调用API获取待办数据
  console.log('待办页面加载完成')
})
</script>

<style scoped>
.todo-container {
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.page-desc {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.stats-cards {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 20px 0;
}

.stat-icon {
  font-size: 48px;
  margin-right: 16px;
}

.daily .stat-icon {
  color: #409eff;
}

.weekly .stat-icon {
  color: #67c23a;
}

.monthly .stat-icon {
  color: #e6a23c;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.filter-section {
  margin-bottom: 24px;
}

.todo-list {
  margin-bottom: 24px;
}

.task-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-text {
  font-size: 14px;
  color: #303133;
}

.overdue {
  color: #f56c6c;
  font-weight: bold;
}

.urgent {
  color: #e6a23c;
  font-weight: bold;
}

.normal {
  color: #67c23a;
}

.pagination {
  margin-top: 24px;
  text-align: right;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}
</style>