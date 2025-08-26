<template>
  <div class="supplier-infos">
    <el-card class="header-card">
      <template #header>
        <div class="card-header">
          <span class="title">客商信息管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            新增客商
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="客商名称">
          <el-input v-model="searchForm.name" placeholder="请输入客商名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="客商编码">
          <el-input v-model="searchForm.code" placeholder="请输入客商编码" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="税号">
          <el-input v-model="searchForm.tin" placeholder="请输入税号" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="地区">
          <el-input v-model="searchForm.area" placeholder="请输入地区" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="tableData" border style="width: 100%">
        <el-table-column prop="code" label="客商编码" min-width="120" />
        <el-table-column prop="name" label="客商名称" min-width="150" />
        <el-table-column prop="tin" label="税号" min-width="150" />
        <el-table-column prop="tel" label="联系电话" width="120" />
        <el-table-column prop="area" label="地区" width="100" />
        <el-table-column prop="address" label="详细地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="legalName" label="法人姓名" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="Edit" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" link :icon="Delete" @click="handleDelete(row)">
              删除
            </el-button>
            <el-button type="success" link :icon="User" @click="handleContacts(row)">
              联系人
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

    <!-- 编辑抽屉 -->
    <SupplierInfoEdit
      v-model:visible="editVisible"
      :data="currentRow"
      :mode="editMode"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete, User } from '@element-plus/icons-vue'
import SupplierInfoEdit from './edit.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  name: '',
  code: '',
  tin: '',
  area: ''
})

// 表格数据
const loading = ref(false)
const tableData = ref([])

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 编辑相关
const editVisible = ref(false)
const currentRow = ref(null)
const editMode = ref('add')

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    code: '',
    tin: '',
    area: ''
  })
  handleSearch()
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    const mockData = [
      {
        id: '1',
        moduleId: 'M001',
        code: 'SUP001',
        name: '北京科技有限公司',
        tin: '91110000123456789X',
        tel: '010-12345678',
        area: '北京市',
        areaCode: '110000',
        address: '北京市朝阳区科技路88号',
        legalName: '张三',
        createTime: '2024-01-15 10:00:00',
        updateTime: '2024-01-15 10:00:00'
      },
      {
        id: '2',
        moduleId: 'M002',
        code: 'SUP002',
        name: '上海贸易发展有限公司',
        tin: '91310000987654321Y',
        tel: '021-87654321',
        area: '上海市',
        areaCode: '310000',
        address: '上海市浦东新区金融街99号',
        legalName: '李四',
        createTime: '2024-01-10 09:30:00',
        updateTime: '2024-01-15 14:20:00'
      },
      {
        id: '3',
        moduleId: 'M003',
        code: 'SUP003',
        name: '深圳创新科技有限公司',
        tin: '91440300345678912Z',
        tel: '0755-12345678',
        area: '广东省深圳市',
        areaCode: '440300',
        address: '深圳市南山区科技园路1号',
        legalName: '王五',
        createTime: '2024-01-12 11:00:00',
        updateTime: '2024-01-15 16:45:00'
      }
    ]

    // 模拟搜索过滤
    let filteredData = mockData
    if (searchForm.name) {
      filteredData = filteredData.filter(item =>
        item.name.toLowerCase().includes(searchForm.name.toLowerCase())
      )
    }
    if (searchForm.code) {
      filteredData = filteredData.filter(item =>
        item.code.toLowerCase().includes(searchForm.code.toLowerCase())
      )
    }
    if (searchForm.tin) {
      filteredData = filteredData.filter(item =>
        item.tin.toLowerCase().includes(searchForm.tin.toLowerCase())
      )
    }
    if (searchForm.area) {
      filteredData = filteredData.filter(item =>
        item.area.toLowerCase().includes(searchForm.area.toLowerCase())
      )
    }

    tableData.value = filteredData.slice(
      (pagination.current - 1) * pagination.size,
      pagination.current * pagination.size
    )
    pagination.total = filteredData.length
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 新增
const handleAdd = () => {
  currentRow.value = null
  editMode.value = 'add'
  editVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  currentRow.value = { ...row }
  editMode.value = 'edit'
  editVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除客商 "${row.name}" 吗？`,
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
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 查看联系人
const handleContacts = (row) => {
  router.push({
    path: '/supplier/contacts',
    query: { coId: row.id, coCode: row.code, coName: row.name }
  })
}

// 编辑成功
const handleEditSuccess = () => {
  editVisible.value = false
  loadData()
}

// 分页变化
const handleSizeChange = (size) => {
  pagination.size = size
  loadData()
}

const handleCurrentChange = (current) => {
  pagination.current = current
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.supplier-infos {
  padding: 20px;
}

.header-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>