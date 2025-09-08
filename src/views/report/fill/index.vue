<template>
  <div class="fill-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/report/todo' }">我的待办</el-breadcrumb-item>
        <el-breadcrumb-item>填写{{ getReportTypeText(reportType) }}</el-breadcrumb-item>
      </el-breadcrumb>
      <h2>填写{{ getReportTypeText(reportType) }}</h2>
      <p class="page-desc">{{ reportInfo.title }} - {{ reportInfo.projectName }}</p>
    </div>

    <!-- 报表信息卡片 -->
    <el-card class="info-card" shadow="never">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="info-item">
            <span class="info-label">报表类型：</span>
            <span class="info-value">{{ getReportTypeText(reportType) }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <span class="info-label">所属项目：</span>
            <span class="info-value">{{ reportInfo.projectName }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-item">
            <span class="info-label">截止日期：</span>
            <span class="info-value" :class="getDeadlineClass(reportInfo.deadline)">
              {{ formatDate(reportInfo.deadline) }}
            </span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 填写表单 -->
    <el-card class="form-card" shadow="never">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        label-position="top"
      >
        <!-- 基本信息字段 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="填写日期" prop="fillDate">
              <el-date-picker
                v-model="formData.fillDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="填写人" prop="author">
              <el-input v-model="formData.author" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 动态字段 -->
        <div v-for="field in dynamicFields" :key="field.id" class="field-section">
          <el-divider v-if="field.type !== 'divider'" content-position="left">
            {{ field.label }}
            <span v-if="field.required" class="required">*</span>
          </el-divider>
          
          <!-- 文本输入 -->
          <el-form-item
            v-if="field.type === 'text'"
            :label="field.label"
            :prop="field.id"
            :rules="field.required ? [{ required: true, message: `请输入${field.label}`, trigger: 'blur' }] : []"
          >
            <el-input
              v-model="formData[field.id]"
              :placeholder="field.placeholder || `请输入${field.label}`"
              :maxlength="field.maxLength || 200"
              show-word-limit
            />
          </el-form-item>

          <!-- 数字输入 -->
          <el-form-item
            v-if="field.type === 'number'"
            :label="field.label"
            :prop="field.id"
            :rules="field.required ? [{ required: true, message: `请输入${field.label}`, trigger: 'blur' }] : []"
          >
            <el-input-number
              v-model="formData[field.id]"
              :min="field.min || 0"
              :max="field.max || 9999"
              :placeholder="field.placeholder || `请输入${field.label}`"
              style="width: 100%"
            />
          </el-form-item>

          <!-- 下拉选择 -->
          <el-form-item
            v-if="field.type === 'select'"
            :label="field.label"
            :prop="field.id"
            :rules="field.required ? [{ required: true, message: `请选择${field.label}`, trigger: 'change' }] : []"
          >
            <el-select
              v-model="formData[field.id]"
              :placeholder="field.placeholder || `请选择${field.label}`"
              style="width: 100%"
            >
              <el-option
                v-for="option in field.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>

          <!-- 多行文本 -->
          <el-form-item
            v-if="field.type === 'textarea'"
            :label="field.label"
            :prop="field.id"
            :rules="field.required ? [{ required: true, message: `请输入${field.label}`, trigger: 'blur' }] : []"
          >
            <el-input
              v-model="formData[field.id]"
              type="textarea"
              :rows="4"
              :placeholder="field.placeholder || `请输入${field.label}`"
              :maxlength="field.maxLength || 500"
              show-word-limit
            />
          </el-form-item>

          <!-- 富文本编辑器 -->
          <el-form-item
            v-if="field.type === 'richText'"
            :label="field.label"
            :prop="field.id"
            :rules="field.required ? [{ required: true, message: `请输入${field.label}`, trigger: 'blur' }] : []"
          >
            <div class="editor-container">
              <Toolbar
                :editor="editorRefs[field.id]"
                :defaultConfig="toolbarConfig"
                :mode="mode"
                style="border-bottom: 1px solid #e8e8e8"
              />
              <Editor
                :editor="editorRefs[field.id]"
                :defaultConfig="editorConfig"
                :mode="mode"
                v-model="formData[field.id]"
                style="height: 300px; overflow-y: hidden; width: 100%"
                @onCreated="(editor) => (editorRefs[field.id] = editor)"
                @onDestroyed="() => (editorRefs[field.id] = null)"
              />
            </div>
          </el-form-item>

          <!-- 日期选择 -->
          <el-form-item
            v-if="field.type === 'date'"
            :label="field.label"
            :prop="field.id"
            :rules="field.required ? [{ required: true, message: `请选择${field.label}`, trigger: 'change' }] : []"
          >
            <el-date-picker
              v-model="formData[field.id]"
              type="date"
              :placeholder="field.placeholder || `请选择${field.label}`"
              style="width: 100%"
            />
          </el-form-item>

          <!-- 日期范围 -->
          <el-form-item
            v-if="field.type === 'daterange'"
            :label="field.label"
            :prop="field.id"
            :rules="field.required ? [{ required: true, message: `请选择${field.label}`, trigger: 'change' }] : []"
          >
            <el-date-picker
              v-model="formData[field.id]"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 100%"
            />
          </el-form-item>

          <!-- 时间选择 -->
          <el-form-item
            v-if="field.type === 'time'"
            :label="field.label"
            :prop="field.id"
            :rules="field.required ? [{ required: true, message: `请选择${field.label}`, trigger: 'change' }] : []"
          >
            <el-time-picker
              v-model="formData[field.id]"
              :placeholder="field.placeholder || `请选择${field.label}`"
              style="width: 100%"
            />
          </el-form-item>

          <!-- 文件上传 -->
          <el-form-item
            v-if="field.type === 'file'"
            :label="field.label"
            :prop="field.id"
            :rules="field.required ? [{ required: true, message: `请上传${field.label}`, trigger: 'change' }] : []"
          >
            <el-upload
              v-model:file-list="formData[field.id]"
              :action="field.uploadUrl || '/api/upload'"
              :limit="field.limit || 3"
              :on-exceed="handleExceed"
              :before-upload="beforeUpload"
            >
              <el-button type="primary">点击上传</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  {{ field.tip || '支持 jpg/png/pdf 格式，单个文件不超过10MB' }}
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </div>
      </el-form>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button @click="handleSaveDraft" :loading="saving">
          保存草稿
        </el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          提交报表
        </el-button>
        <el-button @click="handleBack">
          返回待办
        </el-button>
      </div>
    </el-card>

    <!-- 预览弹窗 -->
    <el-dialog
      v-model="previewVisible"
      title="报表预览"
      width="80%"
      :close-on-click-modal="false"
    >
      <div class="preview-content">
        <h3>{{ reportInfo.title }}</h3>
        <div class="preview-fields">
          <div v-for="field in dynamicFields" :key="field.id" class="preview-field">
            <strong>{{ field.label }}：</strong>
            <div v-if="field.type === 'richText'" v-html="formData[field.id]"></div>
            <span v-else>{{ formatFieldValue(field, formData[field.id]) }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="previewVisible = false">关闭</el-button>
          <el-button type="primary" @click="confirmSubmit" :loading="submitting">
            确认提交
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTabs } from '@/composables/useTabs'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'

// wangEditor 实例管理
const editorRefs = ref({})
const mode = 'default'

// 路由相关
const route = useRoute()
const router = useRouter()
const { closeTabAndRedirect } = useTabs()
const todoId = ref(route.params.id || route.query.id)
const reportType = ref(parseInt(route.query.type) || 1)

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const submitting = ref(false)
const previewVisible = ref(false)

// 报表信息
const reportInfo = reactive({
  title: '',
  projectName: '',
  deadline: '',
  type: ''
})

// 表单数据
const formRef = ref()
const formData = reactive({
  fillDate: new Date(),
  author: '当前用户',
  reportId: '',
  projectId: ''
})

// 动态字段配置
const dynamicFields = ref([])

// 表单验证规则
const formRules = {}

// wangEditor 配置
const toolbarConfig = {
  excludeKeys: ['group-video', 'group-image']
}

const editorConfig = {
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      server: '/api/upload/image',
      fieldName: 'file',
      maxFileSize: 10 * 1024 * 1024,
      maxNumberOfFiles: 10,
      allowedFileTypes: ['image/*'],
      meta: { type: 'report' },
      headers: {
        Authorization: 'Bearer your-token'
      },
      customInsert(res, insertFn) {
        insertFn(res.data.url, res.data.alt, res.data.href)
      }
    },
    uploadVideo: {
      server: '/api/upload/video',
      fieldName: 'file',
      maxFileSize: 100 * 1024 * 1024,
      maxNumberOfFiles: 5,
      allowedFileTypes: ['video/*'],
      meta: { type: 'report' },
      headers: {
        Authorization: 'Bearer your-token'
      },
      customInsert(res, insertFn) {
        insertFn(res.data.url, res.data.poster)
      }
    }
  }
}

