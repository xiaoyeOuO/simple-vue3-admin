<template>
  <el-drawer
    v-model="visible"
    :title="title"
    :size="600"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      class="module-edit-form"
    >
      <el-form-item label="模块名称" prop="moduleName">
        <el-input
          v-model="form.moduleName"
          placeholder="请输入模块名称"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="父模块" prop="parentId">
        <el-tree-select
          v-model="form.parentId"
          :data="parentModuleOptions"
          :props="{ label: 'moduleName', value: 'id', children: 'children' }"
          placeholder="请选择父模块（顶级模块可不选）"
          clearable
          check-strictly
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="模块编码" prop="softId">
        <el-input
          v-model="form.softId"
          placeholder="请输入模块编码"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="状态" prop="state">
        <el-select v-model="form.state" placeholder="请选择状态" style="width: 100%">
          <el-option label="待开始" :value="0" />
          <el-option label="进行中" :value="1" />
          <el-option label="已完成" :value="2" />
          <el-option label="已暂停" :value="3" />
          <el-option label="已取消" :value="4" />
        </el-select>
      </el-form-item>

      <el-form-item label="里程碑" prop="milestone">
        <el-input
          v-model="form.milestone"
          placeholder="请输入里程碑"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="简介" prop="briefIntroduction">
        <el-input
          v-model="form.briefIntroduction"
          type="textarea"
          :rows="3"
          placeholder="请输入模块简介"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number
          v-model="form.sort"
          :min="0"
          :max="999"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>

      <el-divider>时间计划</el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="需求分析开始" prop="demandAnalysisStartTime">
            <el-date-picker
              v-model="form.demandAnalysisStartTime"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="需求分析结束" prop="demandAnalysisEndTime">
            <el-date-picker
              v-model="form.demandAnalysisEndTime"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="软件设计开始" prop="softDesignStartTime">
            <el-date-picker
              v-model="form.softDesignStartTime"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="软件设计结束" prop="softDesignEndTime">
            <el-date-picker
              v-model="form.softDesignEndTime"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="用户指南开始" prop="userGuideStartTime">
            <el-date-picker
              v-model="form.userGuideStartTime"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户指南结束" prop="userGuideEndTime">
            <el-date-picker
              v-model="form.userGuideEndTime"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="预运行开始" prop="preRunStartTime">
            <el-date-picker
              v-model="form.preRunStartTime"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="预运行结束" prop="preRunEndTime">
            <el-date-picker
              v-model="form.preRunEndTime"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="计划完成时间" prop="planCompleteTime">
        <el-date-picker
          v-model="form.planCompleteTime"
          type="date"
          placeholder="选择日期"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="实际完成时间" prop="actualCompleteTime">
        <el-date-picker
          v-model="form.actualCompleteTime"
          type="date"
          placeholder="选择日期"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="URL地址" prop="url">
        <el-input
          v-model="form.url"
          placeholder="请输入URL地址"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          保存
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
  data: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: 'add'
  },
  allModules: {
    type: Array,
    default: () => []
  },
  projectId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:visible', 'success'])

// 表单引用
const formRef = ref()

// 表单数据
const form = ref({
  id: 0,
  subjectId: 0,
  moduleName: '',
  parentId: null,
  softId: '',
  state: 0,
  devToIntegrationPlan: '',
  integrationToUserTestPlan: '',
  userTestToReviewPlan: '',
  demandAnalysisStartTime: '',
  demandAnalysisEndTime: '',
  demandAnalysisPlan: '',
  softDesignStartTime: '',
  softDesignEndTime: '',
  softDesignPlan: '',
  userGuideStartTime: '',
  userGuideEndTime: '',
  userGuidePlan: '',
  preRunStartTime: '',
  preRunEndTime: '',
  preRunPlan: '',
  integrationStartTime: '',
  integrationEndTime: '',
  userTestStartTime: '',
  userTestEndTime: '',
  releaseTrailTime: '',
  milestone: '',
  briefIntroduction: '',
  planCompleteTime: '',
  actualCompleteTime: '',
  sort: 0,
  url: '',
  projectId: ''
})

// 父模块选项（排除自身）
const parentModuleOptions = computed(() => {
  if (!props.allModules || props.allModules.length === 0) return []
  
  // 如果是编辑模式，需要排除当前模块及其子模块
  if (props.mode === 'edit' && props.data?.id) {
    const excludeIds = new Set()
    const findChildren = (module) => {
      excludeIds.add(module.id)
      if (module.children) {
        module.children.forEach(findChildren)
      }
    }
    
    const currentModule = props.allModules.find(m => m.id === props.data.id)
    if (currentModule) {
      findChildren(currentModule)
    }
    
    return props.allModules.filter(m => !excludeIds.has(m.id))
  }
  
  return props.allModules
})

// 表单验证规则
const rules = {
  moduleName: [
    { required: true, message: '请输入模块名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  softId: [
    { required: true, message: '请输入模块编码', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  state: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ]
}

// 提交状态
const submitting = ref(false)

// 标题
const title = computed(() => {
  return props.mode === 'add' ? '新增模块' : '编辑模块'
})

// 可见性
const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 重置表单
const resetForm = () => {
  form.value = {
    id: 0,
    subjectId: 0,
    moduleName: '',
    parentId: null,
    softId: '',
    state: 0,
    devToIntegrationPlan: '',
    integrationToUserTestPlan: '',
    userTestToReviewPlan: '',
    demandAnalysisStartTime: '',
    demandAnalysisEndTime: '',
    demandAnalysisPlan: '',
    softDesignStartTime: '',
    softDesignEndTime: '',
    softDesignPlan: '',
    userGuideStartTime: '',
    userGuideEndTime: '',
    userGuidePlan: '',
    preRunStartTime: '',
    preRunEndTime: '',
    preRunPlan: '',
    integrationStartTime: '',
    integrationEndTime: '',
    userTestStartTime: '',
    userTestEndTime: '',
    releaseTrailTime: '',
    milestone: '',
    briefIntroduction: '',
    planCompleteTime: '',
    actualCompleteTime: '',
    sort: 0,
    url: '',
    projectId: props.projectId
  }
}

// 监听数据变化
watch(() => props.data, (newData) => {
  if (newData && props.mode === 'edit') {
    nextTick(() => {
      form.value = {
        ...newData,
        parentId: newData.parentId || null,
        projectId: props.projectId
      }
    })
  } else if (props.mode === 'add') {
    resetForm()
  }
}, { immediate: true })

// 关闭
const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
  resetForm()
}

// 提交
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success(props.mode === 'add' ? '新增成功' : '更新成功')
    emit('success', { ...form.value })
    handleClose()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('保存失败')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.module-edit-form {
  padding: 0 20px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 10px 20px;
  border-top: 1px solid #eee;
}

:deep(.el-divider__text) {
  font-size: 14px;
  font-weight: 500;
}
</style>