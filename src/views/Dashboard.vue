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
            <el-icon size="48" color="#409eff">
              <User />
            </el-icon>
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
            <el-icon size="48" color="#67c23a">
              <Document />
            </el-icon>
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
            <el-icon size="48" color="#e6a23c">
              <Star />
            </el-icon>
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
            <el-icon size="48" color="#f56c6c">
              <View />
            </el-icon>
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
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" @change="fetchAllData" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
        <el-button type="primary" @click="fetchAllData" :loading="loading">
          <el-icon>
            <Refresh />
          </el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 重新布局：左侧两行，右侧迟到人员 -->
    <div class="dashboard-layout">
      <!-- 左侧区域 -->
      <div class="left-section">
        <!-- 第一行：四个所代码当量、个人当量前五名、迟到次数统计 -->
        <div class="row-1">
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
        </div>

        <!-- 第二行：任务工时趋势图、时间不足员工列表、有问必答解决数 -->
        <div class="row-2">
          <div class="dashboard-flex-item">
            <el-card class="dashboard-card">
              <template #header>
                <div class="card-header">
                  <span>任务工时趋势</span>
                  <el-tag type="info">近7天</el-tag>
                </div>
              </template>
              <div ref="taskHoursChart" class="chart-container" style="height: 400px;"></div>
            </el-card>
          </div>

          <div class="dashboard-flex-item">
            <el-card class="dashboard-card">
              <template #header>
                <div class="card-header">
                  <span>时间不足员工列表</span>
                  <el-tag type="warning">本月</el-tag>
                </div>
              </template>
              <el-table :data="insufficientTimeEmployees" style="width: 100%" height="400">
                <el-table-column prop="name" label="姓名" width="100" />
                <el-table-column prop="employeeId" label="工号" width="100" />
                <el-table-column prop="department" label="部门" width="120" />
                <el-table-column prop="requiredHours" label="应出勤" align="center" />
                <el-table-column prop="actualHours" label="实际出勤" align="center" />
                <el-table-column prop="shortfall" label="缺勤时长" align="center">
                  <template #default="{ row }">
                    <el-tag type="danger">{{ row.shortfall }}小时</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>

          <div class="dashboard-flex-item">
            <el-card class="dashboard-card">
              <template #header>
                <div class="card-header">
                  <span>有问必答解决数</span>
                  <el-tag type="success">今日</el-tag>
                </div>
              </template>
              <el-table :data="qaResolvedData" style="width: 100%" height="400">
                <el-table-column prop="name" label="姓名" width="100" />
                <el-table-column prop="employeeId" label="工号" width="100" />
                <el-table-column prop="department" label="部门" width="120" />
                <el-table-column prop="resolvedCount" label="解决数量" align="center">
                  <template #default="{ row }">
                    <el-tag :type="row.resolvedCount > 10 ? 'success' : row.resolvedCount > 5 ? 'info' : 'warning'">
                      {{ row.resolvedCount }}个
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="avgResponseTime" label="平均响应" align="center" />
                <el-table-column prop="satisfaction" label="满意度" align="center">
                  <template #default="{ row }">
                    <el-rate v-model="row.satisfaction" disabled size="small"
                      :colors="['#99A9BF', '#F7BA2A', '#FF9900']" />
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>
        </div>
      </div>

      <!-- 右侧区域：迟到人员 -->
      <div class="right-section">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>昨日迟到人员</span>
              <el-tag type="info">{{ getYesterdayDate() }}</el-tag>
            </div>
          </template>
          <div class="late-section">
            <div class="late-header">
              <el-icon>
                <Sunrise />
              </el-icon>
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
              <el-icon>
                <Moon />
              </el-icon>
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
    
    <!-- 四个设计所人员分布饼图 -->
    <el-card class="dashboard-card" style="margin-top: 20px; width: 100%;">
      <template #header>
        <div class="card-header">
          <span>四个设计所人员分布</span>
          <el-tag type="info">当前统计</el-tag>
        </div>
      </template>
      <div class="pie-charts-container">
        <div class="pie-chart-item">
          <div class="institute-name-vertical">第一研究所</div>
          <div ref="pieChart1" class="pie-chart"></div>
        </div>
        <div class="pie-chart-item">
          <div class="institute-name-vertical">第二研究所</div>
          <div ref="pieChart2" class="pie-chart"></div>
        </div>
        <div class="pie-chart-item">
          <div class="institute-name-vertical">第三研究所</div>
          <div ref="pieChart3" class="pie-chart"></div>
        </div>
        <div class="pie-chart-item">
          <div class="institute-name-vertical">第四研究所</div>
          <div ref="pieChart4" class="pie-chart"></div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import moment from 'moment'
import * as echarts from 'echarts'
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

// 图表引用
const taskHoursChart = ref()
const pieChart1 = ref()
const pieChart2 = ref()
const pieChart3 = ref()
const pieChart4 = ref()
const insufficientTimeEmployees = ref([])
const qaResolvedData = ref([])
let chartInstance = null
let pieChartInstances = []

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

