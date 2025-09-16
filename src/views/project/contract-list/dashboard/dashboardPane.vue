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

    <!-- 新增图表区域 -->
    <div class="chart-container new-charts-container">
      <!-- 产品线里程碑统计 -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>产品线里程碑逾期统计</span>
          </div>
        </template>
        <div ref="productMilestoneChartRef" class="chart"></div>
      </el-card>

      <!-- 有问必答系统回复统计 -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>有问必答48小时内回复统计</span>
          </div>
        </template>
        <div ref="qaReplyChartRef" class="chart"></div>
      </el-card>

      <!-- 有问必答系统解决统计 -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>有问必答48小时内解决统计</span>
          </div>
        </template>
        <div ref="qaResolveChartRef" class="chart"></div>
      </el-card>

      <!-- 项目里程碑逾期统计 -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>项目里程碑逾期统计</span>
          </div>
        </template>
        <div ref="projectMilestoneChartRef" class="chart"></div>
      </el-card>

      <!-- 缺陷类型分布统计 -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>缺陷类型分布统计</span>
          </div>
        </template>
        <div ref="bugTypeChartRef" class="chart"></div>
      </el-card>

      <!-- 缺陷处理耗时分布 -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>缺陷处理耗时分布</span>
          </div>
        </template>
        <div ref="bugDurationChartRef" class="chart"></div>
      </el-card>

      <!-- 任务工时统计 -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>任务工时统计</span>
          </div>
        </template>
        <div ref="taskHoursChartRef" class="chart"></div>
      </el-card>

      <!-- 按时完成任务统计 -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>按时完成任务统计</span>
          </div>
        </template>
        <div ref="onTimeTaskChartRef" class="chart"></div>
      </el-card>

      <!-- 逾期任务统计 -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>逾期任务统计</span>
          </div>
        </template>
        <div ref="overdueTaskChartRef" class="chart"></div>
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
  },
  selectedModule: {
    type: Array,
    default: () => []
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

// 新增图表实例
const productMilestoneChartRef = ref()
const qaReplyChartRef = ref()
const qaResolveChartRef = ref()
const projectMilestoneChartRef = ref()
const bugTypeChartRef = ref()
const bugDurationChartRef = ref()
const taskHoursChartRef = ref()
const onTimeTaskChartRef = ref()
const overdueTaskChartRef = ref()

let productMilestoneChartInstance = null
let qaReplyChartInstance = null
let qaResolveChartInstance = null
let projectMilestoneChartInstance = null
let bugTypeChartInstance = null
let bugDurationChartInstance = null
let taskHoursChartInstance = null
let onTimeTaskChartInstance = null
let overdueTaskChartInstance = null

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

// 饼图专用配置
const getPieChartOption = (title, data) => {
  return {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C'],
    series: [
      {
        name: title,
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  }
}

// 折线图专用配置
const getLineChartOption = (title, data, dates) => {
  return {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}小时'
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
      data: dates
    },
    yAxis: {
      type: 'value',
      name: '工时'
    },
    series: [
      {
        name: title,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        },
        data: data
      }
    ]
  }
}

