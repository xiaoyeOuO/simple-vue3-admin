<template>
  <div>
    <h1>用户管理</h1>
    <el-card>
      <el-table :data="userList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
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
const userList = [
  { id: 1, username: 'admin', email: 'admin@example.com', status: 'active' },
  { id: 2, username: 'user1', email: 'user1@example.com', status: 'active' },
  { id: 3, username: 'user2', email: 'user2@example.com', status: 'inactive' }
]
</script>