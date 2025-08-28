<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="loading"
    >
      <!-- 字典类型选择 - 只有新增顶级字典时才显示 -->
      <el-form-item 
        v-if="mode === 'add' && !parentData" 
        label="字典类型" 
        prop="type"
      >
        <el-select 
          v-model="formData.type" 
          placeholder="请选择字典类型"
          style="width: 100%"
          @change="handleTypeChange"
        >
          <el-option
            v-for="item in dictTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <!-- 父级字典信息 - 添加子项时显示 -->
      <el-form-item 
        v-if="parentData" 
        label="父级字典"
      >
        <el-tag type="info">
          {{ parentData.name }}
        </el-tag>
      </el-form-item>

      <!-- 字典名称 -->
      <el-form-item label="字典名称" prop="name">
        <el-input 
          v-model="formData.name" 
          placeholder="请输入字典名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <!-- 字典编码 -->
      <el-form-item label="字典编码" prop="code">
        <el-input 
          v-model="formData.code" 
          placeholder="请输入字典编码"
          maxlength="50"
          show-word-limit
          :disabled="mode === 'edit'"
        />
        <div class="form-tip">建议使用大写字母和下划线，如：USER_STATUS</div>
      </el-form-item>

      <!-- 字典值 -->
      <el-form-item label="字典值" prop="value">
        <el-input 
          v-model="formData.value" 
          placeholder="请输入字典值"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <!-- 排序 -->
      <el-form-item label="排序" prop="sort">
        <el-input-number 
          v-model="formData.sort" 
          :min="0" 
          :max="999"
          style="width: 100%"
        />
      </el-form-item>

      <!-- 状态 -->
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 备注 -->
      <el-form-item label="备注" prop="remark">
        <el-input 
          v-model="formData.remark" 
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ mode === 'add' ? '新增' : '保存' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

// 定义props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  editData: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: 'add' // add, edit
  },
  parentData: {
    type: Object,
    default: null
  }
})

// 定义emits
const emit = defineEmits(['update:modelValue', 'success'])

// 响应式变量
const formRef = ref()
const loading = ref(false)
const formData = ref({
  type: '',
  typeName: '',
  name: '',
  code: '',
  value: '',
  sort: 0,
  status: 1,
  remark: ''
})

// 字典类型选项
const dictTypeOptions = [
  { value: 'project_type', label: '项目类型' },
  { value: 'task_priority', label: '任务优先级' },
  { value: 'bug_severity', label: '缺陷严重程度' },
  { value: 'user_role', label: '用户角色' },
  { value: 'project_status', label: '项目状态' },
  { value: 'module_status', label: '模块状态' }
]

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const dialogTitle = computed(() => {
  if (props.parentData) {
    return `添加子项 - ${props.parentData.name}`
  }
  return props.mode === 'add' ? '新增字典' : '编辑字典'
})

// 表单验证规则
const formRules = {
  type: [
    { required: true, message: '请选择字典类型', trigger: 'change' }
  ],
  name: [
    { required: true, message: '请输入字典名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入字典编码', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
    { pattern: /^[A-Z_]+$/, message: '只能包含大写字母和下划线', trigger: 'blur' }
  ],
  value: [
    { required: true, message: '请输入字典值', trigger: 'blur' },
    { max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }
  ],
  sort: [
    { type: 'number', min: 0, max: 999, message: '排序必须在 0-999 之间', trigger: 'blur' }
  ]
}

// 监听props变化，初始化表单数据
watch(() => [props.editData, props.parentData, props.mode], () => {
  nextTick(() => {
    resetForm()
    if (props.mode === 'edit' && props.editData) {
      // 编辑模式
      formData.value = {
        ...props.editData,
        type: props.editData.type || '',
        typeName: props.editData.typeName || ''
      }
    } else if (props.parentData) {
      // 添加子项模式
      formData.value.type = props.parentData.type
      formData.value.typeName = props.parentData.typeName
    } else {
      // 新增顶级字典模式
      formData.value = {
        type: '',
        typeName: '',
        name: '',
        code: '',
        value: '',
        sort: 0,
        status: 1,
        remark: ''
      }
    }
  })
}, { immediate: true })

// 处理字典类型变更
const handleTypeChange = (type) => {
  const selectedType = dictTypeOptions.find(item => item.value === type)
  if (selectedType) {
    formData.value.typeName = selectedType.label
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
  resetForm()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const submitData = {
          ...formData.value,
          parentId: props.parentData?.id || null
        }
        
        emit('success', submitData)
        handleClose()
      } catch (error) {
        ElMessage.error('操作失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}

// 暴露方法给父组件
defineExpose({
  resetForm
})
</script>

<style scoped>
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-dialog__body) {
  padding-top: 10px;
  padding-bottom: 10px;
}
</style>