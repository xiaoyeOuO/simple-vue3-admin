<template>
  <div class="worktime-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>工时管理</h2>
      <div class="header-actions">
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="success" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出Excel
        </el-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="hover">
      <el-form :model="searchForm" inline>
        <el-form-item label="人员工号">
          <el-input
            v-model="searchForm.employeeId"
            placeholder="请输入人员工号"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="人员姓名">
          <el-input
            v-model="searchForm.employeeName"
            placeholder="请输入人员姓名"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="人员部门">
          <el-select
            v-model="searchForm.department"
            placeholder="请选择部门"
            clearable
            style="width: 150px"
          >
            <el-option label="技术部" value="技术部" />
            <el-option label="产品部" value="产品部" />
            <el-option label="设计部" value="设计部" />
            <el-option label="测试部" value="测试部" />
            <el-option label="运营部" value="运营部" />
          </el-select>
        </el-form-item>
        <el-form-item label="人员公司">
          <el-select
            v-model="searchForm.company"
            placeholder="请选择公司"
            clearable
            style="width: 150px"
          >
            <el-option label="总公司" value="总公司" />
            <el-option label="分公司A" value="分公司A" />
            <el-option label="分公司B" value="分公司B" />
          </el-select>
        </el-form-item>
        <el-form-item label="人员类别">
          <el-select
            v-model="searchForm.employeeType"
            placeholder="请选择类别"
            clearable
            style="width: 120px"
          >
            <el-option label="正式员工" value="正式员工" />
            <el-option label="合同工" value="合同工" />
            <el-option label="实习生" value="实习生" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 工时列表 -->
    <el-card class="table-card" shadow="hover">
      <el-table
        :data="tableData"
        border
        stripe
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="employeeId" label="人员工号" width="120" fixed />
        <el-table-column prop="employeeName" label="人员姓名" width="100" fixed />
        <el-table-column prop="department" label="人员部门" width="100" />
        <el-table-column prop="company" label="人员公司" width="100" />
        <el-table-column prop="employeeType" label="人员类别" width="80" />
        
        <!-- 日期列 - 动态生成 -->
        <el-table-column 
          v-for="date in displayDates" 
          :key="date.key"
          :label="date.label" 
          align="center"
          min-width="180"
        >
          <el-table-column 
            :prop="`${date.key}_morning`" 
            label="上午" 
            min-width="60"
            align="center"
          >
            <template #default="{ row }">
              <el-tooltip
                placement="top"
                effect="dark"
                raw-content
              >
                <template #content>
                  <div style="white-space: pre-line;">
                    {{ getTooltipText(row, date.key, 'morning') }}
                  </div>
                </template>
                <span>{{ row[`${date.key}_morning`] }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column 
            :prop="`${date.key}_afternoon`" 
            label="下午" 
            min-width="60"
            align="center"
          >
            <template #default="{ row }">
              <el-tooltip
                placement="top"
                effect="dark"
                raw-content
              >
                <template #content>
                  <div style="white-space: pre-line;">
                    {{ getTooltipText(row, date.key, 'afternoon') }}
                  </div>
                </template>
                <span>{{ row[`${date.key}_afternoon`] }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column 
            :prop="`${date.key}_evening`" 
            label="晚上" 
            min-width="60"
            align="center"
          >
            <template #default="{ row }">
              <el-tooltip
                placement="top"
                effect="dark"
                raw-content
              >
                <template #content>
                  <div style="white-space: pre-line;">
                    {{ getTooltipText(row, date.key, 'evening') }}
                  </div>
                </template>
                <span>{{ row[`${date.key}_evening`] }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table-column>

        <!-- 合计列 -->
        <el-table-column label="合计" align="center" min-width="320">
          <el-table-column prop="regularHours" label="正班工时" width="80" align="center" />
          <el-table-column prop="overtimeHours" label="加班工时" width="80" align="center" />
          <el-table-column prop="totalHours" label="总工时" width="80" align="center" />
          <el-table-column prop="effectiveDays" label="有效工天" width="80" align="center" />
        </el-table-column>
        

      </el-table>
    </el-card>


  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Download } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = ref({
  employeeId: '',
  employeeName: '',
  department: '',
  company: '',
  employeeType: '',
  dateRange: []
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 编辑相关 - 已移除新增和编辑功能

// 显示日期配置
const displayDates = ref([
  { key: 'date20250901', label: '2025-09-01' },
  { key: 'date20250902', label: '2025-09-02' }
])

// 生成模拟数据
const generateMockData = () => {
  return [
    {
      id: 1,
      employeeId: 'EMP001',
      employeeName: '张三',
      department: '技术部',
      company: '总公司',
      employeeType: '正式员工',
      date20250901_morning: 4,
      date20250901_afternoon: 4,
      date20250901_evening: 2,
      date20250902_morning: 4,
      date20250902_afternoon: 4,
      date20250902_evening: 0,
      regularHours: 32,
      overtimeHours: 6,
      totalHours: 38,
      effectiveDays: 5
    },
    {
      id: 2,
      employeeId: 'EMP002',
      employeeName: '李四',
      department: '产品部',
      company: '总公司',
      employeeType: '正式员工',
      date20250901_morning: 4,
      date20250901_afternoon: 3,
      date20250901_evening: 0,
      date20250902_morning: 4,
      date20250902_afternoon: 4,
      date20250902_evening: 1,
      regularHours: 30,
      overtimeHours: 2,
      totalHours: 32,
      effectiveDays: 4.5
    },
    {
      id: 3,
      employeeId: 'EMP003',
      employeeName: '王五',
      department: '设计部',
      company: '分公司A',
      employeeType: '合同工',
      date20250901_morning: 4,
      date20250901_afternoon: 4,
      date20250901_evening: 0,
      date20250902_morning: 4,
      date20250902_afternoon: 3,
      date20250902_evening: 0,
      regularHours: 30,
      overtimeHours: 0,
      totalHours: 30,
      effectiveDays: 4
    }
  ]
}



// 加载数据
const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = generateMockData()
    loading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  let filteredData = generateMockData()
  
  if (searchForm.value.employeeId) {
    filteredData = filteredData.filter(item => 
      item.employeeId.toLowerCase().includes(searchForm.value.employeeId.toLowerCase())
    )
  }
  
  if (searchForm.value.employeeName) {
    filteredData = filteredData.filter(item => 
      item.employeeName.toLowerCase().includes(searchForm.value.employeeName.toLowerCase())
    )
  }
  
  if (searchForm.value.department) {
    filteredData = filteredData.filter(item => item.department === searchForm.value.department)
  }
  
  if (searchForm.value.company) {
    filteredData = filteredData.filter(item => item.company === searchForm.value.company)
  }
  
  if (searchForm.value.employeeType) {
    filteredData = filteredData.filter(item => item.employeeType === searchForm.value.employeeType)
  }
  
  tableData.value = filteredData
}

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    employeeId: '',
    employeeName: '',
    department: '',
    company: '',
    employeeType: '',
    dateRange: []
  }
  loadData()
}

// 刷新数据
const handleRefresh = () => {
  loadData()
  ElMessage.success('数据已刷新')
}







// 获取单元格悬浮提示文本
const getTooltipText = (row, dateKey, timeSlot) => {
  const value = row[`${dateKey}_${timeSlot}`]
  const timeSlotText = timeSlot === 'morning' ? '上午' : timeSlot === 'afternoon' ? '下午' : '晚上'
  const dateLabel = displayDates.value.find(d => d.key === dateKey)?.label || dateKey
  
  // 模拟首次、末次、备注数据
  const firstTime = '08:30'
  const lastTime = '18:00'
  const remark = '正常打卡'
  
  return `首次：${firstTime}\n末次：${lastTime}\n备注：${remark}`
}

// 导出Excel
const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

// 初始化
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.worktime-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-card, .table-card {
  margin-bottom: 20px;
}



:deep(.el-table .cell) {
  padding: 4px 8px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: bold;
}

:deep(.el-table td) {
  cursor: pointer;
}
</style>