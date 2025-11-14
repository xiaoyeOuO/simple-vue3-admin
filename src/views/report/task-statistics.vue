<template>
  <div class="task-statistics">
    <div class="page-header">
      <h2>任务统计报表</h2>
      <div class="header-controls">
        <el-select
          v-model="departmentFilter"
          placeholder="选择部门"
          size="default"
          style="width: 150px"
          clearable
          @change="handleDepartmentChange"
        >
          <el-option
            v-for="dept in mockData.departments"
            :key="dept"
            :label="dept"
            :value="dept"
          />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="monthrange"
          range-separator="至"
          start-placeholder="开始月份"
          end-placeholder="结束月份"
          size="default"
          format="YYYY-MM"
          value-format="YYYY-MM"
          @change="handleDateChange"
        />
        <el-button type="primary" @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </div>

    <div class="chart-container">
      <div class="chart-header">
        <h3>各所任务统计</h3>
        <p class="chart-subtitle">点击柱状图段查看详细任务信息</p>
      </div>
      <div class="custom-legend">
        <div class="legend-item">
          <span class="legend-color" style="background-color: #409EFF;"></span>
          <span class="legend-text">计划开始</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background-color: #67C23A;"></span>
          <span class="legend-text">计划结束</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background-color: #E6A23C;"></span>
          <span class="legend-text">实际结束</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background-color: #F56C6C;"></span>
          <span class="legend-text">逾期已完成</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background-color: #909399;"></span>
          <span class="legend-text">逾期未开始</span>
        </div>
      </div>
      <div ref="stackedChart" class="chart-content"></div>
    </div>

    <!-- 任务详情弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="dialog-content">
        <div class="dialog-summary">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="summary-item">
                <label>部门：</label>
                <span>{{ currentDepartment }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="summary-item">
                <label>月份：</label>
                <span>{{ currentMonth }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="summary-item">
                <label>任务状态：</label>
                <el-tag :type="getStatusTagType(currentStatus)">
                  {{ currentStatus }}
                </el-tag>
              </div>
            </el-col>
          </el-row>
        </div>

        <el-table
          :data="taskDetails"
          style="width: 100%"
          max-height="400"
          v-loading="dialogLoading"
        >
          <el-table-column prop="taskName" label="任务名称" min-width="180" show-overflow-tooltip />
          <el-table-column prop="taskUser" label="负责人" width="120" />
        </el-table>
        
        <!-- 分页组件 -->
        <div style="margin-top: 20px; text-align: center;">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalCount"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { taskStatisticsAPI } from '@/api/taskStatistics.js'

// 响应式数据
const dateRange = ref([])
const loading = ref(false)
const dialogLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const currentDepartment = ref('')
const currentMonth = ref('')
const currentStatus = ref('')
const taskDetails = ref([])
const departmentFilter = ref('') // 新增：部门筛选
const isInitialized = ref(false) // 新增：初始化标志

// 任务详情缓存 - 存储所有任务数据，支持前端分页
const allTaskDetails = ref([])

// 全局任务详情缓存 - 按部门、月份、状态分类存储
const globalTaskCache = ref({})

// 分页相关数据
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)

// ECharts实例
let chartInstance = null
const stackedChart = ref(null)

// 模拟数据
const mockData = ref({
  months: [],
  departments: [],
  data: {
    '延期任务': [],
    '进行中任务': [],
    '未开始任务': []
  }
})

// 使用API获取后端数据
const loadBackendData = async () => {
  try {
    // 调用API获取数据
    const response = await taskStatisticsAPI.getTaskStatistics(dateRange.value[0], dateRange.value[1])
    
    if (response.code === 200 && response.data) {
      return response.data
    } else {
      throw new Error(response.message || '获取数据失败')
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    throw error
  }
}

// ====== 数据转换函数（适配后端数据结构）======

// 获取缓存中的任务详情数据
const getCachedTaskDetails = (department, month, status) => {
  if (!department || !month || !status) {
    return []
  }
  
  if (globalTaskCache.value[department] && 
      globalTaskCache.value[department][month] && 
      globalTaskCache.value[department][month][status]) {
    return globalTaskCache.value[department][month][status]
  }
  
  return []
}

// 将后端数据转换为图表需要的格式，并提取所有任务详情数据到缓存
const transformBackendData = (backendData) => {
  // 重置全局缓存
  globalTaskCache.value = {}
  
  if (!backendData || !backendData.result || !Array.isArray(backendData.result)) {
    return {
      months: [],
      departments: [],
      data: {
        '计划开始': [],
        '计划结束': [],
        '实际结束': [],
        '逾期已完成': [],
        '逾期未开始': []
      }
    }
  }

  const months = []
  const departments = []
  const data = {
    '计划开始': [],
    '计划结束': [],
    '实际结束': [],
    '逾期已完成': [],
    '逾期未开始': []
  }

  // 提取所有月份和部门
  backendData.result.forEach(monthData => {
    const month = monthData.date ? monthData.date.substring(0, 7) : ''
    if (month) {
      months.push(month)
    }
  })

  // 假设所有月份数据都有相同的部门结构
  if (backendData.result.length > 0 && backendData.result[0].units) {
    backendData.result[0].units.forEach(unit => {
      departments.push(unit.unitName)
      // 为每个部门初始化数据数组
      data['计划开始'].push([])
      data['计划结束'].push([])
      data['实际结束'].push([])
      data['逾期已完成'].push([])
      data['逾期未开始'].push([])
    })
  }

  // 填充数据并提取任务详情到缓存
  backendData.result.forEach((monthData, monthIndex) => {
    const month = months[monthIndex]
    
    if (monthData.units) {
      monthData.units.forEach((unit, deptIndex) => {
        const unitData = unit.data || {}
        const department = departments[deptIndex]
        
        // 初始化缓存结构
        if (!globalTaskCache.value[department]) {
          globalTaskCache.value[department] = {}
        }
        if (!globalTaskCache.value[department][month]) {
          globalTaskCache.value[department][month] = {}
        }
        
        // 计划开始 = startCount
        data['计划开始'][deptIndex][monthIndex] = unitData.startCount || 0
        // 存储计划开始任务详情
        if (unitData.startList && Array.isArray(unitData.startList)) {
          globalTaskCache.value[department][month]['计划开始'] = unitData.startList
        }
        
        // 计划结束 = donePlanCount
        data['计划结束'][deptIndex][monthIndex] = unitData.donePlanCount || 0
        // 存储计划结束任务详情
        if (unitData.donePlanList && Array.isArray(unitData.donePlanList)) {
          globalTaskCache.value[department][month]['计划结束'] = unitData.donePlanList
        }
        
        // 实际结束 = doneActualCount
        data['实际结束'][deptIndex][monthIndex] = unitData.doneActualCount || 0
        // 存储实际结束任务详情
        if (unitData.doneActualList && Array.isArray(unitData.doneActualList)) {
          globalTaskCache.value[department][month]['实际结束'] = unitData.doneActualList
        }
        
        // 逾期已完成 = dueLeaveDoneCount
        data['逾期已完成'][deptIndex][monthIndex] = unitData.dueLeaveDoneCount || 0
        // 存储逾期已完成任务详情
        if (unitData.dueLeaveDoneList && Array.isArray(unitData.dueLeaveDoneList)) {
          globalTaskCache.value[department][month]['逾期已完成'] = unitData.dueLeaveDoneList
        }
        
        // 逾期未开始 = dueLeaveNotDoneCount
        data['逾期未开始'][deptIndex][monthIndex] = unitData.dueLeaveNotDoneCount || 0
        // 存储逾期未开始任务详情
        if (unitData.dueLeaveNotDoneList && Array.isArray(unitData.dueLeaveNotDoneList)) {
          globalTaskCache.value[department][month]['逾期未开始'] = unitData.dueLeaveNotDoneList
        }
      })
    }
  })

  return {
    months,
    departments,
    data
  }
}

// 使用API获取任务详情数据
const loadTaskDetailsFromAPI = async (department, month, status, page = 1, pageSize = 10) => {
  try {
    const response = await taskStatisticsAPI.getTaskDetails(department, month, status, page, pageSize)
    
    if (response.code === 200 && response.data) {
      return response.data
    } else {
      throw new Error(response.message || '获取任务详情失败')
    }
  } catch (error) {
    console.error('获取任务详情失败:', error)
    throw error
  }
}

// 初始化日期范围（默认最近6个月）
const initDateRange = () => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 5)
  
  dateRange.value = [
    startDate.toISOString().slice(0, 7),
    endDate.toISOString().slice(0, 7)
  ]
}

