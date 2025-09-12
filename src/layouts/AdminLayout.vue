<template>
  <el-container class="layout-container">
    <!-- 顶部 Header -->
    <el-header class="layout-header">
      <div class="header-left">
        <div class="logo">Vue Admin</div>
        <el-menu
          mode="horizontal"
          :default-active="activeTopMenu"
          class="top-menu"
          @select="handleTopMenuSelect"
          :ellipsis="false"
        >
          <el-menu-item 
            v-for="menu in topMenus" 
            :key="menu.path" 
            :index="menu.path"
            class="top-menu-item"
          >
            <el-icon>
              <component :is="menu.meta.icon" />
            </el-icon>
            <span>{{ menu.meta.title }}</span>
          </el-menu-item>
        </el-menu>
      </div>
      <div class="header-right">
        <el-dropdown>
          <span class="user-info">
            <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            <span>管理员</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>个人中心</el-dropdown-item>
              <el-dropdown-item divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container>
      <!-- 左侧 Aside -->
      <el-aside width="200px" class="layout-aside">
        <el-menu
          :default-active="$route.path"
          class="side-menu"
          router
          unique-opened
        >
          <template v-for="item in sideMenus" :key="item.path">
            <el-sub-menu v-if="item.children && item.children.filter(child => !child.meta?.hidden).length > 0" :index="item.path">
              <template #title>
                <el-icon>
                  <component :is="item.meta.icon" />
                </el-icon>
                <span>{{ item.meta.title }}</span>
              </template>
              <el-menu-item 
                v-for="child in item.children.filter(child => !child.meta?.hidden)" 
                :key="child.path" 
                :index="child.path"
              >
                <el-icon>
                  <component :is="child.meta.icon" />
                </el-icon>
                <span>{{ child.meta.title }}</span>
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item v-else-if="!item.meta?.hidden" :index="item.path">
              <el-icon>
                <component :is="item.meta.icon" />
              </el-icon>
              <span>{{ item.meta.title }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="layout-main">
        <TabBreadcrumb />
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TabBreadcrumb from '@/components/TabBreadcrumb.vue'

const route = useRoute()
const router = useRouter()

// 获取顶级菜单（过滤隐藏的菜单）
const topMenus = computed(() => {
  return router.getRoutes()
    .filter(route => route.path === '/')[0]
    ?.children.filter(child => 
      !child.path.includes('/:') && 
      !child.meta?.hidden
    ) || []
})

// 当前激活的顶部菜单
const activeTopMenu = ref('')

// 根据顶部菜单获取对应的侧边菜单（过滤隐藏的菜单）
const sideMenus = computed(() => {
  const currentTop = activeTopMenu.value || '/dashboard'
  const matchedMenu = topMenus.value.find(menu => menu.path === currentTop)
  
  // 如果有子菜单，过滤隐藏的子菜单
  if (matchedMenu?.children) {
    return matchedMenu.children.filter(child => !child.meta?.hidden)
  }
  
  // 如果没有子菜单，返回当前菜单本身（如果不隐藏）
  return matchedMenu && !matchedMenu.meta?.hidden ? [matchedMenu] : []
})



// 处理顶部菜单选择
const handleTopMenuSelect = (path) => {
  activeTopMenu.value = path
  // 跳转到该菜单的第一个非隐藏子页面
  const menu = topMenus.value.find(m => m.path === path)
  if (menu?.children?.length > 0) {
    const firstVisibleChild = menu.children.find(child => !child.meta?.hidden)
    if (firstVisibleChild) {
      router.push(firstVisibleChild.path)
    } else {
      router.push(path)
    }
  } else {
    router.push(path)
  }
}

// 监听路由变化，更新激活的顶部菜单
watch(() => route.path, (newPath) => {
  const matched = route.matched.find(item => 
    topMenus.value.some(top => top.path === item.path)
  )
  if (matched) {
    activeTopMenu.value = matched.path
  }
}, { immediate: true })
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  margin-right: 40px;
  flex-shrink: 0;
}

.top-menu {
  border-bottom: none;
  flex: 1;
  overflow-x: auto;
  display: flex;
  flex-wrap: nowrap;
}

.top-menu-item {
  flex-shrink: 0;
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .layout-header {
    padding: 0 10px;
  }
  
  .logo {
    margin-right: 20px;
    font-size: 18px;
  }
  
  .header-right {
    margin-left: 10px;
  }
}

@media (max-width: 576px) {
  .logo {
    margin-right: 15px;
    font-size: 16px;
  }
  
  .top-menu {
    font-size: 14px;
  }
}

.layout-aside {
  background: #fff;
  border-right: 1px solid #e4e7ed;
}

.side-menu {
  border-right: none;
}

.layout-main {
  background: #f5f7fa;
  padding: 20px;
}


</style>