<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>仪表盘</h1>
    </div>

    <!-- 原始统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card>
          <div class="card-content">
            <el-icon size="48" color="#409eff"><User /></el-icon>
            <div>
              <div class="card-number">1,234</div>
              <div class="card-title">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="card-content">
            <el-icon size="48" color="#67c23a"><Document /></el-icon>
            <div>
              <div class="card-number">5,678</div>
              <div class="card-title">文章总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="card-content">
            <el-icon size="48" color="#e6a23c"><Star /></el-icon>
            <div>
              <div class="card-number">9,012</div>
              <div class="card-title">收藏总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="card-content">
            <el-icon size="48" color="#f56c6c"><View /></el-icon>
            <div>
              <div class="card-number">3,456</div>
              <div class="card-title">浏览总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 四个表格的时间筛选 -->
    <div class="tables-filter">
      <div class="filter-content">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="fetchAllData"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
        <el-button type="primary" @click="fetchAllData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 四个看板表格 -->
    <div class="dashboard-flex-container">
      <!-- 第一张：四个所的代码当量 -->
      <div class="dashboard-flex-item">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>四个所代码当量</span>
              <el-tag type="info">{{ formatDateRange() }}</el-tag>
            </div>
          </template>
          <el-table :data="codeEquivalentData" style="width: 100%" height="400">
            <el-table-column prop="department" label="所属部门" width="120" />
            <el-table-column prop="total" label="代码当量总数" align="right">
              <template #default="{ row }">
                <span class="number-text">{{ row.total.toLocaleString() }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

      <!-- 第二张：个人代码当量前五名 -->
      <div class="dashboard-flex-item">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>个人代码当量前五名</span>
              <el-tag type="info">{{ formatDateRange() }}</el-tag>
            </div>
          </template>
          <el-table :data="top5PersonalData" style="width: 100%" height="400">
            <el-table-column prop="rank" label="排名" width="60" align="center" />
            <el-table-column prop="name" label="姓名" width="100" />
            <el-table-column prop="employeeId" label="工号" width="100" />
            <el-table-column prop="total" label="代码当量总数" align="right">
              <template #default="{ row }">
                <span class="number-text">{{ row.total.toLocaleString() }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

      <!-- 第三张：迟到次数统计 -->
      <div class="dashboard-flex-item">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>迟到次数统计</span>
              <el-tag type="info">{{ formatDateRange() }}</el-tag>
            </div>
          </template>
          <el-table :data="lateCountData" style="width: 100%" height="400">
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="employeeId" label="工号" width="120" />
            <el-table-column prop="lateCount" label="迟到次数" align="center">
              <template #default="{ row }">
                <el-tag :type="row.lateCount > 5 ? 'danger' : row.lateCount > 2 ? 'warning' : 'info'">
                  {{ row.lateCount }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

      <!-- 第四张：昨日迟到人 -->
      <div class="dashboard-flex-item">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>昨日迟到人员</span>
              <el-tag type="info">{{ getYesterdayDate() }}</el-tag>
            </div>
          </template>
          <div class="late-section">
            <div class="late-header">
              <el-icon><Sunrise /></el-icon>
              <span>上午迟到 ({{ yesterdayMorningLate.length }}人)</span>
            </div>
            <el-table :data="yesterdayMorningLate" style="width: 100%" height="180">
              <el-table-column prop="name" label="姓名" width="100" />
              <el-table-column prop="employeeId" label="工号" width="100" />
              <el-table-column prop="lateTime" label="迟到时间" />
            </el-table>
          </div>
          <el-divider />
          <div class="late-section">
            <div class="late-header">
              <el-icon><Moon /></el-icon>
              <span>下午迟到 ({{ yesterdayAfternoonLate.length }}人)</span>
            </div>
            <el-table :data="yesterdayAfternoonLate" style="width: 100%" height="180">
              <el-table-column prop="name" label="姓名" width="100" />
              <el-table-column prop="employeeId" label="工号" width="100" />
              <el-table-column prop="lateTime" label="迟到时间" />
            </el-table>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import moment from 'moment'
import { User, Document, Star, View, Refresh, Sunrise, Moon } from '@element-plus/icons-vue'

// 时间范围筛选
const dateRange = ref([
  moment().subtract(7, 'days').format('YYYY-MM-DD'),
  moment().format('YYYY-MM-DD')
])
const loading = ref(false)

// 四个表格数据
const codeEquivalentData = ref([])
const top5PersonalData = ref([])
const lateCountData = ref([])
const yesterdayMorningLate = ref([])
const yesterdayAfternoonLate = ref([])

// 模拟API调用
const mockApiCall = (data, delay = 500) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay)
  })
}

