<template>
  <div class="dashboard">
    <!-- 原始统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card>
          <div class="card-content">
            <el-icon size="48" color="#409eff">
              <User />
            </el-icon>
            <div>
              <div class="card-number">1,234</div>
              <div class="card-title">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="card-content">
            <el-icon size="48" color="#67c23a">
              <Document />
            </el-icon>
            <div>
              <div class="card-number">5,678</div>
              <div class="card-title">文章总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="card-content">
            <el-icon size="48" color="#e6a23c">
              <Star />
            </el-icon>
            <div>
              <div class="card-number">9,012</div>
              <div class="card-title">收藏总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="card-content">
            <el-icon size="48" color="#f56c6c">
              <View />
            </el-icon>
            <div>
              <div class="card-number">3,456</div>
              <div class="card-title">浏览总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 项目类型统计卡片 -->
    <el-row :gutter="20" class="project-type-cards">
      <el-col :span="6">
        <el-card class="project-card" @click="openProjectList('development', '开发项目')">
          <div class="card-content">
            <el-icon size="48" color="#409eff">
              <Tools />
            </el-icon>
            <div>
              <div class="card-number">{{ projectTypes.development }}</div>
              <div class="card-title">开发项目</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="project-card" @click="openProjectList('maintenance', '维护项目')">
          <div class="card-content">
            <el-icon size="48" color="#67c23a">
              <Monitor />
            </el-icon>
            <div>
              <div class="card-number">{{ projectTypes.maintenance }}</div>
              <div class="card-title">维护项目</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="project-card" @click="openProjectList('research', '研究项目')">
          <div class="card-content">
            <el-icon size="48" color="#e6a23c">
              <DocumentCopy />
            </el-icon>
            <div>
              <div class="card-number">{{ projectTypes.research }}</div>
              <div class="card-title">研究项目</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="project-card" @click="openProjectList('testing', '测试项目')">
          <div class="card-content">
            <el-icon size="48" color="#f56c6c">
              <Setting />
            </el-icon>
            <div>
              <div class="card-number">{{ projectTypes.testing }}</div>
              <div class="card-title">测试项目</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 项目列表弹窗 -->
    <ProjectListDialog
      v-model="projectListDialogVisible"
      :project-type="currentProjectType"
      :project-type-name="currentProjectTypeName"
      @view-project="handleViewProject"
      @edit-project="handleEditProject"
    />

    <!-- 重新布局：左侧两行，右侧迟到人员 -->
    <div class="dashboard-layout">
      <!-- 左侧区域 -->
      <div class="left-section">
        <!-- 第一行：四个所代码当量、个人当量前五名、迟到次数统计 -->
        <div class="row-1">
          <div class="dashboard-flex-item">
            <el-card class="dashboard-card">
              <template #header>
                <div class="card-header">
                  <span>四个所代码当量</span>
                  <div class="table-date-filter">
                    <el-date-picker
                      v-model="tableDateRanges.codeEquivalent"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      size="small"
                      style="width: 200px; margin-right: 8px;"
                      @change="refreshTable('codeEquivalent')"
                    />
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="refreshTable('codeEquivalent')"
                      :loading="loading"
                    >
                      <el-icon><Refresh /></el-icon>
                    </el-button>
                  </div>
                </div>
              </template>
              <el-table :data="codeEquivalentData" style="width: 100%" height="400">
                <el-table-column prop="department" label="所属部门" width="120" />
                <el-table-column prop="total" label="代码当量总数" align="right">
                  <template #default="{ row }">
                    <span class="number-text">{{ row.total.toLocaleString() }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>

          <div class="dashboard-flex-item">
            <el-card class="dashboard-card">
              <template #header>
                <div class="card-header">
                  <span>个人代码当量前五名</span>
                  <div class="table-date-filter">
                    <el-date-picker
                      v-model="tableDateRanges.top5Personal"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      size="small"
                      style="width: 200px; margin-right: 8px;"
                      @change="refreshTable('top5Personal')"
                    />
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="refreshTable('top5Personal')"
                      :loading="loading"
                    >
                      <el-icon><Refresh /></el-icon>
                    </el-button>
                  </div>
                </div>
              </template>
              <el-table :data="top5PersonalData" style="width: 100%" height="400">
                <el-table-column prop="rank" label="排名" width="60" align="center" />
                <el-table-column prop="name" label="姓名" width="100" />
                <el-table-column prop="employeeId" label="工号" width="100" />
                <el-table-column prop="total" label="代码当量总数" align="right">
                  <template #default="{ row }">
                    <span class="number-text">{{ row.total.toLocaleString() }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>

          <div class="dashboard-flex-item">
            <el-card class="dashboard-card">
              <template #header>
                <div class="card-header">
                  <span>迟到次数统计</span>
                  <div class="table-date-filter">
                    <el-date-picker
                      v-model="tableDateRanges.lateCount"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      size="small"
                      style="width: 200px; margin-right: 8px;"
                      @change="refreshTable('lateCount')"
                    />
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="refreshTable('lateCount')"
                      :loading="loading"
                    >
                      <el-icon><Refresh /></el-icon>
                    </el-button>
                  </div>
                </div>
              </template>
              <el-table :data="lateCountData" style="width: 100%" height="400">
                <el-table-column prop="name" label="姓名" width="120" />
                <el-table-column prop="employeeId" label="工号" width="120" />
                <el-table-column prop="lateCount" label="迟到次数" align="center">
                  <template #default="{ row }">
                    <el-tag :type="row.lateCount > 5 ? 'danger' : row.lateCount > 2 ? 'warning' : 'info'">
                      {{ row.lateCount }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>
        </div>

        <!-- 第二行：任务工时趋势图、时间不足员工列表、有问必答解决数 -->
        <div class="row-2">
          <div class="dashboard-flex-item">
            <el-card class="dashboard-card">
              <template #header>
                <div class="card-header">
                  <span>任务工时趋势</span>
                  <div class="table-date-filter">
                    <el-date-picker
                      v-model="tableDateRanges.taskHours"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      size="small"
                      style="width: 200px; margin-right: 8px;"
                      @change="refreshTable('taskHours')"
                    />
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="refreshTable('taskHours')"
                      :loading="loading"
                    >
                      <el-icon><Refresh /></el-icon>
                    </el-button>
                  </div>
                </div>
              </template>
              <div ref="taskHoursChart" class="chart-container" style="height: 400px;"></div>
            </el-card>
          </div>

          <div class="dashboard-flex-item">
            <el-card class="dashboard-card">
              <template #header>
                <div class="card-header">
                  <span>时间不足员工列表</span>
                  <div class="table-date-filter">
                    <el-date-picker
                      v-model="tableDateRanges.insufficientTime"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      size="small"
                      style="width: 200px; margin-right: 8px;"
                      @change="refreshTable('insufficientTime')"
                    />
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="refreshTable('insufficientTime')"
                      :loading="loading"
                    >
                      <el-icon><Refresh /></el-icon>
                    </el-button>
                  </div>
                </div>
              </template>
              <el-table :data="insufficientTimeEmployees" style="width: 100%" height="400">
                <el-table-column prop="name" label="姓名" width="100" />
                <el-table-column prop="employeeId" label="工号" width="100" />
                <el-table-column prop="department" label="部门" width="120" />
                <el-table-column prop="requiredHours" label="应出勤" align="center" />
                <el-table-column prop="actualHours" label="实际出勤" align="center" />
                <el-table-column prop="shortfall" label="缺勤时长" align="center">
                  <template #default="{ row }">
                    <el-tag type="danger">{{ row.shortfall }}小时</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>

          <div class="dashboard-flex-item">
            <el-card class="dashboard-card">
              <template #header>
                <div class="card-header">
                  <span>有问必答解决数</span>
                  <div class="table-date-filter">
                    <el-date-picker
                      v-model="tableDateRanges.qaResolved"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      size="small"
                      style="width: 200px; margin-right: 8px;"
                      @change="refreshTable('qaResolved')"
                    />
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="refreshTable('qaResolved')"
                      :loading="loading"
                    >
                      <el-icon><Refresh /></el-icon>
                    </el-button>
                  </div>
                </div>
              </template>
              <el-table :data="qaResolvedData" style="width: 100%" height="400">
                <el-table-column prop="name" label="姓名" width="100" />
                <el-table-column prop="employeeId" label="工号" width="100" />
                <el-table-column prop="department" label="部门" width="120" />
                <el-table-column prop="resolvedCount" label="解决数量" align="center">
                  <template #default="{ row }">
                    <el-tag :type="row.resolvedCount > 10 ? 'success' : row.resolvedCount > 5 ? 'info' : 'warning'">
                      {{ row.resolvedCount }}个
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="avgResponseTime" label="平均响应" align="center" />
                <el-table-column prop="satisfaction" label="满意度" align="center">
                  <template #default="{ row }">
                    <el-rate v-model="row.satisfaction" disabled size="small"
                      :colors="['#99A9BF', '#F7BA2A', '#FF9900']" />
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>
        </div>
      </div>

      <!-- 右侧区域：迟到人员 -->
      <div class="right-section">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>迟到人员</span>
              <div class="table-date-filter">
                <el-date-picker
                  v-model="lateEmployeeDate"
                  type="date"
                  placeholder="选择日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  size="small"
                  style="width: 140px; margin-right: 8px;"
                  @change="refreshTable('lateEmployees')"
                />
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="refreshTable('lateEmployees')"
                  :loading="loading"
                >
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </div>
            </div>
          </template>
          <div class="late-section">
            <div class="late-header">
              <el-icon>
                <Sunrise />
              </el-icon>
              <span>上午迟到 ({{ morningLate.length }}人)</span>
            </div>
            <el-table :data="morningLate" style="width: 100%" height="180">
              <el-table-column prop="name" label="姓名" width="100" />
              <el-table-column prop="employeeId" label="工号" width="100" />
              <el-table-column prop="lateTime" label="迟到时间" />
            </el-table>
          </div>
          <el-divider />
          <div class="late-section">
            <div class="late-header">
              <el-icon>
                <Moon />
              </el-icon>
              <span>下午迟到 ({{ afternoonLate.length }}人)</span>
            </div>
            <el-table :data="afternoonLate" style="width: 100%" height="180">
              <el-table-column prop="name" label="姓名" width="100" />
              <el-table-column prop="employeeId" label="工号" width="100" />
              <el-table-column prop="lateTime" label="迟到时间" />
            </el-table>
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 任务完成情况分析 -->
    <div class="dashboard-flex-container" style="margin-top: 20px;">
      <div class="dashboard-flex-item">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>按时完成任务占比分析</span>
              <div class="table-date-filter">
                <el-date-picker
                  v-model="tableDateRanges.onTimeTask"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  size="small"
                  style="width: 200px; margin-right: 8px;"
                  @change="refreshTable('onTimeTask')"
                />
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="refreshTable('onTimeTask')"
                  :loading="loading"
                >
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </div>
            </div>
          </template>
          <div ref="onTimeTaskChart" class="chart-container"></div>
        </el-card>
      </div>

      <div class="dashboard-flex-item">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>逾期任务占比分析</span>
              <div class="table-date-filter">
                <el-date-picker
                  v-model="tableDateRanges.overdueTask"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  size="small"
                  style="width: 200px; margin-right: 8px;"
                  @change="refreshTable('overdueTask')"
                />
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="refreshTable('overdueTask')"
                  :loading="loading"
                >
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </div>
            </div>
          </template>
          <div ref="overdueTaskChart" class="chart-container"></div>
        </el-card>
      </div>
    </div>

    <!-- 四个设计所人员分布饼图 -->
    <el-card class="dashboard-card" style="margin-top: 20px; width: 100%;">
      <template #header>
        <div class="card-header">
          <span>四个设计所人员分布</span>
          <el-tag type="info">当前统计</el-tag>
        </div>
      </template>
      <div class="pie-charts-container">
        <!-- 饼图将通过JavaScript动态生成 -->
      </div>
    </el-card>

    <!-- 迟到人员分布饼图 -->
    <el-card class="dashboard-card" style="margin-top: 20px; width: 100%;">
      <template #header>
        <div class="card-header">
          <span>迟到人员分布</span>
          <el-tag type="info">当前统计</el-tag>
        </div>
      </template>
      <div ref="lateDistributionChart" class="chart-container"></div>
    </el-card>

    <!-- 逾期任务四个所占比饼图 -->
    <el-card class="dashboard-card" style="margin-top: 20px; width: 100%;">
      <template #header>
        <div class="card-header">
          <span>逾期任务四个所占比</span>
          <el-tag type="warning">当前统计</el-tag>
        </div>
      </template>
      <div ref="overdueInstituteChart" class="chart-container"></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import ProjectListDialog from '@/components/ProjectListDialog.vue'
import moment from 'moment'
import * as echarts from 'echarts'
import { User, Document, Star, View, Refresh, Sunrise, Moon, Tools, Monitor, DocumentCopy, Setting } from '@element-plus/icons-vue'

const loading = ref(false)

// 项目类型统计数据
const projectTypes = ref({
  development: 156,
  maintenance: 89,
  research: 34,
  testing: 67
})

// 项目列表弹窗状态
const projectListDialogVisible = ref(false)
const currentProjectType = ref('')
const currentProjectTypeName = ref('')

// 四个表格数据
const codeEquivalentData = ref([])
const top5PersonalData = ref([])
const lateCountData = ref([])
const yesterdayMorningLate = ref([])
const yesterdayAfternoonLate = ref([])

const morningLate = ref([])
const afternoonLate = ref([])

// 图表引用
const taskHoursChart = ref()
const onTimeTaskChart = ref()
const overdueTaskChart = ref()
const lateDistributionChart = ref()
const overdueInstituteChart = ref()
const pieChart1 = ref()
const pieChart2 = ref()
const pieChart3 = ref()
const pieChart4 = ref()
const insufficientTimeEmployees = ref([])
const qaResolvedData = ref([])
let chartInstance = null
let onTimeTaskChartInstance = null
let overdueTaskChartInstance = null
let lateDistributionChartInstance = null
let overdueInstituteChartInstance = null
let pieChartInstances = []

// 模拟API调用
const mockApiCall = (data, delay = 500) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay)
  })
}

