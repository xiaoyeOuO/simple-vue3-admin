<template>
  <el-drawer
    v-model="visible"
    :title="drawerTitle"
    size="60%"
    destroy-on-close
    @close="handleClose"
  >
    <div class="drawer-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        size="default"
      >
        <!-- 基础信息 -->
      <el-divider content-position="left">基础信息</el-divider>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="项目名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入项目名称" maxlength="400" show-word-limit />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="项目编号" prop="projectNo">
            <el-input v-model="formData.projectNo" placeholder="请输入项目编号" maxlength="200" show-word-limit />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="项目跟踪号" prop="tfn">
            <el-input v-model="formData.tfn" placeholder="请输入项目跟踪号" maxlength="100" show-word-limit />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="年度" prop="yaer">
            <el-select v-model="formData.yaer" placeholder="请选择年度" style="width: 100%">
              <el-option v-for="year in yearOptions" :key="year" :label="year" :value="year" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="业务类型" prop="business">
            <el-input v-model="formData.business" placeholder="请输入业务类型" maxlength="300" show-word-limit />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="计划金额" prop="amountPlan">
            <el-input-number 
              v-model="formData.amountPlan" 
              :precision="2" 
              :step="1000" 
              :min="0"
              style="width: 100%"
              placeholder="请输入计划金额"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="项目地址" prop="address">
            <el-input v-model="formData.address" placeholder="请输入项目地址" maxlength="200" show-word-limit />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="合同主体" prop="contractEntity">
            <el-input v-model="formData.contractEntity" placeholder="请输入合同主体" maxlength="200" show-word-limit />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="状态" prop="state">
            <el-select v-model="formData.state" placeholder="请选择状态" style="width: 100%">
              <el-option v-for="item in stateOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="阶段" prop="stage">
            <el-select v-model="formData.stage" placeholder="请选择阶段" style="width: 100%">
              <el-option v-for="item in stageOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="重要事项" prop="isMatter">
            <el-switch
              v-model="formData.isMatter"
              active-text="是"
              inactive-text="否"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="计划完成时间" prop="doneTimePlan">
            <el-date-picker
              v-model="formData.doneTimePlan"
              type="date"
              placeholder="请选择计划完成时间"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>

        <!-- 其他信息 -->
        <el-divider content-position="left">其他信息</el-divider>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="创建人ID" prop="createId">
              <el-input v-model="formData.createId" placeholder="请输入创建人ID" maxlength="11" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          {{ mode === 'add' ? '新增' : '保存' }}
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
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
    default: 'add' // add | edit
  }
})

const emit = defineEmits(['update:visible', 'success'])

// 表单引用
const formRef = ref()

// 表单数据
const formData = reactive({
  name: '',
  projectNo: '',
  tfn: '',
  yaer: '',
  business: '',
  amountPlan: 0,
  address: '',
  state: '进行中',
  stage: '立项阶段',
  isMatter: false,
  doneTimePlan: '',
  contractEntity: '',
  createId: ''
})

// 加载状态
const submitLoading = ref(false)

// 选项数据
const yearOptions = ['2020', '2021', '2022', '2023', '2024', '2025']
const stateOptions = ['进行中', '已完成', '已暂停', '已取消', '待启动']
const stageOptions = ['立项阶段', '实施阶段', '验收阶段', '完成阶段', '维护阶段']

// 计算属性
const drawerTitle = computed(() => {
  return props.mode === 'add' ? '新增经营项目' : '编辑经营项目'
})

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { max: 400, message: '项目名称最多400个字符', trigger: 'blur' }
  ],
  projectNo: [
    { required: true, message: '请输入项目编号', trigger: 'blur' },
    { max: 200, message: '项目编号最多200个字符', trigger: 'blur' }
  ],
  tfn: [
    { max: 100, message: '项目跟踪号最多100个字符', trigger: 'blur' }
  ],
  yaer: [
    { required: true, message: '请选择年度', trigger: 'change' }
  ],
  business: [
    { max: 300, message: '业务类型最多300个字符', trigger: 'blur' }
  ],
  address: [
    { max: 200, message: '项目地址最多200个字符', trigger: 'blur' }
  ],
  contractEntity: [
    { max: 200, message: '合同主体最多200个字符', trigger: 'blur' }
  ],
  state: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  stage: [
    { required: true, message: '请选择阶段', trigger: 'change' }
  ],
  createId: [
    { max: 11, message: '创建人ID最多11个字符', trigger: 'blur' }
  ]
}



// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    name: '',
    projectNo: '',
    tfn: '',
    yaer: '',
    business: '',
    amountPlan: 0,
    address: '',
    state: '进行中',
    stage: '立项阶段',
    isMatter: false,
    doneTimePlan: '',
    contractEntity: '',
    createId: ''
  })
  
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 初始化表单数据
const initFormData = (data) => {
  if (data && data.id) {
    // 编辑模式
    Object.assign(formData, data)
  } else {
    // 新增模式
    resetForm()
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    submitLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 生成ID（实际项目中由后端生成）
    if (props.mode === 'add') {
      formData.id = Date.now()
    }
    
    ElMessage.success(props.mode === 'add' ? '新增成功' : '保存成功')
    emit('success')
    
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitLoading.value = false
  }
}

// 关闭抽屉
const handleClose = () => {
  emit('update:visible', false)
  resetForm()
}

// 监听数据变化
watch(() => props.data, (newData) => {
  if (newData && props.mode === 'edit') {
    initFormData(newData)
  } else {
    resetForm()
  }
}, { immediate: true })
</script>

<style scoped>
.drawer-content {
  padding: 0 20px;
}

.drawer-footer {
  padding: 20px;
  text-align: right;
  border-top: 1px solid #ebeef5;
}

:deep(.el-divider__text) {
  background-color: #f5f7fa;
  padding: 0 15px;
  color: #606266;
  font-weight: 500;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style>