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

    <!-- 数据分析图表 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- 1. 当量统计及趋势折线图 -->
        <el-col :span="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>当量统计及趋势</h3>
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                size="small"
                style="width: 240px"
                @change="updateCodeEquivalentChart"
              />
            </div>
            <div ref="codeEquivalentChart" class="chart-container" style="height: 300px"></div>
          </div>
        </el-col>

        <!-- 2. 缺陷类型分布饼图 -->
        <el-col :span="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>缺陷类型分布</h3>
            </div>
            <div ref="defectTypeChart" class="chart-container" style="height: 300px"></div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <!-- 3. 遗留缺陷比例及趋势 -->
        <el-col :span="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>遗留缺陷比例及趋势</h3>
            </div>
            <div ref="legacyDefectChart" class="chart-container" style="height: 300px"></div>
          </div>
        </el-col>

        <!-- 4. 缺陷处理耗时分布饼图 -->
        <el-col :span="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>缺陷处理耗时分布</h3>
            </div>
            <div ref="defectDurationChart" class="chart-container" style="height: 300px"></div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <!-- 5. A项目工时占比 -->
        <el-col :span="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>A项目工时占比</h3>
              <el-select v-model="selectedProject" size="small" style="width: 120px" @change="updateProjectCharts">
                <el-option label="项目A" value="A" />
                <el-option label="项目B" value="B" />
                <el-option label="项目C" value="C" />
              </el-select>
            </div>
            <div ref="projectWorkHoursChart" class="chart-container" style="height: 300px"></div>
          </div>
        </el-col>

        <!-- 6. 个人工时分布 -->
        <el-col :span="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>个人工时分布</h3>
            </div>
            <div ref="personalWorkHoursChart" class="chart-container" style="height: 300px"></div>
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
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { Folder, Check, Clock, Document, Refresh } from '@element-plus/icons-vue'
// import { personalApi } from '@/api/personal' // 真实API调用时使用

const route = useRoute()
const loading = ref(false)
const taskTable = ref()

// 图表相关
const dateRange = ref([])
const selectedProject = ref('A')
const codeEquivalentChart = ref()
const defectTypeChart = ref()
const legacyDefectChart = ref()
const defectDurationChart = ref()
const projectWorkHoursChart = ref()
const personalWorkHoursChart = ref()

let chartInstances = {}

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
  }
}

// 获取图表数据
const fetchChartData = async () => {
  try {
    loading.value = true
    
    // 模拟后端接口数据获取
    console.log('开始获取个人图表数据...')
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 模拟后端返回的数据
    const mockApiData = {
      // 当量统计数据
      codeEquivalent: {
        months: ['1月', '2月', '3月', '4月', '5月', '6月'],
        data: [120, 132, 101, 134, 90, 230]
      },
      // 缺陷类型分布数据
      defectType: [
        { value: 2, name: '紧急' },
        { value: 5, name: '高级' },
        { value: 8, name: '中级' },
        { value: 3, name: '低级' }
      ],
      // 遗留缺陷趋势数据
      legacyDefect: {
        weeks: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周'],
        unresolved: [5, 8, 6, 9, 7, 5],
        total: [10, 15, 12, 18, 14, 10]
      },
      // 缺陷处理耗时分布数据
      defectDuration: [
        { value: 8, name: '5天以内' },
        { value: 12, name: '5-15天' },
        { value: 6, name: '15-30天' },
        { value: 4, name: '30天以上' }
      ],
      // 项目工时占比数据
      projectWorkHours: {
        personal: 120,
        total: 400
      },
      // 个人工时分布数据
      personalWorkHours: [
        { value: 120, name: 'A项目' },
        { value: 80, name: 'B项目' },
        { value: 60, name: 'C项目' },
        { value: 40, name: '其他项目' }
      ]
    }
    
    console.log('个人图表数据获取成功:', mockApiData)
    
    // 使用模拟的后端数据初始化图表
    initChartsWithData(mockApiData)
    
  } catch (error) {
    console.error('获取图表数据失败:', error)
    ElMessage.error('获取图表数据失败')
    
    // 错误时使用默认数据
    console.log('使用默认数据初始化图表')
    initCharts()
  } finally {
    loading.value = false
  }
}

// 图表相关方法
const initCharts = async () => {
  await nextTick()
  
  // 1. 当量统计及趋势折线图
  initCodeEquivalentChart()
  
  // 2. 缺陷类型分布饼图
  initDefectTypeChart()
  
  // 3. 遗留缺陷比例及趋势
  initLegacyDefectChart()
  
  // 4. 缺陷处理耗时分布饼图
  initDefectDurationChart()
  
  // 5. A项目工时占比
  initProjectWorkHoursChart()
  
  // 6. 个人工时分布
  initPersonalWorkHoursChart()
}

