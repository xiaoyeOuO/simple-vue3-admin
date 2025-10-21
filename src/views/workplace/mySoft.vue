<template>
  <div class="my-soft-container">
    <el-table 
      :data="tableData" 
      style="width: 100%"
      :height="242"
      :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
      v-loading="loading"
    >
      <el-table-column type="index" label="序号" width="80" align="center" />
      <el-table-column prop="name" label="软件名" min-width="200" />
      <el-table-column label="操作" width="300" align="center">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button type="primary" link size="small" @click="handleAccess(row)">
              立即访问
            </el-button>
            <el-button type="info" link size="small" @click="handleDoc(row)">
              帮助文档
            </el-button>
            <el-button type="warning" link size="small" @click="handleVideo(row)">
              帮助视频
            </el-button>
            <el-button type="danger" link size="small" @click="handleUnfavorite(row)">
              取消收藏
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 添加软件弹窗 -->
    <AddSoftwareDialog 
      v-model="addDialogVisible" 
      @confirm="handleAddConfirm"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AddSoftwareDialog from './AddSoftwareDialog.vue'

const tableData = ref([
  {
    id: 1,
    name: 'Visual Studio Code'
  },
  {
    id: 2,
    name: 'WebStorm'
  },
  {
    id: 3,
    name: 'Photoshop'
  },
  {
    id: 4,
    name: 'Postman'
  },
  {
    id: 5,
    name: 'Chrome DevTools'
  }
])

const loading = ref(false)
const addDialogVisible = ref(false)

const handleAddSoftware = () => {
  addDialogVisible.value = true
}

const handleAddConfirm = (selectedSoftware) => {
  loading.value = true
  // 模拟添加软件后的刷新
  setTimeout(() => {
    selectedSoftware.forEach(software => {
      const newId = Math.max(...tableData.value.map(item => item.id)) + 1
      tableData.value.push({
        id: newId,
        name: software
      })
    })
    loading.value = false
    console.log('软件添加完成，列表已刷新')
  }, 500)
}

// 暴露方法给父组件
import { defineExpose } from 'vue'
defineExpose({
  handleAddSoftware
})

const handleAccess = (row) => {
  console.log('立即访问:', row.name)
  // 这里可以添加访问逻辑
}

const handleDoc = (row) => {
  console.log('查看帮助文档:', row.name)
  // 这里可以添加文档查看逻辑
}

const handleVideo = (row) => {
  console.log('查看帮助视频:', row.name)
  // 这里可以添加视频查看逻辑
}

const handleUnfavorite = (row) => {
  console.log('取消收藏:', row.name)
  // 这里可以添加取消收藏逻辑
  const index = tableData.value.findIndex(item => item.id === row.id)
  if (index > -1) {
    tableData.value.splice(index, 1)
  }
}
</script>

<style scoped>
.my-soft-container {
  padding: 16px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  padding: 4px 8px;
  font-size: 12px;
}

/* 自定义表头样式 */
:deep(.el-table__header-wrapper) {
  background-color: #f5f7fa;
}

:deep(.el-table__header) {
  background-color: #f5f7fa;
}

/* 表格行悬停效果 */
:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

/* 按钮悬停效果 */
.action-buttons .el-button:hover {
  opacity: 0.8;
}
</style>