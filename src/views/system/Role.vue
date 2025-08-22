<template>
  <div>
    <h1>角色管理</h1>
    <el-card>
      <p>角色管理页面内容</p>
      <el-button type="primary" @click="handleAdd">新增角色</el-button>
      <el-table :data="roleList" style="width: 100%; margin-top: 20px">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="description" label="描述" />
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

const roleList = ref([
  { id: 1, name: '管理员', description: '拥有所有权限' },
  { id: 2, name: '编辑', description: '内容管理权限' },
  { id: 3, name: '用户', description: '普通用户权限' }
])

const handleAdd = () => {
  // 新增角色逻辑
}
</script>