// 初始化图表
const initChart = async () => {
  if (!stackedChart.value) return
  
  chartInstance = echarts.init(stackedChart.value)
  
  // 显示加载动画
  chartInstance.showLoading()
  
  try {
    // 使用转换函数处理后端数据（这里先用test.json模拟数据）
    // 实际使用时，这里应该是API调用返回的数据
    const backendData = await loadBackendData()
    const data = transformBackendData(backendData)
    mockData.value = data
    
    const series = []
    const statusTypes = ['计划开始', '计划结束', '实际结束', '逾期已完成', '逾期未开始']
    const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
    
    // 为每个部门和状态创建系列
    mockData.value.departments.forEach((dept, deptIndex) => {
      statusTypes.forEach((status, statusIndex) => {
        series.push({
          name: `${dept}-${status}`,
          type: 'bar',
          stack: dept,
          // emphasis: {
          //   focus: 'series' // 注释掉：移除鼠标悬浮高亮其他月份对应数据的功能
          // },
          data: mockData.value.data[status][deptIndex] || [],
          itemStyle: {
            color: colors[statusIndex]
          }
        })
      })
    })
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        // 设置tooltip位置为鼠标右侧
        position: function (point, params, dom, rect, size) {
          // point: 鼠标位置 [x, y]
          // size: tooltip尺寸 {contentSize: [width, height], viewSize: [width, height]}
          const x = point[0] + 10 // 在鼠标右侧10px
          const y = point[1] - size.contentSize[1] / 2 // 垂直居中于鼠标
          
          // 确保tooltip不会超出视口右侧
          const viewWidth = size.viewSize[0]
          const tooltipWidth = size.contentSize[0]
          const adjustedX = (x + tooltipWidth > viewWidth) ? (point[0] - tooltipWidth - 10) : x
          
          return [adjustedX, y]
        },
        formatter: function(params) {
          let result = `<div style="font-weight: bold; margin-bottom: 8px;">${params[0].axisValue}</div>`
          
          // 按部门分组显示
          const deptGroups = {}
          params.forEach(param => {
            const [dept, status] = param.seriesName.split('-')
            if (!deptGroups[dept]) deptGroups[dept] = {}
            deptGroups[dept][status] = param.value
          })
          
          Object.entries(deptGroups).forEach(([dept, statuses]) => {
            result += `<div style="margin: 8px 0; font-weight: bold;">${dept}:</div>`
            Object.entries(statuses).forEach(([status, value]) => {
              const color = status === '计划开始' ? '#409EFF' : 
                           status === '计划结束' ? '#67C23A' :
                           status === '实际结束' ? '#E6A23C' :
                           status === '逾期已完成' ? '#F56C6C' : '#909399'
              result += `<div style="display: flex; align-items: center; margin: 2px 0; margin-left: 16px;">
                <span style="display: inline-block; width: 8px; height: 8px; background-color: ${color}; margin-right: 6px; border-radius: 50%;"></span>
                <span style="flex: 1;">${status}:</span>
                <span style="font-weight: bold; margin-left: 8px;">${value}</span>
              </div>`
            })
          })
          
          return result
        }
      },

      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: mockData.value.months,
        boundaryGap: true
      },
      yAxis: {
        type: 'value',
        name: '任务数量'
      },
      dataZoom: [
        {
          type: 'slider',
          show: true,
          xAxisIndex: 0,
          start: 0,
          end: Math.min(100, (6 / mockData.value.months.length) * 100), // 显示6个月的数据
          height: 24,
          bottom: 15,
          handleSize: '100%',
          handleStyle: {
            color: '#409EFF',
            shadowBlur: 3,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowOffsetX: 1,
            shadowOffsetY: 1
          },
          textStyle: {
            color: '#666',
            fontSize: 12
          },
          borderColor: '#e4e7ed',
          fillerColor: 'rgba(64, 158, 255, 0.15)',
          brushStyle: {
            color: 'rgba(64, 158, 255, 0.3)'
          },
          backgroundColor: '#f5f7fa',
          showDataShadow: false,
          showDetail: false,
          zoomLock: false,
          moveOnMouseMove: true,
          moveOnMouseWheel: true
        },
        {
          type: 'inside',
          xAxisIndex: 0,
          start: 0,
          end: Math.min(100, (6 / mockData.value.months.length) * 100), // 显示6个月的数据
          zoomOnMouseWheel: false, // 禁用内部缩放，避免冲突
          moveOnMouseMove: true,
          moveOnMouseWheel: true
        }
      ],
      series: series
    }
    
    // 为每个系列添加点击事件
    option.series.forEach((series) => {
      series.emphasis = {
        // focus: 'series', // 注释掉：移除鼠标悬浮高亮其他月份对应数据的功能
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        }
      }
    })
    
    chartInstance.hideLoading()
    chartInstance.setOption(option)
    
    // 添加点击事件
    chartInstance.off('click')
    chartInstance.on('click', function(params) {
      if (params.componentType === 'series') {
        handleChartClick(params)
      }
    })
    
    // 设置初始化完成标志
    isInitialized.value = true
  } catch (error) {
    chartInstance.hideLoading()
    ElMessage.error('图表初始化失败')
  }
}

