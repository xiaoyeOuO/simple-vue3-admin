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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import moment from 'moment'

// 日期范围
const dateRange = ref([
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30天前
  new Date() // 今天
])

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
const mockApiCall = (data) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), 300)
  })
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
  try {
    await initAllCharts()
    ElMessage.success('数据已刷新')
  } catch (error) {
    ElMessage.error('数据刷新失败')
    console.error('数据刷新错误:', error)
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
  await initAllCharts()
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
</style>