<template>
  <div class="bug-edit">
    <el-dialog
      v-model="dialogVisible"
      :title="title"
      width="700px"
      :close-on-click-modal="false"
      @close="handleClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        v-loading="loading"
      >
        <el-form-item label="Bug标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入Bug标题" maxlength="100" show-word-limit />
        </el-form-item>
        
        <el-form-item label="详细描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述Bug的复现步骤、预期结果和实际结果"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="所属模块" prop="moduleId">
          <el-tree-select
            v-model="formData.moduleId"
            :data="moduleTreeData"
            :props="{ label: 'moduleName', value: 'id', children: 'children' }"
            placeholder="请选择所属模块"
            clearable
            style="width: 100%"
          />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="处理人" prop="assignee">
              <el-select v-model="formData.assignee" placeholder="请选择处理人" clearable style="width: 100%">
                <el-option
                  v-for="user in userOptions"
                  :key="user.id"
                  :label="user.name"
                  :value="user.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报告人" prop="reporter">
              <el-select v-model="formData.reporter" placeholder="请选择报告人" clearable style="width: 100%">
                <el-option
                  v-for="user in userOptions"
                  :key="user.id"
                  :label="user.name"
                  :value="user.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="严重程度" prop="severity">
              <el-select v-model="formData.severity" placeholder="请选择严重程度" style="width: 100%">
                <el-option :value="0" label="致命" />
                <el-option :value="1" label="严重" />
                <el-option :value="2" label="一般" />
                <el-option :value="3" label="轻微" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="formData.priority" placeholder="请选择优先级" style="width: 100%">
                <el-option :value="0" label="紧急" />
                <el-option :value="1" label="高" />
                <el-option :value="2" label="中" />
                <el-option :value="3" label="低" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
                <el-option :value="0" label="待修复" />
                <el-option :value="1" label="修复中" />
                <el-option :value="2" label="已修复" />
                <el-option :value="3" label="已关闭" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="修复版本" prop="fixVersion">
              <el-input v-model="formData.fixVersion" placeholder="请输入修复版本" maxlength="20" show-word-limit />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="复现步骤" prop="steps">
          <el-input
            v-model="formData.steps"
            type="textarea"
            :rows="3"
            placeholder="请输入详细的复现步骤"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="formData.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请输入标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in tagOptions"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            {{ isEdit ? '更 新' : '创 建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  editData: {
    type: Object,
    default: () => ({})
  },
  projectId: {
    type: [String, Number],
    required: true
  },
  moduleTreeData: {
    type: Array,
    default: () => []
  },
  userOptions: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'success'])

// 状态管理
const loading = ref(false)
const formRef = ref()
const formData = ref({
  title: '',
  description: '',
  moduleId: null,
  assignee: '',
  reporter: '',
  severity: 2,
  priority: 2,
  status: 0,
  fixVersion: '',
  steps: '',
  tags: [],
  projectId: ''
})

// 模拟数据
const tagOptions = ref(['前端', '后端', '测试', '设计', '文档', '优化', 'Bug修复', 'UI', '性能', '兼容性'])

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.editData?.id)

const title = computed(() => {
  return isEdit.value ? '编辑Bug' : '新增Bug'
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入Bug标题', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入Bug详细描述', trigger: 'blur' },
    { max: 1000, message: '最多 1000 个字符', trigger: 'blur' }
  ],
  moduleId: [
    { required: true, message: '请选择所属模块', trigger: 'change' }
  ],
  assignee: [
    { required: true, message: '请选择处理人', trigger: 'change' }
  ],
  reporter: [
    { required: true, message: '请选择报告人', trigger: 'change' }
  ],
  severity: [
    { required: true, message: '请选择严重程度', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  steps: [
    { max: 500, message: '最多 500 个字符', trigger: 'blur' }
  ]
}

// 监听editData变化
watch(() => props.editData, (newVal) => {
  if (newVal && newVal.id) {
    // 编辑模式
    nextTick(() => {
      formData.value = {
        ...newVal,
        projectId: props.projectId,
        tags: newVal.tags ? newVal.tags.split(',') : []
      }
    })
  } else {
    // 新增模式
    resetForm()
  }
}, { immediate: true, deep: true })

// 方法定义
const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    moduleId: null,
    assignee: '',
    reporter: '',
    severity: 2,
    priority: 2,
    status: 0,
    fixVersion: '',
    steps: '',
    tags: [],
    projectId: props.projectId
  }
}

const handleClose = () => {
  dialogVisible.value = false
  resetForm()
  formRef.value?.clearValidate()
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    loading.value = true
    
    const params = {
      ...formData.value,
      projectId: props.projectId,
      tags: formData.value.tags.join(',')
    }
    
    // 这里调用API保存数据
    // const result = await saveBug(params)
    
    // 模拟API调用
    setTimeout(() => {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      emit('success')
      handleClose()
      loading.value = false
    }, 1000)
    
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>

<style scoped>
.bug-edit {
  /* 样式可以根据需要添加 */
}
</style>