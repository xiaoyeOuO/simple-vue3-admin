<template>
  <div class="sjs-dashboard">
    <div class="dashboard-header">
      <h1>设计所指标监控</h1>
      <div class="date-filter">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small"
          style="width: 240px"
          @change="handleDateChange"
        />
        <el-button type="primary" size="small" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div class="charts-container">
      <!-- 第一行：问题统计和团队当量 -->
      <div class="chart-row">
        <div class="chart-item">
          <div class="chart-header">
            <h3>未解决问题统计</h3>
            <span class="chart-subtitle">各产品线问题对比</span>
          </div>
          <div ref="problemChart" class="chart-content"></div>
        </div>
        
        <div class="chart-item">
          <div class="chart-header">
            <h3>团队代码当量统计</h3>
            <span class="chart-subtitle">各产品线当量对比</span>
          </div>
          <div ref="equivalentChart" class="chart-content"></div>
        </div>
      </div>

      <!-- 第二行：任务工时趋势 -->
      <div class="chart-row">
        <div class="chart-item full-width">
          <div class="chart-header">
            <h3>任务工时统计趋势</h3>
            <span class="chart-subtitle">指定周期内工时变化</span>
          </div>
          <div ref="taskHoursChart" class="chart-content"></div>
        </div>
      </div>

      <!-- 第三行：任务完成情况 -->
      <div class="chart-row">
        <div class="chart-item">
          <div class="chart-header">
            <h3>按时完成任务</h3>
            <span class="chart-subtitle">按时完成率</span>
          </div>
          <div ref="onTimeChart" class="chart-content"></div>
        </div>
        
        <div class="chart-item">
          <div class="chart-header">
            <h3>逾期任务统计</h3>
            <span class="chart-subtitle">逾期率</span>
          </div>
          <div ref="overdueChart" class="chart-content"></div>
        </div>
      </div>
    </div>

    <!-- 数据表格区域 -->
    <div class="tables-container">
      <!-- 第一行：迟到人员和迟到次数统计 -->
      <div class="table-row">
        <div class="table-item">
          <el-card class="dashboard-card">
            <template #header>
              <div class="card-header">
                <span>迟到人员</span>
                <div class="table-date-filter">
                  <el-date-picker
                    v-model="tableDateRanges.lateEmployees"
                    type="date"
                    placeholder="选择日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    size="small"
                    style="width: 140px; margin-right: 8px;"
                    @change="refreshTable('lateEmployees')"
                  />
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="refreshTable('lateEmployees')"
                    :loading="loading"
                  >
                    <el-icon><Refresh /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
            <div class="late-section">
              <div class="late-header">
                <el-icon><Sunrise /></el-icon>
                <span>上午迟到 ({{ morningLate.length }}人)</span>
              </div>
              <el-table :data="morningLate" style="width: 100%" height="180">
                <el-table-column prop="name" label="姓名" width="100" />
                <el-table-column prop="employeeId" label="工号" width="100" />
                <el-table-column prop="lateTime" label="迟到时间" />
              </el-table>
            </div>
            <el-divider />
            <div class="late-section">
              <div class="late-header">
                <el-icon><Moon /></el-icon>
                <span>下午迟到 ({{ afternoonLate.length }}人)</span>
              </div>
              <el-table :data="afternoonLate" style="width: 100%" height="180">
                <el-table-column prop="name" label="姓名" width="100" />
                <el-table-column prop="employeeId" label="工号" width="100" />
                <el-table-column prop="lateTime" label="迟到时间" />
              </el-table>
            </div>
          </el-card>
        </div>

        <div class="table-item">
          <el-card class="dashboard-card">
            <template #header>
              <div class="card-header">
                <span>迟到次数统计</span>
                <div class="table-date-filter">
                  <el-date-picker
                    v-model="tableDateRanges.lateCount"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    size="small"
                    style="width: 200px; margin-right: 8px;"
                    @change="refreshTable('lateCount')"
                  />
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="refreshTable('lateCount')"
                    :loading="loading"
                  >
                    <el-icon><Refresh /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
            <el-table :data="lateCountData" style="width: 100%" height="400">
              <el-table-column prop="name" label="姓名" width="100" />
              <el-table-column prop="employeeId" label="工号" width="100" />
              <el-table-column prop="lateCount" label="迟到次数" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.lateCount > 5 ? 'danger' : row.lateCount > 2 ? 'warning' : 'info'">
                    {{ row.lateCount }}次
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </div>

      <!-- 第二行：个人代码当量前五名和无代码当量人员 -->
      <div class="table-row">
        <div class="table-item">
          <el-card class="dashboard-card">
            <template #header>
              <div class="card-header">
                <span>个人代码当量前五名</span>
                <div class="table-date-filter">
                  <el-date-picker
                    v-model="tableDateRanges.top5Personal"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    size="small"
                    style="width: 200px; margin-right: 8px;"
                    @change="refreshTable('top5Personal')"
                  />
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="refreshTable('top5Personal')"
                    :loading="loading"
                  >
                    <el-icon><Refresh /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
            <el-table :data="top5PersonalData" style="width: 100%" height="400">
              <el-table-column prop="rank" label="排名" width="60" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.rank === 1 ? 'danger' : row.rank === 2 ? 'warning' : row.rank === 3 ? 'success' : 'info'">
                    {{ row.rank }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="姓名" width="100" />
              <el-table-column prop="employeeId" label="工号" width="100" />
              <el-table-column prop="total" label="代码当量" align="center">
                <template #default="{ row }">
                  <span class="number-text">{{ row.total.toLocaleString() }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>

        <div class="table-item">
          <el-card class="dashboard-card">
            <template #header>
              <div class="card-header">
                <span>无代码当量人员</span>
                <div class="table-date-filter">
                  <el-date-picker
                    v-model="tableDateRanges.noCodeEquivalent"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    size="small"
                    style="width: 200px; margin-right: 8px;"
                    @change="refreshTable('noCodeEquivalent')"
                  />
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="refreshTable('noCodeEquivalent')"
                    :loading="loading"
                  >
                    <el-icon><Refresh /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
            <el-table :data="noCodeEquivalentData" style="width: 100%" height="400">
              <el-table-column prop="name" label="姓名" width="100" />
              <el-table-column prop="employeeId" label="工号" width="100" />
              <el-table-column prop="department" label="部门" width="120" />
              <el-table-column prop="days" label="无当量天数" align="center">
                <template #default="{ row }">
                  <el-tag type="warning">{{ row.days }}天</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </div>

      <!-- 第三行：代码当量日均不足100人员、月工时不足7.5人员、加班工时未达标人员 -->
      <div class="table-row">
        <div class="table-item">
          <el-card class="dashboard-card">
            <template #header>
              <div class="card-header">
                <span>代码当量日均不足100人员</span>
                <div class="table-date-filter">
                  <el-date-picker
                    v-model="tableDateRanges.lowCodeEquivalent"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    size="small"
                    style="width: 200px; margin-right: 8px;"
                    @change="refreshTable('lowCodeEquivalent')"
                  />
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="refreshTable('lowCodeEquivalent')"
                    :loading="loading"
                  >
                    <el-icon><Refresh /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
            <el-table :data="lowCodeEquivalentData" style="width: 100%" height="400">
              <el-table-column prop="name" label="姓名" width="100" />
              <el-table-column prop="employeeId" label="工号" width="100" />
              <el-table-column prop="department" label="部门" width="120" />
              <el-table-column prop="avgDailyEquivalent" label="日均当量" align="center">
                <template #default="{ row }">
                  <el-tag type="danger">{{ row.avgDailyEquivalent }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>

        <div class="table-item">
          <el-card class="dashboard-card">
            <template #header>
              <div class="card-header">
                <span>月工时不足7.5人员</span>
                <div class="table-date-filter">
                  <el-date-picker
                    v-model="tableDateRanges.lowMonthlyHours"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    size="small"
                    style="width: 200px; margin-right: 8px;"
                    @change="refreshTable('lowMonthlyHours')"
                  />
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="refreshTable('lowMonthlyHours')"
                    :loading="loading"
                  >
                    <el-icon><Refresh /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
            <el-table :data="lowMonthlyHoursData" style="width: 100%" height="400">
              <el-table-column prop="name" label="姓名" width="100" />
              <el-table-column prop="employeeId" label="工号" width="100" />
              <el-table-column prop="department" label="部门" width="120" />
              <el-table-column prop="avgDailyHours" label="日均工时" align="center">
                <template #default="{ row }">
                  <el-tag type="warning">{{ row.avgDailyHours }}小时</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>

        <div class="table-item">
          <el-card class="dashboard-card">
            <template #header>
              <div class="card-header">
                <span>加班工时未达标人员</span>
                <div class="table-date-filter">
                  <el-date-picker
                    v-model="tableDateRanges.overtimeNotMet"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    size="small"
                    style="width: 200px; margin-right: 8px;"
                    @change="refreshTable('overtimeNotMet')"
                  />
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="refreshTable('overtimeNotMet')"
                    :loading="loading"
                  >
                    <el-icon><Refresh /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
            <el-table :data="overtimeNotMetData" style="width: 100%" height="400">
              <el-table-column prop="name" label="姓名" width="100" />
              <el-table-column prop="employeeId" label="工号" width="100" />
              <el-table-column prop="department" label="部门" width="120" />
              <el-table-column prop="requiredOvertime" label="要求加班工时" align="center" />
              <el-table-column prop="actualOvertime" label="实际加班工时" align="center" />
              <el-table-column prop="shortfall" label="缺口" align="center">
                <template #default="{ row }">
                  <el-tag type="danger">{{ row.shortfall }}小时</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { Refresh, Sunrise, Moon } from '@element-plus/icons-vue'
import moment from 'moment'

// 日期范围
const dateRange = ref([
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30天前
  new Date() // 今天
])

// 加载状态
const loading = ref(false)

// 表格数据
const morningLate = ref([])
const afternoonLate = ref([])
const lateCountData = ref([])
const top5PersonalData = ref([])
const noCodeEquivalentData = ref([])
const lowCodeEquivalentData = ref([])
const lowMonthlyHoursData = ref([])
const overtimeNotMetData = ref([])

// 表格日期范围
const tableDateRanges = ref({
  lateEmployees: new Date(Date.now() - 24 * 60 * 60 * 1000), // 昨天
  lateCount: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()],
  top5Personal: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()],
  noCodeEquivalent: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()],
  lowCodeEquivalent: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()],
  lowMonthlyHours: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
  overtimeNotMet: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()]
})

