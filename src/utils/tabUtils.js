/**
 * 标签页工具函数
 * 提供在其他组件中操作标签页的便捷方法
 */

import { useTabsStore } from '@/stores/tabs'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

// 关闭当前标签页并跳转到指定页面
export const closeCurrentTabAndRedirect = async (redirectPath, query = {}) => {
  const tabsStore = useTabsStore()
  const router = useRouter()
  
  try {
    await tabsStore.closeCurrentView()
    await router.push({ path: redirectPath, query })
    ElMessage.success('操作成功')
  } catch (error) {
    console.error('关闭标签页失败:', error)
    ElMessage.error('操作失败')
  }
}

// 仅关闭当前标签页（不跳转）
export const closeCurrentTab = async () => {
  const tabsStore = useTabsStore()
  
  try {
    await tabsStore.closeCurrentView()
    ElMessage.success('已关闭当前页面')
  } catch (error) {
    console.error('关闭标签页失败:', error)
    ElMessage.error('关闭失败')
  }
}

// 关闭当前标签页并返回上一页
export const closeCurrentTabAndGoBack = async () => {
  const tabsStore = useTabsStore()
  const router = useRouter()
  
  try {
    await tabsStore.closeCurrentView()
    router.go(-1)
  } catch (error) {
    console.error('关闭标签页失败:', error)
    ElMessage.error('返回失败')
  }
}

// 在组件中使用的示例
export const useTabActions = () => {
  const tabsStore = useTabsStore()
  const router = useRouter()
  const route = useRoute()

  const closeCurrent = async () => {
    await tabsStore.closeCurrentView()
  }

  const closeAndRedirect = async (path, query = {}) => {
    await closeCurrentTabAndRedirect(path, query)
  }

  const closeAndBack = async () => {
    await closeCurrentTabAndGoBack()
  }

  return {
    closeCurrent,
    closeAndRedirect,
    closeAndBack
  }
}