// 获取四个所代码当量数据
const fetchCodeEquivalent = async () => {
  const mockData = [
    { department: '第一研究所', total: 125430 },
    { department: '第二研究所', total: 98765 },
    { department: '第三研究所', total: 156789 },
    { department: '第四研究所', total: 110234 }
  ]
  codeEquivalentData.value = await mockApiCall(mockData)
}

// 获取个人代码当量前五名
const fetchTop5Personal = async () => {
  const mockData = [
    { rank: 1, name: '张三', employeeId: 'EMP001', total: 52341 },
    { rank: 2, name: '李四', employeeId: 'EMP002', total: 48765 },
    { rank: 3, name: '王五', employeeId: 'EMP003', total: 45678 },
    { rank: 4, name: '赵六', employeeId: 'EMP004', total: 42345 },
    { rank: 5, name: '孙七', employeeId: 'EMP005', total: 39876 }
  ]
  top5PersonalData.value = await mockApiCall(mockData)
}

// 获取迟到次数统计
const fetchLateCount = async () => {
  const mockData = [
    { name: '周九', employeeId: 'EMP009', lateCount: 8 },
    { name: '吴十', employeeId: 'EMP010', lateCount: 6 },
    { name: '郑十一', employeeId: 'EMP011', lateCount: 4 },
    { name: '王十二', employeeId: 'EMP012', lateCount: 3 },
    { name: '李十三', employeeId: 'EMP013', lateCount: 2 },
    { name: '赵十四', employeeId: 'EMP014', lateCount: 1 },
    { name: '钱十五', employeeId: 'EMP015', lateCount: 1 }
  ]
  lateCountData.value = await mockApiCall(mockData)
}



