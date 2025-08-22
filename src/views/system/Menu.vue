<template>
  <div>
    <h1>菜单管理</h1>
    <el-card>
      <p>菜单管理页面内容</p>
      <el-button type="primary" @click="handleAddMenu">新增菜单</el-button>
      <el-table :data="menuList" style="width: 100%; margin-top: 20px" row-key="id">
        <el-table-column prop="title" label="菜单名称" />
        <el-table-column prop="path" label="路由路径" />
        <el-table-column prop="icon" label="图标" />
        <el-table-column prop="sort" label="排序" width="80" />
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

const menuList = ref([
  { id: 1, title: '仪表盘', path: '/dashboard', icon: 'Monitor', sort: 1 },
  { id: 2, title: '用户管理', path: '/system/user', icon: 'User', sort: 2 },
  { id: 3, title: '角色管理', path: '/system/role', icon: 'UserFilled', sort: 3 },
  { id: 4, title: '文章管理', path: '/content/article', icon: 'Document', sort: 4 }
])

const handleAddMenu = () => {
  // 新增菜单逻辑
}
</script>