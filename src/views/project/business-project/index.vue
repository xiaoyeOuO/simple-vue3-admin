<template>
  <div class="business-project-management">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="项目名称">
          <el-input v-model="searchForm.name" placeholder="请输入项目名称" clearable />
        </el-form-item>
        <el-form-item label="项目编码">
          <el-input v-model="searchForm.code" placeholder="请输入项目编码" clearable />
        </el-form-item>
        <el-form-item label="年度">
          <el-select v-model="searchForm.year" placeholder="请选择年度" clearable>
            <el-option v-for="year in yearOptions" :key="year" :label="year" :value="year" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="重要程度">
          <el-select v-model="searchForm.important" placeholder="请选择重要程度" clearable>
            <el-option v-for="item in importantOptions" :key="item.value" :label="item.label" :value="item.value" />
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
        新增经营项目
      </el-button>
    </div>

    <!-- 数据表格 -->
    <div class="data-table">
      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="项目名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="code" label="项目编码" min-width="120" />
        <el-table-column prop="year" label="年度" width="80" align="center" />
        <el-table-column prop="area" label="区域" min-width="120" />
        <el-table-column prop="phaseName" label="阶段" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getPhaseTagType(row.phase)">
              {{ row.phaseName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="statusName" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ row.statusName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="importantName" label="重要程度" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getImportantTagType(row.important)">
              {{ row.importantName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="segmentName" label="业务板块" min-width="120" />
        <el-table-column prop="coName" label="承包商" min-width="150" show-overflow-tooltip />
        <el-table-column prop="assignName" label="负责人" width="100" />
        <el-table-column prop="reporterName" label="填报人" width="100" />
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleDetail(row)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
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
      <BusinessProjectEdit
        v-model:visible="drawerVisible"
        :data="currentRow"
        :mode="editMode"
        @success="handleSuccess"
      />

      <!-- 详情抽屉 -->
      <BusinessProjectDetail
        v-model:visible="detailVisible"
        :data="currentRow"
      />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, View } from '@element-plus/icons-vue'
import BusinessProjectEdit from './edit.vue'
import BusinessProjectDetail from './detail.vue'

// 搜索表单
const searchForm = reactive({
  name: '',
  code: '',
  year: '',
  status: '',
  important: ''
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
const detailVisible = ref(false)
const currentRow = ref(null)
const editMode = ref('add')

// 选项数据
const yearOptions = ['2024', '2023', '2022', '2021']
const statusOptions = [
  { value: 1, label: '进行中' },
  { value: 2, label: '已完成' },
  { value: 3, label: '已暂停' },
  { value: 4, label: '已取消' }
]
const importantOptions = [
  { value: 1, label: '一般' },
  { value: 2, label: '重要' },
  { value: 3, label: '非常重要' }
]

// 模拟数据 - 基于提供的数据结构
const mockData = [
  {
    id: 1,
    moduleId: 'MOD-001',
    name: '智慧园区建设项目',
    code: 'BP-2024-001',
    year: '2024',
    areaCode: 'BJ',
    area: '北京市',
    provinceCode: '110000',
    cityCode: '110100',
    status: 1,
    statusName: '进行中',
    phase: 2,
    phaseName: '实施阶段',
    important: 3,
    importantName: '非常重要',
    segment: 1,
    segmentName: '智慧建筑',
    contractor: '北京建工集团',
    coId: 'CO-001',
    coName: '北京建工集团有限公司',
    coTin: '91110000101361123Y',
    coMemberId: 'M-001',
    coMemberName: '张经理',
    coMemberTel: '13800138001',
    assignId: 'A-001',
    assignName: '李主管',
    instanceStatus: 2,
    instanceStatusName: '已审批',
    deptId: 'DEPT-001',
    deptName: '项目管理部',
    reporterId: 'R-001',
    reporterName: '王工程师',
    reporterDeptId: 'DEPT-002',
    reviewBool: true
  },
  {
    id: 2,
    moduleId: 'MOD-002',
    name: '城市更新改造项目',
    code: 'BP-2024-002',
    year: '2024',
    areaCode: 'SH',
    area: '上海市',
    provinceCode: '310000',
    cityCode: '310100',
    status: 2,
    statusName: '已完成',
    phase: 4,
    phaseName: '验收阶段',
    important: 2,
    importantName: '重要',
    segment: 2,
    segmentName: '市政工程',
    contractor: '上海城建集团',
    coId: 'CO-002',
    coName: '上海城建集团有限公司',
    coTin: '91310000132222888X',
    coMemberId: 'M-002',
    coMemberName: '刘经理',
    coMemberTel: '13900139002',
    assignId: 'A-002',
    assignName: '赵主管',
    instanceStatus: 2,
    instanceStatusName: '已审批',
    deptId: 'DEPT-003',
    deptName: '市政工程部',
    reporterId: 'R-002',
    reporterName: '陈工程师',
    reporterDeptId: 'DEPT-004',
    reviewBool: false
  }
]

// 标签类型方法
const getStatusTagType = (status) => {
  const map = { 1: 'primary', 2: 'success', 3: 'warning', 4: 'danger' }
  return map[status] || 'info'
}

const getImportantTagType = (important) => {
  const map = { 1: 'info', 2: 'warning', 3: 'danger' }
  return map[important] || 'info'
}

const getPhaseTagType = (phase) => {
  const map = { 1: 'info', 2: 'primary', 3: 'warning', 4: 'success' }
  return map[phase] || 'info'
}

// 获取列表数据
const fetchData = () => {
  let filteredData = [...mockData]
  
  if (searchForm.name) {
    filteredData = filteredData.filter(item => 
      item.name.toLowerCase().includes(searchForm.name.toLowerCase())
    )
  }
  
  if (searchForm.code) {
    filteredData = filteredData.filter(item => 
      item.code.toLowerCase().includes(searchForm.code.toLowerCase())
    )
  }
  
  if (searchForm.year) {
    filteredData = filteredData.filter(item => item.year === searchForm.year)
  }
  
  if (searchForm.status !== '') {
    filteredData = filteredData.filter(item => item.status === parseInt(searchForm.status))
  }
  
  if (searchForm.important !== '') {
    filteredData = filteredData.filter(item => item.important === parseInt(searchForm.important))
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
  searchForm.name = ''
  searchForm.code = ''
  searchForm.year = ''
  searchForm.status = ''
  searchForm.important = ''
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

// 详情
const handleDetail = (row) => {
  currentRow.value = { ...row }
  detailVisible.value = true
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
      `确定要删除经营项目 "${row.name}" 吗？`,
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
.business-project-management {
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