// 获取指定日期的迟到人员
const fetchLateEmployees = async () => {
  const morningData = [
    { name: '张三', employeeId: 'EMP001', lateTime: '08:45' },
    { name: '李四', employeeId: 'EMP002', lateTime: '08:52' },
    { name: '王五', employeeId: 'EMP003', lateTime: '09:10' }
  ]

  const afternoonData = [
    { name: '赵六', employeeId: 'EMP004', lateTime: '13:25' },
    { name: '孙七', employeeId: 'EMP005', lateTime: '13:40' },
    { name: '周八', employeeId: 'EMP008', lateTime: '14:05' }
  ]

  const [morning, afternoon] = await Promise.all([
    mockApiCall(morningData),
    mockApiCall(afternoonData)
  ])

  morningLate.value = morning
  afternoonLate.value = afternoon
}

// 根据指定日期获取迟到人员
const fetchLateEmployeesByDate = async (date) => {
  const dateStr = moment(date).format('YYYY-MM-DD')
  console.log(`获取 ${dateStr} 的迟到人员数据`)
  
  // 模拟根据日期获取不同数据
  const morningData = [
    { name: '张三', employeeId: 'EMP001', lateTime: '08:45' },
    { name: '李四', employeeId: 'EMP002', lateTime: '08:52' },
    { name: '王五', employeeId: 'EMP003', lateTime: '09:10' }
  ]

  const afternoonData = [
    { name: '赵六', employeeId: 'EMP004', lateTime: '13:25' },
    { name: '孙七', employeeId: 'EMP005', lateTime: '13:40' },
    { name: '周八', employeeId: 'EMP008', lateTime: '14:05' }
  ]

  const [morning, afternoon] = await Promise.all([
    mockApiCall(morningData),
    mockApiCall(afternoonData)
  ])

  morningLate.value = morning
  afternoonLate.value = afternoon
}

