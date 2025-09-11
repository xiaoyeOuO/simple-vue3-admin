<template>
  <el-drawer
    v-model="visible"
    title="绑定项目"
    :size="400"
    direction="rtl"
    @close="handleClose"
  >
    <div class="drawer-content">
      <el-form :model="form" label-width="80px">
        <el-form-item label="软件名称">
          <el-input v-model="form.softwareName" disabled />
        </el-form-item>
        
        <el-form-item label="选择项目" required>
          <el-select
            v-model="form.projectId"
            placeholder="请选择项目"
            style="width: 100%"
            filterable
            clearable
          >
            <el-option
              v-for="item in projectOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            保存绑定
          </el-button>
          <el-button @click="handleClose">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  software: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'success'])

// 本地状态
const visible = ref(false)
const loading = ref(false)
const form = ref({
  id: '',
  softwareName: '',
  projectId: ''
})

// 项目选项
const projectOptions = ref([])

// 模拟项目数据
const mockProjects = [
  { id: 101, name: '智慧园区管理系统' },
  { id: 102, name: '电商平台重构' },
  { id: 103, name: '微服务架构升级' },
  { id: 104, name: '数据分析平台' },
  { id: 105, name: '移动应用开发' }
]

// 监听props变化
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
})

watch(() => props.software, (newSoftware) => {
  if (newSoftware) {
    form.value = {
      id: newSoftware.id,
      softwareName: newSoftware.softwareName,
      projectId: newSoftware.projectId || ''
    }
  }
}, { immediate: true })

// 监听本地visible变化
watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

// 获取项目列表
const fetchProjects = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    projectOptions.value = mockProjects
  } catch (error) {
    ElMessage.error('获取项目列表失败')
  }
}

// 提交绑定
const handleSubmit = async () => {
  if (!form.value.projectId) {
    ElMessage.warning('请选择项目')
    return
  }

  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const project = projectOptions.value.find(p => p.id === form.value.projectId)
    emit('success', {
      ...form.value,
      projectName: project ? project.name : '未绑定'
    })
    
    ElMessage.success('绑定成功')
    handleClose()
  } catch (error) {
    ElMessage.error('绑定失败')
  } finally {
    loading.value = false
  }
}

// 关闭抽屉
const handleClose = () => {
  visible.value = false
}

// 初始化
fetchProjects()
</script>

<style scoped>
.drawer-content {
  padding: 20px;
}
</style>