// 获取四个所代码当量数据
const fetchCodeEquivalent = async () => {
  const mockData = [
    { department: '第一研究所', total: 125430 },
    { department: '第二研究所', total: 98765 },
    { department: '第三研究所', total: 156789 },
    { department: '第四研究所', total: 110234 }
  ]
  codeEquivalentData.value = await mockApiCall(mockData)
}

// 获取个人代码当量前五名
const fetchTop5Personal = async () => {
  const mockData = [
    { rank: 1, name: '张三', employeeId: 'EMP001', total: 52341 },
    { rank: 2, name: '李四', employeeId: 'EMP002', total: 48765 },
    { rank: 3, name: '王五', employeeId: 'EMP003', total: 45678 },
    { rank: 4, name: '赵六', employeeId: 'EMP004', total: 42345 },
    { rank: 5, name: '孙七', employeeId: 'EMP005', total: 39876 }
  ]
  top5PersonalData.value = await mockApiCall(mockData)
}

// 获取迟到次数统计
const fetchLateCount = async () => {
  const mockData = [
    { name: '周九', employeeId: 'EMP009', lateCount: 8 },
    { name: '吴十', employeeId: 'EMP010', lateCount: 6 },
    { name: '郑十一', employeeId: 'EMP011', lateCount: 4 },
    { name: '王十二', employeeId: 'EMP012', lateCount: 3 },
    { name: '李十三', employeeId: 'EMP013', lateCount: 2 },
    { name: '赵十四', employeeId: 'EMP014', lateCount: 1 },
    { name: '钱十五', employeeId: 'EMP015', lateCount: 1 }
  ]
  lateCountData.value = await mockApiCall(mockData)
}

// 获取昨日迟到人员
const fetchYesterdayLate = async () => {
  const morningData = [
    { name: '张三', employeeId: 'EMP001', lateTime: '08:45' },
    { name: '李四', employeeId: 'EMP002', lateTime: '08:52' },
    { name: '王五', employeeId: 'EMP003', lateTime: '09:10' }
  ]
  
  const afternoonData = [
    { name: '赵六', employeeId: 'EMP004', lateTime: '13:25' },
    { name: '孙七', employeeId: 'EMP005', lateTime: '13:40' },
    { name: '周八', employeeId: 'EMP008', lateTime: '14:05' }
  ]

  const [morning, afternoon] = await Promise.all([
    mockApiCall(morningData),
    mockApiCall(afternoonData)
  ])

  yesterdayMorningLate.value = morning
  yesterdayAfternoonLate.value = afternoon
}

// 格式化日期范围显示
const formatDateRange = () => {
  if (!dateRange.value || dateRange.value.length !== 2) return ''
  return `${dateRange.value[0]} 至 ${dateRange.value[1]}`
}

// 获取昨日日期
const getYesterdayDate = () => {
  return moment().subtract(1, 'days').format('YYYY-MM-DD')
}

// 获取所有数据
const fetchAllData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchCodeEquivalent(),
      fetchTop5Personal(),
      fetchLateCount(),
      fetchYesterdayLate()
    ])
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  fetchAllData()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.dashboard-header h1 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.date-filter {
  display: flex;
  gap: 12px;
  align-items: center;
}

.stat-cards {
  margin-bottom: 20px;
}

.tables-filter {
  margin: 20px 0;
  background: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.filter-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dashboard-flex-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.dashboard-flex-item {
  flex: 1 1 400px;
  flex-basis: 400px;
  min-width: 400px;
  max-width: calc(50% - 10px);
}

.dashboard-card {
  margin-bottom: 0;
  height: 100%;
}

.dashboard-card :deep(.el-card__body) {
  height: calc(100% - 60px);
}

@media (max-width: 768px) {
  .dashboard-flex-item {
    flex: 1 1 100%;
    max-width: 100%;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;
}

.number-text {
  font-weight: bold;
  color: #409EFF;
  font-size: 16px;
}

.late-section {
  margin-bottom: 16px;
}

.late-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 12px;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.card-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}
</style>