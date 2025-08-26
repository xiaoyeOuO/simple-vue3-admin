<template>
  <el-drawer
    v-model="visible"
    :title="drawerTitle"
    :size="drawerSize"
    :before-close="handleClose"
    direction="rtl"
    destroy-on-close
  >
    <div class="drawer-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="类型名称" prop="typeName">
          <el-input 
            v-model="formData.typeName" 
            placeholder="请输入业务类型名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="类型编码" prop="typeCode">
          <el-input 
            v-model="formData.typeCode" 
            placeholder="请输入类型编码（英文+数字）"
            maxlength="30"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="类型描述" prop="description">
          <el-input 
            v-model="formData.description" 
            type="textarea"
            :rows="3"
            placeholder="请输入类型描述信息"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="排序" prop="sortOrder">
          <el-input-number 
            v-model="formData.sortOrder" 
            :min="0" 
            :max="999"
            controls-position="right"
            style="width: 120px"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio value="1">启用</el-radio>
            <el-radio value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleSubmit" 
          :loading="submitLoading"
        >
          确定
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: 'add' // add 或 edit
  }
})

const emit = defineEmits(['update:visible', 'success'])

// 表单引用
const formRef = ref()

// 表单数据
const formData = ref({
  typeName: '',
  typeCode: '',
  description: '',
  sortOrder: 0,
  status: '1'
})

// 提交状态
const submitLoading = ref(false)

// 计算属性
const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const drawerTitle = computed(() => {
  return props.mode === 'add' ? '新增业务类型' : '编辑业务类型'
})

const drawerSize = computed(() => {
  return window.innerWidth < 768 ? '90%' : '500px'
})

// 表单验证规则
const formRules = {
  typeName: [
    { required: true, message: '请输入业务类型名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  typeCode: [
    { required: true, message: '请输入类型编码', trigger: 'blur' },
    { 
      pattern: /^[a-zA-Z0-9-_]+$/, 
      message: '只能包含英文、数字、下划线和横线', 
      trigger: 'blur' 
    },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ],
  sortOrder: [
    { type: 'number', min: 0, max: 999, message: '排序必须在0-999之间', trigger: 'blur' }
  ]
}

// 重置表单
const resetForm = () => {
  formData.value = {
    typeName: '',
    typeCode: '',
    description: '',
    sortOrder: 0,
    status: '1'
  }
}

// 监听数据变化
watch(() => props.data, (newData) => {
  if (newData && props.mode === 'edit') {
    nextTick(() => {
      formData.value = {
        ...newData
      }
    })
  } else if (props.mode === 'add') {
    // 新增时重置表单
    resetForm()
  }
}, { immediate: true })

// 关闭前的处理
const handleClose = (done) => {
  if (!submitLoading.value) {
    ElMessageBox.confirm(
      '确定要关闭吗？未保存的数据将会丢失',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      done()
    }).catch(() => {
      // 取消关闭
    })
  } else {
    done()
  }
}

// 取消
const handleCancel = () => {
  visible.value = false
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 这里应该调用实际的API
    // 如果是编辑模式，调用更新接口
    // 如果是新增模式，调用创建接口
    
    ElMessage.success(props.mode === 'add' ? '新增成功' : '更新成功')
    emit('success')
    visible.value = false
    
  } catch (error) {
    if (error !== false) {
      ElMessage.error('表单验证失败')
    }
  } finally {
    submitLoading.value = false
  }
}

// 暴露方法给父组件
defineExpose({
  resetForm
})
</script>

<style scoped>
.drawer-content {
  padding: 0 20px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 10px 20px;
  border-top: 1px solid #ebeef5;
}

:deep(.el-drawer__header) {
  margin-bottom: 20px;
  padding: 20px 20px 0;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-drawer__body) {
  padding: 0;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

@media screen and (max-width: 768px) {
  .drawer-content {
    padding: 0 15px;
  }
  
  :deep(.el-drawer__header) {
    padding: 15px 15px 0;
  }
}
</style>