// 使用模拟后端数据初始化图表
const initChartsWithData = async (apiData) => {
  await nextTick()
  
  // 1. 当量统计及趋势折线图
  initCodeEquivalentChartWithData(apiData.codeEquivalent)
  
  // 2. 缺陷类型分布饼图
  initDefectTypeChartWithData(apiData.defectType)
  
  // 3. 遗留缺陷比例及趋势
  initLegacyDefectChartWithData(apiData.legacyDefect)
  
  // 4. 缺陷处理耗时分布饼图
  initDefectDurationChartWithData(apiData.defectDuration)
  
  // 5. A项目工时占比
  initProjectWorkHoursChartWithData(apiData.projectWorkHours)
  
  // 6. 个人工时分布
  initPersonalWorkHoursChartWithData(apiData.personalWorkHours)
}

// 1. 当量统计及趋势折线图
const initCodeEquivalentChart = () => {
  if (!codeEquivalentChart.value) return
  
  const chart = echarts.init(codeEquivalentChart.value)
  chartInstances.codeEquivalent = chart
  
  const option = {
    title: {
      text: '代码当量趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>{a}: {c} 当量'
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value',
      name: '当量'
    },
    series: [{
      name: '代码当量',
      type: 'line',
      data: [120, 132, 101, 134, 90, 230],
      smooth: true,
      itemStyle: {
        color: '#409EFF'
      },
      areaStyle: {
        opacity: 0.3
      }
    }]
  }
  
  chart.setOption(option)
}

// 使用后端数据初始化当量统计及趋势折线图
const initCodeEquivalentChartWithData = (data) => {
  if (!codeEquivalentChart.value) return
  
  const chart = echarts.init(codeEquivalentChart.value)
  chartInstances.codeEquivalent = chart
  
  const option = {
    title: {
      text: '代码当量趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>{a}: {c} 当量'
    },
    xAxis: {
      type: 'category',
      data: data.months
    },
    yAxis: {
      type: 'value',
      name: '当量'
    },
    series: [{
      name: '代码当量',
      type: 'line',
      data: data.data,
      smooth: true,
      itemStyle: {
        color: '#409EFF'
      },
      areaStyle: {
        opacity: 0.3
      }
    }]
  }
  
  chart.setOption(option)
}

// 2. 缺陷类型分布饼图
const initDefectTypeChart = () => {
  if (!defectTypeChart.value) return
  
  const chart = echarts.init(defectTypeChart.value)
  chartInstances.defectType = chart
  
  const option = {
    title: {
      text: '缺陷类型分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      name: '缺陷数量',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 2, name: '紧急' },
        { value: 5, name: '高级' },
        { value: 8, name: '中级' },
        { value: 3, name: '低级' }
      ],
      itemStyle: {
        color: function(params) {
          const colors = ['#F56C6C', '#E6A23C', '#409EFF', '#67C23A']
          return colors[params.dataIndex]
        }
      }
    }]
  }
  
  chart.setOption(option)
}

// 使用后端数据初始化缺陷类型分布饼图
const initDefectTypeChartWithData = (data) => {
  if (!defectTypeChart.value) return
  
  const chart = echarts.init(defectTypeChart.value)
  chartInstances.defectType = chart
  
  const option = {
    title: {
      text: '缺陷类型分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      name: '缺陷数量',
      type: 'pie',
      radius: '50%',
      data: data,
      itemStyle: {
        color: function(params) {
          const colors = ['#F56C6C', '#E6A23C', '#409EFF', '#67C23A']
          return colors[params.dataIndex]
        }
      }
    }]
  }
  
  chart.setOption(option)
}

// 3. 遗留缺陷比例及趋势
const initLegacyDefectChart = () => {
  if (!legacyDefectChart.value) return
  
  const chart = echarts.init(legacyDefectChart.value)
  chartInstances.legacyDefect = chart
  
  const option = {
    title: {
      text: '遗留缺陷趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['未解决缺陷', '总缺陷数'],
      top: 30
    },
    xAxis: {
      type: 'category',
      data: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周']
    },
    yAxis: {
      type: 'value',
      name: '缺陷数量'
    },
    series: [
      {
        name: '未解决缺陷',
        type: 'line',
        data: [5, 8, 6, 9, 7, 5],
        smooth: true,
        itemStyle: { color: '#F56C6C' }
      },
      {
        name: '总缺陷数',
        type: 'line',
        data: [10, 15, 12, 18, 14, 10],
        smooth: true,
        itemStyle: { color: '#409EFF' }
      }
    ]
  }
  
  chart.setOption(option)
}

// 使用后端数据初始化遗留缺陷比例及趋势
const initLegacyDefectChartWithData = (data) => {
  if (!legacyDefectChart.value) return
  
  const chart = echarts.init(legacyDefectChart.value)
  chartInstances.legacyDefect = chart
  
  const option = {
    title: {
      text: '遗留缺陷趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['未解决缺陷', '总缺陷数'],
      top: 30
    },
    xAxis: {
      type: 'category',
      data: data.weeks
    },
    yAxis: {
      type: 'value',
      name: '缺陷数量'
    },
    series: [
      {
        name: '未解决缺陷',
        type: 'line',
        data: data.unresolved,
        smooth: true,
        itemStyle: { color: '#F56C6C' }
      },
      {
        name: '总缺陷数',
        type: 'line',
        data: data.total,
        smooth: true,
        itemStyle: { color: '#409EFF' }
      }
    ]
  }
  
  chart.setOption(option)
}

