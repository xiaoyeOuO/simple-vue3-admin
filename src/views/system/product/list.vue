<template>
  <div class="product-list-container">
    <div class="page-header">
      <h2>产品线管理</h2>
      <el-button type="primary" @click="handleAddProduct">
        <el-icon>
          <Plus />
        </el-icon>
        新增产品线
      </el-button>
    </div>

    <div class="table-container">
      <vxe-table ref="xTable" :data="tableData" :tree-config="{ children: 'children', expandAll: true }" border stripe
        highlight-hover-row height="600">
        <vxe-column field="name" title="名称" tree-node width="300" :formatter="nameFormatter" />
        <vxe-column field="id" title="编码" width="150" />
        <vxe-column field="manager" title="产品经理" width="150" :formatter="managerFormatter" />
        <vxe-column field="userType" title="员工类型" width="150" :formatter="userTypeFormatter" />
        <vxe-column title="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </vxe-column>
      </vxe-table>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="编码" prop="id">
          <el-input v-model="formData.id" placeholder="请输入编码" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="产品线" :value="0" />
            <el-option label="部门" :value="1" />
            <el-option label="员工" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="formData.type === 2" label="用户名" prop="userName">
          <el-input v-model="formData.userName" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item v-if="formData.type === 2" label="真实姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// 表格数据 - 原始数据
const rawData = [
  {
    id: "133",
    name: "产品线1",
    type: 0,
    manager: "张三",
    children: [
      {
        id: "1334",
        name: "部门1",
        type: 1,
        manager: "李四",
        children: [
          {
            id: "13341",
            name: "子部门1",
            type: 1,
            manager: "王五",
            children: [
              {
                id: "122",
                name: "李四",
                type: 2,
                userName: "002222",
                realName: "李四",
                departmentId: "1334",
                userType: "普通"
              }
            ]
          }
        ],
        deptUsers: [
          {
            id: 124,
            userName: "003333",
            realName: "赵六",
            departmentId: "1334"
          }
        ],
        postUsers: [
          {
            id: 125,
            userName: "004444",
            realName: "孙七",
            departmentId: "1334"
          }
        ]
      },
      {
        id: "123",
        name: "张三",
        type: 2,
        userName: "001111",
        realName: "张三",
        departmentId: "133",
        userType: "普通"
      }
    ]
  }
]

// 处理数据，将postUsers和deptUsers也转为树形结构的子节点
const processData = (data) => {
  return data.map(item => {
    const processedItem = { ...item }
    
    // 处理子部门
    if (item.children && item.children.length) {
      processedItem.children = processData(item.children)
    } else {
      processedItem.children = []
    }
    
    // 添加部门用户作为子节点
    if (item.deptUsers && item.deptUsers.length) {
      const deptUserNodes = item.deptUsers.map(user => ({
        id: `dept_${user.id}`,
        name: user.realName,
        type: 2,
        id: user.id.toString(),
        userName: user.userName,
        realName: user.realName,
        departmentId: user.departmentId,
        userType: "部门用户",
        isUserNode: true
      }))
      processedItem.children = [...processedItem.children, ...deptUserNodes]
    }
    
    // 添加岗位用户作为子节点
    if (item.postUsers && item.postUsers.length) {
      const postUserNodes = item.postUsers.map(user => ({
        id: `post_${user.id}`,
        name: user.realName,
        type: 2,
        id: user.id.toString(),
        userName: user.userName,
        realName: user.realName,
        departmentId: user.departmentId,
        userType: "岗位用户",
        isUserNode: true
      }))
      processedItem.children = [...processedItem.children, ...postUserNodes]
    }
    
    return processedItem
  })
}

// 表格数据 - 处理后的数据
const tableData = ref(processData(rawData))

// 表格实例
const xTable = ref()

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const formData = reactive({
  name: '',
  id: '',
  type: 0,
  userName: '',
  realName: '',
  departmentId: ''
})

const formRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  id: [{ required: true, message: '请输入编码', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }]
}

// 格式化方法
const nameFormatter = ({ row }) => {
  const indent = '　'.repeat(getLevel(row))
  return `${indent}${row.name}`
}

const managerFormatter = ({ row }) => {
  if (row.isUserNode) {
    return '' // 用户节点不显示产品经理
  }
  
  if (row.type === 0) {
    // 产品线 - 显示产品经理
    return row.manager || ''
  } else if (row.type === 1) {
    // 部门 - 显示部门负责人
    return row.manager || ''
  } else {
    // 员工 - 不显示
    return ''
  }
}

const userTypeFormatter = ({ row }) => {
  if (row.isUserNode || row.type === 2) {
    return row.userType || '普通'
  }
  return ''
}

// 获取层级深度
const getLevel = (row) => {
  let level = 0
  let current = row

  // 递归查找父级
  const findParent = (data, target, depth = 0) => {
    for (const item of data) {
      if (item === target) {
        return depth
      }
      if (item.children && item.children.length) {
        const childDepth = findParent(item.children, target, depth + 1)
        if (childDepth !== -1) {
          return childDepth
        }
      }
    }
    return -1
  }

  return findParent(tableData.value, row)
}

// 操作方法
const handleAddProduct = () => {
  dialogTitle.value = '新增产品线'
  Object.assign(formData, {
    name: '',
    id: '',
    type: 0,
    userName: '',
    realName: '',
    departmentId: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑'
  Object.assign(formData, {
    name: row.name,
    id: row.id,
    type: row.type,
    userName: row.userName || '',
    realName: row.realName || '',
    departmentId: row.departmentId || ''
  })
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认删除 "${row.name}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 模拟删除操作
    const deleteFromTree = (data, id) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === id) {
          data.splice(i, 1)
          return true
        }
        if (data[i].children && data[i].children.length) {
          if (deleteFromTree(data[i].children, id)) {
            return true
          }
        }
      }
      return false
    }

    deleteFromTree(tableData.value, row.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 这里应该调用API保存数据
      ElMessage.success('保存成功')
      dialogVisible.value = false
    }
  })
}

// 初始化
onMounted(() => {
  // 展开所有节点
  nextTick(() => {
    const $table = xTable.value
    if ($table) {
      $table.setAllTreeExpand(true)
    }
  })
})
</script>

<style scoped>
.product-list-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-header h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 500;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

:deep(.vxe-table) {
  font-size: 14px;
}

:deep(.vxe-tree-node) {
  display: flex;
  align-items: center;
}

:deep(.vxe-tree--node-btn) {
  margin-right: 8px;
}

:deep(.vxe-body--column.col--tree-node) {
  padding-left: 0 !important;
}
</style>