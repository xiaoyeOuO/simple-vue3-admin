<template>
  <div class="my-qa-container">
    <!-- 主导航菜单 -->
    <el-menu
      :default-active="activeMainMenu"
      mode="horizontal"
      class="main-menu"
      @select="handleMainMenuSelect"
    >
      <el-menu-item index="pending">我的待办</el-menu-item>
      <el-menu-item index="questions">我的提问</el-menu-item>
      <el-menu-item index="answers">我的回答</el-menu-item>
      <el-menu-item index="comments">我的评论</el-menu-item>
    </el-menu>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 我的待办子菜单 -->
      <div v-if="activeMainMenu === 'pending'" class="sub-menu-area">
        <el-menu
          :default-active="activeSubMenu"
          mode="horizontal"
          class="sub-menu"
          @select="handleSubMenuSelect"
        >
          <el-menu-item index="approval">待审批</el-menu-item>
          <el-menu-item index="confirm">待确认</el-menu-item>
          <el-menu-item index="reply">待回复</el-menu-item>
        </el-menu>
      </div>

      <!-- 表格内容 -->
      <div class="table-container">
        <el-table
          :data="tableData"
          style="width: 100%"
          :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
          v-loading="loading"
        >
          <el-table-column prop="content" label="问题内容" min-width="200" show-overflow-tooltip />
          <el-table-column prop="software" label="所属软件" width="120" />
          <el-table-column prop="status" label="回复状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="time" label="提问时间" width="160" />
          <el-table-column label="操作" width="80" align="center">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleView(row)">
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeMainMenu = ref('pending')
const activeSubMenu = ref('approval')
const loading = ref(false)

// 模拟数据
const mockData = {
  pending: {
    approval: [
      {
        id: 1,
        content: 'Visual Studio Code如何配置Python开发环境？',
        software: 'VS Code',
        status: '待审批',
        time: '2024-01-15 14:30'
      },
      {
        id: 2,
        content: 'WebStorm中如何配置ESLint自动修复？',
        software: 'WebStorm',
        status: '待审批',
        time: '2024-01-15 10:20'
      }
    ],
    confirm: [
      {
        id: 3,
        content: 'Photoshop图层混合模式的使用技巧',
        software: 'Photoshop',
        status: '待确认',
        time: '2024-01-14 16:45'
      }
    ],
    reply: [
      {
        id: 4,
        content: 'Postman中如何设置环境变量？',
        software: 'Postman',
        status: '待回复',
        time: '2024-01-14 09:15'
      }
    ]
  },
  questions: [
    {
      id: 5,
      content: '如何优化Chrome浏览器性能？',
      software: 'Chrome',
      status: '已回答',
      time: '2024-01-13 11:30'
    },
    {
      id: 6,
      content: 'Git分支管理最佳实践',
      software: 'Git',
      status: '未回答',
      time: '2024-01-12 15:20'
    }
  ],
  answers: [
    {
      id: 7,
      content: 'Docker容器网络配置详解',
      software: 'Docker',
      status: '已采纳',
      time: '2024-01-11 13:45'
    }
  ],
  comments: [
    {
      id: 8,
      content: 'MySQL索引优化建议',
      software: 'MySQL',
      status: '正常',
      time: '2024-01-10 09:30'
    }
  ]
}

// 计算表格数据
const tableData = computed(() => {
  if (activeMainMenu.value === 'pending') {
    return mockData.pending[activeSubMenu.value] || []
  }
  return mockData[activeMainMenu.value] || []
})

// 菜单切换处理
const handleMainMenuSelect = (index) => {
  activeMainMenu.value = index
  // 重置子菜单
  if (index === 'pending') {
    activeSubMenu.value = 'approval'
  }
}

const handleSubMenuSelect = (index) => {
  activeSubMenu.value = index
}

// 状态标签样式
const getStatusType = (status) => {
  const statusMap = {
    '待审批': 'warning',
    '待确认': 'info',
    '待回复': 'danger',
    '已回答': 'success',
    '未回答': 'info',
    '已采纳': 'success',
    '正常': 'success'
  }
  return statusMap[status] || 'info'
}

// 查看详情
const handleView = (row) => {
  console.log('查看详情:', row)
  // 这里可以添加查看详情的逻辑
}
</script>

<style scoped>
.my-qa-container {
  padding: 16px;
}

.main-menu {
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 16px;
}

.sub-menu-area {
  margin-bottom: 16px;
}

.sub-menu {
  border-bottom: 1px solid #e4e7ed;
}

.table-container {
  background-color: #fff;
  border-radius: 4px;
}

/* 菜单样式优化 */
:deep(.el-menu-item) {
  height: 40px;
  line-height: 40px;
}

:deep(.el-menu--horizontal > .el-menu-item) {
  border-bottom: 2px solid transparent;
}

:deep(.el-menu--horizontal > .el-menu-item.is-active) {
  border-bottom: 2px solid #409eff;
  color: #409eff;
}
</style>