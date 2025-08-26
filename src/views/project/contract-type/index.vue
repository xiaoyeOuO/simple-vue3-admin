<template>
  <div class="type-management">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="类型名称">
          <el-input v-model="searchForm.typeName" placeholder="请输入类型名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增合同项目类型
      </el-button>
    </div>

    <!-- 数据表格 -->
    <div class="data-table">
      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="typeName" label="类型名称" min-width="150" />
        <el-table-column prop="typeCode" label="类型编码" min-width="120" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '1' ? 'success' : 'danger'">
              {{ row.status === '1' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" align="center" />
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 编辑抽屉 -->
    <TypeEdit
      v-model:visible="drawerVisible"
      :data="currentRow"
      :mode="editMode"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import TypeEdit from './edit.vue'

// 搜索表单
const searchForm = reactive({
  typeName: '',
  status: ''
})

// 表格数据
const tableData = ref([])

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 抽屉控制
const drawerVisible = ref(false)
const currentRow = ref(null)
const editMode = ref('add')

// 模拟数据
const mockData = [
  {
    id: 1,
    typeName: 'Web开发',
    typeCode: 'web-dev',
    description: 'Web应用开发项目类型',
    sortOrder: 1,
    status: '1',
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    typeName: '移动应用',
    typeCode: 'mobile-app',
    description: '移动应用开发项目类型',
    sortOrder: 2,
    status: '1',
    createTime: '2024-01-15 11:00:00'
  },
  {
    id: 3,
    typeName: '数据分析',
    typeCode: 'data-analysis',
    description: '数据分析项目类型',
    sortOrder: 3,
    status: '0',
    createTime: '2024-01-15 14:20:00'
  },
  {
    id: 4,
    typeName: '人工智能',
    typeCode: 'ai',
    description: '人工智能项目类型',
    sortOrder: 4,
    status: '1',
    createTime: '2024-01-16 09:15:00'
  }
]

// 获取列表数据
const fetchData = () => {
  // 模拟搜索和分页
  let filteredData = [...mockData]
  
  if (searchForm.typeName) {
    filteredData = filteredData.filter(item => 
      item.typeName.toLowerCase().includes(searchForm.typeName.toLowerCase())
    )
  }
  
  if (searchForm.status !== '') {
    filteredData = filteredData.filter(item => item.status === searchForm.status)
  }
  
  pagination.total = filteredData.length
  
  const start = (pagination.current - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  tableData.value = filteredData.slice(start, end)
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.typeName = ''
  searchForm.status = ''
  handleSearch()
}

// 分页
const handleSizeChange = (val) => {
  pagination.pageSize = val
  fetchData()
}

const handleCurrentChange = (val) => {
  pagination.current = val
  fetchData()
}

// 新增
const handleAdd = () => {
  currentRow.value = null
  editMode.value = 'add'
  drawerVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  currentRow.value = { ...row }
  editMode.value = 'edit'
  drawerVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除业务类型 "${row.typeName}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟删除操作
    const index = mockData.findIndex(item => item.id === row.id)
    if (index > -1) {
      mockData.splice(index, 1)
    }
    
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 操作成功回调
const handleSuccess = () => {
  drawerVisible.value = false
  fetchData()
}

// 初始化
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.type-management {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
}

.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.operation-bar {
  margin-bottom: 20px;
}

.data-table {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table__header-wrapper) {
  border-top: 1px solid #ebeef5;
}
</style>