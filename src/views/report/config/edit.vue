<template>
  <el-drawer
    v-model="visible"
    :title="title"
    :size="500"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="edit-form"
    >
      <el-form-item label="配置名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入配置名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="报表类型" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio value="daily">日报</el-radio>
          <el-radio value="weekly">周报</el-radio>
          <el-radio value="monthly">月报</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="统计维度" prop="dimensions">
        <el-select
          v-model="form.dimensions"
          placeholder="请选择统计维度"
          style="width: 100%"
          multiple
          collapse-tags
          collapse-tags-tooltip
          @change="handleDimensionsChange"
        >
          <el-option
            v-for="item in dimensionOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <!-- 动态维度值选择器 -->
      <div v-if="form.dimensions.length > 0" class="dimension-values-container">
        <el-divider content-position="left">维度值配置</el-divider>
        
        <div
          v-for="dimension in form.dimensions"
          :key="dimension"
          class="dimension-value-item"
        >
          <el-form-item :label="getDimensionLabel(dimension)" class="dimension-label">
            <el-select
              v-model="form.dimensionValues[dimension]"
              :placeholder="`请选择${getDimensionLabel(dimension)}的值`"
              style="width: 100%"
              multiple
              filterable
              :loading="loadingDimensionValues[dimension]"
            >
              <el-option
                v-for="item in dimensionValueOptions[dimension]"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <!-- 已选择的维度值表格展示 -->
          <div v-if="form.dimensionValues[dimension] && form.dimensionValues[dimension].length > 0" class="selected-values-table">
            <el-table
              :data="getSelectedDimensionData(dimension)"
              border
              style="width: 100%"
              size="small"
            >
              <el-table-column label="序号" width="60" type="index" />
              <el-table-column label="维度值名称" prop="label" />
              <el-table-column label="维度值编码" prop="value" />
              <el-table-column label="操作" width="80" align="center">
                <template #default="{ row }">
                  <el-button
                    type="danger"
                    link
                    size="small"
                    @click="removeDimensionValue(dimension, row.value)"
                  >
                    移除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="请输入配置描述信息"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="统计字段" prop="fields">
        <el-checkbox-group v-model="form.fields">
          <el-checkbox value="work_hours">工作时长</el-checkbox>
          <el-checkbox value="task_count">任务数量</el-checkbox>
          <el-checkbox value="bug_count">缺陷数量</el-checkbox>
          <el-checkbox value="completion_rate">完成率</el-checkbox>
          <el-checkbox value="overtime_hours">加班时长</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="通知方式" prop="notifyType">
        <el-select
          v-model="form.notifyType"
          placeholder="请选择通知方式"
          style="width: 100%"
          multiple
        >
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
  },
  dimensionOptions: {
    type: Array,
    default: () => [
      { value: 'institute', label: '所' },
      { value: 'product_line', label: '产品线' },
      { value: 'product_branch', label: '产品支线' },
      { value: 'project', label: '项目' },
      { value: 'module', label: '模块' }
    ]
  }
})

const emit = defineEmits(['update:visible', 'success'])

// 表单引用
const formRef = ref()

// 表单数据
const form = ref({
  name: '',
  type: 'daily',
  dimensions: [],
  dimensionValues: {},
  description: '',
  fields: ['work_hours', 'task_count'],
  notifyType: ['email']
})

