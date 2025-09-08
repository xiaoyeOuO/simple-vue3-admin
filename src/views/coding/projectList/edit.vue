<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑项目' : '新增项目'"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="项目名称">
        <div class="project-name-display">{{ currentProjectName }}</div>
      </el-form-item>
      
      <el-form-item label="选择项目" prop="selectedProject">
        <el-cascader
          v-model="formData.selectedProject"
          :options="projectOptions"
          :props="cascaderProps"
          :key="cascaderKey"
          placeholder="请选择项目"
          clearable
          filterable
        />
      </el-form-item>
      
      <el-form-item label="纳入统计" prop="included">
        <el-switch
          v-model="formData.included"
          active-text="是"
          inactive-text="否"
          active-color="#409eff"
          inactive-color="#dcdfe6"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="loading">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  project: {
    type: Object,
    default: () => ({ name: '', included: true })
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'save'])

// 表单数据
const formRef = ref()
const formData = ref({
  selectedProject: [],
  included: true
})
const loading = ref(false)
const cascaderKey = ref(Date.now()) // 用于强制重新渲染级联选择器

// 级联选择器配置
const cascaderProps = {
  checkStrictly: true, // 允许选择任意一级
  emitPath: false, // 只返回选中节点的值
  value: 'value',
  label: 'label',
  children: 'children'
}

// 项目级联数据
const projectOptions = ref([])

// 获取项目数据
const fetchProjectOptions = async () => {
  try {
    // TODO: 替换为实际的后端API接口
    // const response = await fetch('/api/projects/cascader-options')
    // const data = await response.json()
    // projectOptions.value = data
    
    // 模拟后端数据 - 实际使用时删除此部分
    projectOptions.value = [
      {
        key: 'frontend',
        label: '前端项目',
        children: [
          { key: 'vue3-admin', label: 'Vue3管理系统' },
          { key: 'react-mall', label: 'React电商后台' },
          { key: 'vue-mobile', label: 'Vue移动端' }
        ]
      },
      {
        key: 'backend',
        label: '后端项目',
        children: [
          { key: 'nodejs-api', label: 'Node.js API服务' },
          { key: 'springcloud', label: 'SpringCloud微服务' },
          { key: 'django-cms', label: 'Django CMS' }
        ]
      },
      {
        key: 'mobile',
        label: '移动端项目',
        children: [
          { key: 'weapp-shop', label: '小程序商城' },
          { key: 'flutter-app', label: 'Flutter应用' },
          { key: 'uniapp-hybrid', label: 'UniApp混合应用' }
        ]
      }
    ]
  } catch (error) {
    console.error('获取项目数据失败:', error)
    // 可以添加错误提示
    ElMessage.error('获取项目数据失败，请稍后重试')
  }
}

// 计算当前项目名称
const currentProjectName = computed(() => {
  if (props.isEdit && props.project.name) {
    return props.project.name
  }
  return '新项目'
})

// 表单验证规则
const rules = {
  selectedProject: [
    { required: true, message: '请选择项目', trigger: 'change' }
  ]
}

// 计算属性控制弹窗显示
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 获取项目详情数据
const fetchProjectDetail = async (projectKey) => {
  try {
    // TODO: 替换为实际的后端API接口
    // const response = await fetch(`/api/projects/${projectKey}`)
    // const data = await response.json()
    // return data
    
    // 模拟后端数据 - 实际使用时删除此部分
    const mockData = {
      vue3: { key: 'vue3', name: 'Vue3管理系统', included: true },
      react: { key: 'react', name: 'React电商后台', included: false },
      nodejs: { key: 'nodejs', name: 'Node.js API服务', included: true }
    }
    return mockData[projectKey] || { key: projectKey, name: projectKey, included: true }
  } catch (error) {
    console.error('获取项目详情失败:', error)
    ElMessage.error('获取项目详情失败，请稍后重试')
    return null
  }
}

// 监听弹窗显示状态
watch(
  () => props.visible,
  async (newVal) => {
    if (newVal) {
      // 每次打开弹窗都重置级联选择器的状态
      cascaderKey.value = Date.now()
      
      if (props.isEdit && props.project?.key) {
        // 编辑模式：重新获取项目详情
        const projectDetail = await fetchProjectDetail(props.project.key)
        if (projectDetail) {
          formData.value = {
            selectedProject: projectDetail.key,
            included: projectDetail.included
          }
        }
      } else {
        // 新增模式：重置表单
        formData.value = {
          selectedProject: '',
          included: true
        }
      }
      
      // 重置表单验证
      nextTick(() => {
        formRef.value?.clearValidate()
      })
    }
  }
)

// 组件挂载时获取项目数据
fetchProjectOptions()

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
}

// 保存数据
const handleSave = async () => {
  try {
    await formRef.value.validate()
    loading.value = true
    
    // 查找选中的项目名称
    const findProjectName = (options, value) => {
      for (const option of options) {
        if (option.value === value) {
          return option.label
        }
        if (option.children) {
          const found = findProjectName(option.children, value)
          if (found) return found
        }
      }
      return ''
    }
    
    const projectName = findProjectName(projectOptions.value, formData.value.selectedProject)
    
    // 模拟异步保存
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const saveData = {
      name: projectName,
      key: formData.value.selectedProject,
      included: formData.value.included
    }
    
    emit('save', saveData)
    handleClose()
    ElMessage.success(props.isEdit ? '更新成功' : '新增成功')
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.project-name-display {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  padding: 8px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-cascader) {
  width: 100%;
}
</style>