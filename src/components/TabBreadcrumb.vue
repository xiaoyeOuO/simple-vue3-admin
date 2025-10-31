<template>
  <div class="tab-breadcrumb">
    <div class="tabs-container">
      <el-tag
        v-for="tag in visitedViews"
        :key="tag.path"
        :closable="!isAffix(tag)"
        :type="isActive(tag) ? '' : 'info'"
        :effect="isActive(tag) ? 'dark' : 'light'"
        @click="goToTag(tag)"
        @close="closeSelectedTag(tag)"
        @contextmenu.prevent="openContextMenu($event, tag)"
        class="tab-tag"
      >
        <el-icon v-if="tag.meta?.icon" style="margin-right: 4px">
          <component :is="tag.meta.icon" />
        </el-icon>
        {{ tag.meta?.title || '未命名' }}
      </el-tag>
    </div>

    <!-- 右键菜单 -->
    <div
      v-if="contextMenuVisible"
      class="context-menu"
      :style="{ left: contextMenuLeft + 'px', top: contextMenuTop + 'px' }"
    >
      <div @click="refreshSelectedTag" class="menu-item">
        <el-icon><Refresh /></el-icon>
        刷新
      </div>
      <div @click="closeSelectedTag(contextMenuTag)" class="menu-item" v-if="!isAffix(contextMenuTag)">
        <el-icon><Close /></el-icon>
        关闭
      </div>
      <div @click="closeOthersTags" class="menu-item">
        <el-icon><CircleClose /></el-icon>
        关闭其他
      </div>
      <div @click="closeAllTags" class="menu-item">
        <el-icon><Minus /></el-icon>
        关闭所有
      </div>
    </div>

    <!-- 遮罩层 -->
    <div
      v-if="contextMenuVisible"
      class="context-menu-mask"
      @click="closeContextMenu"
    ></div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabsStore } from '@/stores/tabs'
import { Refresh, Close, CircleClose, Minus } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const tabsStore = useTabsStore()

// 获取标签页列表
const visitedViews = computed(() => tabsStore.visitedViews)

// 右键菜单相关
const contextMenuVisible = ref(false)
const contextMenuTop = ref(0)
const contextMenuLeft = ref(0)
const contextMenuTag = ref(null)

// 初始化标签页
onMounted(() => {
  tabsStore.initTabs()
  
  // 监听路由变化，自动添加标签页
  const unwatch = router.afterEach((to) => {
    if (to.path !== '/login') {
      tabsStore.addView(to)
    }
  })
  
  // 清理监听器
  onUnmounted(() => {
    unwatch()
  })
})

// 判断是否是固定标签
const isAffix = (tag) => {
  return tabsStore.isAffix(tag)
}

// 判断是否是当前激活的标签
const isActive = (tag) => {
  return tag.path === route.path
}

// 跳转到标签页
const goToTag = (tag) => {
  if (tag.path !== route.path) {
    router.push({
      path: tag.path,
      query: tag.query || {},
      params: tag.params || {}
    })
  }
}

// 关闭选中的标签页
const closeSelectedTag = async (tag) => {
  if (!tag || isAffix(tag)) return
  
  const currentPath = route.path
  const views = await tabsStore.delView(tag)
  
  // 如果关闭的是当前页面，跳转到前一个页面
  if (isActive(tag) && views.length > 0) {
    const latestView = views[views.length - 1]
    router.push({
      path: latestView.path,
      query: latestView.query || {},
      params: latestView.params || {}
    })
  }
}

// 关闭其他标签页
const closeOthersTags = async () => {
  if (!contextMenuTag.value) return
  
  await tabsStore.delOthersViews(contextMenuTag.value)
  
  // 如果当前页面被关闭，跳转到保留的第一个页面
  const isCurrentClosed = !visitedViews.value.some(v => v.path === route.path)
  if (isCurrentClosed && visitedViews.value.length > 0) {
    const firstView = visitedViews.value[0]
    router.push({
      path: firstView.path,
      query: firstView.query || {},
      params: firstView.params || {}
    })
  }
  
  closeContextMenu()
}

// 关闭所有标签页
const closeAllTags = async () => {
  await tabsStore.delAllViews()
  
  // 跳转到第一个固定标签
  if (visitedViews.value.length > 0) {
    const firstView = visitedViews.value[0]
    router.push({
      path: firstView.path,
      query: firstView.query || {},
      params: firstView.params || {}
    })
  }
  
  closeContextMenu()
}

// 刷新当前标签页
const refreshSelectedTag = () => {
  if (!contextMenuTag.value) return
  
  // 先从缓存中移除该组件
  const viewName = contextMenuTag.value.name
  if (viewName) {
    // 临时从缓存列表中移除
    const tempExclude = [viewName]
    
    // 使用路由重载来刷新页面
    const { path, query } = contextMenuTag.value
    router.replace({
      path: '/redirect' + path,
      query: query || {}
    }).then(() => {
      // 重新添加回缓存
      router.replace({ path, query: query || {} })
    })
  }
  
  closeContextMenu()
}

// 打开右键菜单
const openContextMenu = (e, tag) => {
  contextMenuVisible.value = true
  contextMenuLeft.value = e.clientX
  contextMenuTop.value = e.clientY
  contextMenuTag.value = tag
}

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenuVisible.value = false
  contextMenuTag.value = null
}

// 监听点击事件关闭右键菜单
onMounted(() => {
  document.addEventListener('click', closeContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
})
</script>

<style scoped>
.tab-breadcrumb {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 8px 20px;
  position: relative;
  margin-bottom: 20px;
}

.tabs-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tab-tag {
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.tab-tag:hover {
  opacity: 0.8;
}

.tab-tag:active {
  transform: scale(0.95);
}

.context-menu {
  position: fixed;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  padding: 4px 0;
  min-width: 120px;
}

.menu-item {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.menu-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.context-menu-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
}
</style>