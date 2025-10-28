<template>
  <el-container class="layout-container">
    <!-- 移动端遮罩层 -->
    <div 
      v-if="isMobile && isSidebarOpen" 
      class="mobile-overlay"
      @click="toggleSidebar"
    ></div>
    
    <!-- 顶部 Header -->
    <el-header class="layout-header">
      <div class="header-left">
        <!-- 移动端菜单按钮 -->
        <el-button
          v-if="isMobile"
          class="mobile-menu-btn"
          :icon="Menu"
          @click="toggleSidebar"
          circle
          size="small"
        />
        <div class="logo">Vue Admin</div>
        <el-menu
          mode="horizontal"
          :default-active="activeTopMenu"
          class="top-menu"
          @select="handleTopMenuSelect"
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
            <span class="username">管理员</span>
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
      <el-aside 
        class="layout-aside" 
        :width="isMobile ? '280px' : '200px'"
        :class="{ 'mobile-sidebar': isMobile, 'sidebar-open': isSidebarOpen }"
      >
        <div class="sidebar-header" v-if="isMobile">
          <span class="sidebar-title">菜单</span>
          <el-button
            :icon="Close"
            @click="toggleSidebar"
            circle
            size="small"
            class="close-sidebar-btn"
          />
        </div>
        <el-menu
          :default-active="route.path"
          class="side-menu"
          :collapse="false"
          router
        >
          <!-- 移动端显示完整菜单层级 -->
          <template v-if="isMobile">
            <template v-for="topItem in topMenus" :key="topItem.path">
              <el-sub-menu v-if="topItem.children && topItem.children.length > 0" :index="topItem.path">
                <template #title>
                  <el-icon>
                    <component :is="topItem.meta.icon" />
                  </el-icon>
                  <span>{{ topItem.meta.title }}</span>
                </template>
                <el-menu-item 
                  v-for="child in topItem.children.filter(child => !child.meta?.hidden)" 
                  :key="child.path" 
                  :index="child.path"
                  @click="handleMenuItemClick"
                >
                  <el-icon>
                    <component :is="child.meta.icon" />
                  </el-icon>
                  <span>{{ child.meta.title }}</span>
                </el-menu-item>
              </el-sub-menu>
              <el-menu-item v-else-if="!topItem.meta?.hidden" :index="topItem.path" @click="handleMenuItemClick">
                <el-icon>
                  <component :is="topItem.meta.icon" />
                </el-icon>
                <span>{{ topItem.meta.title }}</span>
              </el-menu-item>
            </template>
          </template>
          
          <!-- 桌面端显示当前选中的一级菜单的二级菜单 -->
          <template v-else>
            <template v-for="item in sideMenus" :key="item.path">
              <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.path">
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
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Menu, Close } from '@element-plus/icons-vue'
import TabBreadcrumb from '@/components/TabBreadcrumb.vue'

const route = useRoute()
const router = useRouter()

// 移动端状态管理
const isMobile = ref(false)
const isSidebarOpen = ref(false)

// 检测是否为移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    isSidebarOpen.value = false
  }
}

// 切换侧边栏
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// 监听窗口大小变化
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

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
  // 移动端选择菜单后关闭侧边栏
  if (isMobile.value) {
    isSidebarOpen.value = false
  }
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

// 处理菜单项点击（移动端）
const handleMenuItemClick = () => {
  if (isMobile.value) {
    isSidebarOpen.value = false
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
  transition: padding-left 0.3s ease;
}

/* 移动端样式 */
.mobile-menu-btn {
  margin-right: 10px;
  display: none;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.sidebar-header {
  display: none;
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.close-sidebar-btn {
  border: none;
  background: transparent;
}

/* 移动端菜单样式优化 */
.mobile-sidebar .side-menu {
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.mobile-sidebar .el-sub-menu__title {
  height: 50px;
  line-height: 50px;
  font-size: 14px;
}

.mobile-sidebar .el-menu-item {
  height: 45px;
  line-height: 45px;
  font-size: 14px;
  padding-left: 50px !important;
}

.mobile-sidebar .el-menu-item.is-active {
  background-color: #f5f7fa;
  color: #409eff;
}

/* 移动端响应式样式 */
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: inline-flex;
  }
  
  .layout-aside {
    position: fixed;
    top: 0;
    left: -280px;
    height: 100vh;
    z-index: 1000;
    transition: left 0.3s ease;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  }
  
  .layout-aside.mobile-sidebar.sidebar-open {
    left: 0;
  }
  
  .sidebar-header {
    display: flex;
  }
  
  .layout-main {
    padding: 15px;
  }
  
  .top-menu {
    display: none;
  }
  
  .username {
    display: none;
  }
  
  .header-right {
    margin-left: 10px;
  }
}

@media (max-width: 576px) {
  .layout-main {
    padding: 10px;
  }
  
  .logo {
    font-size: 16px;
    margin-right: 10px;
  }
}


</style>