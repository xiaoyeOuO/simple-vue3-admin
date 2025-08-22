<template>
  <div>
    <h1>文章管理</h1>
    <el-card>
      <div style="margin-bottom: 20px">
        <el-button type="primary" @click="handleAdd">新增文章</el-button>
        <el-input v-model="searchKeyword" placeholder="搜索文章" style="width: 200px; margin-left: 10px" />
      </div>
      <el-table :data="articleList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="文章标题" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'published' ? 'success' : 'warning'">
              {{ scope.row.status === 'published' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" type="primary">编辑</el-button>
            <el-button size="small" type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const searchKeyword = ref('')

const articleList = ref([
  { id: 1, title: 'Vue3入门教程', category: '前端', author: '张三', createTime: '2024-01-01', status: 'published' },
  { id: 2, title: 'Element Plus使用指南', category: '前端', author: '李四', createTime: '2024-01-02', status: 'published' },
  { id: 3, title: 'Vite配置详解', category: '工具', author: '王五', createTime: '2024-01-03', status: 'draft' }
])

const handleAdd = () => {
  // 新增文章逻辑
}
</script>