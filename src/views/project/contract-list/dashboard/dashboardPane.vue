<template>
  <div class="dashboard-pane">
    <!-- 时间范围选择器 -->
    <el-card class="filter-card" shadow="hover">
      <div class="filter-container">
        <div class="filter-group">
          <span class="filter-label">时间范围：</span>
          <el-select v-model="selectedTimeRange" size="small" @change="handleTimeRangeChange" style="width: 120px">
            <el-option label="近7天" value="7" />
            <el-option label="近15天" value="15" />
            <el-option label="近30天" value="30" />
            <el-option label="近90天" value="90" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </div>
        
        <!-- 自定义日期范围 -->
        <div class="filter-group" v-if="selectedTimeRange === 'custom'">
          <span class="filter-label">自定义日期：</span>
          <el-date-picker
            v-model="customDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="small"
            style="width: 240px"
            @change="handleCustomDateChange"
          />
        </div>

        <el-button type="primary" size="small" @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </el-card>

    <div class="chart-container">
      <!-- 缺陷数量变化趋势图 -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>缺陷数量变化趋势</span>
            <el-radio-group v-model="bugChartType" size="small">
              <el-radio-button label="line">折线图</el-radio-button>
              <el-radio-button label="bar">柱状图</el-radio-button>
              <el-radio-button label="pie">饼图</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div ref="bugChartRef" class="chart"></div>
      </el-card>

      <!-- 任务完成数量变化趋势图 -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>任务完成数量变化趋势</span>
            <el-radio-group v-model="taskChartType" size="small">
              <el-radio-button label="line">折线图</el-radio-button>
              <el-radio-button label="bar">柱状图</el-radio-button>
              <el-radio-button label="pie">饼图</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div ref="taskChartRef" class="chart"></div>
      </el-card>

      <!-- 实际工时变化趋势图 -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>实际工时变化趋势</span>
            <el-radio-group v-model="workHourChartType" size="small">
              <el-radio-button label="line">折线图</el-radio-button>
              <el-radio-button label="bar">柱状图</el-radio-button>
              <el-radio-button label="pie">饼图</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div ref="workHourChartRef" class="chart"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { Refresh } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  bugsData: {
    type: Array,
    default: () => []
  },
  tasksData: {
    type: Array,
    default: () => []
  },
  projectId: {
    type: [String, Number],
    default: ''
  }
})

// 时间范围选择
const selectedTimeRange = ref('30')
const loading = ref(false)
const customDateRange = ref([])

// 图表类型切换
const bugChartType = ref('line')
const taskChartType = ref('line')
const workHourChartType = ref('line')

// 图表实例
const bugChartRef = ref()
const taskChartRef = ref()
const workHourChartRef = ref()

let bugChartInstance = null
let taskChartInstance = null
let workHourChartInstance = null

// 生成模拟数据
const generateChartData = () => {
  const dates = []
  let days = 30
  
  if (selectedTimeRange.value === 'custom' && customDateRange.value && customDateRange.value.length === 2) {
    // 使用自定义日期范围
    const startDate = new Date(customDateRange.value[0])
    const endDate = new Date(customDateRange.value[1])
    days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      dates.push(date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }))
    }
  } else {
    // 使用预设时间范围
    days = parseInt(selectedTimeRange.value)
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dates.push(date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }))
    }
  }

  // 根据实际天数生成合理的数据
  const bugData = dates.map(() => Math.floor(Math.random() * Math.max(1, days / 3)) + 1)
  const taskData = dates.map(() => Math.floor(Math.random() * Math.max(1, days / 2)) + 2)
  const workHourData = dates.map(() => Math.floor(Math.random() * 30) + 5)

  return { dates, bugData, taskData, workHourData }
}

