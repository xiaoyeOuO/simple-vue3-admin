<template>
  <div>
    <h1>分类管理</h1>
    <el-card>
      <div style="margin-bottom: 20px">
        <el-button type="primary" @click="handleAdd">新增分类</el-button>
      </div>
      <el-table :data="categoryList" style="width: 100%" row-key="id">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="articleCount" label="文章数量" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
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

const categoryList = ref([
  { id: 1, name: '前端开发', description: '前端相关技术文章', articleCount: 15, createTime: '2024-01-01' },
  { id: 2, name: '后端开发', description: '后端相关技术文章', articleCount: 8, createTime: '2024-01-02' },
  { id: 3, name: '工具教程', description: '开发工具使用教程', articleCount: 12, createTime: '2024-01-03' }
])

const handleAdd = () => {
  // 新增分类逻辑
}
</script>