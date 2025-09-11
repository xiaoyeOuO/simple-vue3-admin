<template>
  <div class="personnel-profile">
    <div class="page-header">
      <h2>人员档案管理</h2>
      <p>查看和分析团队成员的综合表现数据</p>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="姓名">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入姓名"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="部门">
          <el-select
            v-model="searchForm.department"
            placeholder="请选择部门"
            clearable
            @change="handleSearch"
          >
            <el-option
              v-for="item in departmentOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 人员列表 -->
    <div class="content-card">
      <el-row :gutter="20">
        <el-col
          v-for="person in personnelList"
          :key="person.id"
          :xs="24" :sm="12" :md="8" :lg="6"
        >
          <el-card class="person-card" shadow="hover">
            <div class="person-header">
              <el-avatar :size="60" :src="person.avatar">{{ person.name.charAt(0) }}</el-avatar>
              <div class="person-info">
                <h3>{{ person.name }}</h3>
                <p>{{ person.department }}</p>
              </div>
            </div>
            
            <div class="chart-container">
              <div :ref="el => setChartRef(person.id, el)" class="radar-chart"></div>
            </div>

            <div class="person-meta">
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>{{ person.department }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Briefcase /></el-icon>
                <span>{{ person.projects }} 个项目</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[8, 12, 16, 20]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  name: '',
  department: ''
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 12,
  total: 0
})

// 数据
const personnelList = ref([])
const loading = ref(false)
const departmentOptions = ref([
  { value: '研发部', label: '研发部' },
  { value: '测试部', label: '测试部' },
  { value: '产品部', label: '产品部' },
  { value: '设计部', label: '设计部' }
])

// 图表实例管理
const chartInstances = new Map()

// 模拟人员数据
const mockPersonnelData = [
  {
    id: 1,
    name: '张三',
    department: '研发部',
    avatar: '',
    completion: 85,
    projects: 8,
    workHours: 168,
    efficiency: 92,
    defects: 3
  },
  {
    id: 2,
    name: '李四',
    department: '测试部',
    avatar: '',
    completion: 92,
    projects: 6,
    workHours: 156,
    efficiency: 88,
    defects: 1
  },
  {
    id: 3,
    name: '王五',
    department: '产品部',
    avatar: '',
    completion: 78,
    projects: 5,
    workHours: 144,
    efficiency: 85,
    defects: 2
  },
  {
    id: 4,
    name: '赵六',
    department: '设计部',
    avatar: '',
    completion: 95,
    projects: 7,
    workHours: 152,
    efficiency: 94,
    defects: 0
  },
  {
    id: 5,
    name: '孙七',
    department: '研发部',
    avatar: '',
    completion: 88,
    projects: 9,
    workHours: 172,
    efficiency: 90,
    defects: 4
  },
  {
    id: 6,
    name: '周八',
    department: '测试部',
    avatar: '',
    completion: 82,
    projects: 6,
    workHours: 148,
    efficiency: 87,
    defects: 2
  },
  {
    id: 7,
    name: '吴九',
    department: '产品部',
    avatar: '',
    completion: 91,
    projects: 8,
    workHours: 160,
    efficiency: 93,
    defects: 1
  },
  {
    id: 8,
    name: '郑十',
    department: '设计部',
    avatar: '',
    completion: 87,
    projects: 5,
    workHours: 138,
    efficiency: 89,
    defects: 1
  }
]

// 获取人员列表
const fetchPersonnelList = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟分页和筛选
    let filteredData = [...mockPersonnelData]
    
    if (searchForm.name) {
      filteredData = filteredData.filter(item => 
        item.name.includes(searchForm.name)
      )
    }
    
    if (searchForm.department) {
      filteredData = filteredData.filter(item => 
        item.department === searchForm.department
      )
    }
    
    // 模拟分页
    pagination.total = filteredData.length
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    personnelList.value = filteredData.slice(start, end)
    
    // 渲染图表
    nextTick(() => {
      renderCharts()
    })
  } catch (error) {
    ElMessage.error('获取人员数据失败')
  } finally {
    loading.value = false
  }
}

// 设置图表引用
const setChartRef = (personId, el) => {
  if (el) {
    el.dataset.personId = personId
  }
}

// 渲染所有雷达图
const renderCharts = () => {
  // 清理旧的图表实例
  chartInstances.forEach(chart => chart.dispose())
  chartInstances.clear()
  
  personnelList.value.forEach(person => {
    const chartEl = document.querySelector(`.radar-chart[data-person-id="${person.id}"]`)
    if (chartEl) {
      renderRadarChart(chartEl, person)
    }
  })
}

// 渲染单个雷达图
const renderRadarChart = (chartEl, person) => {
  const chart = echarts.init(chartEl)
  
  const option = {
    radar: {
      indicator: [
        { name: '完成度', max: 100 },
        { name: '项目数', max: 10 },
        { name: '工时', max: 200 },
        { name: '效率', max: 100 },
        { name: '缺陷', max: 5 }
      ],
      radius: '70%',
      splitNumber: 5,
      axisName: {
        color: '#666',
        fontSize: 12
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(114, 172, 209, 0.1)', 'rgba(114, 172, 209, 0.2)']
        }
      }
    },
    series: [{
      type: 'radar',
      data: [{
        value: [
          person.completion,
          person.projects,
          person.workHours,
          person.efficiency,
          5 - person.defects // 缺陷越少越好，转换为正向指标
        ],
        name: person.name,
        areaStyle: {
          color: 'rgba(64, 158, 255, 0.3)'
        },
        lineStyle: {
          color: '#409EFF',
          width: 2
        },
        itemStyle: {
          color: '#409EFF'
        }
      }]
    }],
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        return `
          <div style="padding: 8px;">
            <strong>${params.name}</strong><br/>
            完成度: ${person.completion}%<br/>
            项目数: ${person.projects}<br/>
            工时: ${person.workHours}h<br/>
            效率: ${person.efficiency}<br/>
            缺陷: ${person.defects}
          </div>
        `
      }
    }
  }
  
  chart.setOption(option)
  chartInstances.set(person.id, chart)
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchPersonnelList()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.department = ''
  pagination.current = 1
  fetchPersonnelList()
}

// 分页
const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchPersonnelList()
}

const handleCurrentChange = (page) => {
  pagination.current = page
  fetchPersonnelList()
}

// 窗口大小改变时重新渲染
const handleResize = () => {
  chartInstances.forEach(chart => chart.resize())
}

onMounted(() => {
  fetchPersonnelList()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chartInstances.forEach(chart => chart.dispose())
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.personnel-profile {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.search-card {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.content-card {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.person-card {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.person-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
}

.person-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.person-info {
  margin-left: 15px;
}

.person-info h3 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 16px;
}

.person-info p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.chart-container {
  height: 200px;
  margin-bottom: 15px;
}

.radar-chart {
  width: 100%;
  height: 100%;
}

.person-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 14px;
}

.meta-item .el-icon {
  font-size: 16px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .person-card {
    margin-bottom: 15px;
  }
  
  .stats-summary {
    grid-template-columns: 1fr;
  }
}
</style>