// 获取任务工时趋势数据
const fetchTaskHoursTrend = async () => {
  const trendData = [
    { date: '2024-01-15', 第一研究所: 125, 第二研究所: 98, 第三研究所: 156, 第四研究所: 110 },
    { date: '2024-01-16', 第一研究所: 132, 第二研究所: 105, 第三研究所: 148, 第四研究所: 115 },
    { date: '2024-01-17', 第一研究所: 118, 第二研究所: 92, 第三研究所: 162, 第四研究所: 108 },
    { date: '2024-01-18', 第一研究所: 141, 第二研究所: 113, 第三研究所: 155, 第四研究所: 125 },
    { date: '2024-01-19', 第一研究所: 129, 第二研究所: 101, 第三研究所: 167, 第四研究所: 119 },
    { date: '2024-01-20', 第一研究所: 135, 第二研究所: 108, 第三研究所: 149, 第四研究所: 122 },
    { date: '2024-01-21', 第一研究所: 147, 第二研究所: 116, 第三研究所: 158, 第四研究所: 128 }
  ]
  return await mockApiCall(trendData)
}

// 根据时间范围获取任务工时趋势数据
const fetchTaskHoursTrendByRange = async (startDate, endDate) => {
  const start = moment(startDate)
  const end = moment(endDate)
  const days = end.diff(start, 'days') + 1
  
  console.log(`获取任务工时趋势数据，时间范围: ${start.format('YYYY-MM-DD')} 至 ${end.format('YYYY-MM-DD')}，共 ${days} 天`)
  
  // 模拟根据时间范围生成数据
  const trendData = []
  for (let i = 0; i < days; i++) {
    const currentDate = start.clone().add(i, 'days')
    trendData.push({
      date: currentDate.format('YYYY-MM-DD'),
      第一研究所: Math.floor(Math.random() * 50) + 100,
      第二研究所: Math.floor(Math.random() * 40) + 80,
      第三研究所: Math.floor(Math.random() * 60) + 120,
      第四研究所: Math.floor(Math.random() * 45) + 90
    })
  }
  
  return await mockApiCall(trendData)
}



// 获取时间不足员工数据
const fetchInsufficientTimeEmployees = async () => {
  const data = [
    { name: '张三', employeeId: 'EMP001', department: '研发部', requiredHours: 160, actualHours: 140, shortfall: 20 },
    { name: '李四', employeeId: 'EMP002', department: '测试部', requiredHours: 160, actualHours: 145, shortfall: 15 },
    { name: '王五', employeeId: 'EMP003', department: '产品部', requiredHours: 160, actualHours: 135, shortfall: 25 },
    { name: '赵六', employeeId: 'EMP004', department: '设计部', requiredHours: 160, actualHours: 150, shortfall: 10 },
    { name: '孙七', employeeId: 'EMP005', department: '研发部', requiredHours: 160, actualHours: 138, shortfall: 22 }
  ]
  insufficientTimeEmployees.value = await mockApiCall(data)
}

// 获取有问必答解决数据
const fetchQAResolvedData = async () => {
  const data = [
    { name: '张三', employeeId: 'EMP001', department: '技术支持', resolvedCount: 15, avgResponseTime: '5分钟', satisfaction: 4.8 },
    { name: '李四', employeeId: 'EMP002', department: '客服部', resolvedCount: 12, avgResponseTime: '8分钟', satisfaction: 4.5 },
    { name: '王五', employeeId: 'EMP003', department: '产品部', resolvedCount: 8, avgResponseTime: '12分钟', satisfaction: 4.3 },
    { name: '赵六', employeeId: 'EMP004', department: '技术支持', resolvedCount: 20, avgResponseTime: '3分钟', satisfaction: 4.9 },
    { name: '孙七', employeeId: 'EMP005', department: '客服部', resolvedCount: 10, avgResponseTime: '6分钟', satisfaction: 4.6 }
  ]
  qaResolvedData.value = await mockApiCall(data)
}

