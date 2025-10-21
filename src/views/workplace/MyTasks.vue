<template>
  <div class="my-tasks-container">
    <el-row :gutter="16">
      <!-- 勘察记表 -->
      <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="task-col">
        <div class="task-content">
          <div class="chart-container">
            <div class="chart-wrapper">
              <div ref="surveyChart" class="chart"></div>
              <div class="chart-center">
                <div class="chart-title">勘察记表</div>
                <div class="chart-progress">{{ surveyProgress }}%</div>
              </div>
            </div>
            <div class="stats-info">
              <div class="stat-item">
                <span class="stat-label">总数：</span>
                <span class="stat-value">{{ surveyTotal }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">完成数：</span>
                <span class="stat-value completed">{{ surveyCompleted }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">剩余数：</span>
                <span class="stat-value remaining">{{ surveyRemaining }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      
      <!-- 设计记表 -->
      <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="task-col">
        <el-divider direction="vertical" class="task-divider" />
        <div class="task-content">
          <div class="chart-container">
            <div class="chart-wrapper">
              <div ref="designChart" class="chart"></div>
              <div class="chart-center">
                <div class="chart-title">设计记表</div>
                <div class="chart-progress">{{ designProgress }}%</div>
              </div>
            </div>
            <div class="stats-info">
              <div class="stat-item">
                <span class="stat-label">总数：</span>
                <span class="stat-value">{{ designTotal }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">完成数：</span>
                <span class="stat-value completed">{{ designCompleted }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">剩余数：</span>
                <span class="stat-value remaining">{{ designRemaining }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

// 定义props
const props = defineProps({
  projectId: {
    type: [String, Number],
    default: undefined
  },
  date: {
    type: String,
    default: undefined
  }
})

// 勘察记表数据
const surveyTotal = ref(100)
const surveyCompleted = ref(75)
const surveyRemaining = ref(25)
const surveyProgress = ref(75)

// 设计记表数据
const designTotal = ref(80)
const designCompleted = ref(60)
const designRemaining = ref(20)
const designProgress = ref(75)

// 图表实例
const surveyChart = ref(null)
const designChart = ref(null)
let surveyChartInstance = null
let designChartInstance = null

// 创建仪表盘配置
const createGaugeChartOption = (progress, color) => {
  return {
    series: [
      {
        type: 'gauge',
        startAngle: 225,
        endAngle: -45,
        min: 0,
        max: 100,
        radius: '90%',
        center: ['50%', '60%'],
        splitNumber: 0,
        axisLine: {
          lineStyle: {
            width: 18,
            color: [
              [progress / 100, color],
              [1, '#e4e7ed']
            ]
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          show: false
        },
        pointer: {
          show: false
        },
        detail: {
          show: false
        }
      }
    ]
  }
}

// 初始化图表
const initCharts = () => {
  if (surveyChart.value) {
    surveyChartInstance = echarts.init(surveyChart.value)
    surveyChartInstance.setOption(createGaugeChartOption(surveyProgress.value, '#409EFF'))
  }
  
  if (designChart.value) {
    designChartInstance = echarts.init(designChart.value)
    designChartInstance.setOption(createGaugeChartOption(designProgress.value, '#67C23A'))
  }
}

// 获取任务数据（模拟API调用）
const fetchTaskData = async () => {
  try {
    // 这里可以根据projectId和date调用后端API
    console.log('获取任务数据:', { projectId: props.projectId, date: props.date })
    
    // 模拟API响应数据
    // const response = await getTaskData({ projectId: props.projectId, date: props.date })
    
    // 这里使用模拟数据，实际项目中应该替换为真实API数据
    // surveyTotal.value = response.data.surveyTotal
    // surveyCompleted.value = response.data.surveyCompleted
    // surveyRemaining.value = response.data.surveyRemaining
    // surveyProgress.value = response.data.surveyProgress
    
    // designTotal.value = response.data.designTotal
    // designCompleted.value = response.data.designCompleted
    // designRemaining.value = response.data.designRemaining
    // designProgress.value = response.data.designProgress
  } catch (error) {
    console.error('获取任务数据失败:', error)
  }
}

// 监听props变化
watch(() => [props.projectId, props.date], () => {
  fetchTaskData()
}, { immediate: true })

// 组件挂载
onMounted(() => {
  initCharts()
  
  // 响应式处理
  window.addEventListener('resize', () => {
    surveyChartInstance?.resize()
    designChartInstance?.resize()
  })
})

// 组件卸载时销毁图表
const beforeUnmount = () => {
  surveyChartInstance?.dispose()
  designChartInstance?.dispose()
  window.removeEventListener('resize', () => {
    surveyChartInstance?.resize()
    designChartInstance?.resize()
  })
}
</script>

<style scoped>
.my-tasks-container {
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
}

.task-content {
  padding: 20px;
}

/* 任务列容器样式 */
.task-col {
  position: relative;
}

/* el-divider 分隔线样式 */
.task-divider {
  position: absolute;
  left: 0;
  top: 10%;
  bottom: 10%;
  height: auto;
  margin: 0;
  border-left: 1px solid #dcdfe6;
}

@media (max-width: 767px) {
  .task-divider {
    display: none;
  }
}

.chart-container {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding-top: 10px;
}

.chart-wrapper {
  position: relative;
  width: 160px;
  height: 120px;
}

.chart {
  width: 100%;
  height: 100%;
}

.chart-center {
  position: absolute;
  top: 65%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.chart-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 6px;
  font-weight: 500;
}

.chart-progress {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stats-info {
  flex: 1;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.stat-label {
  color: #606266;
  font-size: 14px;
}

.stat-value {
  font-weight: 500;
  font-size: 16px;
  color: #303133;
}

.stat-value.completed {
  color: #67C23A;
}

.stat-value.remaining {
  color: #F56C6C;
}

/* 响应式处理 */
@media (max-width: 768px) {
  .chart-container {
    flex-direction: column;
    text-align: center;
  }
  
  .stats-info {
    width: 100%;
  }
}
</style>