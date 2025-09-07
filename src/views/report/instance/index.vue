<template>
  <div class="report-instance">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button :icon="ArrowLeft" @click="handleBack" style="margin-right: 12px">
              返回
            </el-button>
            <span class="title">报表实例管理 - {{ configInfo.name }}</span>
          </div>
          <el-button type="primary" :icon="Plus" @click="handleAddInstance">
            新增实例
          </el-button>
        </div>
      </template>

      <!-- 配置信息展示 -->
      <el-descriptions :column="3" border class="config-info">
        <el-descriptions-item label="配置名称">{{ configInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="报表类型">
          <el-tag
            :type="configInfo.type === 1 ? 'success' : configInfo.type === 2 ? 'primary' : 'warning'"
          >
            {{ configInfo.type === 1 ? '日报' : configInfo.type === 2 ? '周报' : '月报' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ configInfo.createTime }}</el-descriptions-item>
        <el-descriptions-item label="统计维度">
          <el-tag
            v-for="dim in configInfo.dimensions"
            :key="dim"
            size="small"
            type="info"
            style="margin-right: 4px"
          >
            {{ getDimensionLabel(dim) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="维度值" :span="2">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div
              v-for="dim in configInfo.dimensions"
              :key="dim"
              style="font-size: 12px; line-height: 1.4;"
            >
              <span style="color: #909399; margin-right: 4px;">
                {{ getDimensionLabel(dim) }}:
              </span>
              <span style="color: #606266;">
                {{ formatDimensionValues(configInfo.dimensionValues[dim]) }}
              </span>
            </div>
          </div>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 实例列表 -->
      <el-table v-loading="loading" :data="instanceData" border style="width: 100%; margin-top: 20px">
        <el-table-column prop="name" label="实例名称" min-width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'running' ? 'success' : 'danger'">
              {{ row.status === 'running' ? '运行中' : '已停止' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastRunTime" label="最后运行时间" width="160" />
        <el-table-column prop="nextRunTime" label="下次运行时间" width="160" />
        <el-table-column prop="runCount" label="运行次数" width="80" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              :type="row.status === 'running' ? 'danger' : 'success'"
              :icon="row.status === 'running' ? Close : VideoPlay"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'running' ? '停止' : '启动' }}
            </el-button>
            <el-button type="primary" link :icon="Edit" size="small" @click="handleEditInstance(row)">
              编辑
            </el-button>
            <el-button type="danger" link :icon="Delete" size="small" @click="handleDeleteInstance(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 编辑实例抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="drawerMode === 'add' ? '新增实例' : '编辑实例'"
      size="40%"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="instanceForm"
        :rules="formRules"
        label-width="100px"
        style="padding: 20px"
      >
        <el-form-item label="实例名称" prop="name">
          <el-input v-model="instanceForm.name" placeholder="请输入实例名称" />
        </el-form-item>
        <el-form-item label="运行周期" prop="cron">
          <el-input v-model="instanceForm.cron" placeholder="例如：0 0 9 * * ?" />
          <div style="color: #909399; font-size: 12px; margin-top: 4px;">
            每日9点运行：0 0 9 * * ?<br>
            每周一9点运行：0 0 9 ? * MON<br>
            每月1日9点运行：0 0 9 1 * ?
          </div>
        </el-form-item>
        <el-form-item label="通知邮箱" prop="email">
          <el-input v-model="instanceForm.email" placeholder="请输入通知邮箱，多个用逗号分隔" />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="instanceForm.enabled" active-text="启用" inactive-text="禁用" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="instanceForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div style="padding: 20px; text-align: right;">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmitInstance">
            确定
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, VideoPlay, Close, ArrowLeft } from '@element-plus/icons-vue'

// 路由相关
const route = useRoute()
const router = useRouter()
const configId = ref(route.params.configId || route.query.configId)

// 配置信息
const configInfo = ref({
  name: '',
  type: '',
  dimensions: [],
  dimensionValues: {},
  createTime: ''
})

// 实例数据
const loading = ref(false)
const instanceData = ref([])

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 编辑抽屉
const drawerVisible = ref(false)
const drawerMode = ref('add')
const submitting = ref(false)
const formRef = ref()

// 表单数据
const instanceForm = reactive({
  id: null,
  name: '',
  cron: '',
  email: '',
  enabled: true,
  remark: ''
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入实例名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  cron: [
    { required: true, message: '请输入运行周期', trigger: 'blur' },
    { pattern: /^(\d+|\*|\?|\/)+$/, message: '请输入有效的cron表达式', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入通知邮箱', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入通知邮箱'))
        } else {
          const emails = value.split(',').map(e => e.trim())
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          const invalidEmails = emails.filter(e => !emailRegex.test(e))
          if (invalidEmails.length > 0) {
            callback(new Error(`邮箱格式不正确：${invalidEmails.join(', ')}`))
          } else {
            callback()
          }
        }
      },
      trigger: 'blur'
    }
  ]
}

