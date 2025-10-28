<template>
  <div class="soft-project-bind">
    <div class="page-header">
      <h2>软件项目绑定管理</h2>
      <p>管理软件与项目的绑定关系</p>
    </div>

    <div class="content-card">
      <el-table
        :data="tableData"
        v-loading="loading"
        style="width: 100%"
        border
      >
        <el-table-column prop="softwareName" label="软件名" min-width="200" />
        <el-table-column prop="projectName" label="绑定的项目名" min-width="200" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleBind(row)">
              绑定项目
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 绑定项目抽屉组件 -->
    <SoftProjectBindEdit
      v-model="drawerVisible"
      :software="currentSoftware"
      @success="handleBindSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import SoftProjectBindEdit from './edit.vue'

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 抽屉控制
const drawerVisible = ref(false)
const currentSoftware = ref({})

// 模拟数据
const mockSoftwareData = [
  { id: 1, softwareName: 'Visual Studio Code', projectId: 101, projectName: '智慧园区管理系统' },
  { id: 2, softwareName: 'IntelliJ IDEA', projectId: 102, projectName: '电商平台重构' },
  { id: 3, softwareName: 'Postman', projectId: null, projectName: '未绑定' },
  { id: 4, softwareName: 'Docker Desktop', projectId: 103, projectName: '微服务架构升级' },
  { id: 5, softwareName: 'Git', projectId: null, projectName: '未绑定' }
]

// 获取列表数据
const fetchData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    tableData.value = mockSoftwareData.map(item => ({
      ...item,
      projectName: item.projectName || '未绑定'
    }))
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 打开绑定抽屉
const handleBind = (row) => {
  currentSoftware.value = { ...row }
  drawerVisible.value = true
}

// 绑定成功回调
const handleBindSuccess = (result) => {
  // 更新本地数据
  const target = tableData.value.find(item => item.id === result.id)
  if (target) {
    target.projectId = result.projectId
    target.projectName = result.projectName
  }
  ElMessage.success('绑定成功')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.soft-project-bind {
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

.content-card {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.drawer-content {
  padding: 20px;
}
</style>