// 4. 缺陷处理耗时分布饼图
const initDefectDurationChart = () => {
  if (!defectDurationChart.value) return
  
  const chart = echarts.init(defectDurationChart.value)
  chartInstances.defectDuration = chart
  
  const option = {
    title: {
      text: '缺陷处理耗时分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}个 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      name: '缺陷数量',
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: 8, name: '5天以内' },
        { value: 12, name: '5-15天' },
        { value: 6, name: '15-30天' },
        { value: 4, name: '30天以上' }
      ],
      itemStyle: {
        color: function(params) {
          const colors = ['#67C23A', '#E6A23C', '#F56C6C', '#909399']
          return colors[params.dataIndex]
        }
      }
    }]
  }
  
  chart.setOption(option)
}

// 使用后端数据初始化缺陷处理耗时分布饼图
const initDefectDurationChartWithData = (data) => {
  if (!defectDurationChart.value) return
  
  const chart = echarts.init(defectDurationChart.value)
  chartInstances.defectDuration = chart
  
  const option = {
    title: {
      text: '缺陷处理耗时分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}个 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      name: '缺陷数量',
      type: 'pie',
      radius: ['40%', '70%'],
      data: data,
      itemStyle: {
        color: function(params) {
          const colors = ['#67C23A', '#E6A23C', '#F56C6C', '#909399']
          return colors[params.dataIndex]
        }
      }
    }]
  }
  
  chart.setOption(option)
}

// 5. A项目工时占比
const initProjectWorkHoursChart = () => {
  if (!projectWorkHoursChart.value) return
  
  const chart = echarts.init(projectWorkHoursChart.value)
  chartInstances.projectWorkHours = chart
  
  const option = {
    title: {
      text: `${selectedProject.value}项目工时占比`,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}小时 ({d}%)'
    },
    series: [{
      name: '工时',
      type: 'pie',
      radius: '60%',
      data: [
        { value: 120, name: '个人工时' },
        { value: 280, name: '项目总工时' }
      ],
      itemStyle: {
        color: function(params) {
          return params.dataIndex === 0 ? '#409EFF' : '#E6A23C'
        }
      }
    }]
  }
  
  chart.setOption(option)
}

// 使用后端数据初始化A项目工时占比
const initProjectWorkHoursChartWithData = (data) => {
  if (!projectWorkHoursChart.value) return
  
  const chart = echarts.init(projectWorkHoursChart.value)
  chartInstances.projectWorkHours = chart
  
  const otherHours = data.total - data.personal
  
  const option = {
    title: {
      text: `${selectedProject.value}项目工时占比`,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}小时 ({d}%)'
    },
    series: [{
      name: '工时',
      type: 'pie',
      radius: '60%',
      data: [
        { value: data.personal, name: '个人工时' },
        { value: otherHours, name: '项目总工时' }
      ],
      itemStyle: {
        color: function(params) {
          return params.dataIndex === 0 ? '#409EFF' : '#E6A23C'
        }
      }
    }]
  }
  
  chart.setOption(option)
}

// 6. 个人工时分布
const initPersonalWorkHoursChart = () => {
  if (!personalWorkHoursChart.value) return
  
  const chart = echarts.init(personalWorkHoursChart.value)
  chartInstances.personalWorkHours = chart
  
  const option = {
    title: {
      text: '个人工时分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}小时 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      name: '工时',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 120, name: 'A项目' },
        { value: 80, name: 'B项目' },
        { value: 60, name: 'C项目' },
        { value: 40, name: '其他项目' }
      ],
      itemStyle: {
        color: function(params) {
          const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C']
          return colors[params.dataIndex]
        }
      }
    }]
  }
  
  chart.setOption(option)
}

// 使用后端数据初始化个人工时分布
const initPersonalWorkHoursChartWithData = (data) => {
  if (!personalWorkHoursChart.value) return
  
  const chart = echarts.init(personalWorkHoursChart.value)
  chartInstances.personalWorkHours = chart
  
  const option = {
    title: {
      text: '个人工时分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}小时 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      name: '工时',
      type: 'pie',
      radius: '50%',
      data: data,
      itemStyle: {
        color: function(params) {
          const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C']
          return colors[params.dataIndex]
        }
      }
    }]
  }
  
  chart.setOption(option)
}

// 更新图表方法
const updateCodeEquivalentChart = () => {
  if (chartInstances.codeEquivalent) {
    // 这里可以根据日期范围重新获取数据并更新图表
    initCodeEquivalentChart()
  }
}

const updateProjectCharts = () => {
  if (chartInstances.projectWorkHours) {
    initProjectWorkHoursChart()
  }
}

onMounted(() => {
  fetchUserData()
  fetchChartData()
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    Object.values(chartInstances).forEach(chart => {
      if (chart) chart.resize()
    })
  })
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
/* 图表区域样式 */
.charts-section {
  margin-bottom: 20px;
}

.chart-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.chart-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.chart-container {
  width: 100%;
  height: 300px;
}

@media (max-width: 768px) {
  .charts-section .el-col {
    margin-bottom: 15px;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .chart-container {
    height: 250px;
  }
}

</style>