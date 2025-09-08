/**
 * 标签页操作的组合式函数
 * 在Vue3组件中使用的便捷方法
 */

import { useTabsStore } from '@/stores/tabs'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

export function useTabs() {
  const tabsStore = useTabsStore()
  const router = useRouter()
  const route = useRoute()

  /**
   * 关闭当前标签页
   */
  const closeCurrentTab = async () => {
    try {
      await tabsStore.closeCurrentView()
      ElMessage.success('已关闭当前页面')
    } catch (error) {
      console.error('关闭标签页失败:', error)
      ElMessage.error('关闭失败')
    }
  }

  /**
   * 关闭当前标签页并跳转到指定页面
   * @param {string} path - 目标路径
   * @param {object} query - 查询参数
   */
  const closeTabAndRedirect = async (path, query = {}) => {
    try {
      await tabsStore.closeCurrentView()
      await router.push({ path, query })
    } catch (error) {
      console.error('跳转失败:', error)
      ElMessage.error('跳转失败')
    }
  }

  /**
   * 关闭当前标签页并返回上一页
   */
  const closeTabAndGoBack = async () => {
    try {
      await tabsStore.closeCurrentView()
      router.go(-1)
    } catch (error) {
      console.error('返回失败:', error)
      ElMessage.error('返回失败')
    }
  }

  /**
   * 关闭当前标签页并跳转到指定路由名称
   * @param {string} name - 路由名称
   * @param {object} params - 路由参数
   * @param {object} query - 查询参数
   */
  const closeTabAndReplace = async (name, params = {}, query = {}) => {
    try {
      await tabsStore.closeCurrentView()
      await router.replace({ name, params, query })
    } catch (error) {
      console.error('替换失败:', error)
      ElMessage.error('替换失败')
    }
  }

  /**
   * 获取当前标签页信息
   */
  const getCurrentTab = () => {
    return route
  }

  /**
   * 判断当前标签页是否为固定标签
   */
  const isCurrentAffix = () => {
    return tabsStore.isAffix(route)
  }

  return {
    closeCurrentTab,
    closeTabAndRedirect,
    closeTabAndGoBack,
    closeTabAndReplace,
    getCurrentTab,
    isCurrentAffix,
    tabsStore
  }
}