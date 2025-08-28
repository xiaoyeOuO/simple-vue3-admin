<template>
  <el-drawer
    v-model="visible"
    :title="isEdit ? '编辑名称' : '新增任务/模块'"
    :size="size"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="drawer-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        class="config-form"
      >
        <el-form-item label="类型" prop="type" v-if="!isEdit">
          <el-select v-model="formData.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="任务" value="task" />
            <el-option label="模块" value="module" />
          </el-select>
        </el-form-item>

        <el-form-item label="名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="关联项目" prop="projectName">
        <el-select
          v-model="formData.projectName"
          placeholder="请选择关联项目"
          style="width: 100%"
          filterable
          allow-create
          default-first-option
        >
          <el-option label="智慧园区项目" value="智慧园区项目" />
          <el-option label="小程序开发项目" value="小程序开发项目" />
          <el-option label="数据分析项目" value="数据分析项目" />
          <el-option label="电商平台项目" value="电商平台项目" />
          <el-option label="OA办公系统" value="OA办公系统" />
        </el-select>
      </el-form-item>

      <el-form-item label="ID" prop="id" v-if="!isEdit">
        <el-input
          v-model="formData.id"
          placeholder="请输入ID"
          maxlength="50"
        />
      </el-form-item>
      </el-form>

      <!-- 底部操作按钮 -->
      <div class="drawer-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  editData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

// 响应式抽屉大小
const size = computed(() => {
  return window.innerWidth <= 768 ? '90%' : '400px'
})

// 表单相关
const formRef = ref()
const loading = ref(false)

// 表单数据
const formData = ref({
  id: '',
  name: '',
  type: 'task',
  projectName: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择类型', trigger: 'change' }
  ],
  projectName: [
    { required: true, message: '请选择关联项目', trigger: 'change' }
  ],
  id: [
    { required: true, message: '请输入ID', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
  ]
}

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.editData)

// 方法
const resetForm = () => {
  formData.value = {
    id: '',
    name: '',
    type: 'task',
    projectName: ''
  }
}

const loadFormData = () => {
  if (props.editData) {
    formData.value = {
      id: props.editData.id,
      name: props.editData.name,
      type: props.editData.type,
      projectName: props.editData.projectName || ''
    }
  } else {
    resetForm()
  }
}

const handleClose = (done) => {
  formRef.value?.resetFields()
  done()
}

const handleCancel = () => {
  visible.value = false
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    const result = {
      ...formData.value,
      createTime: new Date().toLocaleString('zh-CN'),
      updateTime: new Date().toLocaleString('zh-CN')
    }

    emit('success', result)
    visible.value = false
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听
watch(() => props.editData, loadFormData, { immediate: true })
watch(() => props.modelValue, (val) => {
  if (val) {
    nextTick(() => {
      if (!props.editData) {
        resetForm()
      }
      formRef.value?.clearValidate()
    })
  }
})
</script>

<style scoped>
.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.config-form {
  flex: 1;
  padding: 20px;
}

.drawer-footer {
  padding: 16px 20px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background-color: #fafafa;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>