// 处理图表点击事件 - 使用缓存数据，无需API调用
const handleChartClick = (params) => {
  const month = params.name
  const [department, status] = params.seriesName.split('-')
  
  currentMonth.value = month
  currentStatus.value = status
  currentDepartment.value = department
  dialogTitle.value = `${department} - ${month} - ${status}详情`
  
  // 重置分页参数
  currentPage.value = 1
  pageSize.value = 10
  
  dialogVisible.value = true
  
  // 立即显示加载状态
  dialogLoading.value = true
  
  try {
    // 使用辅助函数从缓存中获取对应的数据
    const cachedTasks = getCachedTaskDetails(department, month, status)
    
    if (cachedTasks.length > 0) {
      // 存储到allTaskDetails用于前端分页
      allTaskDetails.value = cachedTasks
      totalCount.value = cachedTasks.length
      
      // 执行前端分页
      performFrontendPagination()
    } else {
      // 如果缓存中没有数据，显示空数据
      ElMessage.warning('未找到对应的任务数据')
      allTaskDetails.value = []
      taskDetails.value = []
      totalCount.value = 0
    }
  } catch (error) {
    console.error('处理任务详情失败:', error)
    ElMessage.error('处理任务详情失败')
    allTaskDetails.value = []
    taskDetails.value = []
    totalCount.value = 0
  } finally {
    dialogLoading.value = false
  }
}