// 图表实例
let problemChartInstance = null
let equivalentChartInstance = null
let taskHoursChartInstance = null
let onTimeChartInstance = null
let overdueChartInstance = null

// 图表DOM引用
const problemChart = ref(null)
const equivalentChart = ref(null)
const taskHoursChart = ref(null)
const onTimeChart = ref(null)
const overdueChart = ref(null)

// 模拟API调用
const mockApiCall = (data, delay = 500) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay)
  })
}

// 获取迟到人员数据
const fetchLateEmployees = async (date) => {
  const mockData = {
    morning: [
      { name: '张三', employeeId: 'S001', department: '设计部', lateTime: '09:15' },
      { name: '李四', employeeId: 'S002', department: '前端组', lateTime: '09:23' },
      { name: '王五', employeeId: 'S003', department: '后端组', lateTime: '09:45' }
    ],
    afternoon: [
      { name: '赵六', employeeId: 'S004', department: '测试组', lateTime: '14:10' },
      { name: '钱七', employeeId: 'S005', department: '产品部', lateTime: '14:25' }
    ]
  }
  return await mockApiCall(mockData)
}

// 获取迟到次数统计
const fetchLateCount = async (startDate, endDate) => {
  const mockData = [
    { name: '张三', employeeId: 'S001', department: '设计部', lateCount: 3, avgLateTime: '15分钟' },
    { name: '李四', employeeId: 'S002', department: '前端组', lateCount: 2, avgLateTime: '23分钟' },
    { name: '王五', employeeId: 'S003', department: '后端组', lateCount: 4, avgLateTime: '45分钟' },
    { name: '赵六', employeeId: 'S004', department: '测试组', lateCount: 1, avgLateTime: '10分钟' },
    { name: '钱七', employeeId: 'S005', department: '产品部', lateCount: 2, avgLateTime: '25分钟' }
  ]
  return await mockApiCall(mockData)
}