// 模拟从后端获取字段配置
const fetchReportConfig = async () => {
  loading.value = true
  try {
    // TODO: 替换为实际API调用
    // const response = await fetch(`/api/report/config/${todoId.value}`)
    // const data = await response.json()
    
    // 模拟后端返回的数据
    const mockConfigs = {
      1: {
        title: '2024-01-15 开发日报',
        projectName: 'Vue3管理系统',
        deadline: '2024-01-15',
        type: '1',
        fields: [
          {
            id: 'todayWork',
            label: '今日工作内容',
            type: 'richText',
            required: true,
            placeholder: '详细描述今日完成的工作内容'
          },
          {
            id: 'progress',
            label: '完成进度',
            type: 'number',
            required: true,
            min: 0,
            max: 100,
            placeholder: '请输入完成百分比'
          },
          {
            id: 'problems',
            label: '遇到的问题',
            type: 'richText',
            required: false,
            placeholder: '描述遇到的问题及解决方案'
          },
          {
            id: 'tomorrowPlan',
            label: '明日计划',
            type: 'richText',
            required: true,
            placeholder: '明日的工作计划'
          },
          {
            id: 'workHours',
            label: '工作时长',
            type: 'number',
            required: true,
            min: 0,
            max: 24,
            placeholder: '请输入今日工作小时数'
          }
        ]
      },
      2: {
        title: '第3周周报',
        projectName: 'React电商后台',
        deadline: '2024-01-21',
        type: '2',
        fields: [
          {
            id: 'weekSummary',
            label: '本周工作总结',
            type: 'richText',
            required: true,
            placeholder: '总结本周工作完成情况'
          },
          {
            id: 'achievements',
            label: '主要成果',
            type: 'richText',
            required: true,
            placeholder: '列出本周取得的主要成果'
          },
          {
            id: 'issues',
            label: '问题与风险',
            type: 'richText',
            required: false,
            placeholder: '列出遇到的问题和潜在风险'
          },
          {
            id: 'nextWeekPlan',
            label: '下周工作计划',
            type: 'richText',
            required: true,
            placeholder: '下周的工作计划和目标'
          }
        ]
      },
      3: {
        title: '2024年1月月报',
        projectName: 'Node.js API服务',
        deadline: '2024-01-31',
        type: '3',
        fields: [
          {
            id: 'monthOverview',
            label: '本月工作概览',
            type: 'richText',
            required: true,
            placeholder: '本月工作整体情况'
          },
          {
            id: 'keyMetrics',
            label: '关键指标',
            type: 'textarea',
            required: true,
            placeholder: '列出本月关键业务指标'
          },
          {
            id: 'projectProgress',
            label: '项目进展',
            type: 'richText',
            required: true,
            placeholder: '项目整体进展情况'
          },
          {
            id: 'teamPerformance',
            label: '团队表现',
            type: 'richText',
            required: false,
            placeholder: '团队整体表现评价'
          },
          {
            id: 'improvements',
            label: '改进建议',
            type: 'richText',
            required: false,
            placeholder: '针对发现问题的改进建议'
          }
        ]
      }
    }

    const config = mockConfigs[reportType.value] || mockConfigs[1]
    
    // 设置报表信息
    reportInfo.title = config.title
    reportInfo.projectName = config.projectName
    reportInfo.deadline = config.deadline
    reportInfo.type = config.type
    
    // 设置动态字段
    dynamicFields.value = config.fields
    
    // 初始化表单数据
    config.fields.forEach(field => {
      formData[field.id] = field.defaultValue || (field.type === 'richText' ? '<p></p>' : '')
    })
    
    // 初始化表单验证规则
    config.fields.forEach(field => {
      if (field.required) {
        formRules[field.id] = [
          { required: true, message: `请${field.type === 'select' ? '选择' : '输入'}${field.label}`, trigger: 'blur' }
        ]
      }
    })
    
  } catch (error) {
    console.error('获取报表配置失败:', error)
    ElMessage.error('获取报表配置失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 格式化字段值显示
const formatFieldValue = (field, value) => {
  if (!value) return '未填写'
  
  switch (field.type) {
    case 'select':
      const option = field.options?.find(opt => opt.value === value)
      return option?.label || value
    case 'number':
      return value + (field.unit || '')
    case 'date':
      return new Date(value).toLocaleDateString('zh-CN')
    case 'daterange':
      return Array.isArray(value) 
        ? `${new Date(value[0]).toLocaleDateString('zh-CN')} 至 ${new Date(value[1]).toLocaleDateString('zh-CN')}`
        : value
    default:
      return value
  }
}

// 文件上传相关
const handleExceed = (files, fileList) => {
  ElMessage.warning(`最多只能上传 ${fileList.length} 个文件`)
}

const beforeUpload = (file) => {
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
  }
  return isLt10M
}

// 保存草稿
const handleSaveDraft = async () => {
  saving.value = true
  try {
    // TODO: 调用保存草稿API
    // await saveDraftAPI({
    //   todoId: todoId.value,
    //   type: reportType.value,
    //   ...formData
    // })
    
    ElMessage.success('草稿保存成功')
  } catch (error) {
    console.error('保存草稿失败:', error)
    ElMessage.error('保存草稿失败')
  } finally {
    saving.value = false
  }
}

// 提交报表
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      previewVisible.value = true
    } else {
      ElMessage.error('请完善必填信息')
    }
  })
}