// 执行前端分页
const performFrontendPagination = () => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  taskDetails.value = allTaskDetails.value.slice(startIndex, endIndex)
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    '计划开始': 'info',
    '计划结束': 'success',
    '实际结束': 'primary',
    '逾期已完成': 'warning',
    '逾期未开始': 'danger'
  }
  return typeMap[status] || 'info'
}

// 处理分页变化
const handlePageChange = (page) => {
  currentPage.value = page
  performFrontendPagination()
}

// 处理每页条数变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1 // 重置到第一页
  performFrontendPagination()
}

// 处理部门筛选变化
const handleDepartmentChange = () => {
  if (!isInitialized.value) return
  updateChartData()
}

// 处理日期变化
const handleDateChange = () => {
  if (!isInitialized.value) return
  if (!dateRange.value || dateRange.value.length !== 2) return
  refreshData()
}

// 刷新数据（使用内部数据生成函数）
const refreshData = async () => {
  loading.value = true
  
  try {
    // 添加延迟模拟网络请求
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 使用转换函数处理后端数据
    const backendData = await loadBackendData()
    const data = transformBackendData(backendData)
    mockData.value = data
    
    if (isInitialized.value) {
      updateChartData()
      ElMessage.success('数据刷新成功')
    }
  } catch (error) {
    if (isInitialized.value) {
      ElMessage.error('数据刷新失败')
    }
  } finally {
    loading.value = false
  }
}