// 获取个人代码当量前五名
const fetchTop5Personal = async (startDate, endDate) => {
  const mockData = [
    { name: '张三', employeeId: 'S001', department: '设计部', equivalent: 1250, rank: 1, trend: 'up' },
    { name: '李四', employeeId: 'S002', department: '前端组', equivalent: 1180, rank: 2, trend: 'up' },
    { name: '王五', employeeId: 'S003', department: '后端组', equivalent: 1050, rank: 3, trend: 'down' },
    { name: '赵六', employeeId: 'S004', department: '测试组', equivalent: 980, rank: 4, trend: 'up' },
    { name: '钱七', employeeId: 'S005', department: '产品部', equivalent: 920, rank: 5, trend: 'same' }
  ]
  return await mockApiCall(mockData)
}

// 获取无代码当量人员
const fetchNoCodeEquivalent = async (startDate, endDate) => {
  const mockData = [
    { name: '孙八', employeeId: 'S006', department: '设计部', daysWithoutCode: 5, status: 'warning' },
    { name: '周九', employeeId: 'S007', department: '产品部', daysWithoutCode: 3, status: 'warning' },
    { name: '吴十', employeeId: 'S008', department: '测试组', daysWithoutCode: 7, status: 'danger' }
  ]
  return await mockApiCall(mockData)
}

