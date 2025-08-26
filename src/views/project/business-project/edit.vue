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
              <el-input v-model="formData.name" placeholder="请输入项目名称" maxlength="100" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目编码" prop="code">
              <el-input v-model="formData.code" placeholder="请输入项目编码" maxlength="50" show-word-limit />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="年度" prop="year">
              <el-select v-model="formData.year" placeholder="请选择年度" style="width: 100%">
                <el-option v-for="year in yearOptions" :key="year" :label="year" :value="year" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="区域" prop="areaCode">
              <el-cascader
                v-model="formData.areaCode"
                :options="areaOptions"
                placeholder="请选择区域"
                style="width: 100%"
                @change="handleAreaChange"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
                <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="阶段" prop="phase">
              <el-select v-model="formData.phase" placeholder="请选择阶段" style="width: 100%">
                <el-option v-for="item in phaseOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="重要程度" prop="important">
              <el-select v-model="formData.important" placeholder="请选择重要程度" style="width: 100%">
                <el-option v-for="item in importantOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="业务板块" prop="segment">
              <el-select v-model="formData.segment" placeholder="请选择业务板块" style="width: 100%">
                <el-option v-for="item in segmentOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模块ID" prop="moduleId">
              <el-input v-model="formData.moduleId" placeholder="请输入模块ID" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 承包商信息 -->
        <el-divider content-position="left">承包商信息</el-divider>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="承包商" prop="coName">
              <el-input v-model="formData.coName" placeholder="请输入承包商名称" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="承包商ID" prop="coId">
              <el-input v-model="formData.coId" placeholder="请输入承包商ID" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="统一信用代码" prop="coTin">
              <el-input v-model="formData.coTin" placeholder="请输入统一信用代码" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="承包商联系人" prop="coMemberName">
              <el-input v-model="formData.coMemberName" placeholder="请输入联系人姓名" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人ID" prop="coMemberId">
              <el-input v-model="formData.coMemberId" placeholder="请输入联系人ID" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="coMemberTel">
              <el-input v-model="formData.coMemberTel" placeholder="请输入联系电话" maxlength="20" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 负责人信息 -->
        <el-divider content-position="left">负责人信息</el-divider>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="负责人" prop="assignName">
              <el-input v-model="formData.assignName" placeholder="请输入负责人姓名" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人ID" prop="assignId">
              <el-input v-model="formData.assignId" placeholder="请输入负责人ID" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 填报信息 -->
        <el-divider content-position="left">填报信息</el-divider>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="填报人" prop="reporterName">
              <el-input v-model="formData.reporterName" placeholder="请输入填报人姓名" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="填报人ID" prop="reporterId">
              <el-input v-model="formData.reporterId" placeholder="请输入填报人ID" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="填报部门" prop="reporterDeptName">
              <el-input v-model="formData.reporterDeptName" placeholder="请输入填报部门" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门" prop="deptName">
              <el-input v-model="formData.deptName" placeholder="请输入部门名称" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="部门ID" prop="deptId">
              <el-input v-model="formData.deptId" placeholder="请输入部门ID" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="审核状态" prop="reviewBool">
              <el-switch
                v-model="formData.reviewBool"
                active-text="已审核"
                inactive-text="未审核"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="实例状态" prop="instanceStatus">
              <el-select v-model="formData.instanceStatus" placeholder="请选择实例状态" style="width: 100%">
                <el-option v-for="item in instanceStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实例状态名称" prop="instanceStatusName">
              <el-input v-model="formData.instanceStatusName" placeholder="请输入实例状态名称" maxlength="50" />
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
  id: '',
  moduleId: '',
  name: '',
  code: '',
  year: '',
  areaCode: '',
  area: '',
  provinceCode: '',
  cityCode: '',
  status: 1,
  statusName: '',
  phase: 1,
  phaseName: '',
  important: 1,
  importantName: '',
  segment: 1,
  segmentName: '',
  contractor: '',
  coId: '',
  coName: '',
  coTin: '',
  coMemberId: '',
  coMemberName: '',
  coMemberTel: '',
  assignId: '',
  assignName: '',
  instanceStatus: 2,
  instanceStatusName: '',
  deptId: '',
  deptName: '',
  reporterId: '',
  reporterName: '',
  reporterDeptId: '',
  reviewBool: false
})

// 加载状态
const submitLoading = ref(false)

