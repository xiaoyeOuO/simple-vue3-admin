import axios from 'axios'

const API_BASE_URL = '/api'

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// 个人数据分析相关API
export const personalApi = {
  // 获取代码当量统计
  getCodeEquivalentStats: (userId, startDate, endDate) => {
    return api.get('/personal/code-equivalent', {
      params: { userId, startDate, endDate }
    })
  },

  // 获取缺陷类型统计
  getDefectTypeStats: (userId) => {
    return api.get('/personal/defect-types', {
      params: { userId }
    })
  },

  // 获取遗留缺陷趋势
  getLegacyDefectTrend: (userId) => {
    return api.get('/personal/legacy-defects', {
      params: { userId }
    })
  },

  // 获取缺陷处理耗时分布
  getDefectDurationDistribution: (userId) => {
    return api.get('/personal/defect-duration', {
      params: { userId }
    })
  },

  // 获取项目工时统计
  getProjectWorkHours: (userId, projectId) => {
    return api.get('/personal/project-hours', {
      params: { userId, projectId }
    })
  },

  // 获取个人工时分布
  getPersonalWorkHours: (userId) => {
    return api.get('/personal/work-hours', {
      params: { userId }
    })
  }
}

export default personalApi