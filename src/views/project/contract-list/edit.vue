<template>
  <el-drawer
    v-model="visible"
    :title="isEdit ? '编辑项目' : '新增项目'"
    :size="size"
    :before-close="handleClose"
    destroy-on-close
  >
    <div class="drawer-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="project-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="组织机构" prop="org">
              <el-input v-model="formData.org" placeholder="请输入组织机构" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="管理编号" prop="manageNo">
              <el-input v-model="formData.manageNo" placeholder="请输入管理编号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目编号" prop="projectNo">
              <el-input v-model="formData.projectNo" placeholder="请输入项目编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入项目名称" maxlength="400" show-word-limit />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目分类" prop="projectCategoryCode">
              <el-select v-model="formData.projectCategoryCode" placeholder="请选择项目分类">
                <el-option label="电商平台" value="ECOMMERCE" />
                <el-option label="移动应用" value="MOBILE" />
                <el-option label="数据分析" value="DATA" />
                <el-option label="系统集成" value="SYSTEM" />
                <el-option label="其他" value="OTHER" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单编号" prop="orderCode">
              <el-input v-model="formData.orderCode" placeholder="请输入订单编号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="子编号" prop="subCode">
              <el-input v-model="formData.subCode" placeholder="请输入子编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="业务类型" prop="businessType">
              <el-select v-model="formData.businessType" placeholder="请选择业务类型">
                <el-option label="软件开发" value="软件开发" />
                <el-option label="移动应用" value="移动应用" />
                <el-option label="数据分析" value="数据分析" />
                <el-option label="系统集成" value="系统集成" />
                <el-option label="咨询服务" value="咨询服务" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目级别" prop="level">
              <el-select v-model="formData.level" placeholder="请选择项目级别">
                <el-option label="高优先级" value="high" />
                <el-option label="中优先级" value="medium" />
                <el-option label="低优先级" value="low" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目来源" prop="source">
              <el-select v-model="formData.source" placeholder="请选择项目来源">
                <el-option label="内部需求" value="内部需求" />
                <el-option label="客户需求" value="客户需求" />
                <el-option label="战略规划" value="战略规划" />
                <el-option label="市场机会" value="市场机会" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目角色" prop="role">
              <el-select v-model="formData.role" placeholder="请选择项目角色">
                <el-option label="主开发商" value="主开发商" />
                <el-option label="承包商" value="承包商" />
                <el-option label="咨询方" value="咨询方" />
                <el-option label="监理方" value="监理方" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入联系电话" maxlength="20" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker
                v-model="formData.startDate"
                type="date"
                placeholder="选择开始日期"
                style="width: 100%"
                :disabled-date="disabledStartDate"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期" prop="endDate">
              <el-date-picker
                v-model="formData.endDate"
                type="date"
                placeholder="选择结束日期"
                style="width: 100%"
                :disabled-date="disabledEndDate"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="专业方向" prop="major">
              <el-select v-model="formData.major" placeholder="请选择专业方向">
                <el-option label="全栈开发" value="全栈开发" />
                <el-option label="前端开发" value="前端开发" />
                <el-option label="后端开发" value="后端开发" />
                <el-option label="移动端开发" value="移动端开发" />
                <el-option label="大数据" value="大数据" />
                <el-option label="人工智能" value="人工智能" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="班级类型" prop="classType">
              <el-select v-model="formData.classType" placeholder="请选择班级类型">
                <el-option label="企业级" value="企业级" />
                <el-option label="消费级" value="消费级" />
                <el-option label="教育级" value="教育级" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="资金计划" prop="fundPlan">
              <el-input-number
                v-model="formData.fundPlan"
                :min="0"
                :precision="2"
                :step="1000"
                style="width: 100%"
              >
                <template #append>元</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="班级级别" prop="classLevel">
              <el-select v-model="formData.classLevel" placeholder="请选择班级级别">
                <el-option label="一级" :value="1" />
                <el-option label="二级" :value="2" />
                <el-option label="三级" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="其他业务" prop="otherBusinessType">
              <el-select v-model="formData.otherBusinessType" placeholder="请选择">
                <el-option label="类型1" :value="1" />
                <el-option label="类型2" :value="2" />
                <el-option label="类型3" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合同评审">
              <el-switch
                v-model="formData.hasContractReview"
                active-text="是"
                inactive-text="否"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目ID" prop="projectId">
              <el-input v-model="formData.projectId" placeholder="请输入项目ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="父项目ID" prop="parentId">
              <el-input v-model="formData.parentId" placeholder="请输入父项目ID" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入项目详细描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <!-- 底部操作按钮 -->
      <div class="drawer-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  projectData: {
    type: Object,
    default: null
  },
  size: {
    type: [String, Number],
    default: '50%'
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

// 表单相关
const formRef = ref(null)
const submitLoading = ref(false)

// 表单数据 - 使用小写首字母字段
const formData = ref({
  createTime: '',
  related: 0,
  org: '',
  manageNo: '',
  projectNo: '',
  name: '',
  projectCategoryCode: '',
  orderCode: '',
  subCode: '',
  businessType: '',
  level: 'medium',
  source: '',
  role: '',
  startDate: '',
  endDate: '',
  phone: '',
  major: '',
  classType: '',
  fundPlan: 0.00,
  classLevel: 1,
  otherBusinessType: 1,
  hasContractReview: false,
  projectId: '',
  parentId: '',
  isDelete: false
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { max: 400, message: '长度不能超过400个字符', trigger: 'blur' }
  ],
  projectNo: [
    { required: true, message: '请输入项目编号', trigger: 'blur' },
    { max: 200, message: '长度不能超过200个字符', trigger: 'blur' }
  ],
  manageNo: [
    { required: true, message: '请输入管理编号', trigger: 'blur' },
    { max: 200, message: '长度不能超过200个字符', trigger: 'blur' }
  ],
  org: [
    { required: true, message: '请输入组织机构', trigger: 'blur' },
    { max: 300, message: '长度不能超过300个字符', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择结束日期', trigger: 'change' }
  ],
  phone: [
    { max: 20, message: '电话号码不能超过20位', trigger: 'blur' }
  ],
  fundPlan: [
    { type: 'number', min: 0, message: '资金计划不能为负数', trigger: 'blur' }
  ]
}

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.projectData)

// 日期禁用函数
const disabledStartDate = (time) => {
  if (formData.value.endDate) {
    return time.getTime() > new Date(formData.value.endDate).getTime()
  }
  return false
}

const disabledEndDate = (time) => {
  if (formData.value.startDate) {
    return time.getTime() < new Date(formData.value.startDate).getTime()
  }
  return false
}

// 方法
const resetForm = () => {
  formData.value = {
    createTime: '',
    related: 0,
    org: '',
    manageNo: '',
    projectNo: '',
    name: '',
    projectCategoryCode: '',
    orderCode: '',
    subCode: '',
    businessType: '',
    level: 'medium',
    source: '',
    role: '',
    startDate: '',
    endDate: '',
    phone: '',
    major: '',
    classType: '',
    fundPlan: 0.00,
    classLevel: 1,
    otherBusinessType: 1,
    hasContractReview: false,
    projectId: '',
    parentId: '',
    isDelete: false
  }
}

const loadProjectData = () => {
  if (props.projectData) {
    formData.value = { ...props.projectData }
  } else {
    resetForm()
  }
}

const handleClose = (done) => {
  formRef.value?.resetFields()
  done()
}

const handleCancel = () => {
  visible.value = false
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 设置创建时间
    if (!isEdit.value) {
      formData.value.createTime = new Date().toLocaleString()
    }
    
    const projectData = {
      ...formData.value,
      isDelete: false
    }
    
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    emit('success', projectData)
    visible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitLoading.value = false
  }
}

// 监听
watch(() => props.projectData, loadProjectData, { immediate: true })
watch(() => props.modelValue, (val) => {
  if (val) {
    nextTick(() => {
      formRef.value?.clearValidate()
    })
  }
})
</script>

<style scoped>
.drawer-content {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.project-form {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

:deep(.el-drawer__body) {
  padding: 0;
}

:deep(.el-form-item__label) {
  font-weight: 600;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}
</style>