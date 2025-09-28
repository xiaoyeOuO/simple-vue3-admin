<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="600px"
    :before-close="handleClose"
    @closed="handleClosed"
  >
    <div class="dialog-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-loading :loading="true" text="加载中..." />
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <el-alert
          :title="error"
          type="error"
          :closable="false"
        />
      </div>
      
      <!-- 问答数据展示 -->
      <div v-else-if="questionData || replyData.length > 0" class="qa-container">
        <!-- 问题信息 -->
        <div v-if="questionData" class="question-section">
          <div class="section-title">
            <el-icon><QuestionFilled /></el-icon>
            <span>问题信息</span>
          </div>
          <div class="question-content">
            {{ questionData.content }}
          </div>
          <div v-if="questionData.createTime" class="question-time">
            提问时间: {{ formatTime(questionData.createTime) }}
          </div>
        </div>
        
        <!-- 回复信息 -->
        <div v-if="replyData.length > 0" class="reply-section">
          <div class="section-title">
            <el-icon><ChatLineRound /></el-icon>
            <span>回复信息</span>
            <el-tag size="small" type="info">{{ replyData.length }} 条回复</el-tag>
          </div>
          <div class="reply-list">
            <div 
              v-for="(reply, index) in replyData" 
              :key="index"
              class="reply-item"
            >
              <div class="reply-content">
                {{ reply.content }}
              </div>
              <div v-if="reply.createTime" class="reply-time">
                {{ formatTime(reply.createTime) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 空数据状态 -->
      <div v-else class="empty-container">
        <el-empty description="暂无数据" />
      </div>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { QuestionFilled, ChatLineRound } from '@element-plus/icons-vue'

// Props定义
const props = defineProps({
  // 控制弹窗显示
  modelValue: {
    type: Boolean,
    default: false
  },
  // 数据ID
  id: {
    type: [String, Number],
    required: true
  },
  // 弹窗标题
  title: {
    type: String,
    default: '详细信息'
  },
  // 后端API地址
  apiUrl: {
    type: String,
    required: true
  }
})

// Emits定义
const emit = defineEmits(['update:modelValue', 'loaded', 'error'])

// 响应式数据
const dialogVisible = ref(false)
const loading = ref(false)
const error = ref('')
const tableData = ref([])
const questionData = ref(null)
const replyData = ref([])

// 监听modelValue变化
watch(() => props.modelValue, (newVal) => {
  dialogVisible.value = newVal
  if (newVal && props.id) {
    // 弹窗打开时加载数据
    loadData()
  }
})

// 监听dialogVisible变化
watch(dialogVisible, (newVal) => {
  emit('update:modelValue', newVal)
})

// 加载数据
const loadData = async () => {
  if (!props.id) {
    error.value = 'ID不能为空'
    return
  }
  
  loading.value = true
  error.value = ''
  tableData.value = []
  questionData.value = null
  replyData.value = []
  
  try {
    // 构建完整的API URL
    const url = `${props.apiUrl}/${props.id}`
    
    // 模拟API调用（实际使用时替换为真实的API调用）
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    
    // 处理返回数据
    if (result.code === 200 || result.success) {
      // 新的问答数据格式
      if (result.data && (result.data.question || result.data.reply)) {
        // 处理问题数据
        if (result.data.question) {
          questionData.value = result.data.question
        }
        
        // 处理回复数据
        if (result.data.reply && Array.isArray(result.data.reply)) {
          replyData.value = result.data.reply
        } else if (result.data.reply && typeof result.data.reply === 'object') {
          replyData.value = [result.data.reply]
        }
        
        emit('loaded', { question: questionData.value, reply: replyData.value })
      }
      // 兼容旧的表格数据格式
      else if (result.data) {
        // 如果返回的是数组
        if (Array.isArray(result.data)) {
          tableData.value = result.data
        } 
        // 如果返回的是单个对象
        else if (typeof result.data === 'object') {
          tableData.value = [result.data]
        }
        // 如果返回的是直接数据
        else {
          tableData.value = result.data ? [result.data] : []
        }
        
        emit('loaded', tableData.value)
      }
    } else {
      throw new Error(result.message || '获取数据失败')
    }
  } catch (err) {
    error.value = err.message || '加载数据失败'
    ElMessage.error(error.value)
    emit('error', error.value)
    
    // 模拟问答数据（用于演示，实际使用时删除）
    setTimeout(() => {
      questionData.value = {
        content: `这是ID为 ${props.id} 的问题内容，请问如何解决这个问题？`,
        createTime: new Date().toISOString()
      }
      
      replyData.value = [
        {
          content: `这是针对问题 ${props.id} 的第一个回复，提供了一些解决方案。`,
          createTime: new Date(Date.now() + 1000 * 60 * 5).toISOString()
        },
        {
          content: `这是针对问题 ${props.id} 的第二个回复，补充了更多详细信息。`,
          createTime: new Date(Date.now() + 1000 * 60 * 10).toISOString()
        }
      ]
      
      loading.value = false
      error.value = ''
      ElMessage.success('问答数据加载成功（模拟数据）')
    }, 1000)
  } finally {
    loading.value = false
  }
}

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
}

// 弹窗关闭后的回调
const handleClosed = () => {
  // 重置状态
  tableData.value = []
  questionData.value = null
  replyData.value = []
  error.value = ''
  loading.value = false
}

// 时间格式化函数
const formatTime = (timeString) => {
  if (!timeString) return ''
  const date = new Date(timeString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 暴露方法给父组件
const refresh = () => {
  if (dialogVisible.value && props.id) {
    loadData()
  }
}

// 定义暴露的方法
defineExpose({
  refresh
})
</script>

<style scoped>
.dialog-content {
  min-height: 200px;
  padding: 10px 0;
}

.loading-container,
.error-container,
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.table-container {
  padding: 10px;
}

/* 问答样式 */
.qa-container {
  padding: 15px;
  max-height: 500px;
  overflow-y: auto;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f2f5;
}

.question-section {
  margin-bottom: 25px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.question-content {
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
  margin-bottom: 10px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.question-time {
  font-size: 12px;
  color: #909399;
  text-align: right;
}

.reply-section {
  padding: 15px;
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.reply-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.reply-item {
  padding: 12px 15px;
  background-color: #f5f7fa;
  border-radius: 6px;
  border-left: 3px solid #67c23a;
  transition: all 0.3s ease;
}

.reply-item:hover {
  background-color: #eef5ff;
  transform: translateX(2px);
}

.reply-content {
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
  margin-bottom: 8px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.reply-time {
  font-size: 12px;
  color: #909399;
  text-align: right;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 自定义滚动条 */
.qa-container::-webkit-scrollbar {
  width: 6px;
}

.qa-container::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 3px;
}

.qa-container::-webkit-scrollbar-track {
  background-color: #f5f7fa;
  border-radius: 3px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .qa-container {
    padding: 10px;
  }
  
  .question-section,
  .reply-section {
    padding: 12px;
  }
  
  .section-title {
    font-size: 15px;
  }
}
</style>