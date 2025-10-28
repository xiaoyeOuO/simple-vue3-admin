<template>
  <div class="project-list-container">
    <!-- 页面标题保持不变 -->
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <div class="operation-header">
        <h2>合同项目列表</h2>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增合同项目
        </el-button>
      </div>
      <el-form :model="searchForm" inline>
        <el-form-item label="项目名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入项目名称"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="项目状态">
          <el-select
            v-model="searchForm.level"
            placeholder="请选择状态"
            clearable
            @clear="handleSearch"
          >
            <el-option label="进行中" value="active" />
            <el-option label="已完成" value="completed" />
            <el-option label="已暂停" value="paused" />
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

    <!-- 项目列表 - 根据数据库结构调整列 -->
    <el-card>
      <el-table
        :data="projectList"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="项目名称" min-width="200" />
        <el-table-column prop="org" label="组织机构" width="150" />
        <el-table-column prop="manageNo" label="管理编号" width="120" />
        <el-table-column prop="projectNo" label="项目编号" width="120" />
        <el-table-column prop="projectCategoryCode" label="项目分类" width="100" />
        <el-table-column prop="orderCode" label="订单编号" width="120" />
        <el-table-column prop="subCode" label="子编号" width="100" />
        <el-table-column prop="businessType" label="业务类型" width="100" />
        <el-table-column prop="level" label="项目级别" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)">
              {{ getLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="项目来源" width="100" />
        <el-table-column prop="role" label="项目角色" width="100" />
        <el-table-column prop="startDate" label="开始日期" width="120" align="center" />
        <el-table-column prop="endDate" label="结束日期" width="120" align="center" />
        <el-table-column prop="phone" label="联系电话" width="120" />
        <el-table-column prop="major" label="专业方向" width="120" />
        <el-table-column prop="classType" label="班级类型" width="100" />
        <el-table-column prop="fundPlan" label="资金计划" width="120" align="right">
          <template #default="{ row }">
            ¥{{ row.fundPlan?.toLocaleString() || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column prop="classLevel" label="班级级别" width="80" align="center" />
        <el-table-column prop="otherBusinessType" label="其他业务" width="100" />
        <el-table-column prop="hasContractReview" label="合同评审" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.hasContractReview ? 'success' : 'info'">
              {{ row.hasContractReview ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="projectId" label="项目ID" width="100" />
        <el-table-column prop="parentId" label="父项目ID" width="100" />
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleDetail(row)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button
              type="primary"
              link
              @click="handleEdit(row)"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              @click="handleDelete(row)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页保持不变 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑抽屉 -->
    <ProjectEdit
      v-model="drawerVisible"
      :project-data="currentProject"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete, View } from '@element-plus/icons-vue'
import ProjectEdit from './edit.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
// 搜索表单 - 更新字段名
const searchForm = reactive({
  name: '',
  level: ''
})

// 分页数据
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 项目列表 - 使用小写首字母字段
const projectList = ref([])
const loading = ref(false)

// 抽屉相关
const drawerVisible = ref(false)
const currentProject = ref(null)

// 模拟项目数据 - 根据数据库结构调整
const mockProjects = [
  {
    createTime: '2024-01-15 10:30:00',
    related: 1,
    org: '技术研发部',
    manageNo: 'MNG-2024-001',
    projectNo: 'PRJ-2024-001',
    name: '电商平台重构项目',
    projectCategoryCode: 'ECOMMERCE',
    orderCode: 'ORD-2024-001',
    subCode: 'SUB-001',
    businessType: '软件开发',
    level: 'high',
    source: '内部需求',
    role: '主开发商',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    phone: '13800138001',
    major: '全栈开发',
    classType: '企业级',
    fundPlan: 500000.00,
    classLevel: 1,
    otherBusinessType: 2,
    hasContractReview: true,
    projectId: 'PID-2024-001',
    parentId: '',
    isDelete: false
  },
  {
    createTime: '2024-02-20 14:15:00',
    related: 2,
    org: '移动开发部',
    manageNo: 'MNG-2024-002',
    projectNo: 'PRJ-2024-002',
    name: '移动端APP开发',
    projectCategoryCode: 'MOBILE',
    orderCode: 'ORD-2024-002',
    subCode: 'SUB-002',
    businessType: '移动应用',
    level: 'medium',
    source: '客户需求',
    role: '承包商',
    startDate: '2023-10-01',
    endDate: '2024-02-28',
    phone: '13800138002',
    major: '移动端开发',
    classType: '消费级',
    fundPlan: 300000.00,
    classLevel: 2,
    otherBusinessType: 1,
    hasContractReview: true,
    projectId: 'PID-2024-002',
    parentId: '',
    isDelete: false
  },
  {
    createTime: '2024-03-10 09:45:00',
    related: 3,
    org: '数据科学部',
    manageNo: 'MNG-2024-003',
    projectNo: 'PRJ-2024-003',
    name: '数据中台建设',
    projectCategoryCode: 'DATA',
    orderCode: 'ORD-2024-003',
    subCode: 'SUB-003',
    businessType: '数据分析',
    level: 'high',
    source: '战略规划',
    role: '主开发商',
    startDate: '2024-03-01',
    endDate: '2024-12-31',
    phone: '13800138003',
    major: '大数据',
    classType: '企业级',
    fundPlan: 800000.00,
    classLevel: 1,
    otherBusinessType: 3,
    hasContractReview: false,
    projectId: 'PID-2024-003',
    parentId: '',
    isDelete: false
  }
]

// 获取项目列表
const fetchProjects = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    let filtered = [...mockProjects]
    if (searchForm.name) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchForm.name.toLowerCase())
      )
    }
    if (searchForm.level) {
      filtered = filtered.filter(item => item.level === searchForm.level)
    }
    
    projectList.value = filtered
    pagination.total = filtered.length
  } catch (error) {
    ElMessage.error('获取项目列表失败')
  } finally {
    loading.value = false
  }
}

// 状态相关方法 - 更新为level
const getLevelType = (level) => {
  const types = {
    high: 'danger',
    medium: 'warning',
    low: 'success'
  }
  return types[level] || 'info'
}

const getLevelText = (level) => {
  const texts = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return texts[level] || level
}

// 事件处理方法保持不变
const handleSearch = () => {
  pagination.current = 1
  fetchProjects()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.level = ''
  handleSearch()
}

const handleAdd = () => {
  currentProject.value = null
  drawerVisible.value = true
}

const handleDetail = (row) => {
  router.push(`/project/contract-list/detail/${row.id}`)
}

const handleEdit = (row) => {
  currentProject.value = { ...row }
  drawerVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除项目"${row.name}"吗？此操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const index = mockProjects.findIndex(item => item.projectId === row.projectId)
    if (index > -1) {
      mockProjects[index].isDelete = true
      ElMessage.success('删除成功')
      fetchProjects()
    }
  } catch {
    // 用户取消删除
  }
}

const handleSizeChange = (val) => {
  pagination.size = val
  fetchProjects()
}

const handleCurrentChange = (val) => {
  pagination.current = val
  fetchProjects()
}

const handleSuccess = () => {
  drawerVisible.value = false
  ElMessage.success('操作成功')
  fetchProjects()
}

onMounted(() => {
  fetchProjects()
})
</script>

<style scoped>
.project-list-container {
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.search-card {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

:deep(.el-table) {
  --el-table-border-color: #e4e7ed;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  font-weight: 600;
}

:deep(.el-table__body-wrapper) {
  max-height: 600px;
  overflow-y: auto;
}
</style>