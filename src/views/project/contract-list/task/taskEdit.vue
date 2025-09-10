<template>
  <div class="task-edit">
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
        <el-form-item label="任务标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入任务标题" maxlength="100" show-word-limit />
        </el-form-item>
        
        <el-form-item label="任务描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入任务描述"
            maxlength="500"
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
                <el-option :value="0" label="待开始" />
                <el-option :value="1" label="进行中" />
                <el-option :value="2" label="已完成" />
                <el-option :value="3" label="已暂停" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="进度" prop="progress">
              <el-slider
                v-model="formData.progress"
                :min="0"
                :max="100"
                :step="1"
                show-input
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划开始时间" prop="planStartTime">
              <el-date-picker
                v-model="formData.planStartTime"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划完成时间" prop="planCompleteTime">
              <el-date-picker
                v-model="formData.planCompleteTime"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
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
  priority: 2,
  status: 0,
  progress: 0,
  planStartTime: '',
  planCompleteTime: '',
  tags: [],
  projectId: ''
})

// 模拟数据
const tagOptions = ref(['前端', '后端', '测试', '设计', '文档', '优化', 'Bug修复'])

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.editData?.id)

const title = computed(() => {
  return isEdit.value ? '编辑任务' : '新增任务'
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '最多 500 个字符', trigger: 'blur' }
  ],
  moduleId: [
    { required: true, message: '请选择所属模块', trigger: 'change' }
  ],
  assignee: [
    { required: true, message: '请选择处理人', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  progress: [
    { required: true, message: '请输入进度', trigger: 'blur' }
  ],
  planStartTime: [
    { required: true, message: '请选择计划开始时间', trigger: 'change' }
  ],
  planCompleteTime: [
    { required: true, message: '请选择计划完成时间', trigger: 'change' }
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
    priority: 2,
    status: 0,
    progress: 0,
    planStartTime: '',
    planCompleteTime: '',
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
    // const result = await saveTask(params)
    
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
.task-edit {
  /* 样式可以根据需要添加 */
}
</style>