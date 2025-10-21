<template>
  <el-dialog
    v-model="visible"
    title="添加软件"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="dialog-content">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="选择软件">
          <el-select
            v-model="formData.selectedSoftware"
            multiple
            placeholder="请选择要添加的软件"
            style="width: 100%"
            filterable
            clearable
          >
            <el-option
              v-for="item in softwareOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="loading">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(false)
const loading = ref(false)

const formData = reactive({
  selectedSoftware: []
})

// 模拟软件选项数据
const softwareOptions = ref([
  { label: 'Visual Studio Code', value: 'vscode' },
  { label: 'WebStorm', value: 'webstorm' },
  { label: 'Photoshop', value: 'photoshop' },
  { label: 'Postman', value: 'postman' },
  { label: 'Chrome DevTools', value: 'chrome-devtools' },
  { label: 'Figma', value: 'figma' },
  { label: 'Git', value: 'git' },
  { label: 'Docker', value: 'docker' },
  { label: 'MySQL Workbench', value: 'mysql-workbench' },
  { label: 'Navicat', value: 'navicat' }
])

// 监听visible变化
watch(() => props.modelValue, (val) => {
  visible.value = val
})

// 监听内部visible变化
watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleClose = () => {
  formData.selectedSoftware = []
}

const handleCancel = () => {
  visible.value = false
  formData.selectedSoftware = []
}

const handleConfirm = async () => {
  if (formData.selectedSoftware.length === 0) {
    ElMessage.warning('请至少选择一个软件')
    return
  }
  
  loading.value = true
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 这里可以替换为实际的API调用
    console.log('发送请求到后端:', formData.selectedSoftware)
    
    ElMessage.success('软件添加成功')
    emit('confirm', formData.selectedSoftware)
    visible.value = false
    formData.selectedSoftware = []
  } catch (error) {
    ElMessage.error('添加失败，请重试')
    console.error('添加软件失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.dialog-content {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>