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
      <el-form-item label="所属客商" prop="coId">
        <el-select
          v-model="form.coId"
          placeholder="请选择所属客商"
          filterable
          clearable
          style="width: 100%"
          @change="handleSupplierChange"
        >
          <el-option
            v-for="item in supplierOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
            <span style="float: left">{{ item.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.code }}</span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="联系人姓名" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入联系人姓名"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="性别" prop="sex">
        <el-radio-group v-model="form.sex">
          <el-radio :value="1">男</el-radio>
          <el-radio :value="0">女</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="联系电话" prop="tel">
        <el-input
          v-model="form.tel"
          placeholder="请输入联系电话"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="职位" prop="position">
        <el-input
          v-model="form.position"
          placeholder="请输入职位"
          maxlength="50"
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
  },
  supplierOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible', 'success'])

// 表单引用
const formRef = ref()

// 表单数据
const form = ref({
  id: '',
  moduleId: '',
  coId: '',
  coCode: '',
  coName: '',
  name: '',
  sex: 1,
  tel: '',
  position: ''
})

// 表单验证规则
const rules = {
  coId: [
    { required: true, message: '请选择所属客商', trigger: 'change' }
  ],
  name: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  sex: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  tel: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$|^\d{3,4}-\d{7,8}$/, message: '请输入正确的电话号码', trigger: 'blur' }
  ],
  position: [
    { required: true, message: '请输入职位', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ]
}

// 提交状态
const submitting = ref(false)

// 标题
const title = computed(() => {
  return props.mode === 'add' ? '新增联系人' : '编辑联系人'
})

// 可见性
const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 处理客商变化
const handleSupplierChange = (supplierId) => {
  const supplier = props.supplierOptions.find(item => item.id === supplierId)
  if (supplier) {
    form.value.coCode = supplier.code
    form.value.coName = supplier.name
  } else {
    form.value.coCode = ''
    form.value.coName = ''
  }
}

// 重置表单
const resetForm = () => {
  form.value = {
    id: '',
    moduleId: '',
    coId: '',
    coCode: '',
    coName: '',
    name: '',
    sex: 1,
    tel: '',
    position: ''
  }
}

// 监听数据变化
watch(() => props.data, (newData) => {
  if (newData && props.mode === 'edit') {
    nextTick(() => {
      form.value = {
        id: newData.id || '',
        moduleId: newData.moduleId || '',
        coId: newData.coId || '',
        coCode: newData.coCode || '',
        coName: newData.coName || '',
        name: newData.name || '',
        sex: newData.sex !== undefined ? newData.sex : 1,
        tel: newData.tel || '',
        position: newData.position || ''
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