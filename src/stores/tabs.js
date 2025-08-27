import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useTabsStore = defineStore('tabs', () => {
  // 访问过的标签页列表
  const visitedViews = ref([])
  
  // 固定标签页（不可关闭）
  const affixTags = [
    { path: '/dashboard', name: 'Dashboard', meta: { title: '仪表盘', icon: 'Monitor' } }
  ]

  // 初始化标签页
  const initTabs = () => {
    // 注释掉持久化功能 - 每次刷新都从固定标签开始
    // 从localStorage加载标签页
    // const savedTabs = localStorage.getItem('visitedViews')
    // if (savedTabs) {
    //   try {
    //     const parsedTabs = JSON.parse(savedTabs)
    //     // 过滤掉无效的标签页
    //     visitedViews.value = parsedTabs.filter(tab => 
    //       tab.path && tab.meta && tab.meta.title
    //     )
    //   } catch (error) {
    //     console.error('Failed to parse saved tabs:', error)
    //     visitedViews.value = [...affixTags]
    //   }
    // } else {
    //   // 默认只显示固定标签
    //   visitedViews.value = [...affixTags]
    // }
    
    // 不启用持久化，每次刷新都从固定标签开始
    visitedViews.value = [...affixTags]
  }

  // 添加标签页
  const addView = (view) => {
    if (view.path === '/login') return
    if (!view.meta || !view.meta.title) return
    
    // 检查是否已存在
    const existingIndex = visitedViews.value.findIndex(v => v.path === view.path)
    if (existingIndex === -1) {
      visitedViews.value.push({
        path: view.path,
        name: view.name,
        meta: { ...view.meta },
        query: view.query,
        params: view.params
      })
    }
  }

  // 删除标签页
  const delView = (view) => {
    return new Promise((resolve) => {
      const index = visitedViews.value.findIndex(v => v.path === view.path)
      if (index > -1) {
        visitedViews.value.splice(index, 1)
      }
      resolve([...visitedViews.value])
    })
  }

  // 删除其他标签页
  const delOthersViews = (view) => {
    return new Promise((resolve) => {
      visitedViews.value = visitedViews.value.filter(v => 
        v.path === view.path || affixTags.some(affix => affix.path === v.path)
      )
      resolve([...visitedViews.value])
    })
  }

  // 删除所有标签页（保留固定标签）
  const delAllViews = () => {
    return new Promise((resolve) => {
      visitedViews.value = [...affixTags]
      resolve([...visitedViews.value])
    })
  }

  // 判断是否是固定标签
  const isAffix = (view) => {
    return affixTags.some(affix => affix.path === view.path)
  }

  // 保存到localStorage - 注释掉持久化功能
  // const saveTabs = () => {
  //   localStorage.setItem('visitedViews', JSON.stringify(visitedViews.value))
  // }

  // 监听标签页变化，自动保存到localStorage - 注释掉持久化功能
  // watch(visitedViews, saveTabs, { deep: true })

  return {
    visitedViews,
    affixTags,
    initTabs,
    addView,
    delView,
    delOthersViews,
    delAllViews,
    isAffix
  }
})