// 获取任务工时趋势数据
const fetchTaskHoursTrend = async () => {
  const trendData = [
    { date: '2024-01-15', 第一研究所: 125, 第二研究所: 98, 第三研究所: 156, 第四研究所: 110 },
    { date: '2024-01-16', 第一研究所: 132, 第二研究所: 105, 第三研究所: 148, 第四研究所: 115 },
    { date: '2024-01-17', 第一研究所: 118, 第二研究所: 92, 第三研究所: 162, 第四研究所: 108 },
    { date: '2024-01-18', 第一研究所: 141, 第二研究所: 113, 第三研究所: 155, 第四研究所: 125 },
    { date: '2024-01-19', 第一研究所: 129, 第二研究所: 101, 第三研究所: 167, 第四研究所: 119 },
    { date: '2024-01-20', 第一研究所: 135, 第二研究所: 108, 第三研究所: 149, 第四研究所: 122 },
    { date: '2024-01-21', 第一研究所: 147, 第二研究所: 116, 第三研究所: 158, 第四研究所: 128 }
  ]
  return await mockApiCall(trendData)
}



// 获取时间不足员工数据
const fetchInsufficientTimeEmployees = async () => {
  const data = [
    { name: '张三', employeeId: 'EMP001', department: '研发部', requiredHours: 160, actualHours: 140, shortfall: 20 },
    { name: '李四', employeeId: 'EMP002', department: '测试部', requiredHours: 160, actualHours: 145, shortfall: 15 },
    { name: '王五', employeeId: 'EMP003', department: '产品部', requiredHours: 160, actualHours: 135, shortfall: 25 },
    { name: '赵六', employeeId: 'EMP004', department: '设计部', requiredHours: 160, actualHours: 150, shortfall: 10 },
    { name: '孙七', employeeId: 'EMP005', department: '研发部', requiredHours: 160, actualHours: 138, shortfall: 22 }
  ]
  insufficientTimeEmployees.value = await mockApiCall(data)
}

