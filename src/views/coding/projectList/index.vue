<template>
  <div class="project-list-container">
    <div class="header">
      <h2>项目管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增项目
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="statistics">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card>
            <div class="stat-item">
              <div class="stat-label">总项目数</div>
              <div class="stat-value">{{ projects.length }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card>
            <div class="stat-item">
              <div class="stat-label">纳入统计</div>
              <div class="stat-value">{{ includedCount }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card>
            <div class="stat-item">
              <div class="stat-label">未纳入统计</div>
              <div class="stat-value">{{ excludedCount }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 项目列表 -->
    <div class="table-container">
      <el-table
        :data="projects"
        border
        style="width: 100%"
        :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#303133', fontWeight: 'bold' }"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="项目名称" min-width="200" />
        <el-table-column prop="included" label="纳入统计" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.included ? 'success' : 'info'">
              {{ row.included ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row, $index }">
            <el-button type="primary" link @click="handleEdit(row, $index)">
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row, $index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 编辑弹窗 -->
    <ProjectEdit
      v-model:visible="editDialogVisible"
      :project="currentProject"
      :is-edit="isEdit"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProjectEdit from './edit.vue'

// 项目数据
const projects = ref([
  { name: 'Vue3管理系统', key: 'vue3-admin', included: true },
  { name: 'React电商后台', key: 'react-mall', included: false },
  { name: 'Node.js API服务', key: 'nodejs-api', included: true },
  { name: '小程序商城', key: 'weapp-shop', included: true }
])

// 编辑弹窗状态
const editDialogVisible = ref(false)
const currentProject = ref({ name: '', included: true })
const currentIndex = ref(-1)
const isEdit = ref(false)

// 统计信息
const includedCount = computed(() => {
  return projects.value.filter(p => p.included).length
})

const excludedCount = computed(() => {
  return projects.value.filter(p => !p.included).length
})

// 操作方法
const handleAdd = () => {
  currentProject.value = { name: '', included: true }
  currentIndex.value = -1
  isEdit.value = false
  editDialogVisible.value = true
}

const handleEdit = (row, index) => {
  currentProject.value = { ...row }
  currentIndex.value = index
  isEdit.value = true
  editDialogVisible.value = true
}

const handleDelete = (row, index) => {
  ElMessageBox.confirm(
    `确定要删除项目 "${row.name}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    projects.value.splice(index, 1)
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
  })
}

const handleSave = (project) => {
  if (currentIndex.value === -1) {
    // 新增
    projects.value.push({ ...project })
    ElMessage.success('新增成功')
  } else {
    // 编辑
    projects.value[currentIndex.value] = { ...project }
    ElMessage.success('更新成功')
  }
}
</script>

<style scoped>
.project-list-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.statistics {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  color: #909399;
  font-size: 14px;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-table) {
  border-radius: 8px;
}

:deep(.el-table__header-wrapper) {
  border-radius: 8px 8px 0 0;
}

:deep(.el-table__body-wrapper) {
  border-radius: 0 0 8px 8px;
}
</style>