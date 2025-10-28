<template>
  <div class="contacts-container">
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline label-width="80px">
        <el-form-item label="联系人">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入联系人姓名"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="客商">
          <el-select
            v-model="searchForm.coId"
            placeholder="请选择客商"
            clearable
            filterable
            style="width: 200px"
          >
            <el-option
              v-for="item in supplierOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="性别">
          <el-select
            v-model="searchForm.sex"
            placeholder="请选择性别"
            clearable
            style="width: 120px"
          >
            <el-option label="男" :value="1" />
            <el-option label="女" :value="0" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮 -->
    <el-card class="table-card">
      <div class="table-header">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增联系人
        </el-button>
        <el-button type="danger" @click="handleBatchDelete" :disabled="!selectedIds.length">
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </div>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="name" label="联系人姓名" min-width="120" />
        <el-table-column prop="sex" label="性别" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.sex === 1 ? 'primary' : 'danger'">
              {{ row.sex === 1 ? '男' : '女' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="tel" label="联系电话" min-width="120" />
        <el-table-column prop="position" label="职位" min-width="120" />
        <el-table-column prop="coName" label="所属客商" min-width="150" />
        <el-table-column prop="coCode" label="客商编码" min-width="120" />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

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
    </el-card>

    <!-- 编辑抽屉 -->
    <edit-drawer
      v-model:visible="editVisible"
      :data="currentRow"
      :mode="editMode"
      :supplier-options="supplierOptions"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'
import EditDrawer from './edit.vue'

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const selectedIds = ref([])
const editVisible = ref(false)
const editMode = ref('add')
const currentRow = ref(null)

// 搜索表单
const searchForm = reactive({
  name: '',
  coId: '',
  sex: ''
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// 客商选项
const supplierOptions = ref([])

// 模拟数据
const mockData = [
  {
    id: '1',
    moduleId: 'supplier',
    coId: '1',
    coCode: 'SUP001',
    coName: '北京科技有限公司',
    name: '张三',
    sex: 1,
    tel: '13800138001',
    position: '销售总监'
  },
  {
    id: '2',
    moduleId: 'supplier',
    coId: '1',
    coCode: 'SUP001',
    coName: '北京科技有限公司',
    name: '李四',
    sex: 0,
    tel: '13800138002',
    position: '采购经理'
  },
  {
    id: '3',
    moduleId: 'supplier',
    coId: '2',
    coCode: 'SUP002',
    coName: '上海贸易公司',
    name: '王五',
    sex: 1,
    tel: '13800138003',
    position: '总经理'
  },
  {
    id: '4',
    moduleId: 'supplier',
    coId: '3',
    coCode: 'SUP003',
    coName: '深圳电子有限公司',
    name: '赵六',
    sex: 1,
    tel: '13800138004',
    position: '技术总监'
  },
  {
    id: '5',
    moduleId: 'supplier',
    coId: '3',
    coCode: 'SUP003',
    coName: '深圳电子有限公司',
    name: '孙七',
    sex: 0,
    tel: '13800138005',
    position: '财务经理'
  }
]

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 搜索过滤
    let filteredData = [...mockData]
    
    if (searchForm.name) {
      filteredData = filteredData.filter(item => 
        item.name.toLowerCase().includes(searchForm.name.toLowerCase())
      )
    }
    
    if (searchForm.coId) {
      filteredData = filteredData.filter(item => item.coId === searchForm.coId)
    }
    
    if (searchForm.sex !== '') {
      filteredData = filteredData.filter(item => item.sex === searchForm.sex)
    }
    
    // 分页
    pagination.total = filteredData.length
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    tableData.value = filteredData.slice(start, end)
    
    // 加载客商选项
    loadSupplierOptions()
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 加载客商选项
const loadSupplierOptions = () => {
  // 模拟从客商信息中获取
  supplierOptions.value = [
    { id: '1', name: '北京科技有限公司', code: 'SUP001' },
    { id: '2', name: '上海贸易公司', code: 'SUP002' },
    { id: '3', name: '深圳电子有限公司', code: 'SUP003' },
    { id: '4', name: '广州食品公司', code: 'SUP004' },
    { id: '5', name: '杭州服装公司', code: 'SUP005' }
  ]
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.coId = ''
  searchForm.sex = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  editMode.value = 'add'
  currentRow.value = null
  editVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  editMode.value = 'edit'
  currentRow.value = { ...row }
  editVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该联系人吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 模拟删除
    const index = mockData.findIndex(item => item.id === row.id)
    if (index > -1) {
      mockData.splice(index, 1)
    }
    
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (!selectedIds.value.length) return
  
  try {
    await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 个联系人吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 模拟批量删除
    selectedIds.value.forEach(id => {
      const index = mockData.findIndex(item => item.id === id)
      if (index > -1) {
        mockData.splice(index, 1)
      }
    })
    
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

// 分页变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadData()
}

const handleCurrentChange = (page) => {
  pagination.current = page
  loadData()
}

// 成功回调
const handleSuccess = () => {
  loadData()
}

// 初始化
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.contacts-container {
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.table-header {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>