// 选项数据
const yearOptions = ['2024', '2023', '2022', '2021', '2020']
const statusOptions = [
  { value: 1, label: '进行中' },
  { value: 2, label: '已完成' },
  { value: 3, label: '已暂停' },
  { value: 4, label: '已取消' }
]
const phaseOptions = [
  { value: 1, label: '立项阶段' },
  { value: 2, label: '实施阶段' },
  { value: 3, label: '验收阶段' },
  { value: 4, label: '完成阶段' }
]
const importantOptions = [
  { value: 1, label: '一般' },
  { value: 2, label: '重要' },
  { value: 3, label: '非常重要' }
]
const segmentOptions = [
  { value: 1, label: '智慧建筑' },
  { value: 2, label: '市政工程' },
  { value: 3, label: '交通工程' },
  { value: 4, label: '水利工程' }
]
const instanceStatusOptions = [
  { value: 1, label: '未启动' },
  { value: 2, label: '进行中' },
  { value: 3, label: '已完成' },
  { value: 4, label: '已终止' }
]

const areaOptions = [
  {
    value: 'BJ',
    label: '北京市',
    children: [
      { value: '110100', label: '北京市' }
    ]
  },
  {
    value: 'SH',
    label: '上海市',
    children: [
      { value: '310100', label: '上海市' }
    ]
  },
  {
    value: 'GD',
    label: '广东省',
    children: [
      { value: '440100', label: '广州市' },
      { value: '440300', label: '深圳市' }
    ]
  }
]

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
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入项目编码', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  year: [
    { required: true, message: '请选择年度', trigger: 'change' }
  ],
  areaCode: [
    { required: true, message: '请选择区域', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  phase: [
    { required: true, message: '请选择阶段', trigger: 'change' }
  ],
  important: [
    { required: true, message: '请选择重要程度', trigger: 'change' }
  ],
  segment: [
    { required: true, message: '请选择业务板块', trigger: 'change' }
  ]
}

// 区域选择变化
const handleAreaChange = (value) => {
  if (value && value.length === 2) {
    const [areaCode, cityCode] = value
    formData.areaCode = areaCode
    formData.cityCode = cityCode
    
    // 查找对应的区域名称
    const area = areaOptions.find(item => item.value === areaCode)
    if (area) {
      formData.area = area.label
      formData.provinceCode = area.children[0]?.value || ''
    }
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: '',
    moduleId: '',
    name: '',
    code: '',
    year: '',
    areaCode: '',
    area: '',
    provinceCode: '',
    cityCode: '',
    status: 1,
    statusName: '',
    phase: 1,
    phaseName: '',
    important: 1,
    importantName: '',
    segment: 1,
    segmentName: '',
    contractor: '',
    coId: '',
    coName: '',
    coTin: '',
    coMemberId: '',
    coMemberName: '',
    coMemberTel: '',
    assignId: '',
    assignName: '',
    instanceStatus: 2,
    instanceStatusName: '',
    deptId: '',
    deptName: '',
    reporterId: '',
    reporterName: '',
    reporterDeptId: '',
    reviewBool: false
  })
  
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 填充表单数据
const fillFormData = (data) => {
  if (data) {
    Object.assign(formData, data)
    
    // 设置区域选择器值
    if (data.areaCode && data.cityCode) {
      formData.areaCode = [data.areaCode, data.cityCode]
    }
    
    // 根据数值设置对应的名称
    formData.statusName = statusOptions.find(item => item.value === formData.status)?.label || ''
    formData.phaseName = phaseOptions.find(item => item.value === formData.phase)?.label || ''
    formData.importantName = importantOptions.find(item => item.value === formData.important)?.label || ''
    formData.segmentName = segmentOptions.find(item => item.value === formData.segment)?.label || ''
    formData.instanceStatusName = instanceStatusOptions.find(item => item.value === formData.instanceStatus)?.label || ''
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    submitLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新名称字段
    formData.statusName = statusOptions.find(item => item.value === formData.status)?.label || ''
    formData.phaseName = phaseOptions.find(item => item.value === formData.phase)?.label || ''
    formData.importantName = importantOptions.find(item => item.value === formData.important)?.label || ''
    formData.segmentName = segmentOptions.find(item => item.value === formData.segment)?.label || ''
    formData.instanceStatusName = instanceStatusOptions.find(item => item.value === formData.instanceStatus)?.label || ''
    
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
    fillFormData(newData)
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