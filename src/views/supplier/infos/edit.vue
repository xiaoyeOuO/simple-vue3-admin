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
      label-width="100px"
      class="edit-form"
    >
      <el-form-item label="客商编码" prop="code">
        <el-input
          v-model="form.code"
          placeholder="请输入客商编码"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="客商名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入客商名称"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="税号" prop="tin">
        <el-input
          v-model="form.tin"
          placeholder="请输入统一社会信用代码/税号"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="联系电话" prop="tel">
        <el-input
          v-model="form.tel"
          placeholder="请输入联系电话"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="地区" prop="area">
        <el-cascader
          v-model="areaValue"
          :options="areaOptions"
          placeholder="请选择地区"
          style="width: 100%"
          @change="handleAreaChange"
        />
      </el-form-item>

      <el-form-item label="详细地址" prop="address">
        <el-input
          v-model="form.address"
          type="textarea"
          :rows="3"
          placeholder="请输入详细地址"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="法人姓名" prop="legalName">
        <el-input
          v-model="form.legalName"
          placeholder="请输入法人姓名"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="模块ID" prop="moduleId">
        <el-input
          v-model="form.moduleId"
          placeholder="请输入模块ID"
          maxlength="20"
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
  }
})

const emit = defineEmits(['update:visible', 'success'])

// 表单引用
const formRef = ref()

// 表单数据
const form = ref({
  id: '',
  moduleId: '',
  code: '',
  name: '',
  tin: '',
  tel: '',
  area: '',
  areaCode: '',
  address: '',
  legalName: ''
})

// 地区选择器
const areaValue = ref([])

// 地区选项（简化版）
const areaOptions = [
  {
    value: '北京市',
    label: '北京市',
    children: [
      { value: '东城区', label: '东城区' },
      { value: '西城区', label: '西城区' },
      { value: '朝阳区', label: '朝阳区' },
      { value: '海淀区', label: '海淀区' },
      { value: '丰台区', label: '丰台区' }
    ]
  },
  {
    value: '上海市',
    label: '上海市',
    children: [
      { value: '黄浦区', label: '黄浦区' },
      { value: '徐汇区', label: '徐汇区' },
      { value: '长宁区', label: '长宁区' },
      { value: '静安区', label: '静安区' },
      { value: '浦东新区', label: '浦东新区' }
    ]
  },
  {
    value: '广东省',
    label: '广东省',
    children: [
      {
        value: '广州市',
        label: '广州市',
        children: [
          { value: '天河区', label: '天河区' },
          { value: '越秀区', label: '越秀区' },
          { value: '荔湾区', label: '荔湾区' }
        ]
      },
      {
        value: '深圳市',
        label: '深圳市',
        children: [
          { value: '南山区', label: '南山区' },
          { value: '福田区', label: '福田区' },
          { value: '罗湖区', label: '罗湖区' }
        ]
      }
    ]
  }
]

// 表单验证规则
const rules = {
  code: [
    { required: true, message: '请输入客商编码', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入客商名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  tin: [
    { required: true, message: '请输入税号', trigger: 'blur' },
    { min: 15, max: 20, message: '税号长度应在15-20位', trigger: 'blur' }
  ],
  tel: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$|^\d{3,4}-\d{7,8}$/, message: '请输入正确的电话号码', trigger: 'blur' }
  ],
  area: [
    { required: true, message: '请选择地区', trigger: 'change' }
  ],
  address: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { min: 5, max: 200, message: '地址长度应在5-200个字符', trigger: 'blur' }
  ],
  legalName: [
    { required: true, message: '请输入法人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度应在2-20个字符', trigger: 'blur' }
  ]
}

// 提交状态
const submitting = ref(false)

// 标题
const title = computed(() => {
  return props.mode === 'add' ? '新增客商信息' : '编辑客商信息'
})

// 可见性
const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 处理地区变化
const handleAreaChange = (value) => {
  if (value && value.length > 0) {
    form.value.area = value[value.length - 1]
    form.value.areaCode = value.join('-')
  } else {
    form.value.area = ''
    form.value.areaCode = ''
  }
}

// 重置表单
const resetForm = () => {
  form.value = {
    id: '',
    moduleId: '',
    code: '',
    name: '',
    tin: '',
    tel: '',
    area: '',
    areaCode: '',
    address: '',
    legalName: ''
  }
  areaValue.value = []
}

// 监听数据变化
watch(() => props.data, (newData) => {
  if (newData && props.mode === 'edit') {
    nextTick(() => {
      form.value = {
        id: newData.id || '',
        moduleId: newData.moduleId || '',
        code: newData.code || '',
        name: newData.name || '',
        tin: newData.tin || '',
        tel: newData.tel || '',
        area: newData.area || '',
        areaCode: newData.areaCode || '',
        address: newData.address || '',
        legalName: newData.legalName || ''
      }
      
      // 设置地区选择器的值
      if (newData.areaCode) {
        const areaParts = newData.areaCode.split('-')
        areaValue.value = areaParts
      } else if (newData.area) {
        // 简化的地区匹配
        const areaMap = {
          '北京市': ['北京市'],
          '上海市': ['上海市'],
          '深圳市': ['广东省', '深圳市'],
          '广州市': ['广东省', '广州市']
        }
        areaValue.value = areaMap[newData.area] || [newData.area]
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
</style>