// 打开项目列表弹窗
const openProjectList = (type, typeName) => {
  currentProjectType.value = type
  currentProjectTypeName.value = typeName
  projectListDialogVisible.value = true
}

// 处理查看项目事件
const handleViewProject = (project) => {
  console.log('查看项目:', project)
  // 这里可以添加查看项目的逻辑，比如跳转到项目详情页
}

// 处理编辑项目事件
const handleEditProject = (project) => {
  console.log('编辑项目:', project)
  // 这里可以添加编辑项目的逻辑，比如打开编辑弹窗
}





// 初始化任务工时趋势图表
const initTaskHoursChart = async (startDate, endDate) => {
  await nextTick()
  if (!taskHoursChart.value) return

  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(taskHoursChart.value)
  
  // 如果有时间范围参数，使用范围数据，否则使用默认数据
  const trendData = startDate && endDate 
    ? await fetchTaskHoursTrendByRange(startDate, endDate)
    : await fetchTaskHoursTrend()

  const option = {
    title: {
      text: '四个所实际工时趋势',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['第一研究所', '第二研究所', '第三研究所', '第四研究所'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendData.map(item => item.date)
    },
    yAxis: {
      type: 'value',
      name: '工时（小时）'
    },
    series: [
      {
        name: '第一研究所',
        type: 'line',
        data: trendData.map(item => item.第一研究所),
        smooth: true,
        lineStyle: {
          color: '#409EFF'
        },
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '第二研究所',
        type: 'line',
        data: trendData.map(item => item.第二研究所),
        smooth: true,
        lineStyle: {
          color: '#67C23A'
        },
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '第三研究所',
        type: 'line',
        data: trendData.map(item => item.第三研究所),
        smooth: true,
        lineStyle: {
          color: '#E6A23C'
        },
        itemStyle: {
          color: '#E6A23C'
        }
      },
      {
        name: '第四研究所',
        type: 'line',
        data: trendData.map(item => item.第四研究所),
        smooth: true,
        lineStyle: {
          color: '#F56C6C'
        },
        itemStyle: {
          color: '#F56C6C'
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

// 动态初始化人员分布饼图（支持任意数量研究所）
const initPieCharts = async (pieData) => {
  await nextTick()

  // 清理现有饼图实例
  pieChartInstances.forEach(instance => {
    if (instance) instance.dispose()
  })
  pieChartInstances = []

  // 清空容器，为动态生成做准备
  const container = document.querySelector('.pie-charts-container')
  if (container) container.innerHTML = ''

  if (!pieData || pieData.length === 0) {
    container.innerHTML = '<div style="text-align: center; color: #909399; padding: 40px;">暂无数据</div>'
    return
  }

  // 动态生成饼图DOM并初始化
  pieData.forEach(item => {
    // 创建单个饼图容器
    const itemDiv = document.createElement('div')
    itemDiv.className = 'pie-chart-item'
    itemDiv.style.cssText = `
      flex: 1 1 240px;
      min-width: 240px;
      max-width: 320px;
      height: 320px;
      display: flex;
      align-items: center;
      gap: 10px;
    `

    // 研究所名称标签
    const label = document.createElement('div')
    label.className = 'institute-name-vertical'
    label.textContent = item.name

    // 图表容器
    const chartDiv = document.createElement('div')
    chartDiv.style.cssText = 'width: 100%; height: 100%; flex: 1;'

    itemDiv.appendChild(label)
    itemDiv.appendChild(chartDiv)
    container?.appendChild(itemDiv)

    // 初始化ECharts实例
    const chart = echarts.init(chartDiv)
    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
      legend: {
        orient: 'vertical',
        right: 0,
        top: 'middle',
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 5,
        textStyle: { fontSize: 10 }
      },
      series: [{
        name: item.name,
        type: 'pie',
        radius: ['28%', '52%'],
        center: ['33%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderColor: '#fff', borderWidth: 1 },
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 12, fontWeight: 'bold' } },
        labelLine: { show: false },
        data: item.data
      }],
      color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C']
    })
    pieChartInstances.push(chart)
  })
}


// 从后端获取饼图数据并动态生成
  const fetchPieData = async () => {
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 600))

      // 这里替换为真实API调用，例如：
      // const res = await fetch('/api/dashboard/institute-personnel-stats').then(r => r.json())
      // return res.data

      // 模拟后端返回任意数量研究所的数据
      // 可以测试不同数量的研究所：
      const mockData = [
        { name: '第一研究所', data: [{ value: 120, name: '在册人员' }, { value: 45, name: '劳务人员' }, { value: 30, name: '外包人员' }, { value: 15, name: '集中办公人员' }] },
        { name: '第二研究所', data: [{ value: 98, name: '在册人员' }, { value: 38, name: '劳务人员' }, { value: 25, name: '外包人员' }, { value: 12, name: '集中办公人员' }] },
        { name: '第三研究所', data: [{ value: 135, name: '在册人员' }, { value: 52, name: '劳务人员' }, { value: 35, name: '外包人员' }, { value: 18, name: '集中办公人员' }] },
        { name: '第四研究所', data: [{ value: 110, name: '在册人员' }, { value: 42, name: '劳务人员' }, { value: 28, name: '外包人员' }, { value: 14, name: '集中办公人员' }] }
      ]
      
      // 测试不同数量：可以改为3个或5个研究所
      // return mockData.slice(0, 3) // 3个研究所
      return mockData // 4个研究所
    } catch (e) {
      console.error('获取饼图数据失败:', e)
      // 错误时使用默认数据
      return [{ name: '暂无数据', data: [{ value: 0, name: '暂无数据' }] }]
    }
  }

  // 获取所有数据
    const fetchAllData = async () => {
      loading.value = true
      try {
        await Promise.all([
          fetchCodeEquivalent(),
          fetchTop5Personal(),
          fetchLateCount(),
          fetchLateEmployees(),
          fetchInsufficientTimeEmployees(),
          fetchQAResolvedData()
        ])
        
        // 获取饼图数据并动态生成
        const pieData = await fetchPieData()
        await initPieCharts(pieData)
        
        // 使用默认时间范围初始化任务工时趋势图表
        await initTaskHoursChart(tableDateRanges.value.taskHours[0], tableDateRanges.value.taskHours[1])
        
        // 初始化新饼图
        await initOnTimeTaskChart(tableDateRanges.value.onTimeTask[0], tableDateRanges.value.onTimeTask[1])
        await initOverdueTaskChart(tableDateRanges.value.overdueTask[0], tableDateRanges.value.overdueTask[1])
        await initLateDistributionChart()
        await initOverdueInstituteChart()
      } finally {
        loading.value = false
      }
    }

    // 格式化日期范围显示
    const formatTableDateRange = (dateRange) => {
      if (!dateRange || dateRange.length !== 2) return ''
      const start = new Date(dateRange[0])
      const end = new Date(dateRange[1])
      return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')} 至 ${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
    }

    // 测试用：动态切换研究所数量（开发调试用）
  const testPieData = async (count) => {
    const allData = [
      { name: '第一研究所', data: [{ value: 120, name: '在册人员' }, { value: 45, name: '劳务人员' }, { value: 30, name: '外包人员' }, { value: 15, name: '集中办公人员' }] },
      { name: '第二研究所', data: [{ value: 98, name: '在册人员' }, { value: 38, name: '劳务人员' }, { value: 25, name: '外包人员' }, { value: 12, name: '集中办公人员' }] },
      { name: '第三研究所', data: [{ value: 135, name: '在册人员' }, { value: 52, name: '劳务人员' }, { value: 35, name: '外包人员' }, { value: 18, name: '集中办公人员' }] },
      { name: '第四研究所', data: [{ value: 110, name: '在册人员' }, { value: 42, name: '劳务人员' }, { value: 28, name: '外包人员' }, { value: 14, name: '集中办公人员' }] },
      { name: '第五研究所', data: [{ value: 95, name: '在册人员' }, { value: 35, name: '劳务人员' }, { value: 22, name: '外包人员' }, { value: 10, name: '集中办公人员' }] }
    ]
    
    const testData = allData.slice(0, count)
    await initPieCharts(testData)
  }

  // 初始化按时完成任务占比饼图
  const initOnTimeTaskChart = async (startDate, endDate) => {
    try {
      // 模拟API调用获取数据
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 模拟数据：按时完成任务数和总任务数
      const onTimeCount = Math.floor(Math.random() * 500) + 200
      const totalCount = onTimeCount + Math.floor(Math.random() * 200) + 50
      const notOnTimeCount = totalCount - onTimeCount
      
      const chartData = [
        { value: onTimeCount, name: '按时完成任务' },
        { value: notOnTimeCount, name: '未按时完成任务' }
      ]
      
      if (!onTimeTaskChart.value) {
        console.error('按时完成任务图表容器未找到')
        return
      }
      
      // 清理旧实例
      if (onTimeTaskChartInstance) {
        onTimeTaskChartInstance.dispose()
      }
      
      onTimeTaskChartInstance = echarts.init(onTimeTaskChart.value)
      
      const option = {
        title: {
          text: `任务总数: ${totalCount}`,
          left: 'center',
          top: 20,
          textStyle: {
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'horizontal',
          left: 'center',
          top: 50,
          itemGap: 20
        },
        series: [
          {
            name: '按时完成任务分析',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '65%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              formatter: '{b}: {d}%'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold'
              }
            },
            data: chartData
          }
        ],
        color: ['#67C23A', '#F56C6C']
      }
      
      onTimeTaskChartInstance.setOption(option)
      
    } catch (error) {
      console.error('初始化按时完成任务图表失败:', error)
    }
  }
  
  // 初始化逾期任务占比饼图
  const initOverdueTaskChart = async (startDate, endDate) => {
    try {
      // 模拟API调用获取数据
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 模拟数据：逾期任务数和总任务数
      const overdueCount = Math.floor(Math.random() * 100) + 20
      const totalCount = overdueCount + Math.floor(Math.random() * 600) + 300
      const normalCount = totalCount - overdueCount
      
      const chartData = [
        { value: overdueCount, name: '逾期任务' },
        { value: normalCount, name: '正常任务' }
      ]
      
      if (!overdueTaskChart.value) {
        console.error('逾期任务图表容器未找到')
        return
      }
      
      // 清理旧实例
      if (overdueTaskChartInstance) {
        overdueTaskChartInstance.dispose()
      }
      
      overdueTaskChartInstance = echarts.init(overdueTaskChart.value)
      
      const option = {
        title: {
          text: `任务总数: ${totalCount}`,
          left: 'center',
          top: 20,
          textStyle: {
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'horizontal',
          left: 'center',
          top: 50,
          itemGap: 20
        },
        series: [
          {
            name: '逾期任务分析',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '65%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              formatter: '{b}: {d}%'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold'
              }
            },
            data: chartData
          }
        ],
        color: ['#F56C6C', '#409EFF']
      }
      
      overdueTaskChartInstance.setOption(option)
      
    } catch (error) {
      console.error('初始化逾期任务图表失败:', error)
    }
  }

  // 初始化迟到人员分布饼图
  const initLateDistributionChart = async () => {
    try {
      // 模拟API调用获取数据
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 模拟四个所的迟到人员数据
      const chartData = [
        { value: 15, name: '第一研究所' },
        { value: 8, name: '第二研究所' },
        { value: 12, name: '第三研究所' },
        { value: 6, name: '第四研究所' }
      ]
      
      if (!lateDistributionChart.value) {
        console.error('迟到人员分布图表容器未找到')
        return
      }
      
      // 清理旧实例
      if (lateDistributionChartInstance) {
        lateDistributionChartInstance.dispose()
      }
      
      lateDistributionChartInstance = echarts.init(lateDistributionChart.value)
      
      const option = {
        title: {
          text: '迟到人员分布统计',
          left: 'center',
          top: 20,
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c}人 ({d}%)'
        },
        legend: {
          orient: 'horizontal',
          left: 'center',
          top: 60,
          itemGap: 20
        },
        series: [
          {
            name: '迟到人员分布',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '65%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              formatter: '{b}: {c}人'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold'
              }
            },
            data: chartData
          }
        ],
        color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C']
      }
      
      lateDistributionChartInstance.setOption(option)
      
    } catch (error) {
      console.error('初始化迟到人员分布图表失败:', error)
    }
  }

  // 初始化逾期任务四个所占比饼图
  const initOverdueInstituteChart = async () => {
    try {
      // 模拟API调用获取数据
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 模拟四个所的逾期任务数据
      const chartData = [
        { value: 25, name: '第一研究所' },
        { value: 18, name: '第二研究所' },
        { value: 32, name: '第三研究所' },
        { value: 15, name: '第四研究所' }
      ]
      
      if (!overdueInstituteChart.value) {
        console.error('逾期任务四个所占比图表容器未找到')
        return
      }
      
      // 清理旧实例
      if (overdueInstituteChartInstance) {
        overdueInstituteChartInstance.dispose()
      }
      
      overdueInstituteChartInstance = echarts.init(overdueInstituteChart.value)
      
      const option = {
        title: {
          text: '逾期任务四个所占比统计',
          left: 'center',
          top: 20,
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c}个任务 ({d}%)'
        },
        legend: {
          orient: 'horizontal',
          left: 'center',
          top: 60,
          itemGap: 20
        },
        series: [
          {
            name: '逾期任务分布',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '65%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              formatter: '{b}: {c}个'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold'
              }
            },
            data: chartData
          }
        ],
        color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C']
      }
      
      overdueInstituteChartInstance.setOption(option)
      
    } catch (error) {
      console.error('初始化逾期任务四个所占比图表失败:', error)
    }
  }

