<template>
  <el-drawer
    v-model="visible"
    :title="drawerTitle"
    :size="drawerSize"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="任务名称" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入任务名称"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="所属模块" prop="parentId">
        <el-tree-select
          v-model="formData.parentId"
          :data="moduleTreeData"
          :props="{ label: 'moduleName', value: 'id', children: 'children' }"
          placeholder="请选择所属模块"
          clearable
          filterable
        />
      </el-form-item>

      <el-form-item label="任务类型" prop="typeKey">
        <el-select v-model="formData.typeKey" placeholder="请选择任务类型" clearable>
          <el-option
            v-for="item in taskTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="处理人" prop="assigneeUserId">
        <el-select
          v-model="formData.assigneeUserId"
          placeholder="请选择处理人"
          clearable
          filterable
        >
          <el-option
            v-for="item in userOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="任务描述" prop="content">
        <el-input
          v-model="formData.content"
          type="textarea"
          :rows="4"
          placeholder="请输入任务描述"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="开始日期" prop="startDate">
        <el-date-picker
          v-model="formData.startDate"
          type="date"
          placeholder="选择开始日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="结束日期" prop="endDate">
        <el-date-picker
          v-model="formData.endDate"
          type="date"
          placeholder="选择结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="完成时间" prop="doneTime" v-if="mode === 'edit'">
        <el-date-picker
          v-model="formData.doneTime"
          type="datetime"
          placeholder="选择完成时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ mode === 'add' ? '创建' : '更新' }}
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'add' // add or edit
  },
  data: {
    type: Object,
    default: null
  },
  projectId: {
    type: String,
    required: true
  },
  moduleTreeData: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible', 'success'])

// 表单引用
const formRef = ref()

// 加载状态
const loading = ref(false)

// 表单数据
const formData = ref({
  projectId: '',
  parentId: '',
  title: '',
  content: '',
  typeKey: null,
  assigneeUserId: null,
  startDate: '',
  endDate: '',
  doneTime: ''
})

// 任务类型选项
const taskTypeOptions = [
  { value: 1, label: '需求开发' },
  { value: 2, label: 'Bug修复' },
  { value: 3, label: '测试任务' },
  { value: 4, label: '文档编写' },
  { value: 5, label: '其他' }
]

// 用户选项（模拟数据）
const userOptions = [
  { value: 1, label: '张经理' },
  { value: 2, label: '王工程师' },
  { value: 3, label: '李技术员' },
  { value: 4, label: '赵测试' },
  { value: 5, label: '陈设计' }
]

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  typeKey: [
    { required: true, message: '请选择任务类型', trigger: 'change' }
  ],
  assigneeUserId: [
    { required: true, message: '请选择处理人', trigger: 'change' }
  ],
  startDate: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择结束日期', trigger: 'change' }
  ]
}

// 计算属性
const drawerTitle = computed(() => {
  return props.mode === 'add' ? '新建任务' : '编辑任务'
})

const drawerSize = computed(() => {
  return window.innerWidth < 768 ? '90%' : '500px'
})

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 监听数据变化
watch(
  () => props.data,
  (newData) => {
    if (newData && props.mode === 'edit') {
      // 编辑模式，填充表单数据
      formData.value = {
        projectId: props.projectId,
        parentId: newData.parentId || '',
        title: newData.title || '',
        content: newData.content || '',
        typeKey: newData.typeKey || null,
        assigneeUserId: newData.assigneeUserId || null,
        startDate: newData.startDate || '',
        endDate: newData.endDate || '',
        doneTime: newData.doneTime || ''
      }
    } else {
      // 新增模式，重置表单
      formData.value = {
        projectId: props.projectId,
        parentId: '',
        title: '',
        content: '',
        typeKey: null,
        assigneeUserId: null,
        startDate: '',
        endDate: '',
        doneTime: ''
      }
    }
  },
  { immediate: true }
)

// 重置表单
const resetForm = () => {
  formData.value = {
    projectId: props.projectId,
    parentId: '',
    title: '',
    content: '',
    typeKey: null,
    assigneeUserId: null,
    startDate: '',
    endDate: '',
    doneTime: ''
  }
}

// 关闭抽屉
const handleClose = () => {
  visible.value = false
  nextTick(() => {
    formRef.value?.resetFields()
  })
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 构造返回数据
    const submitData = {
      ...formData.value,
      id: props.mode === 'edit' ? props.data?.id : Date.now(),
      moduleName: getModuleName(formData.value.parentId),
      assignee: getUserName(formData.value.assigneeUserId),
      typeName: getTaskTypeName(formData.value.typeKey),
      status: props.mode === 'edit' ? props.data?.status : 1,
      statusName: props.mode === 'edit' ? props.data?.statusName : '待开始',
      progress: props.mode === 'edit' ? props.data?.progress : 0
    }

    ElMessage.success(props.mode === 'add' ? '创建成功' : '更新成功')
    emit('success', submitData)
    handleClose()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('表单验证失败:', error)
    }
  } finally {
    loading.value = false
  }
}

// 获取模块名称
const getModuleName = (moduleId) => {
  const findModule = (modules) => {
    for (const module of modules) {
      if (module.id === moduleId) {
        return module.moduleName
      }
      if (module.children && module.children.length) {
        const found = findModule(module.children)
        if (found) return found
      }
    }
    return ''
  }
  return findModule(props.moduleTreeData)
}

// 获取用户名称
const getUserName = (userId) => {
  const user = userOptions.find(u => u.value === userId)
  return user ? user.label : ''
}

// 获取任务类型名称
const getTaskTypeName = (typeKey) => {
  const type = taskTypeOptions.find(t => t.value === typeKey)
  return type ? type.label : ''
}
</script>

<style scoped>
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-drawer__body) {
  padding: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>