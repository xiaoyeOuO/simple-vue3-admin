<template>
  <div class="report-index-container">
    <div class="header">
      <h2>日报管理</h2>
      <div class="header-actions">
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
        />
        <el-button type="primary" @click="handleBatchEdit">
          <el-icon><Edit /></el-icon>
          批量编辑
        </el-button>
      </div>
    </div>
    
    <!-- 统计信息 -->
    <div class="statistics">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card>
            <div class="stat-item">
              <div class="stat-label">总人数</div>
              <div class="stat-value">{{ users.length }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <div class="stat-item">
              <div class="stat-label">已填写</div>
              <div class="stat-value">{{ filledCount }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <div class="stat-item">
              <div class="stat-label">完成率</div>
              <div class="stat-value">{{ completionRate }}%</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <div class="stat-item">
              <div class="stat-label">今日日期</div>
              <div class="stat-value">{{ today }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="table-container">
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#303133', fontWeight: 'bold' }"
        v-loading="loading"
      >
        <el-table-column
          prop="user"
          label="用户"
          width="120"
          fixed
          align="center"
        />
        <el-table-column 
          v-for="date in dates" 
          :key="date" 
          :label="date" 
          align="center"
        >
          <el-table-column
            v-for="metric in metrics"
            :key="metric.key"
            :prop="`${metric.key}_${date}`"
            :label="metric.label"
            min-width="100"
            align="center"
          >
            <template #default="{ row }">
              <div 
                class="editable-cell"
                :class="{ 'has-data': row[`${metric.key}_${date}`] }"
                @click="handleCellClick(row.user, date, metric.label)"
              >
                {{ row[`${metric.key}_${date}`] || '-' }}
              </div>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑日报数据"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="dialog-content">
        <div class="dialog-info">
          <p><strong>用户：</strong>{{ currentEditData.user }}</p>
          <p><strong>日期：</strong>{{ currentEditData.date }}</p>
          <p><strong>指标：</strong>{{ currentEditData.metric }}</p>
        </div>
        <el-input
          v-model="currentEditData.value"
          type="textarea"
          :rows="4"
          placeholder="请输入内容..."
          maxlength="500"
          show-word-limit
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEditData">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 基础数据
const dates = ref([])
const metrics = ref([])
const loading = ref(false)

// 获取表格配置数据
const fetchTableConfig = async () => {
  try {
    loading.value = true
    // 模拟接口调用，实际使用时替换为真实API
    const response = await new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            dates: ['2025-09-01', '2025-09-02', '2025-09-03'],
            fields: [
              { key: 'workTime', label: '工作时长', unit: '小时' },
              { key: 'taskCount', label: '任务数量', unit: '个' },
              { key: 'bugCount', label: '缺陷数量', unit: '个' },
              { key: 'coverage', label: '测试覆盖率', unit: '%' }
            ]
          }
        })
      }, 500)
    })
    
    dates.value = response.data.dates
    metrics.value = response.data.fields
  } catch (error) {
    console.error('获取表格配置失败:', error)
    ElMessage.error('获取表格配置失败')
  } finally {
    loading.value = false
  }
}
const users = ref(['张三', '李四', '王五'])

// 日报数据存储（扁平化结构）
const dailyData = ref({})

// 示例数据
const sampleData = {
  '张三_2025-09-01_workTime': '8',
  '张三_2025-09-01_taskCount': '5',
  '张三_2025-09-01_bugCount': '2',
  '张三_2025-09-01_coverage': '85%',
  '张三_2025-09-02_workTime': '7.5',
  '张三_2025-09-02_taskCount': '4',
  '张三_2025-09-02_bugCount': '1',
  '张三_2025-09-02_coverage': '90%',
  '李四_2025-09-01_workTime': '9',
  '李四_2025-09-01_taskCount': '6',
  '李四_2025-09-01_bugCount': '0',
  '李四_2025-09-01_coverage': '92%',
  '王五_2025-09-02_workTime': '8',
  '王五_2025-09-02_taskCount': '7',
  '王五_2025-09-02_bugCount': '3',
  '王五_2025-09-02_coverage': '88%'
}

const selectedDate = ref('')
const today = new Date().toISOString().split('T')[0]

// 生命周期
onMounted(() => {
  fetchTableConfig()
  // 加载示例数据
  dailyData.value = { ...sampleData }
})

// 计算属性
const tableData = computed(() => {
  return users.value.map(user => {
    const rowData = { user }
    dates.value.forEach(date => {
      metrics.value.forEach(metric => {
        const key = `${metric.key}_${date}`
        rowData[key] = getCellData(user, date, metric.label)
      })
    })
    return rowData
  })
})

const filledCount = computed(() => {
  let count = 0
  users.value.forEach(user => {
    dates.value.forEach(date => {
      metrics.value.slice(0, 4).forEach(metric => {
        if (getCellData(user, date, metric)) {
          count++
        }
      })
    })
  })
  return count
})

const completionRate = computed(() => {
  const totalCells = users.value.length * dates.value.length * metrics.value.length
  return totalCells > 0 ? Math.round((filledCount.value / totalCells) * 100) : 0
})

// 获取单元格数据
const getCellData = (user, date, metricLabel) => {
  const metric = metrics.value.find(m => m.label === metricLabel)
  if (!metric) return ''
  const key = `${user}_${date}_${metric.key}`
  return dailyData.value[key] || ''
}

// 设置单元格数据
const setCellData = (user, date, metricLabel, value) => {
  const metric = metrics.value.find(m => m.label === metricLabel)
  if (!metric) return
  const key = `${user}_${date}_${metric.key}`
  if (value && value.trim()) {
    dailyData.value[key] = value.trim()
  } else {
    delete dailyData.value[key]
  }
}

const dialogVisible = ref(false)
const currentEditData = ref({
  user: '',
  date: '',
  metric: '',
  value: ''
})

const handleCellClick = (user, date, metricLabel) => {
  currentEditData.value = {
    user,
    date,
    metric: metricLabel,
    value: getCellData(user, date, metricLabel)
  }
  dialogVisible.value = true
}

const saveEditData = () => {
  const { user, date, metric, value } = currentEditData.value
  
  if (!value.trim()) {
    ElMessage.warning('请输入内容')
    return
  }
  
  setCellData(user, date, metric, value.trim())
  dialogVisible.value = false
  ElMessage.success('数据已更新')
}

const handleDateChange = (date) => {
  if (date) {
    dates.value = [date]
  }
}

const handleBatchEdit = () => {
  ElMessage.info('批量编辑功能开发中...')
}
</script>

<style scoped>
.report-index-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.editable-cell {
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 4px;
  min-height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.editable-cell:hover {
  background-color: #f0f9ff;
  color: #409eff;
}

.editable-cell.has-data {
  background-color: #f0f9ff;
  color: #409eff;
  font-weight: bold;
}

:deep(.el-table) {
  border-radius: 8px;
}

:deep(.el-table__header-wrapper) {
  border-radius: 8px 8px 0 0;
}

:deep(.el-table__body-wrapper) {
  border-radius: 0 0 8px 8px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.dialog-content {
  padding: 10px 0;
}

.dialog-info {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.dialog-info p {
  margin: 5px 0;
  color: #303133;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.statistics {
  margin-bottom: 20px;
}
</style>