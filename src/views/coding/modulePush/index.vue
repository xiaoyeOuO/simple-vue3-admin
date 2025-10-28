<template>
  <div class="module-push-container">
    <div class="header">
      <div class="header-left">
        <h2>模块推送管理</h2>
        <el-select v-model="selectedProject" placeholder="请选择项目" style="width: 200px; margin-left: 20px" filterable
          clearable>
          <el-option v-for="project in projectList" :key="project.id" :label="project.name" :value="project.id">
            <div style="display: flex; justify-content: space-between">
              <span>{{ project.name }}</span>
              <el-tag size="small" :type="project.type === 'dev' ? 'success' : 'info'">
                {{ project.type === 'dev' ? '开发' : '生产' }}
              </el-tag>
            </div>
          </el-option>
        </el-select>
      </div>
      <el-button type="primary" :disabled="selectedModules.length === 0 || !selectedProject" @click="showPushDialog">
        <el-icon>
          <Promotion />
        </el-icon>
        推送选中模块
      </el-button>
    </div>

    <div class="table-container">
      <div v-if="!selectedProject" class="empty-state">
        <el-empty description="请先选择项目以查看模块列表" />
      </div>
      <vxe-table v-else ref="xTable" :data="tableData" :tree-config="{ children: 'children', expandAll: true }"
        :checkbox-config="{
          checkRowKeys: defaultChecked,
          checkStrictly: true,
          trigger: 'row',
          checkMethod: ({ row }) => !row.isPush
        }" border height="600" @checkbox-change="handleCheckboxChange" @checkbox-all="handleCheckboxAll">
        <vxe-column type="checkbox" width="60"></vxe-column>
        <vxe-column field="name" title="模块名称" tree-node></vxe-column>
        <vxe-column field="code" title="模块编码" width="120"></vxe-column>
        <vxe-column field="version" title="版本" width="100"></vxe-column>
        <vxe-column field="status" title="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </vxe-column>
        <vxe-column field="isPush" title="推送状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isPush ? 'info' : 'success'" :effect="row.isPush ? 'light' : 'plain'">
              {{ row.isPush ? '已推送' : '未推送' }}
            </el-tag>
          </template>
        </vxe-column>
        <vxe-column field="updateTime" title="更新时间" width="180"></vxe-column>
      </vxe-table>
    </div>

    <!-- 推送弹窗 -->
    <el-dialog v-model="pushDialogVisible" title="选择推送项目" width="500px" :close-on-click-modal="false">
      <el-form :model="pushForm" label-width="100px">
        <el-form-item label="目标项目">
          <el-select v-model="pushForm.targetProject" placeholder="请选择要推送到的项目" style="width: 100%" filterable>
            <el-option v-for="project in projectList" :key="project.id" :label="project.name" :value="project.id">
              <div style="display: flex; justify-content: space-between">
                <span>{{ project.name }}</span>
                <el-tag size="small" :type="project.type === 'dev' ? 'success' : 'info'">
                  {{ project.type === 'dev' ? '开发' : '生产' }}
                </el-tag>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="推送说明">
          <el-input v-model="pushForm.description" type="textarea" :rows="3" placeholder="请输入推送说明（可选）" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="pushDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmPush" :loading="pushing">
          确认推送
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 表格实例
const xTable = ref()

// 选中的模块
const selectedModules = ref([])

// 选择的项目
const selectedProject = ref()

// 原始模块数据
const allModuleData = ref([
  {
    id: 1,
    name: '用户管理模块',
    code: 'user-module',
    version: '1.0.0',
    status: 'completed',
    updateTime: '2024-01-15 10:30:00',
    isPush: false,
    children: [
      {
        id: 11,
        name: '用户登录',
        code: 'user-login',
        version: '1.0.0',
        status: 'completed',
        updateTime: '2024-01-15 09:00:00',
        isPush: false
      },
      {
        id: 12,
        name: '用户注册',
        code: 'user-register',
        version: '1.0.0',
        status: 'completed',
        updateTime: '2024-01-15 09:30:00',
        isPush: true
      }
    ]
  },
  {
    id: 2,
    name: '订单管理模块',
    code: 'order-module',
    version: '1.2.0',
    status: 'developing',
    updateTime: '2024-01-15 11:00:00',
    isPush: false,
    children: [
      {
        id: 21,
        name: '订单创建',
        code: 'order-create',
        version: '1.2.0',
        status: 'developing',
        updateTime: '2024-01-15 10:45:00',
        isPush: true
      },
      {
        id: 22,
        name: '订单查询',
        code: 'order-query',
        version: '1.1.0',
        status: 'completed',
        updateTime: '2024-01-15 10:15:00',
        isPush: false
      }
    ]
  },
  {
    id: 3,
    name: '支付模块',
    code: 'payment-module',
    version: '2.0.0',
    status: 'testing',
    updateTime: '2024-01-15 12:00:00',
    isPush: true,
    children: [
      {
        id: 31,
        name: '微信支付',
        code: 'wechat-pay',
        version: '2.0.0',
        status: 'testing',
        updateTime: '2024-01-15 11:30:00',
        isPush: true
      },
      {
        id: 32,
        name: '支付宝支付',
        code: 'alipay-pay',
        version: '1.5.0',
        status: 'completed',
        updateTime: '2024-01-15 11:15:00',
        isPush: false
      }
    ]
  }
])