// 更新图表数据
const updateChartData = () => {
  if (!chartInstance || !mockData.value.months.length) return
  
  const series = []
  const statusTypes = ['计划开始', '计划结束', '实际结束', '逾期已完成', '逾期未开始']
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
  
  // 根据部门筛选决定显示哪些部门
  const departmentsToShow = departmentFilter.value 
    ? [departmentFilter.value] 
    : mockData.value.departments
  
  // 为每个部门和状态创建系列
  departmentsToShow.forEach((dept) => {
    const deptIndex = mockData.value.departments.indexOf(dept)
    statusTypes.forEach((status, statusIndex) => {
      series.push({
        name: `${dept}-${status}`,
        type: 'bar',
        stack: dept,
        // emphasis: {
        //   focus: 'series' // 注释掉：移除鼠标悬浮高亮其他月份对应数据的功能
        // },
        data: mockData.value.data[status][deptIndex] || [],
        itemStyle: {
          color: colors[statusIndex]
        }
      })
    })
  })
  
  chartInstance.setOption({
    xAxis: {
      data: mockData.value.months
    },
    dataZoom: [
      {
        start: 0,
        end: Math.min(100, (6 / mockData.value.months.length) * 100), // 重新计算显示6个月的数据
        height: 24,
        bottom: 15
      },
      {
        start: 0,
        end: Math.min(100, (6 / mockData.value.months.length) * 100) // 重新计算显示6个月的数据
      }
    ],
    series: series
  })
}

// 根据日期范围生成模拟数据
const generateMockDataByDateRange = (startMonth, endMonth) => {
  // 这里简化处理，实际应该根据真实的月份范围生成数据
  return {
    months: mockData.value.months,
    data: mockData.value.data
  }
}

// 监听窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 生命周期
onMounted(() => {
  initDateRange()
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.task-statistics {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 84px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h2 {
    margin: 0;
    color: #333;
    font-size: 24px;
  }
}

.header-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.chart-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-header {
  margin-bottom: 20px;
  
  h3 {
    margin: 0 0 8px 0;
    color: #333;
    font-size: 18px;
  }
  
  .chart-subtitle {
    color: #666;
    font-size: 14px;
  }
}

.custom-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 20px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
  }
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.legend-text {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.chart-content {
  width: 100%;
  height: 500px;
}

.dialog-content {
  .dialog-summary {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 4px;
    
    .summary-item {
      display: flex;
      align-items: center;
      
      label {
        font-weight: bold;
        margin-right: 8px;
        color: #606266;
      }
      
      span {
        color: #303133;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

// 响应式设计
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .header-controls {
    width: 100%;
    justify-content: flex-start;
  }
  
  .chart-content {
    height: 400px;
  }
}
</style>