// 确认提交
const confirmSubmit = async () => {
  submitting.value = true
  try {
    // wangEditor 内容已经通过 v-model 绑定到 formData
    const submitData = { ...formData }
    
    // TODO: 调用提交API
    // await submitReportAPI({
    //   todoId: todoId.value,
    //   type: reportType.value,
    //   ...submitData
    // })
    
    ElMessage.success('报表提交成功')
    previewVisible.value = false
    
    // 关闭当前标签页并返回待办页面
    setTimeout(() => {
      closeTabAndRedirect('/report/todo')
    }, 1000)
    
  } catch (error) {
    console.error('提交报表失败:', error)
    ElMessage.error('提交报表失败')
  } finally {
    submitting.value = false
  }
}

// 返回待办
const handleBack = () => {
  ElMessageBox.confirm('确定要返回吗？未保存的数据将丢失', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    closeTabAndRedirect('/report/todo')
  })
}

// 获取报表类型文本
const getReportTypeText = (type) => {
  const map = {
    1: '日报',
    2: '周报',
    3: '月报'
  }
  return map[type] || type
}

// 获取截止日期样式
const getDeadlineClass = (deadline) => {
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'deadline-overdue'
  if (diffDays <= 1) return 'deadline-urgent'
  if (diffDays <= 3) return 'deadline-warning'
  return 'deadline-normal'
}

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 生命周期钩子
onMounted(() => {
  fetchReportConfig()
})