// 图表配置
const getChartOption = (type, title, data, dates) => {
  const baseOption = {
    title: { text: title, left: 'center' },
    tooltip: {
      trigger: type === 'pie' ? 'item' : 'axis',
      formatter: type === 'pie' 
        ? '{a} <br/>{b}: {c} ({d}%)'
        : '{b}: {c}'
    },
    legend: {
      data: [title],
      bottom: 10
    }
  }

  if (type === 'pie') {
    // 饼图数据处理
    const pieData = data.map((value, index) => ({
      name: dates[index],
      value: value
    }))
    
    return {
      ...baseOption,
      series: [{
        name: title,
        type: 'pie',
        radius: '50%',
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    }
  } else {
    // 折线图或柱状图
    return {
      ...baseOption,
      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: type === 'bar'
      },
      yAxis: {
        type: 'value',
        name: title.includes('工时') ? '小时' : '数量'
      },
      series: [{
        name: title,
        type: type,
        data: data,
        smooth: true,
        itemStyle: {
          color: title.includes('缺陷') ? '#f56c6c' : 
                 title.includes('任务') ? '#409eff' : '#67c23a'
        },
        areaStyle: type === 'line' ? {
          opacity: 0.3
        } : undefined
      }]
    }
  }
}

// 初始化图表
const initCharts = () => {
  const { dates, bugData, taskData, workHourData } = generateChartData()

  // 初始化缺陷图表
  if (bugChartRef.value) {
    bugChartInstance = echarts.init(bugChartRef.value)
    bugChartInstance.setOption(getChartOption('line', '缺陷数量', bugData, dates))
  }

  // 初始化任务图表
  if (taskChartRef.value) {
    taskChartInstance = echarts.init(taskChartRef.value)
    taskChartInstance.setOption(getChartOption('line', '任务完成数量', taskData, dates))
  }

  // 初始化工时图表
  if (workHourChartRef.value) {
    workHourChartInstance = echarts.init(workHourChartRef.value)
    workHourChartInstance.setOption(getChartOption('line', '实际工时', workHourData, dates))
  }
}

// 更新图表
const updateCharts = () => {
  const { dates, bugData, taskData, workHourData } = generateChartData()

  if (bugChartInstance) {
    bugChartInstance.setOption(getChartOption(bugChartType.value, '缺陷数量', bugData, dates))
  }

  if (taskChartInstance) {
    taskChartInstance.setOption(getChartOption(taskChartType.value, '任务完成数量', taskData, dates))
  }

  if (workHourChartInstance) {
    workHourChartInstance.setOption(getChartOption(workHourChartType.value, '实际工时', workHourData, dates))
  }
}

// 监听图表类型变化
watch([bugChartType, taskChartType, workHourChartType], () => {
  nextTick(() => {
    updateCharts()
  })
})

// 时间范围变化处理
const handleTimeRangeChange = () => {
  if (selectedTimeRange.value !== 'custom') {
    refreshData()
  }
}

// 自定义日期范围变化处理
const handleCustomDateChange = () => {
  if (customDateRange.value && customDateRange.value.length === 2) {
    refreshData()
  }
}

// 刷新数据
const refreshData = () => {
  loading.value = true
  nextTick(() => {
    updateCharts()
    setTimeout(() => {
      loading.value = false
    }, 500)
  })
}

// 响应式处理
const handleResize = () => {
  bugChartInstance?.resize()
  taskChartInstance?.resize()
  workHourChartInstance?.resize()
}

// 强制重新调整图表尺寸
const forceResize = () => {
  nextTick(() => {
    setTimeout(() => {
      bugChartInstance?.resize()
      taskChartInstance?.resize()
      workHourChartInstance?.resize()
    }, 100)
  })
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
  
  // 监听标签页切换，强制重新调整尺寸
  const observer = new MutationObserver(() => {
    forceResize()
  })
  
  // 观察图表容器的可见性变化
  const chartContainer = document.querySelector('.chart-container')
  if (chartContainer) {
    observer.observe(chartContainer, { 
      attributes: true, 
      attributeFilter: ['style', 'class'] 
    })
  }
  
  // 延迟执行一次resize确保尺寸正确
  forceResize()
})

// 清理
const cleanup = () => {
  window.removeEventListener('resize', handleResize)
  bugChartInstance?.dispose()
  taskChartInstance?.dispose()
  workHourChartInstance?.dispose()
}

// 暴露方法
defineExpose({
  updateCharts,
  cleanup
})
</script>

<style scoped>
.dashboard-pane {
  padding: 20px;
}
.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.filter-container {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-weight: 500;
  color: #606266;
  white-space: nowrap;
}

.chart-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart {
  width: 100%;
  height: 300px;
}

@media (max-width: 768px) {
  .chart-container {
    grid-template-columns: 1fr;
  }
  
  .filter-container {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-group {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>