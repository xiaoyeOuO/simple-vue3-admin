<template>
  <div class="example-container">
    <h3>通用问答信息弹窗组件使用示例</h3>
    
    <!-- 使用示例 -->
    <div class="button-group">
      <el-button @click="openDialog('123')" type="primary">
        查看问答信息
      </el-button>
      <el-button @click="openDialog('456')" type="success">
        查看另一个问答
      </el-button>
      <el-button @click="openDialog('789')" type="warning">
        查看第三个问答
      </el-button>
    </div>
    
    <!-- 通用信息弹窗组件 -->
    <CommonInfoDialog
      v-model="dialogVisible"
      :id="currentId"
      title="问答详情"
      api-url="/api/qa"
      @loaded="handleLoaded"
      @error="handleError"
    />
    
    <!-- 数据展示区域 -->
    <div class="data-display" v-if="loadedData">
      <h4>加载的数据结构：</h4>
      <pre>{{ JSON.stringify(loadedData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CommonInfoDialog from '@/components/CommonInfoDialog.vue'

// 响应式数据
const dialogVisible = ref(false)
const currentId = ref('')
const loadedData = ref(null)

// 打开弹窗
const openDialog = (id) => {
  currentId.value = id
  dialogVisible.value = true
}

// 数据加载完成回调
const handleLoaded = (data) => {
  console.log('问答数据加载完成:', data)
  loadedData.value = data
}

// 错误处理回调
const handleError = (error) => {
  console.error('加载失败:', error)
}
</script>

<style scoped>
.example-container {
  padding: 20px;
}

.button-group {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.data-display {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.data-display h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.data-display pre {
  margin: 0;
  padding: 10px;
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
  color: #606266;
  overflow-x: auto;
}
</style>