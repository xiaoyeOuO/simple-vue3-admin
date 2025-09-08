<template>
  <el-drawer v-model="visible" :title="title" :size="500" :before-close="handleClose" destroy-on-close>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="edit-form">
      <el-form-item label="配置名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入配置名称" maxlength="50" show-word-limit />
      </el-form-item>

      <el-form-item label="报表类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :value="1">日报</el-radio>
            <el-radio :value="2">周报</el-radio>
            <el-radio :value="3">月报</el-radio>
          </el-radio-group>
        </el-form-item>

      <el-form-item label="统计维度" prop="dimensions">
        <el-select v-model="form.institute" placeholder="请选择所" style="width: 100%" multiple filterable>
          <el-option label="一所 - 总部" value="一所" />
          <el-option label="二所 - 研发中心" value="二所" />
          <el-option label="三所 - 创新中心" value="三所" />
          <el-option label="四所 - 支撑中心" value="四所" />
        </el-select>
      </el-form-item>

      <el-form-item label="产品线" prop="productLine">
        <el-select v-model="form.productLine" placeholder="请选择产品线" style="width: 100%" multiple filterable>
          <el-option label="产品线A - 核心业务" value="产品线A" />
          <el-option label="产品线B - 创新业务" value="产品线B" />
          <el-option label="产品线C - 支撑业务" value="产品线C" />
          <el-option label="产品线D - 新兴业务" value="产品线D" />
        </el-select>
      </el-form-item>

      <el-form-item label="产品支线" prop="productBranch">
        <el-select v-model="form.productBranch" placeholder="请选择产品支线" style="width: 100%" multiple filterable>
          <el-option label="支线1 - 移动端" value="支线1" />
          <el-option label="支线2 - Web端" value="支线2" />
          <el-option label="支线3 - 服务端" value="支线3" />
          <el-option label="支线4 - 数据端" value="支线4" />
        </el-select>
      </el-form-item>

      <el-form-item label="项目" prop="project">
        <el-select v-model="form.project" placeholder="请选择项目" style="width: 100%" multiple filterable>
          <el-option label="项目A - 核心项目" value="项目A" />
          <el-option label="项目B - 创新项目" value="项目B" />
          <el-option label="项目C - 支撑项目" value="项目C" />
          <el-option label="项目D - 试点项目" value="项目D" />
        </el-select>
      </el-form-item>

      <el-form-item label="模块" prop="module">
        <el-select v-model="form.module" placeholder="请选择模块" style="width: 100%" multiple filterable>
          <el-option label="用户模块 - 核心功能" value="用户模块" />
          <el-option label="订单模块 - 业务功能" value="订单模块" />
          <el-option label="支付模块 - 核心功能" value="支付模块" />
          <el-option label="报表模块 - 分析功能" value="报表模块" />
        </el-select>
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入配置描述信息" maxlength="200"
          show-word-limit />
      </el-form-item>

      <el-form-item label="统计字段" prop="customFields">
        <div class="custom-fields-container">
          <div class="fields-input-group">
            <el-input
              v-model="newField"
              placeholder="输入统计字段名称后按回车添加"
              style="width: 200px"
              @keyup.enter="addCustomField"
              clearable
            />
            <el-button type="primary" @click="addCustomField" style="margin-left: 10px">
              <el-icon><Plus /></el-icon>
              添加字段
            </el-button>
          </div>
          
          <div class="fields-help-text">
            <el-text type="info" size="small">
              💡 提示：您可以输入任意自定义的统计字段，也可以点击下方快速添加预设字段
            </el-text>
          </div>

          <div class="preset-fields">
            <el-text size="small" style="margin-right: 10px">快速添加：</el-text>
            <el-tag
              v-for="preset in presetFields"
              :key="preset"
              type="info"
              effect="plain"
              style="cursor: pointer; margin-right: 8px"
              @click="addPresetField(preset)"
            >
              {{ preset }}
            </el-tag>
          </div>

          <div v-if="form.customFields.length > 0" class="selected-fields">
            <el-divider content-position="left">已添加的统计字段</el-divider>
            <el-tag
              v-for="(field, index) in form.customFields"
              :key="index"
              closable
              type="primary"
              @close="removeCustomField(index)"
            >
              {{ field }}
            </el-tag>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="通知方式" prop="notifyType">
        <el-select v-model="form.notifyType" placeholder="请选择通知方式" style="width: 100%" multiple>
          <el-option label="邮件" value="email" />
          <el-option label="企业微信" value="wechat" />
          <el-option label="钉钉" value="dingtalk" />
        </el-select>
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
  }
})

const emit = defineEmits(['update:visible', 'success'])

// 表单引用
const formRef = ref()

// 表单数据
const form = ref({
  name: '',
  type: 1,
  institute: [],
  productLine: [],
  productBranch: [],
  project: [],
  module: [],
  description: '',
  customFields: ['工作时长', '任务数量'],
  notifyType: ['email']
})

// 新字段输入
const newField = ref('')

// 预设字段
const presetFields = ['工作时长', '任务数量', '缺陷数量', '完成率', '加班时长', '代码行数', '测试覆盖率']

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入配置名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择报表类型', trigger: 'change' }
  ],
  institute: [
    { type: 'array', required: true, message: '请至少选择一个所', trigger: 'change' }
  ],
  description: [
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ],
  customFields: [
    { type: 'array', required: true, message: '请至少输入一个统计字段', trigger: 'change' }
  ],
  notifyType: [
    { type: 'array', required: true, message: '请至少选择一种通知方式', trigger: 'change' }
  ]
}

// 提交状态
const submitting = ref(false)

// 标题
const title = computed(() => {
  return props.mode === 'add' ? '新增日报月报配置' : '编辑日报月报配置'
})

// 可见性
const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})



// 重置表单
const resetForm = () => {
  form.value = {
    name: '',
    type: 'daily',
    institute: [],
    productLine: [],
    productBranch: [],
    project: [],
    module: [],
    description: '',
    customFields: ['工作时长', '任务数量'],
    notifyType: ['email']
  }
}

// 监听数据变化
watch(() => props.data, (newData) => {
  if (newData && props.mode === 'edit') {
    nextTick(() => {
      form.value = {
        name: newData.name || '',
        type: newData.type || 1,
        institute: newData.institute || [],
        productLine: newData.productLine || [],
        productBranch: newData.productBranch || [],
        project: newData.project || [],
        module: newData.module || [],
        description: newData.description || '',
        customFields: newData.customFields || ['工作时长', '任务数量'],
        notifyType: newData.notifyType || ['email']
      }
    })
  } else if (props.mode === 'add') {
    resetForm()
  }
}, { immediate: true })



// 添加自定义字段
const addCustomField = () => {
  const field = newField.value.trim()
  if (field && !form.value.customFields.includes(field)) {
    form.value.customFields.push(field)
    newField.value = ''
  }
}

// 添加预设字段
const addPresetField = (preset) => {
  if (!form.value.customFields.includes(preset)) {
    form.value.customFields.push(preset)
  }
}

// 移除自定义字段
const removeCustomField = (index) => {
  form.value.customFields.splice(index, 1)
}

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
    emit('success')
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
.edit-form {
  padding: 0 20px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 10px 20px;
  border-top: 1px solid #eee;
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.custom-fields-container {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  background-color: #fafafa;
}

.fields-input-group {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.fields-help-text {
  margin-bottom: 12px;
}

.preset-fields {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.selected-fields {
  margin-top: 16px;
}

.selected-fields .el-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>