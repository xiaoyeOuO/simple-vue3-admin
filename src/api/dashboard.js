import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 可以在这里添加token等认证信息
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const { code, message, data } = response.data
    
    // 根据后端约定的状态码处理
    if (code === 200) {
      return data
    } else {
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message || '请求失败'))
    }
  },
  error => {
    console.error('响应错误:', error)
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          // 可以跳转到登录页
          break
        case 403:
          ElMessage.error('权限不足')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(error.response.data?.message || '网络错误')
      }
    } else {
      ElMessage.error('网络连接错误')
    }
    
    return Promise.reject(error)
  }
)

/**
 * 获取研究所人员统计数据
 * @returns {Promise<Array>} 返回四个研究所的人员统计数据
 */
export const getInstitutePersonnelStats = () => {
  return service.get('/dashboard/institute-personnel-stats')
}

/**
 * 获取指定研究所的人员详情
 * @param {string} instituteId 研究所ID
 * @returns {Promise<Object>} 指定研究所的人员详情
 */
export const getInstitutePersonnelDetail = (instituteId) => {
  return service.get(`/dashboard/institute-personnel-detail/${instituteId}`)
}

/**
 * 获取人员类型统计（用于饼图）
 * @param {Object} params 查询参数
 * @param {string} params.date 统计日期（可选，默认为当前日期）
 * @param {string} params.instituteId 研究所ID（可选，获取指定研究所）
 * @returns {Promise<Array>} 人员类型统计数据
 */
export const getPersonnelTypeStats = (params = {}) => {
  return service.get('/dashboard/personnel-type-stats', { params })
}

/**
 * 获取实时人员数据
 * @returns {Promise<Object>} 实时人员统计数据
 */
export const getRealTimePersonnelStats = () => {
  return service.get('/dashboard/real-time-personnel-stats')
}