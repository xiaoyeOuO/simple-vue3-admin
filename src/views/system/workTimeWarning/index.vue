<template>
  <div class="work-time-warning-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>工时预警列表</h2>
    </div>

    <!-- 搜索和操作区域 -->
    <div class="filter-section">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchName"
            placeholder="请输入姓名搜索"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="16">
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column
          prop="name"
          label="姓名"
          min-width="120"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <el-tag type="warning" effect="plain">
              {{ row.name }}
            </el-tag>
          </template>
        </el-table-column>
        
        <!-- 预留其他字段的插槽位置 -->
        <el-table-column
          label="操作"
          width="150"
          fixed="right"
          align="center"
        >
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click="handleView(row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 搜索条件
const searchName = ref('')

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 分页数据
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 模拟API调用
const mockApiCall = (data, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data)
    }, delay)
  })
}

// 获取工时预警列表数据
const fetchWorkTimeWarningList = async () => {
  loading.value = true
  try {
    // 模拟数据
    const mockData = []
    const totalCount = 50 // 模拟总数据量
    
    // 生成模拟数据
    for (let i = 0; i < pageSize.value; i++) {
      const index = (currentPage.value - 1) * pageSize.value + i + 1
      if (index <= totalCount) {
        mockData.push({
          id: index,
          name: `员工${index.toString().padStart(3, '0')}`,
          // 这里可以添加其他字段，后续扩展使用
        })
      }
    }

    // 模拟搜索过滤
    let filteredData = mockData
    if (searchName.value) {
      filteredData = mockData.filter(item => 
        item.name.toLowerCase().includes(searchName.value.toLowerCase())
      )
    }

    const result = await mockApiCall({
      data: filteredData,
      total: totalCount,
      page: currentPage.value,
      pageSize: pageSize.value
    })

    tableData.value = result.data
    total.value = result.total
  } catch (error) {
    ElMessage.error('获取数据失败')
    console.error('获取工时预警列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  fetchWorkTimeWarningList()
}

// 重置搜索
const resetSearch = () => {
  searchName.value = ''
  currentPage.value = 1
  fetchWorkTimeWarningList()
}

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchWorkTimeWarningList()
}

// 当前页改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchWorkTimeWarningList()
}

// 查看详情
const handleView = (row) => {
  ElMessage.info(`查看 ${row.name} 的工时预警详情`)
  // 这里可以跳转到详情页或打开详情弹窗
}

// 生命周期钩子
onMounted(() => {
  fetchWorkTimeWarningList()
})
</script>

<style scoped lang="scss">
.work-time-warning-container {
  background-color: #f5f5f5;
  min-height: calc(100vh - 84px);
}

.page-header {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  h2 {
    margin: 0;
    color: #303133;
    font-size: 18px;
    font-weight: 600;
  }
}

.filter-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination-section {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

// 响应式设计
@media screen and (max-width: 768px) {
  .work-time-warning-container {
    padding: 10px;
  }
  
  .page-header,
  .filter-section,
  .table-section {
    padding: 15px;
  }
}
</style>