// 过滤后的表格数据
const tableData = ref([])

// 默认勾选
const defaultChecked = ref([])

// 项目列表
const projectList = ref([
  { id: 1, name: '电商平台项目', type: 'dev' },
  { id: 2, name: '管理系统项目', type: 'dev' },
  { id: 3, name: '移动APP项目', type: 'prod' },
  { id: 4, name: '小程序项目', type: 'prod' },
  { id: 5, name: '后台服务系统', type: 'dev' }
])

// 推送弹窗
const pushDialogVisible = ref(false)
const pushing = ref(false)
const pushForm = reactive({
  targetProject: '',
  description: ''
})

// 状态处理
const getStatusType = (status) => {
  const map = {
    completed: 'success',
    developing: 'warning',
    testing: 'info',
    pending: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    completed: '已完成',
    developing: '开发中',
    testing: '测试中',
    pending: '待处理'
  }
  return map[status] || status
}

// 复选框变化处理
const handleCheckboxChange = ({ checked, row }) => {
  const $table = xTable.value
  if ($table) {
    const records = $table.getCheckboxRecords(true)
    selectedModules.value = records
    console.log(selectedModules.value)
  }
}

const handleCheckboxAll = ({ checked }) => {
  const $table = xTable.value
  if ($table) {
    const records = $table.getCheckboxRecords(true)
    selectedModules.value = records
  }
}

// 显示推送弹窗
const showPushDialog = () => {
  if (selectedModules.value.length === 0) {
    ElMessage.warning('请先选择要推送的模块')
    return
  }
  pushDialogVisible.value = true
  pushForm.targetProject = ''
  pushForm.description = ''
}

// 确认推送
const confirmPush = async () => {
  if (!pushForm.targetProject) {
    ElMessage.warning('请选择目标项目')
    return
  }

  pushing.value = true
  try {
    // 模拟推送API调用
    await new Promise(resolve => setTimeout(resolve, 1500))

    const targetProject = projectList.value.find(p => p.id === pushForm.targetProject)
    const moduleNames = selectedModules.value.map(m => m.name).join('、')

    ElMessage.success(`成功将 ${selectedModules.value.length} 个模块推送到 ${targetProject.name}`)
    pushDialogVisible.value = false

    // 清空选择
    const $table = xTable.value
    if ($table) {
      $table.clearCheckboxRow()
      selectedModules.value = []
    }
  } catch (error) {
    ElMessage.error('推送失败，请重试')
  } finally {
    pushing.value = false
  }
}

// 监听项目选择变化
watch(selectedProject, (newProject) => {
  if (newProject) {
    // 根据选择的项目过滤模块数据
    const project = projectList.value.find(p => p.id === newProject)
    if (project) {
      // 模拟根据项目过滤模块数据
      // 这里可以根据实际项目关联的模块进行过滤
      tableData.value = allModuleData.value.map(module => ({
        ...module,
        // 可以在这里添加项目关联的过滤逻辑
      }))
    }
  } else {
    // 没有选择项目时清空表格
    tableData.value = []
  }

  // 清空选择
  selectedModules.value = []
  if (xTable.value) {
    xTable.value.clearCheckboxRow()
  }
})

onMounted(() => {
  // 初始化表格数据
  tableData.value = []
})
</script>

<style scoped>
.module-push-container {
  background-color: #fff;
  height: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header h2 {
  margin: 0;
  color: #303133;
}

.table-container {
  background-color: #fff;
  border-radius: 4px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

:deep(.vxe-table--render-default .vxe-tree--btn-wrapper) {
  margin-right: 8px;
}
</style>