// 维度值选项
const dimensionValueOptions = ref({})
const loadingDimensionValues = ref({})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入配置名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择报表类型', trigger: 'change' }
  ],
  dimensions: [
    { type: 'array', required: true, message: '请至少选择一个统计维度', trigger: 'change' }
  ],
  description: [
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ],
  fields: [
    { type: 'array', required: true, message: '请至少选择一个统计字段', trigger: 'change' }
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

// 获取维度标签
const getDimensionLabel = (value) => {
  const option = props.dimensionOptions.find(item => item.value === value)
  return option ? option.label : value
}

// 获取维度值标签
const getDimensionValueLabel = (dimension, value) => {
  const options = dimensionValueOptions.value[dimension] || []
  const option = options.find(item => item.value === value)
  return option ? option.label : value
}

// 获取已选维度值的表格数据
const getSelectedDimensionData = (dimension) => {
  const selectedValues = form.value.dimensionValues[dimension] || []
  const options = dimensionValueOptions.value[dimension] || []
  
  return selectedValues.map(value => {
    const option = options.find(item => item.value === value)
    return {
      value: value,
      label: option ? option.label : value
    }
  })
}

// 移除维度值
const removeDimensionValue = (dimension, value) => {
  const values = form.value.dimensionValues[dimension] || []
  const index = values.indexOf(value)
  if (index > -1) {
    values.splice(index, 1)
  }
}

// 重置表单
const resetForm = () => {
  form.value = {
    name: '',
    type: 'daily',
    dimensions: [],
    dimensionValues: {},
    description: '',
    fields: ['work_hours', 'task_count'],
    notifyType: ['email']
  }
  dimensionValueOptions.value = {}
  loadingDimensionValues.value = {}
}

// 监听数据变化
watch(() => props.data, (newData) => {
  if (newData && props.mode === 'edit') {
    nextTick(() => {
      form.value = {
        name: newData.name || '',
        type: newData.type || 'daily',
        dimensions: newData.dimensions || [],
        dimensionValues: newData.dimensionValues || {},
        description: newData.description || '',
        fields: newData.fields || ['work_hours', 'task_count'],
        notifyType: newData.notifyType || ['email']
      }
      // 加载所有已选维度的值
      if (newData.dimensions && newData.dimensions.length > 0) {
        newData.dimensions.forEach(dimension => {
          loadDimensionValues(dimension)
        })
      }
    })
  } else if (props.mode === 'add') {
    resetForm()
  }
}, { immediate: true })

// 监听维度变化
const handleDimensionsChange = (newDimensions) => {
  // 清理已移除维度的数据
  Object.keys(form.value.dimensionValues).forEach(key => {
    if (!newDimensions.includes(key)) {
      delete form.value.dimensionValues[key]
      delete dimensionValueOptions.value[key]
      delete loadingDimensionValues.value[key]
    }
  })
  
  // 加载新维度的值
  newDimensions.forEach(dimension => {
    if (!dimensionValueOptions.value[dimension]) {
      loadDimensionValues(dimension)
    }
  })
}

// 加载维度值
const loadDimensionValues = async (dimension) => {
  loadingDimensionValues.value[dimension] = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 根据维度类型返回不同的选项
    const mockData = {
      institute: [
        { value: '一所', label: '一所 - 总部' },
        { value: '二所', label: '二所 - 研发中心' },
        { value: '三所', label: '三所 - 创新中心' },
        { value: '四所', label: '四所 - 支撑中心' }
      ],
      product_line: [
        { value: '产品线A', label: '产品线A - 核心业务' },
        { value: '产品线B', label: '产品线B - 创新业务' },
        { value: '产品线C', label: '产品线C - 支撑业务' },
        { value: '产品线D', label: '产品线D - 新兴业务' }
      ],
      product_branch: [
        { value: '支线1', label: '支线1 - 移动端' },
        { value: '支线2', label: '支线2 - Web端' },
        { value: '支线3', label: '支线3 - 服务端' },
        { value: '支线4', label: '支线4 - 数据端' }
      ],
      project: [
        { value: '项目A', label: '项目A - 核心项目' },
        { value: '项目B', label: '项目B - 创新项目' },
        { value: '项目C', label: '项目C - 支撑项目' },
        { value: '项目D', label: '项目D - 试点项目' }
      ],
      module: [
        { value: '用户模块', label: '用户模块 - 核心功能' },
        { value: '订单模块', label: '订单模块 - 业务功能' },
        { value: '支付模块', label: '支付模块 - 核心功能' },
        { value: '报表模块', label: '报表模块 - 分析功能' }
      ]
    }
    
    dimensionValueOptions.value[dimension] = mockData[dimension] || []
  } catch (error) {
    ElMessage.error('加载维度值失败')
  } finally {
    loadingDimensionValues.value[dimension] = false
  }
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

.dimension-values-container {
  margin: 20px 0;
}

.dimension-value-item {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 6px;
}

.dimension-label {
  margin-bottom: 10px;
}

.dimension-label :deep(.el-form-item__label) {
  font-weight: bold;
  color: #303133;
}

.selected-values-table {
  margin-top: 15px;
}

.selected-values-table :deep(.el-table) {
  border-radius: 4px;
}

.selected-values-table :deep(.el-table__header-wrapper th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
  height: 40px;
  padding: 8px 0;
}

.selected-values-table :deep(.el-table__body-wrapper td) {
  padding: 8px 0;
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

:deep(.el-divider__text) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: bold;
}
</style>