// 获取代码当量日均不足100人员
const fetchLowCodeEquivalent = async (startDate, endDate) => {
  const mockData = [
    { name: '郑一', employeeId: 'S009', department: '前端组', avgEquivalent: 85, days: 5, status: 'warning' },
    { name: '王二', employeeId: 'S010', department: '后端组', avgEquivalent: 72, days: 7, status: 'danger' },
    { name: '李三', employeeId: 'S011', department: '测试组', avgEquivalent: 95, days: 3, status: 'warning' }
  ]
  return await mockApiCall(mockData)
}

// 获取月工时不足7.5人员
const fetchLowMonthlyHours = async (startDate, endDate) => {
  const mockData = [
    { name: '张四', employeeId: 'S012', department: '设计部', avgDailyHours: 6.8, insufficientDays: 8, status: 'danger' },
    { name: '李五', employeeId: 'S013', department: '前端组', avgDailyHours: 7.2, insufficientDays: 5, status: 'warning' },
    { name: '王六', employeeId: 'S014', department: '后端组', avgDailyHours: 6.5, insufficientDays: 10, status: 'danger' }
  ]
  return await mockApiCall(mockData)
}

// 获取加班工时未达标人员
const fetchOvertimeNotMet = async (startDate, endDate) => {
  const mockData = [
    { name: '赵七', employeeId: 'S015', department: '测试组', requiredOvertime: 10, actualOvertime: 6, completionRate: '60%', status: 'danger' },
    { name: '钱八', employeeId: 'S016', department: '产品部', requiredOvertime: 8, actualOvertime: 5, completionRate: '62.5%', status: 'warning' },
    { name: '孙九', employeeId: 'S017', department: '设计部', requiredOvertime: 12, actualOvertime: 4, completionRate: '33.3%', status: 'danger' }
  ]
  return await mockApiCall(mockData)
}

// 获取未解决问题数据
const fetchProblemData = async () => {
  const data = [
    { productLine: '产品线A', unresolved: 15, total: 25 },
    { productLine: '产品线B', unresolved: 8, total: 20 },
    { productLine: '产品线C', unresolved: 12, total: 18 },
    { productLine: '产品线D', unresolved: 6, total: 15 },
    { productLine: '产品线E', unresolved: 10, total: 22 },
    { productLine: '产品线F', unresolved: 18, total: 28 },
    { productLine: '产品线G', unresolved: 22, total: 35 },
    { productLine: '产品线H', unresolved: 14, total: 24 },
    { productLine: '产品线I', unresolved: 9, total: 16 },
    { productLine: '产品线J', unresolved: 11, total: 19 },
    { productLine: '产品线K', unresolved: 16, total: 26 },
    { productLine: '产品线L', unresolved: 7, total: 14 },
    { productLine: '产品线M', unresolved: 13, total: 21 },
    { productLine: '产品线N', unresolved: 19, total: 30 },
    { productLine: '产品线O', unresolved: 5, total: 12 },
    { productLine: '产品线P', unresolved: 20, total: 32 },
    { productLine: '产品线Q', unresolved: 17, total: 27 },
    { productLine: '产品线R', unresolved: 23, total: 38 },
    { productLine: '产品线S', unresolved: 8, total: 17 },
    { productLine: '产品线T', unresolved: 12, total: 20 },
    { productLine: '产品线U', unresolved: 15, total: 23 },
    { productLine: '产品线V', unresolved: 10, total: 18 },
    { productLine: '产品线W', unresolved: 14, total: 25 }
  ]
  return await mockApiCall(data)
}