// 统一的resize事件处理器
const handleResize = () => {
  if (chartInstance) chartInstance.resize()
  pieChartInstances.forEach(instance => {
    if (instance) instance.resize()
  })
  if (onTimeTaskChartInstance) onTimeTaskChartInstance.resize()
  if (overdueTaskChartInstance) overdueTaskChartInstance.resize()
  if (lateDistributionChartInstance) lateDistributionChartInstance.resize()
  if (overdueInstituteChartInstance) overdueInstituteChartInstance.resize()
}

  // 为每个表格创建独立的时间筛选器
  const tableDateRanges = ref({
    codeEquivalent: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()],
    top5Personal: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()],
    lateCount: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()],
    lateEmployees: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()],
    insufficientTime: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()],
    qaResolved: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()],
    taskHours: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()],
    onTimeTask: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()],
    overdueTask: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()]
  })

  // 迟到人员单日期选择
  const lateEmployeeDate = ref(new Date(Date.now() - 24 * 60 * 60 * 1000))

  // 为每个表格创建独立的刷新函数
  const refreshTable = async (tableName) => {
    let dateInfo = ''
    if (tableName === 'lateEmployees') {
      dateInfo = `日期: ${moment(lateEmployeeDate.value).format('YYYY-MM-DD')}`
    } else if (tableName === 'taskHours') {
      const dateRange = tableDateRanges.value[tableName]
      dateInfo = `时间范围: ${moment(dateRange[0]).format('YYYY-MM-DD')} 至 ${moment(dateRange[1]).format('YYYY-MM-DD')}`
    } else if (tableName === 'onTimeTask' || tableName === 'overdueTask') {
      const dateRange = tableDateRanges.value[tableName]
      dateInfo = `时间范围: ${moment(dateRange[0]).format('YYYY-MM-DD')} 至 ${moment(dateRange[1]).format('YYYY-MM-DD')}`
    } else {
      const dateRange = tableDateRanges.value[tableName]
      dateInfo = `时间范围: ${moment(dateRange[0]).format('YYYY-MM-DD')} 至 ${moment(dateRange[1]).format('YYYY-MM-DD')}`
    }
    
    console.log(`刷新 ${tableName} 表格，${dateInfo}`)
    
    switch (tableName) {
      case 'codeEquivalent':
        await fetchCodeEquivalent()
        break
      case 'top5Personal':
        await fetchTop5Personal()
        break
      case 'lateCount':
        await fetchLateCount()
        break
      case 'lateEmployees':
        await fetchLateEmployeesByDate(lateEmployeeDate.value)
        break
      case 'insufficientTime':
        await fetchInsufficientTimeEmployees()
        break
      case 'qaResolved':
        await fetchQAResolvedData()
        break
      case 'taskHours':
        if (tableDateRanges.taskHours && tableDateRanges.taskHours.length === 2) {
          await initTaskHoursChart(tableDateRanges.taskHours[0], tableDateRanges.taskHours[1])
        } else {
          await initTaskHoursChart()
        }
        break
      case 'onTimeTask':
        if (tableDateRanges.onTimeTask && tableDateRanges.onTimeTask.length === 2) {
          await initOnTimeTaskChart(tableDateRanges.onTimeTask[0], tableDateRanges.onTimeTask[1])
        }
        break
      case 'overdueTask':
        if (tableDateRanges.overdueTask && tableDateRanges.overdueTask.length === 2) {
          await initOverdueTaskChart(tableDateRanges.overdueTask[0], tableDateRanges.overdueTask[1])
        }
        break
    }
  }

