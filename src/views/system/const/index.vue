<template>
  <div class="const-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>系统字典管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增字典
      </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="hover">
      <el-form :model="searchForm" inline>
        <el-form-item label="字典类型">
          <el-select 
            v-model="searchForm.type" 
            placeholder="请选择字典类型"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="item in dictTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="字典名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入字典名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select 
            v-model="searchForm.status" 
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
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

    <!-- 字典列表 -->
    <el-card class="table-card" shadow="hover">
      <el-table
      :data="tableData"
      border
      stripe
      height="600"
      v-loading="loading"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="字典名称" min-width="150" />
      <el-table-column prop="code" label="字典编码" min-width="150" />
      <el-table-column prop="value" label="字典值" min-width="120" />
      <el-table-column prop="type" label="字典类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getTypeTag(row.type)">{{ row.typeName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)" :disabled="row.children && row.children.length > 0">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    </el-card>

    <!-- 编辑对话框 -->
    <const-edit
      v-model="editVisible"
      :edit-data="currentEditData"
      :parent-data="parentData"
      :mode="editMode"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Search, Refresh } from '@element-plus/icons-vue'
import ConstEdit from './edit.vue'

// 表格引用
const xTable = ref()

// 搜索表单
const searchForm = ref({
  type: '',
  name: '',
  status: ''
})

// 字典类型选项
const dictTypes = [
  { value: 'project_type', label: '项目类型' },
  { value: 'task_priority', label: '任务优先级' },
  { value: 'bug_severity', label: '缺陷严重程度' },
  { value: 'user_role', label: '用户角色' },
  { value: 'project_status', label: '项目状态' },
  { value: 'module_status', label: '模块状态' }
]

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 编辑相关
const editVisible = ref(false)
const editMode = ref('add')
const currentEditData = ref(null)
const parentData = ref(null)

// 模拟数据生成
const generateMockData = () => {
  return [
    {
      id: 1,
      type: 'project_type',
      typeName: '项目类型',
      name: '智慧建筑',
      code: 'SMART_BUILDING',
      value: '1',
      sort: 1,
      status: 1,
      remark: '包含智能楼宇、智能安防等',
      createTime: '2024-01-15 10:00:00',
      updateTime: '2024-01-15 10:00:00'
    },
    {
      id: 2,
      type: 'project_type',
      typeName: '项目类型',
      name: '智能楼宇',
      code: 'SMART_BUILDING_SUB1',
      value: '1-1',
      sort: 2,
      status: 1,
      remark: '楼宇自动化系统',
      createTime: '2024-01-15 10:00:00',
      updateTime: '2024-01-15 10:00:00'
    },
    {
      id: 3,
      type: 'project_type',
      typeName: '项目类型',
      name: '智能安防',
      code: 'SMART_BUILDING_SUB2',
      value: '1-2',
      sort: 3,
      status: 1,
      remark: '安防监控系统',
      createTime: '2024-01-15 10:00:00',
      updateTime: '2024-01-15 10:00:00'
    },
    {
      id: 4,
      type: 'task_priority',
      typeName: '任务优先级',
      name: '高优先级',
      code: 'HIGH_PRIORITY',
      value: '1',
      sort: 1,
      status: 1,
      remark: '紧急且重要的任务',
      createTime: '2024-01-15 10:00:00',
      updateTime: '2024-01-15 10:00:00'
    },
    {
      id: 5,
      type: 'task_priority',
      typeName: '任务优先级',
      name: '中优先级',
      code: 'MEDIUM_PRIORITY',
      value: '2',
      sort: 2,
      status: 1,
      remark: '重要但不紧急的任务',
      createTime: '2024-01-15 10:00:00',
      updateTime: '2024-01-15 10:00:00'
    },
    {
      id: 6,
      type: 'task_priority',
      typeName: '任务优先级',
      name: '低优先级',
      code: 'LOW_PRIORITY',
      value: '3',
      sort: 3,
      status: 1,
      remark: '不紧急不重要的任务',
      createTime: '2024-01-15 10:00:00',
      updateTime: '2024-01-15 10:00:00'
    },
    {
      id: 7,
      type: 'bug_severity',
      typeName: '缺陷严重程度',
      name: '致命',
      code: 'FATAL',
      value: '1',
      sort: 1,
      status: 1,
      remark: '导致系统崩溃或无法使用',
      createTime: '2024-01-15 10:00:00',
      updateTime: '2024-01-15 10:00:00'
    },
    {
      id: 8,
      type: 'bug_severity',
      typeName: '缺陷严重程度',
      name: '严重',
      code: 'SEVERE',
      value: '2',
      sort: 2,
      status: 1,
      remark: '主要功能受影响',
      createTime: '2024-01-15 10:00:00',
      updateTime: '2024-01-15 10:00:00'
    },
    {
      id: 9,
      type: 'bug_severity',
      typeName: '缺陷严重程度',
      name: '一般',
      code: 'NORMAL',
      value: '3',
      sort: 3,
      status: 1,
      remark: '一般缺陷',
      createTime: '2024-01-15 10:00:00',
      updateTime: '2024-01-15 10:00:00'
    },
    {
      id: 10,
      type: 'user_role',
      typeName: '用户角色',
      name: '管理员',
      code: 'ADMIN',
      value: 'admin',
      sort: 1,
      status: 1,
      remark: '系统管理员',
      createTime: '2024-01-15 10:00:00',
      updateTime: '2024-01-15 10:00:00'
    },
    {
      id: 11,
      type: 'user_role',
      typeName: '用户角色',
      name: '普通用户',
      code: 'USER',
      value: 'user',
      sort: 2,
      status: 1,
      remark: '普通用户',
      createTime: '2024-01-15 10:00:00',
      updateTime: '2024-01-15 10:00:00'
    },
    {
      id: 12,
      type: 'project_status',
      typeName: '项目状态',
      name: '进行中',
      code: 'IN_PROGRESS',
      value: 'in_progress',
      sort: 1,
      status: 1,
      remark: '项目进行中',
      createTime: '2024-01-15 10:00:00',
      updateTime: '2024-01-15 10:00:00'
    },
    {
      id: 13,
      type: 'project_status',
      typeName: '项目状态',
      name: '已完成',
      code: 'COMPLETED',
      value: 'completed',
      sort: 2,
      status: 1,
      remark: '项目已完成',
      createTime: '2024-01-15 10:00:00',
      updateTime: '2024-01-15 10:00:00'
    },
    {
      id: 14,
      type: 'project_status',
      typeName: '项目状态',
      name: '已暂停',
      code: 'PAUSED',
      value: 'paused',
      sort: 3,
      status: 0,
      remark: '项目已暂停',
      createTime: '2024-01-15 10:00:00',
      updateTime: '2024-01-15 10:00:00'
    }
  ]
}