// 生成新图表的模拟数据
const generateNewChartData = () => {
  // 产品线里程碑逾期统计
  const productMilestoneData = [
    { name: '逾期节点', value: Math.floor(Math.random() * 20) + 5 },
    { name: '正常节点', value: Math.floor(Math.random() * 50) + 30 }
  ]

  // 有问必答系统48小时内回复统计
  const qaReplyData = [
    { name: '48小时内回复', value: Math.floor(Math.random() * 80) + 60 },
    { name: '48小时后回复', value: Math.floor(Math.random() * 30) + 10 }
  ]

  // 有问必答系统48小时内解决统计
  const qaResolveData = [
    { name: '48小时内解决', value: Math.floor(Math.random() * 60) + 40 },
    { name: '48小时后解决', value: Math.floor(Math.random() * 40) + 20 }
  ]

  // 项目里程碑逾期统计
  const projectMilestoneData = [
    { name: '逾期节点', value: Math.floor(Math.random() * 15) + 3 },
    { name: '正常节点', value: Math.floor(Math.random() * 40) + 25 }
  ]

  // 缺陷类型分布统计
  const bugTypeData = [
    { name: '紧急', value: Math.floor(Math.random() * 20) + 5 },
    { name: '高级', value: Math.floor(Math.random() * 30) + 15 },
    { name: '中级', value: Math.floor(Math.random() * 40) + 20 },
    { name: '低级', value: Math.floor(Math.random() * 25) + 10 }
  ]

  // 缺陷处理耗时分布
  const bugDurationData = [
    { name: '5天内', value: Math.floor(Math.random() * 30) + 20 },
    { name: '5-15天', value: Math.floor(Math.random() * 25) + 15 },
    { name: '15-30天', value: Math.floor(Math.random() * 20) + 10 },
    { name: '30天及以上', value: Math.floor(Math.random() * 15) + 5 }
  ]

  // 任务工时统计数据（折线图）
  const taskHoursDates = []
  const taskHoursData = []
  const days = 30
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    taskHoursDates.push(date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }))
    taskHoursData.push(Math.floor(Math.random() * 40) + 10)
  }

  // 按时完成任务统计
  const onTimeTaskData = [
    { name: '按时完成', value: Math.floor(Math.random() * 60) + 40 },
    { name: '未按时完成', value: Math.floor(Math.random() * 30) + 10 }
  ]

  // 逾期任务统计
  const overdueTaskData = [
    { name: '逾期任务', value: Math.floor(Math.random() * 25) + 5 },
    { name: '正常任务', value: Math.floor(Math.random() * 50) + 30 }
  ]

  return {
    productMilestoneData,
    qaReplyData,
    qaResolveData,
    projectMilestoneData,
    bugTypeData,
    bugDurationData,
    taskHoursDates,
    taskHoursData,
    onTimeTaskData,
    overdueTaskData
  }
}

// 初始化原有图表
const initOriginalCharts = () => {
  const { dates, bugData, taskData, workHourData } = generateChartData()

  // 缺陷数量变化趋势图
  if (bugChartRef.value) {
    bugChartInstance = echarts.init(bugChartRef.value)
    const bugOption = {
      title: { text: '缺陷数量变化趋势' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: dates },
      yAxis: { type: 'value' },
      series: [{
        name: '缺陷数量',
        type: bugChartType.value,
        data: bugData,
        smooth: true,
        itemStyle: { color: '#F56C6C' }
      }]
    }
    bugChartInstance.setOption(bugOption)
  }

  // 任务完成数量变化趋势图
  if (taskChartRef.value) {
    taskChartInstance = echarts.init(taskChartRef.value)
    const taskOption = {
      title: { text: '任务完成数量变化趋势' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: dates },
      yAxis: { type: 'value' },
      series: [{
        name: '任务完成数量',
        type: taskChartType.value,
        data: taskData,
        smooth: true,
        itemStyle: { color: '#67C23A' }
      }]
    }
    taskChartInstance.setOption(taskOption)
  }

  // 实际工时变化趋势图
  if (workHourChartRef.value) {
    workHourChartInstance = echarts.init(workHourChartRef.value)
    const workHourOption = {
      title: { text: '实际工时变化趋势' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: dates },
      yAxis: { type: 'value' },
      series: [{
        name: '实际工时',
        type: workHourChartType.value,
        data: workHourData,
        smooth: true,
        itemStyle: { color: '#409EFF' }
      }]
    }
    workHourChartInstance.setOption(workHourOption)
  }
}