// 获取团队当量数据
const fetchEquivalentData = async () => {
  const data = [
    { productLine: '产品线A', equivalent: 1250 },
    { productLine: '产品线B', equivalent: 980 },
    { productLine: '产品线C', equivalent: 1560 },
    { productLine: '产品线D', equivalent: 1100 },
    { productLine: '产品线E', equivalent: 890 },
    { productLine: '产品线F', equivalent: 1380 },
    { productLine: '产品线G', equivalent: 1680 },
    { productLine: '产品线H', equivalent: 1180 },
    { productLine: '产品线I', equivalent: 920 },
    { productLine: '产品线J', equivalent: 1050 },
    { productLine: '产品线K', equivalent: 1420 },
    { productLine: '产品线L', equivalent: 870 },
    { productLine: '产品线M', equivalent: 1280 },
    { productLine: '产品线N', equivalent: 1750 },
    { productLine: '产品线O', equivalent: 760 },
    { productLine: '产品线P', equivalent: 1520 },
    { productLine: '产品线Q', equivalent: 1360 },
    { productLine: '产品线R', equivalent: 1820 },
    { productLine: '产品线S', equivalent: 940 },
    { productLine: '产品线T', equivalent: 1120 },
    { productLine: '产品线U', equivalent: 1290 },
    { productLine: '产品线V', equivalent: 1010 },
    { productLine: '产品线W', equivalent: 1340 }
  ]
  return await mockApiCall(data)
}

// 获取任务工时数据
const fetchTaskHoursData = async (startDate, endDate) => {
  const start = moment(startDate)
  const end = moment(endDate)
  const days = end.diff(start, 'days') + 1
  
  const data = []
  for (let i = 0; i < days; i++) {
    const currentDate = start.clone().add(i, 'days')
    data.push({
      date: currentDate.format('YYYY-MM-DD'),
      taskHours: Math.floor(Math.random() * 100) + 200
    })
  }
  
  return await mockApiCall(data)
}

// 获取按时完成任务数据
const fetchOnTimeData = async () => {
  const onTime = 68
  const total = 85
  return await mockApiCall({ onTime, total, rate: (onTime / total * 100).toFixed(1) })
}

// 获取逾期任务数据
const fetchOverdueData = async () => {
  const overdue = 17
  const total = 85
  return await mockApiCall({ overdue, total, rate: (overdue / total * 100).toFixed(1) })
}

// 格式化日期范围
const formatTableDateRange = (date) => {
  if (Array.isArray(date)) {
    return `${moment(date[0]).format('YYYY-MM-DD')} 至 ${moment(date[1]).format('YYYY-MM-DD')}`
  } else {
    return moment(date).format('YYYY-MM-DD')
  }
}