// 获取字典类型标签样式
const getTypeTag = (type) => {
  const typeMap = {
    'project_type': 'primary',
    'task_priority': 'success',
    'bug_severity': 'danger',
    'user_role': 'warning',
    'project_status': 'info',
    'module_status': 'info'
  }
  return typeMap[type] || 'info'
}

// 获取字典类型文本
const getTypeLabel = (type) => {
  const typeMap = {
    'project_type': '项目类型',
    'task_priority': '任务优先级',
    'bug_severity': '缺陷严重程度',
    'user_role': '用户角色',
    'project_status': '项目状态',
    'module_status': '模块状态'
  }
  return typeMap[type] || type
}

// 加载数据
const loadData = () => {
  tableData.value = generateMockData()
}

// 搜索
const handleSearch = () => {
  let filteredData = generateMockData()
  
  if (searchForm.value.type) {
    filteredData = filteredData.filter(item => item.type === searchForm.value.type)
  }
  
  if (searchForm.value.name) {
    filteredData = filteredData.filter(item => 
      item.name.toLowerCase().includes(searchForm.value.name.toLowerCase())
    )
  }
  
  if (searchForm.value.status !== '') {
    filteredData = filteredData.filter(item => item.status === parseInt(searchForm.value.status))
  }
  
  tableData.value = filteredData
}

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    type: '',
    name: '',
    status: ''
  }
  loadData()
}

// 刷新数据
const handleRefresh = () => {
  loadData()
  ElMessage.success('数据已刷新')
}

// 新增字典
const handleAdd = () => {
  editMode.value = 'add'
  currentEditData.value = null
  parentData.value = null
  editVisible.value = true
}

// 编辑字典
const handleEdit = (row) => {
  editMode.value = 'edit'
  currentEditData.value = { ...row }
  parentData.value = null
  editVisible.value = true
}

// 删除字典
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除字典 "${row.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  } catch (error) {
    // 用户取消删除
  }
}

// 状态变更
const handleStatusChange = (row) => {
  ElMessage.success(`状态已${row.status === 1 ? '启用' : '禁用'}`)
}

// 编辑成功回调
const handleEditSuccess = (data) => {
  if (editMode.value === 'edit') {
    const index = tableData.value.findIndex(item => item.id === data.id)
    if (index > -1) {
      Object.assign(tableData.value[index], data)
      ElMessage.success('更新成功')
    }
  } else {
    const newData = {
      ...data,
      id: Date.now(),
      createTime: new Date().toLocaleString('zh-CN'),
      updateTime: new Date().toLocaleString('zh-CN')
    }
    tableData.value.push(newData)
    ElMessage.success('新增成功')
  }
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.const-management {
  background-color: #f5f7fa;
  min-height: 100vh;
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

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

:deep(.el-card__header) {
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}
</style>