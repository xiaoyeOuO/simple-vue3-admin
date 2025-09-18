<template>
  <el-dialog
    v-model="visible"
    :title="`${projectTypeName}列表`"
    width="80%"
    top="5vh"
    :before-close="handleClose"
  >
    <div class="dialog-content">
      <!-- 搜索和操作区域 -->
      <div class="filter-container">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索项目名称"
          style="width: 300px"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch" style="margin-left: 10px">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </div>

      <!-- 项目列表表格 -->
      <el-table
        :data="projectList"
        v-loading="loading"
        style="width: 100%"
        height="500"
        stripe
        border
      >
        <el-table-column prop="id" label="项目ID" width="100" align="center" />
        <el-table-column prop="name" label="项目名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="type" label="项目类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getProjectTypeTag(row.type)">
              {{ getProjectTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="项目状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="manager" label="项目经理" width="120" align="center" />
        <el-table-column prop="startDate" label="开始日期" width="120" align="center" />
        <el-table-column prop="endDate" label="结束日期" width="120" align="center" />
        <el-table-column prop="progress" label="进度" width="150" align="center">
          <template #default="{ row }">
            <el-progress 
              :percentage="row.progress" 
              :status="getProgressStatus(row.progress)"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
        <el-table-column prop="memberCount" label="成员数" width="80" align="center" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button type="success" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
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
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, View, Edit } from '@element-plus/icons-vue'

// 定义props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  projectType: {
    type: String,
    required: true
  },
  projectTypeName: {
    type: String,
    required: true
  }
})

// 定义emits
const emit = defineEmits(['update:modelValue', 'view-project', 'edit-project'])

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const searchKeyword = ref('')
const projectList = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 项目类型映射
const projectTypeMap = {
  development: { name: '开发项目', tag: 'primary' },
  maintenance: { name: '维护项目', tag: 'success' },
  research: { name: '研究项目', tag: 'warning' },
  testing: { name: '测试项目', tag: 'danger' }
}

const statusMap = {
  planning: { name: '规划中', tag: 'info' },
  ongoing: { name: '进行中', tag: 'primary' },
  completed: { name: '已完成', tag: 'success' },
  suspended: { name: '已暂停', tag: 'warning' },
  cancelled: { name: '已取消', tag: 'danger' }
}

// 方法定义
const getProjectTypeTag = (type) => {
  return projectTypeMap[type]?.tag || 'info'
}

const getProjectTypeName = (type) => {
  return projectTypeMap[type]?.name || type
}

const getStatusType = (status) => {
  return statusMap[status]?.tag || 'info'
}

const getStatusName = (status) => {
  return statusMap[status]?.name || status
}

const getProgressStatus = (progress) => {
  if (progress >= 100) return 'success'
  if (progress >= 70) return 'primary'
  if (progress >= 40) return 'warning'
  return 'exception'
}

// 模拟API请求
const fetchProjectList = async () => {
  loading.value = true
  try {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 模拟数据生成
    const mockData = generateMockData()
    
    // 搜索过滤
    let filteredData = mockData
    if (searchKeyword.value) {
      filteredData = mockData.filter(item => 
        item.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
      )
    }
    
    // 分页处理
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    projectList.value = filteredData.slice(start, end)
    total.value = filteredData.length
    
  } catch (error) {
    ElMessage.error('获取项目列表失败')
    console.error('获取项目列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 生成模拟数据
const generateMockData = () => {
  const baseNames = {
    development: ['电商平台', '移动应用', '管理系统', '数据分析', '云服务', 'AI系统', '物联网', '区块链'],
    maintenance: ['系统升级', '漏洞修复', '性能优化', '安全加固', '数据迁移', '版本更新', '兼容性修复', '文档维护'],
    research: ['技术研究', '算法优化', '架构设计', '新技术探索', '可行性分析', '性能研究', '用户体验', '市场调研'],
    testing: ['功能测试', '性能测试', '安全测试', '兼容性测试', '自动化测试', '压力测试', '回归测试', '用户验收']
  }
  
  const statuses = ['planning', 'ongoing', 'completed', 'suspended']
  const managers = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十']
  
  const data = []
  const count = Math.floor(Math.random() * 50) + 30 // 30-80个项目
  
  for (let i = 1; i <= count; i++) {
    const names = baseNames[props.projectType] || baseNames.development
    const randomName = names[Math.floor(Math.random() * names.length)]
    const randomSuffix = Math.floor(Math.random() * 1000) + 1
    
    data.push({
      id: `PRJ${String(i).padStart(4, '0')}`,
      name: `${randomName}项目${randomSuffix}`,
      type: props.projectType,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      manager: managers[Math.floor(Math.random() * managers.length)],
      startDate: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      endDate: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      progress: Math.floor(Math.random() * 100),
      memberCount: Math.floor(Math.random() * 15) + 3
    })
  }
  
  return data
}

// 事件处理
const handleSearch = () => {
  currentPage.value = 1
  fetchProjectList()
}

const handleReset = () => {
  searchKeyword.value = ''
  currentPage.value = 1
  pageSize.value = 20
  fetchProjectList()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchProjectList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchProjectList()
}

const handleView = (row) => {
  emit('view-project', row)
  ElMessage.success(`查看项目: ${row.name}`)
}

const handleEdit = (row) => {
  emit('edit-project', row)
  ElMessage.success(`编辑项目: ${row.name}`)
}

const handleClose = () => {
  visible.value = false
  // 重置数据
  searchKeyword.value = ''
  currentPage.value = 1
  pageSize.value = 20
  projectList.value = []
  total.value = 0
}

// 监听对话框显示状态
watch(visible, (newVal) => {
  if (newVal) {
    // 对话框打开时获取数据
    fetchProjectList()
  }
})

// 监听项目类型变化
watch(() => props.projectType, () => {
  if (visible.value) {
    fetchProjectList()
  }
})
</script>

<style scoped>
.dialog-content {
  padding: 20px 0;
}

.filter-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-table) {
  border: 1px solid #e4e7ed;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-progress-bar__outer) {
  background-color: #e4e7ed;
}
</style>