// 表格刷新函数
const refreshTable = async (tableType) => {
  loading.value = true
  try {
    switch (tableType) {
      case 'lateEmployees':
        const lateData = await fetchLateEmployees(tableDateRanges.value.lateEmployees)
        morningLate.value = lateData.morning
        afternoonLate.value = lateData.afternoon
        break
      case 'lateCount':
        lateCountData.value = await fetchLateCount(tableDateRanges.value.lateCount[0], tableDateRanges.value.lateCount[1])
        break
      case 'top5Personal':
        top5PersonalData.value = await fetchTop5Personal(tableDateRanges.value.top5Personal[0], tableDateRanges.value.top5Personal[1])
        break
      case 'noCodeEquivalent':
        noCodeEquivalentData.value = await fetchNoCodeEquivalent(tableDateRanges.value.noCodeEquivalent[0], tableDateRanges.value.noCodeEquivalent[1])
        break
      case 'lowCodeEquivalent':
        lowCodeEquivalentData.value = await fetchLowCodeEquivalent(tableDateRanges.value.lowCodeEquivalent[0], tableDateRanges.value.lowCodeEquivalent[1])
        break
      case 'lowMonthlyHours':
        lowMonthlyHoursData.value = await fetchLowMonthlyHours(tableDateRanges.value.lowMonthlyHours[0], tableDateRanges.value.lowMonthlyHours[1])
        break
      case 'overtimeNotMet':
        overtimeNotMetData.value = await fetchOvertimeNotMet(tableDateRanges.value.overtimeNotMet[0], tableDateRanges.value.overtimeNotMet[1])
        break
    }
    ElMessage.success('数据已刷新')
  } catch (error) {
    ElMessage.error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

// 初始化未解决问题图表
const initProblemChart = async () => {
  if (!problemChart.value) return
  
  if (problemChartInstance) {
    problemChartInstance.dispose()
  }
  
  problemChartInstance = echarts.init(problemChart.value)
  const data = await fetchProblemData()
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        const unresolved = params[0]
        const total = params[1]
        return `${unresolved.name}<br/>
                未解决: ${unresolved.value}<br/>
                总数: ${total.value}<br/>
                解决率: ${((total.value - unresolved.value) / total.value * 100).toFixed(1)}%`
      }
    },
    legend: {
      data: ['未解决问题', '问题总数']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.productLine)
    },
    yAxis: {
      type: 'value',
      name: '问题数量'
    },
    series: [
      {
        name: '未解决问题',
        type: 'bar',
        data: data.map(item => item.unresolved),
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '问题总数',
        type: 'bar',
        data: data.map(item => item.total),
          itemStyle: {
            color: '#E6A23C'
          }
      }
    ]
  }
  
  problemChartInstance.setOption(option)
}

// 初始化团队当量图表
const initEquivalentChart = async () => {
  if (!equivalentChart.value) return
  
  if (equivalentChartInstance) {
    equivalentChartInstance.dispose()
  }
  
  equivalentChartInstance = echarts.init(equivalentChart.value)
  const data = await fetchEquivalentData()
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.productLine)
    },
    yAxis: {
      type: 'value',
      name: '代码当量'
    },
    series: [
      {
        name: '代码当量',
        type: 'bar',
        data: data.map(item => item.equivalent),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#2378f7' },
              { offset: 0.7, color: '#2378f7' },
              { offset: 1, color: '#83bff6' }
            ])
          }
        }
      }
    ]
  }
  
  equivalentChartInstance.setOption(option)
}

// 初始化任务工时趋势图表
const initTaskHoursChart = async () => {
  if (!taskHoursChart.value) return
  
  if (taskHoursChartInstance) {
    taskHoursChartInstance.dispose()
  }
  
  taskHoursChartInstance = echarts.init(taskHoursChart.value)
  const data = await fetchTaskHoursData(dateRange.value[0], dateRange.value[1])
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(item => item.date)
    },
    yAxis: {
      type: 'value',
      name: '工时（小时）'
    },
    series: [
      {
        name: '任务工时',
        type: 'line',
        data: data.map(item => item.taskHours),
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        },
        lineStyle: {
          color: '#409EFF',
          width: 3
        },
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }
  
  taskHoursChartInstance.setOption(option)
}

// 初始化按时完成任务饼图
const initOnTimeChart = async () => {
  if (!onTimeChart.value) return
  
  if (onTimeChartInstance) {
    onTimeChartInstance.dispose()
  }
  
  onTimeChartInstance = echarts.init(onTimeChart.value)
  const data = await fetchOnTimeData()
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '任务完成情况',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,

        label: {
          show: true,
          formatter: '{b}\n{c} ({d}%)'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: data.onTime, name: '按时完成', itemStyle: { color: '#67C23A' } },
          { value: data.total - data.onTime, name: '未按时完成', itemStyle: { color: '#F56C6C' } }
        ]
      }
    ]
  }
  
  onTimeChartInstance.setOption(option)
}

// 初始化逾期任务饼图
const initOverdueChart = async () => {
  if (!overdueChart.value) return
  
  if (overdueChartInstance) {
    overdueChartInstance.dispose()
  }
  
  overdueChartInstance = echarts.init(overdueChart.value)
  const data = await fetchOverdueData()
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '逾期任务统计',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,

        label: {
          show: true,
          formatter: '{b}\n{c} ({d}%)'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: data.overdue, name: '逾期任务', itemStyle: { color: '#F56C6C' } },
          { value: data.total - data.overdue, name: '正常任务', itemStyle: { color: '#409EFF' } }
        ]
      }
    ]
  }
  
  overdueChartInstance.setOption(option)
}

