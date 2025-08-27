<template>
  <div class="business-project-management">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="项目名称">
          <el-input v-model="searchForm.name" placeholder="请输入项目名称" clearable />
        </el-form-item>
        <el-form-item label="项目编号">
          <el-input v-model="searchForm.projectNo" placeholder="请输入项目编号" clearable />
        </el-form-item>
        <el-form-item label="项目跟踪号">
          <el-input v-model="searchForm.tfn" placeholder="请输入项目跟踪号" clearable />
        </el-form-item>
        <el-form-item label="年度">
          <el-select v-model="searchForm.yaer" placeholder="请选择年度" clearable>
            <el-option v-for="year in yearOptions" :key="year" :label="year" :value="year" />
          </el-select>
        </el-form-item>
        <el-form-item label="业务类型">
          <el-input v-model="searchForm.business" placeholder="请输入业务类型" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.state" placeholder="请选择状态" clearable>
            <el-option v-for="item in stateOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="阶段">
          <el-select v-model="searchForm.stage" placeholder="请选择阶段" clearable>
            <el-option v-for="item in stageOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="重要事项">
          <el-select v-model="searchForm.isMatter" placeholder="请选择" clearable>
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
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
          <el-table-column prop="name" label="项目名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="projectNo" label="项目编号" min-width="150" />
          <el-table-column prop="tfn" label="项目跟踪号" min-width="120" />
          <el-table-column prop="yaer" label="年度" width="80" align="center" />
          <el-table-column prop="business" label="业务类型" min-width="120" />
          <el-table-column prop="amountPlan" label="计划金额" width="120" align="right">
            <template #default="{ row }">
              ¥{{ formatAmount(row.amountPlan) }}
            </template>
          </el-table-column>
          <el-table-column prop="address" label="项目地址" min-width="200" show-overflow-tooltip />
          <el-table-column prop="state" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStateTagType(row.state)">
                {{ row.state }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="stage" label="阶段" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStageTagType(row.stage)">
                {{ row.stage }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="isMatter" label="重要事项" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.isMatter ? 'danger' : 'info'">
                {{ row.isMatter ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="doneTimePlan" label="计划完成时间" width="120">
            <template #default="{ row }">
              {{ formatDate(row.doneTimePlan) }}
            </template>
          </el-table-column>
          <el-table-column prop="contractEntity" label="合同主体" min-width="150" show-overflow-tooltip />
          <el-table-column prop="createTime" label="创建时间" width="150">
            <template #default="{ row }">
              {{ formatDateTime(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right" align="center">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleDetail(row)">
                <el-icon><View /></el-icon>
                详情
              </el-button>
              <el-button type="primary" link @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)" :disabled="row.isDelete">
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
  projectNo: '',
  tfn: '',
  yaer: '',
  business: '',
  state: '',
  stage: '',
  isMatter: ''
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
const yearOptions = ['2024', '2023', '2022', '2021', '2020']
const stateOptions = ['进行中', '已完成', '已暂停', '已取消', '待启动']
const stageOptions = ['立项阶段', '实施阶段', '验收阶段', '完成阶段', '维护阶段']

// 模拟数据 - 基于数据库字段结构
const mockData = [
  {
    id: 'BP-2024-001',
    name: '智慧园区建设项目',
    projectNo: 'BP-2024-001',
    tfn: 'TFN-2024-001',
    yaer: '2024',
    business: '智慧建筑',
    amountPlan: 5000000.00,
    address: '北京市朝阳区科技园A座',
    state: '进行中',
    stage: '实施阶段',
    isMatter: true,
    doneTimePlan: '2024-12-31',
    contractEntity: '北京建工集团有限公司',
    createTime: '2024-01-15 09:30:00',
    createId: 1001,
    isDelete: false
  },
  {
    id: 'BP-2024-002',
    name: '城市更新改造项目',
    projectNo: 'BP-2024-002',
    tfn: 'TFN-2024-002',
    yaer: '2024',
    business: '市政工程',
    amountPlan: 12000000.50,
    address: '上海市浦东新区世纪大道100号',
    state: '已完成',
    stage: '验收阶段',
    isMatter: false,
    doneTimePlan: '2024-10-15',
    contractEntity: '上海城建集团有限公司',
    createTime: '2024-02-20 14:45:00',
    createId: 1002,
    isDelete: false
  },
  {
    id: 'BP-2024-003',
    name: '智慧交通系统升级',
    projectNo: 'BP-2024-003',
    tfn: 'TFN-2024-003',
    yaer: '2023',
    business: '交通工程',
    amountPlan: 8500000.75,
    address: '深圳市南山区科技园',
    state: '进行中',
    stage: '立项阶段',
    isMatter: true,
    doneTimePlan: '2025-03-30',
    contractEntity: '深圳市交通建设集团',
    createTime: '2023-11-10 08:20:00',
    createId: 1003,
    isDelete: false
  }
]

// 标签类型方法
const getStateTagType = (state) => {
  const map = {
    '进行中': 'primary',
    '已完成': 'success',
    '已暂停': 'warning',
    '已取消': 'danger',
    '待启动': 'info'
  }
  return map[state] || 'info'
}

const getStageTagType = (stage) => {
  const map = {
    '立项阶段': 'info',
    '实施阶段': 'primary',
    '验收阶段': 'warning',
    '完成阶段': 'success',
    '维护阶段': 'success'
  }
  return map[stage] || 'info'
}

// 格式化函数
const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '0.00'
  return Number(amount).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

// 获取列表数据
const fetchData = () => {
  let filteredData = [...mockData]
  
  if (searchForm.name) {
    filteredData = filteredData.filter(item => 
      item.name.toLowerCase().includes(searchForm.name.toLowerCase())
    )
  }
  
  if (searchForm.projectNo) {
    filteredData = filteredData.filter(item => 
      item.projectNo.toLowerCase().includes(searchForm.projectNo.toLowerCase())
    )
  }
  
  if (searchForm.tfn) {
    filteredData = filteredData.filter(item => 
      item.tfn.toLowerCase().includes(searchForm.tfn.toLowerCase())
    )
  }
  
  if (searchForm.yaer) {
    filteredData = filteredData.filter(item => item.yaer === searchForm.yaer)
  }
  
  if (searchForm.business) {
    filteredData = filteredData.filter(item => 
      item.business.toLowerCase().includes(searchForm.business.toLowerCase())
    )
  }
  
  if (searchForm.state) {
    filteredData = filteredData.filter(item => item.state === searchForm.state)
  }
  
  if (searchForm.stage) {
    filteredData = filteredData.filter(item => item.stage === searchForm.stage)
  }
  
  if (searchForm.isMatter !== '') {
    filteredData = filteredData.filter(item => item.isMatter === searchForm.isMatter)
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
  searchForm.projectNo = ''
  searchForm.tfn = ''
  searchForm.yaer = ''
  searchForm.business = ''
  searchForm.state = ''
  searchForm.stage = ''
  searchForm.isMatter = ''
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
    const index = mockData.findIndex(item => item.projectNo === row.projectNo)
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