// 销毁所有 wangEditor 实例
onUnmounted(() => {
  Object.values(editorRefs.value).forEach(editor => {
    if (editor && typeof editor.destroy === 'function') {
      editor.destroy()
    }
  })
})
</script>

<style scoped>
.fill-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 12px 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-desc {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.info-card {
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-label {
  color: #606266;
  font-size: 14px;
  margin-right: 8px;
}

.info-value {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.deadline-overdue {
  color: #f56c6c;
  font-weight: bold;
}

.deadline-urgent {
  color: #e6a23c;
  font-weight: bold;
}

.deadline-warning {
  color: #409eff;
  font-weight: bold;
}

.deadline-normal {
  color: #67c23a;
}

.form-card {
  margin-bottom: 24px;
}

.field-section {
  margin-bottom: 24px;
}

.required {
  color: #f56c6c;
  margin-left: 4px;
}

.editor-container {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
  width: 100%;
}

.editor-container :deep(.w-e-text-container) {
  width: 100% !important;
}

.editor-container :deep(.w-e-toolbar) {
  width: 100% !important;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
}

.preview-content h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #303133;
  font-size: 18px;
}

.preview-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-field {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.preview-field strong {
  display: block;
  margin-bottom: 8px;
  color: #606266;
}

.preview-field div,
.preview-field span {
  color: #303133;
  line-height: 1.6;
}
</style>