// 统计维度选项
const dimensionOptions = [
  { value: 'institute', label: '所' },
  { value: 'product_line', label: '产品线' },
  { value: 'product_branch', label: '产品支线' },
  { value: 'project', label: '项目' },
  { value: 'module', label: '模块' },
  { value: 'person', label: '人员' }
]

// 获取维度标签
const getDimensionLabel = (value) => {
  const option = dimensionOptions.find(item => item.value === value)
  return option ? option.label : value
}

// 格式化维度值显示
const formatDimensionValues = (values) => {
  if (!values || values.length === 0) return '-'
  return values.join('、')
}

// 返回
const handleBack = () => {
  router.push('/report/config')
}

// 加载配置信息
const loadConfigInfo = async () => {
  try {
    // 模拟获取配置信息
    const mockConfigs = {
      1: {
        name: '产品线A日报配置',
        type: 1,
        dimensions: ['product_line'],
        dimensionValues: {
          product_line: ['产品线A']
        },
        createTime: '2024-01-15 10:00:00'
      },
      2: {
        name: '产品支线X月报配置',
        type: 3,
        dimensions: ['product_branch'],
        dimensionValues: {
          product_branch: ['产品支线X']
        },
        createTime: '2024-01-10 09:30:00'
      },
      3: {
        name: '张三日报配置',
        type: 1,
        dimensions: ['person'],
        dimensionValues: {
          person: ['张三']
        },
        createTime: '2024-01-12 11:00:00'
      }
    }

    configInfo.value = mockConfigs[configId.value] || mockConfigs[1]
  } catch (error) {
    ElMessage.error('获取配置信息失败')
  }
}

// 加载实例数据
const loadInstanceData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    const mockInstances = [
      {
        id: 1,
        name: `${configInfo.value.name}-实例1`,
        status: 'running',
        lastRunTime: '2024-01-15 09:00:00',
        nextRunTime: '2024-01-16 09:00:00',
        runCount: 15,
        createTime: '2024-01-01 10:00:00',
        cron: '0 0 9 * * ?',
        email: 'admin@example.com',
        enabled: true,
        remark: '每日9点自动生成报表'
      },
      {
        id: 2,
        name: `${configInfo.value.name}-实例2`,
        status: 'stopped',
        lastRunTime: '2024-01-14 09:00:00',
        nextRunTime: '-',
        runCount: 10,
        createTime: '2024-01-05 14:30:00',
        cron: '0 0 10 * * ?',
        email: 'manager@example.com',
        enabled: false,
        remark: '测试实例，已暂停'
      },
      {
        id: 3,
        name: `${configInfo.value.name}-实例3`,
        status: 'running',
        lastRunTime: '2024-01-15 08:30:00',
        nextRunTime: '2024-01-16 08:30:00',
        runCount: 20,
        createTime: '2023-12-20 09:15:00',
        cron: '0 30 8 * * ?',
        email: 'team@example.com',
        enabled: true,
        remark: '每日8:30生成报表'
      }
    ]

    instanceData.value = mockInstances.slice(
      (pagination.current - 1) * pagination.size,
      pagination.current * pagination.size
    )
    pagination.total = mockInstances.length
  } catch (error) {
    ElMessage.error('加载实例数据失败')
  } finally {
    loading.value = false
  }
}

// 新增实例
const handleAddInstance = () => {
  drawerMode.value = 'add'
  Object.assign(instanceForm, {
    id: null,
    name: '',
    cron: '0 0 9 * * ?',
    email: '',
    enabled: true,
    remark: ''
  })
  drawerVisible.value = true
}

// 编辑实例
const handleEditInstance = (row) => {
  drawerMode.value = 'edit'
  Object.assign(instanceForm, {
    id: row.id,
    name: row.name,
    cron: row.cron,
    email: row.email,
    enabled: row.enabled,
    remark: row.remark
  })
  drawerVisible.value = true
}

// 删除实例
const handleDeleteInstance = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除实例 "${row.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 模拟删除API
    await new Promise(resolve => setTimeout(resolve, 300))
    ElMessage.success('删除成功')
    loadInstanceData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 切换实例状态
const handleToggleStatus = async (row) => {
  const action = row.status === 'running' ? '停止' : '启动'
  try {
    await ElMessageBox.confirm(
      `确定要${action}实例 "${row.name}" 吗？`,
      `${action}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 模拟状态切换API
    await new Promise(resolve => setTimeout(resolve, 300))
    row.status = row.status === 'running' ? 'stopped' : 'running'
    ElMessage.success(`${action}成功`)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失败`)
    }
  }
}

// 提交实例表单
const handleSubmitInstance = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    if (drawerMode.value === 'add') {
      ElMessage.success('新增实例成功')
    } else {
      ElMessage.success('更新实例成功')
    }

    drawerVisible.value = false
    loadInstanceData()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitting.value = false
  }
}

// 分页变化
const handleSizeChange = (size) => {
  pagination.size = size
  loadInstanceData()
}

const handleCurrentChange = (current) => {
  pagination.current = current
  loadInstanceData()
}

onMounted(() => {
  loadConfigInfo()
  loadInstanceData()
})
</script>

<style scoped>
.report-instance {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.config-info {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-descriptions__label) {
  font-weight: bold;
}
</style>