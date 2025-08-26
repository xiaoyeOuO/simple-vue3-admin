<template>
  <div class="report-config">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <span class="title">日报月报配置管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            新增配置
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="配置名称">
          <el-input v-model="searchForm.name" placeholder="请输入配置名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="统计维度">
          <el-select v-model="searchForm.dimension" placeholder="请选择统计维度" clearable style="width: 150px">
            <el-option v-for="item in dimensionOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="报表类型">
          <el-select v-model="searchForm.type" placeholder="请选择报表类型" clearable style="width: 150px">
            <el-option label="日报" value="daily" />
            <el-option label="周报" value="weekly" />
            <el-option label="月报" value="monthly" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="tableData" border style="width: 100%">
        <el-table-column prop="name" label="配置名称" min-width="150" />
        <el-table-column prop="type" label="报表类型" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.type === 'daily' ? 'success' : row.type === 'weekly' ? 'primary' : 'warning'"
            >
              {{ row.type === 'daily' ? '日报' : row.type === 'weekly' ? '周报' : '月报' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dimensions" label="统计维度" width="200">
          <template #default="{ row }">
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              <el-tag
                v-for="dim in row.dimensions"
                :key="dim"
                size="small"
                type="info"
              >
                {{ getDimensionLabel(dim) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="dimensionValues" label="维度值" min-width="250">
          <template #default="{ row }">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div
                v-for="dim in row.dimensions"
                :key="dim"
                style="font-size: 12px; line-height: 1.4;"
              >
                <span style="color: #909399; margin-right: 4px;">
                  {{ getDimensionLabel(dim) }}:
                </span>
                <span style="color: #606266;">
                  {{ formatDimensionValues(row.dimensionValues[dim]) }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="Edit" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" link :icon="Delete" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination v-model:current-page="pagination.current" v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
        class="pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </el-card>

    <!-- 编辑抽屉 -->
    <BusinessReportEdit v-model:visible="editVisible" :data="currentRow" :mode="editMode"
      :dimension-options="dimensionOptions" @success="handleEditSuccess" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete } from '@element-plus/icons-vue'
import BusinessReportEdit from './edit.vue'

// 搜索表单
const searchForm = reactive({
  name: '',
  dimension: '',
  type: ''
})

// 统计维度选项
const dimensionOptions = [
  { value: 'institute', label: '所' },
  { value: 'product_line', label: '产品线' },
  { value: 'product_branch', label: '产品支线' },
  { value: 'project', label: '项目' },
  { value: 'module', label: '模块' }
]

// 表格数据
const loading = ref(false)
const tableData = ref([])

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 编辑相关
const editVisible = ref(false)
const currentRow = ref(null)
const editMode = ref('add')

// 获取维度标签
const getDimensionLabel = (value) => {
  const option = dimensionOptions.find(item => item.value === value)
  return option ? option.label : value
}

// 格式化维度值显示
const formatDimensionValues = (values) => {
  if (!values || values.length === 0) return '-'
  return values.join('、')
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    dimension: '',
    type: ''
  })
  handleSearch()
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    const mockData = [
      {
        id: 1,
        name: '产品线A日报配置',
        type: 'daily',
        dimensions: ['product_line'],
        dimensionValues: {
          product_line: ['产品线A']
        },
        description: '产品线A的每日数据统计配置',
        createTime: '2024-01-15 10:00:00',
        updateTime: '2024-01-15 10:00:00'
      },
      {
        id: 2,
        name: '产品支线X月报配置',
        type: 'monthly',
        dimensions: ['product_branch'],
        dimensionValues: {
          product_branch: ['产品支线X']
        },
        description: '产品支线X的月度数据统计配置',
        createTime: '2024-01-10 09:30:00',
        updateTime: '2024-01-15 14:20:00'
      },
      {
        id: 3,
        name: '张三日报配置',
        type: 'daily',
        dimensions: ['person'],
        dimensionValues: {
          person: ['张三']
        },
        description: '张三的个人日报统计配置',
        createTime: '2024-01-12 11:00:00',
        updateTime: '2024-01-15 16:45:00'
      },
      {
        id: 4,
        name: '研发一部产品线A项目X配置',
        type: 'daily',
        dimensions: ['department', 'product_line', 'project'],
        dimensionValues: {
          department: ['研发一部'],
          product_line: ['产品线A'],
          project: ['项目X']
        },
        description: '研发一部产品线A下项目X的每日数据统计配置',
        createTime: '2024-01-16 09:00:00',
        updateTime: '2024-01-16 09:00:00'
      },
      {
        id: 5,
        name: '全产品线月报配置',
        type: 'monthly',
        dimensions: ['product_line'],
        dimensionValues: {
          product_line: ['产品线A', '产品线B', '产品线C']
        },
        description: '所有产品线的月度数据统计配置',
        createTime: '2024-01-14 14:00:00',
        updateTime: '2024-01-15 11:30:00'
      },
      {
        id: 6,
        name: '研发一部周报配置',
        type: 'weekly',
        dimensions: ['department', 'product_line'],
        dimensionValues: {
          department: ['研发一部'],
          product_line: ['产品线A', '产品线B']
        },
        description: '研发一部的每周数据统计配置',
        createTime: '2024-01-15 09:00:00',
        updateTime: '2024-01-15 09:00:00'
      },
      {
        id: 7,
        name: '项目X周报配置',
        type: 'weekly',
        dimensions: ['project'],
        dimensionValues: {
          project: ['项目X']
        },
        description: '项目X的每周数据统计配置',
        createTime: '2024-01-14 16:30:00',
        updateTime: '2024-01-15 14:20:00'
      }
    ]

    // 模拟搜索过滤
    let filteredData = mockData
    if (searchForm.name) {
      filteredData = filteredData.filter(item =>
        item.name.toLowerCase().includes(searchForm.name.toLowerCase())
      )
    }
    if (searchForm.dimension) {
      filteredData = filteredData.filter(item => 
        item.dimensions.includes(searchForm.dimension)
      )
    }
    if (searchForm.type) {
      filteredData = filteredData.filter(item => item.type === searchForm.type)
    }

    tableData.value = filteredData.slice(
      (pagination.current - 1) * pagination.size,
      pagination.current * pagination.size
    )
    pagination.total = filteredData.length
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 新增
const handleAdd = () => {
  currentRow.value = null
  editMode.value = 'add'
  editVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  currentRow.value = { ...row }
  editMode.value = 'edit'
  editVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除配置 "${row.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 模拟删除API
    await new Promise(resolve => setTimeout(resolve, 300))
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 编辑成功
const handleEditSuccess = () => {
  editVisible.value = false
  loadData()
}

// 分页变化
const handleSizeChange = (size) => {
  pagination.size = size
  loadData()
}

const handleCurrentChange = (current) => {
  pagination.current = current
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.report-config {
  padding: 20px;
}

.header-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>