// 清理资源
const cleanupChart = () => {
  // 清理任务工时趋势图表
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  
  // 清理四个饼图实例
  pieChartInstances.forEach(instance => {
    if (instance) {
      instance.dispose()
    }
  })
  pieChartInstances = []
  
  // 清理新饼图实例
  if (onTimeTaskChartInstance) {
    onTimeTaskChartInstance.dispose()
    onTimeTaskChartInstance = null
  }
  
  if (overdueTaskChartInstance) {
    overdueTaskChartInstance.dispose()
    overdueTaskChartInstance = null
  }
  
  // 清理迟到人员分布图表实例
  if (lateDistributionChartInstance) {
    lateDistributionChartInstance.dispose()
    lateDistributionChartInstance = null
  }
  
  // 清理逾期任务四个所占比图表实例
  if (overdueInstituteChartInstance) {
    overdueInstituteChartInstance.dispose()
    overdueInstituteChartInstance = null
  }
  
  // 清理事件监听器
  window.removeEventListener('resize', handleResize)
}

// 初始化
onMounted(async () => {
  await fetchAllData()
  await initPieCharts()
  
  // 添加统一的resize事件监听器
  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理
onUnmounted(() => {
  cleanupChart()
})
</script>

<style scoped>
.dashboard {
  background-color: #f5f7fa;
  min-height: 100vh;
  max-width: 100vw;
  box-sizing: border-box;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.dashboard-header h1 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.date-filter {
  display: flex;
  gap: 12px;
  align-items: center;
}

.stat-cards {
  margin-bottom: 20px;
}

.project-type-cards {
  margin-bottom: 20px;
}

.project-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tables-filter {
  margin: 20px 0;
  background: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.filter-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dashboard-layout {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  max-width: 100%;
  overflow-x: hidden;
}

.left-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.row-1,
.row-2 {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.row-1 .dashboard-flex-item,
.row-2 .dashboard-flex-item {
  flex: 1 1 calc(33.333% - 14px);
  min-width: 280px;
  max-width: calc(33.333% - 14px);
}

.right-section {
  flex: 0 0 380px;
  min-width: 380px;
  max-width: 380px;
}

@media (max-width: 1400px) {
  .dashboard-layout {
    flex-direction: column;
  }
  
  .right-section {
    flex: 1;
    min-width: 100%;
    max-width: 100%;
  }
}

@media (max-width: 900px) {
  .row-1,
  .row-2 {
    flex-direction: column;
  }
  
  .row-1 .dashboard-flex-item,
  .row-2 .dashboard-flex-item {
    flex: 1 1 100%;
    min-width: 100%;
    max-width: 100%;
  }
}

.dashboard-flex-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.dashboard-flex-item {
  flex: 1 1 400px;
  flex-basis: 400px;
  min-width: 400px;
  max-width: calc(50% - 10px);
}

.dashboard-card {
  margin-bottom: 0;
  height: 100%;
}

.dashboard-card :deep(.el-card__body) {
  height: calc(100% - 60px);
}

@media (max-width: 768px) {
  .dashboard-flex-item {
    flex: 1 1 100%;
    max-width: 100%;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;
}

.table-date-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-date-filter .el-date-picker {
  flex-shrink: 0;
}

.number-text {
  font-weight: bold;
  color: #409EFF;
  font-size: 16px;
}

.late-section {
  margin-bottom: 16px;
}

.late-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 12px;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.card-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.chart-container {
  width: 100%;
  height: 400px;
}

.el-rate {
  display: inline-block;
}

.pie-charts-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 20px;
  justify-content: center;
  align-items: flex-start;
}

.pie-chart-item {
  flex: 1;
  min-width: 240px;
  max-width: 320px;
  height: 320px;
  flex-shrink: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.pie-chart {
  width: 100%;
  height: 100%;
  flex: 1;
}

.institute-name-vertical {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  white-space: nowrap;
  padding: 4px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 2px;
}

@media (max-width: 1200px) {
  .pie-chart-item {
    min-width: 200px;
    max-width: 240px;
    height: 300px;
  }
}

@media (max-width: 992px) {
  .pie-chart-item {
    min-width: 180px;
    max-width: 220px;
    height: 280px;
  }
}

@media (max-width: 768px) {
  .pie-chart-item {
    min-width: 160px;
    max-width: 200px;
    height: 260px;
  }
}

@media (max-width: 576px) {
  .pie-charts-container {
    gap: 10px;
    padding: 10px;
  }
  
  .pie-chart-item {
    min-width: 140px;
    max-width: 180px;
    height: 240px;
  }
}
</style>