// 初始化新图表
const initNewCharts = () => {
  const {
    productMilestoneData,
    qaReplyData,
    qaResolveData,
    projectMilestoneData,
    bugTypeData,
    bugDurationData,
    taskHoursDates,
    taskHoursData,
    onTimeTaskData,
    overdueTaskData
  } = generateNewChartData()

  // 产品线里程碑逾期统计
  if (productMilestoneChartRef.value) {
    productMilestoneChartInstance = echarts.init(productMilestoneChartRef.value)
    productMilestoneChartInstance.setOption(getPieChartOption('产品线里程碑逾期统计', productMilestoneData))
  }

  // 有问必答系统48小时内回复统计
  if (qaReplyChartRef.value) {
    qaReplyChartInstance = echarts.init(qaReplyChartRef.value)
    qaReplyChartInstance.setOption(getPieChartOption('有问必答48小时内回复统计', qaReplyData))
  }

  // 有问必答系统48小时内解决统计
  if (qaResolveChartRef.value) {
    qaResolveChartInstance = echarts.init(qaResolveChartRef.value)
    qaResolveChartInstance.setOption(getPieChartOption('有问必答48小时内解决统计', qaResolveData))
  }

  // 项目里程碑逾期统计
  if (projectMilestoneChartRef.value) {
    projectMilestoneChartInstance = echarts.init(projectMilestoneChartRef.value)
    projectMilestoneChartInstance.setOption(getPieChartOption('项目里程碑逾期统计', projectMilestoneData))
  }

  // 缺陷类型分布统计
  if (bugTypeChartRef.value) {
    bugTypeChartInstance = echarts.init(bugTypeChartRef.value)
    bugTypeChartInstance.setOption(getPieChartOption('缺陷类型分布统计', bugTypeData))
  }

  // 缺陷处理耗时分布
  if (bugDurationChartRef.value) {
    bugDurationChartInstance = echarts.init(bugDurationChartRef.value)
    bugDurationChartInstance.setOption(getPieChartOption('缺陷处理耗时分布', bugDurationData))
  }

  // 任务工时统计（折线图）
  if (taskHoursChartRef.value) {
    taskHoursChartInstance = echarts.init(taskHoursChartRef.value)
    taskHoursChartInstance.setOption(getLineChartOption('任务工时统计', taskHoursData, taskHoursDates))
  }

  // 按时完成任务统计
  if (onTimeTaskChartRef.value) {
    onTimeTaskChartInstance = echarts.init(onTimeTaskChartRef.value)
    onTimeTaskChartInstance.setOption(getPieChartOption('按时完成任务统计', onTimeTaskData))
  }

  // 逾期任务统计
  if (overdueTaskChartRef.value) {
    overdueTaskChartInstance = echarts.init(overdueTaskChartRef.value)
    overdueTaskChartInstance.setOption(getPieChartOption('逾期任务统计', overdueTaskData))
  }
}

// 初始化所有图表
const initCharts = () => {
  initOriginalCharts()
  initNewCharts()
}

// 更新原有图表
const updateOriginalCharts = () => {
  const { dates, bugData, taskData, workHourData } = generateChartData()

  // 更新缺陷数量变化趋势图
  if (bugChartInstance) {
    const bugOption = {
      xAxis: { data: dates },
      series: [{ data: bugData, type: bugChartType.value }]
    }
    bugChartInstance.setOption(bugOption)
  }

  // 更新任务完成数量变化趋势图
  if (taskChartInstance) {
    const taskOption = {
      xAxis: { data: dates },
      series: [{ data: taskData, type: taskChartType.value }]
    }
    taskChartInstance.setOption(taskOption)
  }

  // 更新实际工时变化趋势图
  if (workHourChartInstance) {
    const workHourOption = {
      xAxis: { data: dates },
      series: [{ data: workHourData, type: workHourChartType.value }]
    }
    workHourChartInstance.setOption(workHourOption)
  }
}

