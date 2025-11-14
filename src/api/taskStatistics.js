// 任务统计相关API
import { ElMessage } from 'element-plus'

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 根据后端数据结构生成模拟数据（包含完整的list）
const generateBackendStyleData = (startMonth, endMonth) => {
  const months = []
  const startDate = new Date(startMonth + '-01')
  const endDate = new Date(endMonth + '-01')
  
  // 生成月份数组
  let currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    months.push(currentDate.toISOString().slice(0, 7))
    currentDate.setMonth(currentDate.getMonth() + 1)
  }
  
  const result = []
  
  months.forEach(month => {
    const monthData = {
      date: month + '-01 00:00:00',
      dateStr: null,
      units: [
        {
          unitId: '111111',
          unitName: '第一研发所',
          data: {
            doneActualCount: Math.floor(Math.random() * 60) + 30,
            doneActualList: generateTaskDetails('第一研发所', month, '实际结束'),
            donePlanCount: Math.floor(Math.random() * 30) + 60,
            donePlanList: generateTaskDetails('第一研发所', month, '计划结束'),
            dueLeaveDoneCount: Math.floor(Math.random() * 15) + 5,
            dueLeaveDoneList: generateTaskDetails('第一研发所', month, '逾期已完成'),
            dueLeaveNotDoneCount: Math.floor(Math.random() * 40) + 10,
            dueLeaveNotDoneList: generateTaskDetails('第一研发所', month, '逾期未开始'),
            startCount: Math.floor(Math.random() * 300) + 400,
            startList: generateTaskDetails('第一研发所', month, '计划开始')
          }
        },
        {
          unitId: '222222',
          unitName: '第二研发所',
          data: {
            doneActualCount: Math.floor(Math.random() * 60) + 30,
            doneActualList: generateTaskDetails('第二研发所', month, '实际结束'),
            donePlanCount: Math.floor(Math.random() * 30) + 60,
            donePlanList: generateTaskDetails('第二研发所', month, '计划结束'),
            dueLeaveDoneCount: Math.floor(Math.random() * 15) + 5,
            dueLeaveDoneList: generateTaskDetails('第二研发所', month, '逾期已完成'),
            dueLeaveNotDoneCount: Math.floor(Math.random() * 40) + 10,
            dueLeaveNotDoneList: generateTaskDetails('第二研发所', month, '逾期未开始'),
            startCount: Math.floor(Math.random() * 300) + 400,
            startList: generateTaskDetails('第二研发所', month, '计划开始')
          }
        },
        {
          unitId: '333333',
          unitName: '第三研发所',
          data: {
            doneActualCount: Math.floor(Math.random() * 60) + 30,
            doneActualList: generateTaskDetails('第三研发所', month, '实际结束'),
            donePlanCount: Math.floor(Math.random() * 30) + 60,
            donePlanList: generateTaskDetails('第三研发所', month, '计划结束'),
            dueLeaveDoneCount: Math.floor(Math.random() * 15) + 5,
            dueLeaveDoneList: generateTaskDetails('第三研发所', month, '逾期已完成'),
            dueLeaveNotDoneCount: Math.floor(Math.random() * 40) + 10,
            dueLeaveNotDoneList: generateTaskDetails('第三研发所', month, '逾期未开始'),
            startCount: Math.floor(Math.random() * 300) + 400,
            startList: generateTaskDetails('第三研发所', month, '计划开始')
          }
        },
        {
          unitId: '444444',
          unitName: '第四研发所',
          data: {
            doneActualCount: Math.floor(Math.random() * 60) + 30,
            doneActualList: generateTaskDetails('第四研发所', month, '实际结束'),
            donePlanCount: Math.floor(Math.random() * 30) + 60,
            donePlanList: generateTaskDetails('第四研发所', month, '计划结束'),
            dueLeaveDoneCount: Math.floor(Math.random() * 15) + 5,
            dueLeaveDoneList: generateTaskDetails('第四研发所', month, '逾期已完成'),
            dueLeaveNotDoneCount: Math.floor(Math.random() * 40) + 10,
            dueLeaveNotDoneList: generateTaskDetails('第四研发所', month, '逾期未开始'),
            startCount: Math.floor(Math.random() * 300) + 400,
            startList: generateTaskDetails('第四研发所', month, '计划开始')
          }
        }
      ]
    }
    
    result.push(monthData)
  })
  
  return { result }
}

// 生成任务详情数据（按照test.json的结构）
const generateTaskDetails = (department, month, status) => {
  const taskCount = Math.floor(Math.random() * 8) + 3 // 3-10个任务
  const users = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']
  
  return Array.from({ length: taskCount }, (_, index) => ({
    taskName: `任务${index + 1}`,
    taskUser: users[Math.floor(Math.random() * users.length)]
  }))
}

// API函数
export const taskStatisticsAPI = {
  // 获取任务统计数据
  async getTaskStatistics(startMonth, endMonth) {
    try {
      await delay(800) // 模拟网络延迟
      
      // 模拟后端返回数据（新的数据结构）
      const backendData = generateBackendStyleData(startMonth, endMonth)
      
      return {
        code: 200,
        message: 'success',
        data: backendData
      }
    } catch (error) {
      ElMessage.error('获取任务统计数据失败')
      throw error
    }
  },
  
  // 获取任务详情（支持分页）
  async getTaskDetails(department, month, status, page = 1, pageSize = 10) {
    try {
      await delay(600) // 模拟网络延迟
      
      // 根据test.json的结构，返回对应状态的全部数据
      let allDetails = []
      
      // 根据状态类型返回对应的数据结构
      switch (status) {
        case '计划开始':
          allDetails = generateTaskDetails(department, month, '计划开始')
          break
        case '计划结束':
          allDetails = generateTaskDetails(department, month, '计划结束')
          break
        case '实际结束':
          allDetails = generateTaskDetails(department, month, '实际结束')
          break
        case '逾期已完成':
          allDetails = generateTaskDetails(department, month, '逾期已完成')
          break
        case '逾期未开始':
          allDetails = generateTaskDetails(department, month, '逾期未开始')
          break
        default:
          allDetails = generateTaskDetails(department, month, status)
      }
      
      // 前端分页处理
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedData = allDetails.slice(startIndex, endIndex)
      
      return {
        code: 200,
        message: '获取任务详情成功',
        data: {
          list: paginatedData,
          total: allDetails.length,
          page: page,
          pageSize: pageSize,
          totalPages: Math.ceil(allDetails.length / pageSize)
        }
      }
    } catch (error) {
      console.error('获取任务详情失败:', error)
      return {
        code: 500,
        message: '获取任务详情失败',
        data: null
      }
    }
  }
}

export default taskStatisticsAPI