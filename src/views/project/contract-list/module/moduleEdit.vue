<template>
  <div class="module-edit">
    <el-dialog
      v-model="dialogVisible"
      :title="title"
      width="600px"
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
        <el-form-item label="模块名称" prop="moduleName">
          <el-input v-model="formData.moduleName" placeholder="请输入模块名称" maxlength="50" show-word-limit />
        </el-form-item>
        
        <el-form-item label="模块编码" prop="softId">
          <el-input v-model="formData.softId" placeholder="请输入模块编码" maxlength="20" show-word-limit />
        </el-form-item>
        
        <el-form-item label="状态" prop="state">
          <el-select v-model="formData.state" placeholder="请选择状态" style="width: 100%">
            <el-option :value="0" label="待开始" />
            <el-option :value="1" label="进行中" />
            <el-option :value="2" label="已完成" />
            <el-option :value="3" label="已暂停" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="计划完成时间" prop="planCompleteTime">
          <el-date-picker
            v-model="formData.planCompleteTime"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" style="width: 100%" />
        </el-form-item>
        
        <el-form-item label="简介" prop="briefIntroduction">
          <el-input
            v-model="formData.briefIntroduction"
            type="textarea"
            :rows="4"
            placeholder="请输入模块简介"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="父模块" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :data="moduleTreeData"
            :props="{ label: 'moduleName', value: 'id', children: 'children' }"
            placeholder="请选择父模块"
            clearable
            check-strictly
            style="width: 100%"
          />
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
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'success'])

// 状态管理
const loading = ref(false)
const formRef = ref()
const formData = ref({
  moduleName: '',
  softId: '',
  state: 0,
  planCompleteTime: '',
  sort: 0,
  briefIntroduction: '',
  parentId: null,
  projectId: ''
})

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.editData?.id)

const title = computed(() => {
  return isEdit.value ? '编辑模块' : '新增模块'
})

// 表单验证规则
const rules = {
  moduleName: [
    { required: true, message: '请输入模块名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  softId: [
    { required: true, message: '请输入模块编码', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  state: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  planCompleteTime: [
    { required: true, message: '请选择计划完成时间', trigger: 'change' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ],
  briefIntroduction: [
    { max: 200, message: '最多 200 个字符', trigger: 'blur' }
  ]
}

// 监听editData变化
watch(() => props.editData, (newVal) => {
  if (newVal && newVal.id) {
    // 编辑模式
    nextTick(() => {
      formData.value = {
        ...newVal,
        projectId: props.projectId
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
    moduleName: '',
    softId: '',
    state: 0,
    planCompleteTime: '',
    sort: 0,
    briefIntroduction: '',
    parentId: null,
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
      projectId: props.projectId
    }
    
    // 这里调用API保存数据
    // const result = await saveModule(params)
    
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
.module-edit {
  /* 样式可以根据需要添加 */
}
</style>