// 更新新图表
const updateNewCharts = () => {
  const {
    productMilestoneData,
    qaReplyData,
    qaResolveData,
    projectMilestoneData,
    bugTypeData,
    bugDurationData,
    taskHoursDates,
    taskHoursData,
    onTimeTaskData,
    overdueTaskData
  } = generateNewChartData()

  // 更新产品线里程碑逾期统计
  if (productMilestoneChartInstance) {
    productMilestoneChartInstance.setOption(getPieChartOption('产品线里程碑逾期统计', productMilestoneData))
  }

  // 更新有问必答系统48小时内回复统计
  if (qaReplyChartInstance) {
    qaReplyChartInstance.setOption(getPieChartOption('有问必答48小时内回复统计', qaReplyData))
  }

  // 更新有问必答系统48小时内解决统计
  if (qaResolveChartInstance) {
    qaResolveChartInstance.setOption(getPieChartOption('有问必答48小时内解决统计', qaResolveData))
  }

  // 更新项目里程碑逾期统计
  if (projectMilestoneChartInstance) {
    projectMilestoneChartInstance.setOption(getPieChartOption('项目里程碑逾期统计', projectMilestoneData))
  }

  // 更新缺陷类型分布统计
  if (bugTypeChartInstance) {
    bugTypeChartInstance.setOption(getPieChartOption('缺陷类型分布统计', bugTypeData))
  }

  // 更新缺陷处理耗时分布
  if (bugDurationChartInstance) {
    bugDurationChartInstance.setOption(getPieChartOption('缺陷处理耗时分布', bugDurationData))
  }

  // 更新任务工时统计
  if (taskHoursChartInstance) {
    taskHoursChartInstance.setOption(getLineChartOption('任务工时统计', taskHoursData, taskHoursDates))
  }

  // 更新按时完成任务统计
  if (onTimeTaskChartInstance) {
    onTimeTaskChartInstance.setOption(getPieChartOption('按时完成任务统计', onTimeTaskData))
  }

  // 更新逾期任务统计
  if (overdueTaskChartInstance) {
    overdueTaskChartInstance.setOption(getPieChartOption('逾期任务统计', overdueTaskData))
  }
}

// 更新所有图表
const updateCharts = () => {
  updateOriginalCharts()
  updateNewCharts()
}

// 处理时间范围变化
const handleTimeRangeChange = () => {
  if (selectedTimeRange.value !== 'custom') {
    updateCharts()
  }
}

// 处理自定义日期变化
const handleCustomDateChange = () => {
  if (selectedTimeRange.value === 'custom' && customDateRange.value && customDateRange.value.length === 2) {
    updateCharts()
  }
}

// 刷新数据
const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    updateCharts()
    loading.value = false
  }, 500)
}

// 处理窗口大小变化
const handleResize = () => {
  nextTick(() => {
    bugChartInstance?.resize()
    taskChartInstance?.resize()
    workHourChartInstance?.resize()
    productMilestoneChartInstance?.resize()
    qaReplyChartInstance?.resize()
    qaResolveChartInstance?.resize()
    projectMilestoneChartInstance?.resize()
    bugTypeChartInstance?.resize()
    bugDurationChartInstance?.resize()
    taskHoursChartInstance?.resize()
    onTimeTaskChartInstance?.resize()
    overdueTaskChartInstance?.resize()
  })
}

// 强制重绘图表
const forceResize = () => {
  setTimeout(() => {
    handleResize()
  }, 100)
}

// 清理图表实例
const cleanup = () => {
  bugChartInstance?.dispose()
  taskChartInstance?.dispose()
  workHourChartInstance?.dispose()
  productMilestoneChartInstance?.dispose()
  qaReplyChartInstance?.dispose()
  qaResolveChartInstance?.dispose()
  projectMilestoneChartInstance?.dispose()
  bugTypeChartInstance?.dispose()
  bugDurationChartInstance?.dispose()
  taskHoursChartInstance?.dispose()
  onTimeTaskChartInstance?.dispose()
  overdueTaskChartInstance?.dispose()
}

// 监听图表类型变化
watch(bugChartType, () => {
  updateOriginalCharts()
})

watch(taskChartType, () => {
  updateOriginalCharts()
})

watch(workHourChartType, () => {
  updateOriginalCharts()
})

// 生命周期钩子
onMounted(() => {
  nextTick(() => {
    initCharts()
  })
})

// 监听窗口大小变化
if (typeof window !== 'undefined') {
  window.addEventListener('resize', handleResize)
}

// 监听模块筛选变化
watch(() => props.selectedModule, () => {
  nextTick(() => {
    updateCharts()
  })
}, { deep: true })

// 组件卸载时清理
if (typeof window !== 'undefined') {
  window.removeEventListener('resize', handleResize)
  cleanup()
}

// 暴露方法给父组件
defineExpose({
  refreshData,
  forceResize
})
</script>

<style scoped>
.dashboard-pane {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.filter-container {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.chart-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.new-charts-container {
  margin-top: 20px;
}

.chart-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;
}

.chart {
  width: 100%;
  height: 300px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-pane {
    padding: 10px;
  }
  
  .chart-container {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .filter-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .chart {
    height: 250px;
  }
}

@media (max-width: 480px) {
  .chart {
    height: 200px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>