// 初始化所有图表
const initAllCharts = async () => {
  try {
    await Promise.all([
      initProblemChart(),
      initEquivalentChart(),
      initTaskHoursChart(),
      initOnTimeChart(),
      initOverdueChart()
    ])
  } catch (error) {
    ElMessage.error('图表加载失败')
    console.error('图表初始化错误:', error)
  }
}

// 日期变化处理
const handleDateChange = () => {
  refreshData()
}

// 刷新数据
const refreshData = async () => {
  loading.value = true
  try {
    await initAllCharts()
    ElMessage.success('数据已刷新')
  } catch (error) {
    ElMessage.error('数据刷新失败')
    console.error('数据刷新错误:', error)
  } finally {
    loading.value = false
  }
}

// 响应式处理
const handleResize = () => {
  if (problemChartInstance) problemChartInstance.resize()
  if (equivalentChartInstance) equivalentChartInstance.resize()
  if (taskHoursChartInstance) taskHoursChartInstance.resize()
  if (onTimeChartInstance) onTimeChartInstance.resize()
  if (overdueChartInstance) overdueChartInstance.resize()
}

// 清理图表实例
const cleanupCharts = () => {
  if (problemChartInstance) {
    problemChartInstance.dispose()
    problemChartInstance = null
  }
  if (equivalentChartInstance) {
    equivalentChartInstance.dispose()
    equivalentChartInstance = null
  }
  if (taskHoursChartInstance) {
    taskHoursChartInstance.dispose()
    taskHoursChartInstance = null
  }
  if (onTimeChartInstance) {
    onTimeChartInstance.dispose()
    onTimeChartInstance = null
  }
  if (overdueChartInstance) {
    overdueChartInstance.dispose()
    overdueChartInstance = null
  }
  
  window.removeEventListener('resize', handleResize)
}

// 生命周期
onMounted(async () => {
  initAllCharts()
  // 初始化表格数据
  await Promise.all([
    refreshTable('lateEmployees'),
    refreshTable('lateCount'),
    refreshTable('top5Personal'),
    refreshTable('noCodeEquivalent'),
    refreshTable('lowCodeEquivalent'),
    refreshTable('lowMonthlyHours'),
    refreshTable('overtimeNotMet')
  ])
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  cleanupCharts()
})
</script>

<style scoped>
.sjs-dashboard {
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

.charts-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.chart-item {
  flex: 1;
  min-width: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.chart-item.full-width {
  min-width: 100%;
}

.chart-header {
  margin-bottom: 16px;
  text-align: center;
}

.chart-header h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.chart-subtitle {
  color: #909399;
  font-size: 14px;
}

.chart-content {
  height: 300px;
  width: 100%;
}

@media (max-width: 768px) {
  .chart-row {
    flex-direction: column;
  }
  
  .chart-item {
    min-width: 100%;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}

/* 表格区域样式 */
.table-section {
  margin-top: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 0 10px;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.table-date-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.table-date-filter .el-date-editor {
  width: 240px;
}

.table-date-filter .el-button {
  padding: 8px 12px;
}

/* 迟到人员表格样式 */
.late-section {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
}

.late-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-weight: 600;
  color: #606266;
}

.late-header .el-icon {
  margin-right: 8px;
  font-size: 16px;
}

.late-header.morning {
  color: #e6a23c;
}

.late-header.afternoon {
  color: #409eff;
}

/* 状态标签样式 */
.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag.warning {
  background-color: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #f5dab1;
}

.status-tag.danger {
  background-color: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}

.status-tag.success {
  background-color: #f0f9ff;
  color: #409eff;
  border: 1px solid #b3d8ff;
}

/* 趋势图标样式 */
.trend-icon {
  margin-left: 4px;
  font-size: 14px;
}

.trend-icon.up {
  color: #67c23a;
}

.trend-icon.down {
  color: #f56c6c;
}

.trend-icon.same {
  color: #909399;
}
</style>