// 获取有问必答解决数据
const fetchQAResolvedData = async () => {
  const data = [
    { name: '张三', employeeId: 'EMP001', department: '技术支持', resolvedCount: 15, avgResponseTime: '5分钟', satisfaction: 4.8 },
    { name: '李四', employeeId: 'EMP002', department: '客服部', resolvedCount: 12, avgResponseTime: '8分钟', satisfaction: 4.5 },
    { name: '王五', employeeId: 'EMP003', department: '产品部', resolvedCount: 8, avgResponseTime: '12分钟', satisfaction: 4.3 },
    { name: '赵六', employeeId: 'EMP004', department: '技术支持', resolvedCount: 20, avgResponseTime: '3分钟', satisfaction: 4.9 },
    { name: '孙七', employeeId: 'EMP005', department: '客服部', resolvedCount: 10, avgResponseTime: '6分钟', satisfaction: 4.6 }
  ]
  qaResolvedData.value = await mockApiCall(data)
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

// 初始化任务工时趋势图表
const initTaskHoursChart = async () => {
  await nextTick()
  if (!taskHoursChart.value) return

  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(taskHoursChart.value)
  const trendData = await fetchTaskHoursTrend()

  const option = {
    title: {
      text: '四个所实际工时趋势',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['第一研究所', '第二研究所', '第三研究所', '第四研究所'],
      top: 30
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
      data: trendData.map(item => item.date)
    },
    yAxis: {
      type: 'value',
      name: '工时（小时）'
    },
    series: [
      {
        name: '第一研究所',
        type: 'line',
        data: trendData.map(item => item.第一研究所),
        smooth: true,
        lineStyle: {
          color: '#409EFF'
        },
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '第二研究所',
        type: 'line',
        data: trendData.map(item => item.第二研究所),
        smooth: true,
        lineStyle: {
          color: '#67C23A'
        },
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '第三研究所',
        type: 'line',
        data: trendData.map(item => item.第三研究所),
        smooth: true,
        lineStyle: {
          color: '#E6A23C'
        },
        itemStyle: {
          color: '#E6A23C'
        }
      },
      {
        name: '第四研究所',
        type: 'line',
        data: trendData.map(item => item.第四研究所),
        smooth: true,
        lineStyle: {
          color: '#F56C6C'
        },
        itemStyle: {
          color: '#F56C6C'
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

// 初始化四个设计所人员分布饼图
const initPieCharts = async () => {
  await nextTick()
  
  // 清理现有的饼图实例
  pieChartInstances.forEach(instance => {
    if (instance) instance.dispose()
  })
  pieChartInstances = []

  // 模拟四个设计所的人员数据
  const pieData = [
    {
      name: '第一研究所',
      data: [
        { value: 120, name: '在册人员' },
        { value: 45, name: '劳务人员' },
        { value: 30, name: '外包人员' },
        { value: 15, name: '集中办公人员' }
      ]
    },
    {
      name: '第二研究所',
      data: [
        { value: 98, name: '在册人员' },
        { value: 38, name: '劳务人员' },
        { value: 25, name: '外包人员' },
        { value: 12, name: '集中办公人员' }
      ]
    },
    {
      name: '第三研究所',
      data: [
        { value: 135, name: '在册人员' },
        { value: 52, name: '劳务人员' },
        { value: 35, name: '外包人员' },
        { value: 18, name: '集中办公人员' }
      ]
    },
    {
      name: '第四研究所',
      data: [
        { value: 110, name: '在册人员' },
        { value: 42, name: '劳务人员' },
        { value: 28, name: '外包人员' },
        { value: 14, name: '集中办公人员' }
      ]
    }
  ]

  const chartRefs = [pieChart1, pieChart2, pieChart3, pieChart4]
  
  chartRefs.forEach((chartRef, index) => {
    if (!chartRef.value) return
    
    const instance = echarts.init(chartRef.value)
    const currentData = pieData[index]
    
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
          orient: 'vertical',
          right: 0,
          top: 'middle',
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 5,
          textStyle: {
            fontSize: 10
          }
        },
      series: [
        {
          name: currentData.name,
            type: 'pie',
            radius: ['28%', '52%'],
            center: ['33%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: currentData.data
        }
      ],
      color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C']
    }
    
    instance.setOption(option)
    pieChartInstances.push(instance)
  })
}

// 获取所有数据
const fetchAllData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchCodeEquivalent(),
      fetchTop5Personal(),
      fetchLateCount(),
      fetchYesterdayLate(),
      fetchInsufficientTimeEmployees(),
      fetchQAResolvedData()
    ])
    await initTaskHoursChart()
  } finally {
    loading.value = false
  }
}

// 统一的resize事件处理器
const handleResize = () => {
  if (chartInstance) chartInstance.resize()
  pieChartInstances.forEach(instance => {
    if (instance) instance.resize()
  })
}

// 清理资源
const cleanupChart = () => {
  // 清理任务工时趋势图表
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  
  // 清理四个饼图实例
  pieChartInstances.forEach(instance => {
    if (instance) {
      instance.dispose()
    }
  })
  pieChartInstances = []
  
  // 清理事件监听器
  window.removeEventListener('resize', handleResize)
}

// 初始化
onMounted(async () => {
  await fetchAllData()
  await initPieCharts()
  
  // 添加统一的resize事件监听器
  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理
onUnmounted(() => {
  cleanupChart()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
  max-width: 100vw;
  box-sizing: border-box;
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

.dashboard-layout {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  max-width: 100%;
  overflow-x: hidden;
}

.left-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.row-1,
.row-2 {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.row-1 .dashboard-flex-item,
.row-2 .dashboard-flex-item {
  flex: 1 1 calc(33.333% - 14px);
  min-width: 280px;
  max-width: calc(33.333% - 14px);
}

.right-section {
  flex: 0 0 380px;
  min-width: 380px;
  max-width: 380px;
}

@media (max-width: 1400px) {
  .dashboard-layout {
    flex-direction: column;
  }
  
  .right-section {
    flex: 1;
    min-width: 100%;
    max-width: 100%;
  }
}

@media (max-width: 900px) {
  .row-1,
  .row-2 {
    flex-direction: column;
  }
  
  .row-1 .dashboard-flex-item,
  .row-2 .dashboard-flex-item {
    flex: 1 1 100%;
    min-width: 100%;
    max-width: 100%;
  }
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

.chart-container {
  width: 100%;
  height: 400px;
}

.el-rate {
  display: inline-block;
}

.pie-charts-container {
  display: flex;
  flex-wrap: nowrap;
  gap: 16px;
  padding: 20px;
  justify-content: space-between;
  align-items: flex-start;
  overflow-x: auto;
}

.pie-chart-item {
  flex: 1;
  min-width: 240px;
  max-width: 320px;
  height: 320px;
  flex-shrink: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.pie-chart {
  width: 100%;
  height: 100%;
  flex: 1;
}

.institute-name-vertical {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  white-space: nowrap;
  padding: 4px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 2px;
}

@media (max-width: 1200px) {
  .pie-chart-item {
    min-width: 200px;
    max-width: 240px;
    height: 300px;
  }
}

@media (max-width: 992px) {
  .pie-chart-item {
    min-width: 180px;
    max-width: 220px;
    height: 280px;
  }
}

@media (max-width: 768px) {
  .pie-chart-item {
    min-width: 160px;
    max-width: 200px;
    height: 260px;
  }
}

@media (max-width: 576px) {
  .pie-charts-container {
    gap: 10px;
    padding: 10px;
  }
  
  .pie-chart-item {
    min-width: 140px;
    max-width: 180px;
    height: 240px;
  }
}
</style>