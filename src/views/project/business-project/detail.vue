<template>
  <el-drawer
    v-model="visible"
    :title="drawerTitle"
    size="70%"
    destroy-on-close
    @close="handleClose"
    @open="handleOpen"
  >
    <div class="detail-content" v-loading="loading">
      <!-- 项目基本信息 -->
      <div class="base-info">
        <h3>项目基本信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="项目名称">{{ projectData.name }}</el-descriptions-item>
          <el-descriptions-item label="项目编码">{{ projectData.code }}</el-descriptions-item>
          <el-descriptions-item label="年度">{{ projectData.year }}</el-descriptions-item>
          <el-descriptions-item label="区域">{{ projectData.area }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(projectData.status)">
              {{ projectData.statusName }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="阶段">
            <el-tag :type="getPhaseTagType(projectData.phase)">
              {{ projectData.phaseName }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="重要程度">
            <el-tag :type="getImportantTagType(projectData.important)">
              {{ projectData.importantName }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="业务板块">{{ projectData.segmentName }}</el-descriptions-item>
          <el-descriptions-item label="承包商">{{ projectData.coName }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ projectData.assignName }}</el-descriptions-item>
          <el-descriptions-item label="填报人">{{ projectData.reporterName }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ projectData.createTime || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 跟踪信息 -->
      <div class="tracking-info" v-if="hasTrackingData">
        <h3>跟踪信息</h3>
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in trackingData"
            :key="item.id"
            :timestamp="item.createTime"
            :type="getTimelineType(item.trackType)"
            placement="top"
          >
            <el-card>
              <template #header>
                <div class="card-header">
                  <span class="track-type">{{ item.trackTypeName }}</span>
                  <span class="tracker">{{ item.trackerName || '未知' }}</span>
                </div>
              </template>
              
              <div class="track-content">
                <div class="time-range">
                  <el-icon><Calendar /></el-icon>
                  {{ item.beginTime }} 至 {{ item.endTime }}
                </div>
                
                <div v-if="item.keyUserName" class="key-user">
                  <el-icon><User /></el-icon>
                  关键用户：{{ item.keyUserName }}
                </div>
                
                <div v-if="item.info" class="track-info">
                  <el-icon><Document /></el-icon>
                  <div class="info-content">{{ item.info }}</div>
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-if="!hasTrackingData && !loading">
        <el-empty description="暂无跟踪信息" />
      </div>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Calendar, User, Document } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible'])

// 数据状态
const loading = ref(false)
const projectData = ref({})
const trackingData = ref([])

// 计算属性
const drawerTitle = computed(() => {
  return projectData.value?.name ? `项目详情 - ${projectData.value.name}` : '项目详情'
})

const hasTrackingData = computed(() => {
  return trackingData.value && trackingData.value.length > 0
})

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 标签类型方法
const getStatusTagType = (status) => {
  const map = { 1: 'primary', 2: 'success', 3: 'warning', 4: 'danger' }
  return map[status] || 'info'
}

const getPhaseTagType = (phase) => {
  const map = { 1: 'info', 2: 'primary', 3: 'warning', 4: 'success' }
  return map[phase] || 'info'
}

const getImportantTagType = (important) => {
  const map = { 1: 'info', 2: 'warning', 3: 'danger' }
  return map[important] || 'info'
}

const getTimelineType = (trackType) => {
  const map = {
    1: 'primary',    // 初次沟通
    2: 'success',    // 需求沟通
    3: 'warning',    // 方案设计
    4: 'danger',     // 问题处理
    5: 'info'        // 其他
  }
  return map[trackType] || 'info'
}

// 模拟API调用 - 获取跟踪信息
const fetchTrackingData = async (projectId) => {
  try {
    loading.value = true
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 模拟数据 - 根据项目ID获取跟踪信息
    const mockTrackingData = [
      {
        id: 'TRK-001',
        moduleId: 'MOD-001',
        businessInfoId: projectId,
        trackType: 1,
        trackTypeName: '初次沟通',
        beginTime: '2025-07-01',
        endTime: '2025-07-02',
        trackerId: 'USER-001',
        trackerName: '张经理',
        keyUserName: '李总监',
        info: '与客户进行了初步需求沟通，了解了项目的基本情况和客户的期望。客户希望项目能够在年底前完成，预算控制在500万以内。',
        createTime: '2025-08-02 11:15:41'
      },
      {
        id: 'TRK-002',
        moduleId: 'MOD-001',
        businessInfoId: projectId,
        trackType: 2,
        trackTypeName: '需求沟通',
        beginTime: '2025-08-11',
        endTime: '2025-08-13',
        trackerId: 'USER-002',
        trackerName: '王工程师',
        keyUserName: '客户代表',
        info: '深入讨论了具体的技术需求，包括系统架构、功能模块、性能要求等。客户提出了一些新的想法，需要调整项目计划。',
        createTime: '2025-08-11 15:04:55'
      },
      {
        id: 'TRK-003',
        moduleId: 'MOD-001',
        businessInfoId: projectId,
        trackType: 3,
        trackTypeName: '方案设计',
        beginTime: '2025-08-15',
        endTime: '2025-08-20',
        trackerId: 'USER-003',
        trackerName: '赵设计师',
        keyUserName: '技术总监',
        info: '完成了系统架构设计和UI设计稿，与客户进行了多轮讨论和修改，最终方案已获客户确认。',
        createTime: '2025-08-20 10:30:22'
      }
    ]
    
    // 随机返回数据，模拟空数据情况
    if (Math.random() > 0.8) {
      trackingData.value = []
    } else {
      trackingData.value = mockTrackingData
    }
    
  } catch (error) {
    console.error('获取跟踪信息失败:', error)
    ElMessage.error('获取跟踪信息失败')
    trackingData.value = []
  } finally {
    loading.value = false
  }
}

// 填充项目数据
const fillProjectData = (data) => {
  if (data) {
    projectData.value = { ...data }
  }
}

// 抽屉打开时
const handleOpen = () => {
  if (props.data && props.data.id) {
    fillProjectData(props.data)
    fetchTrackingData(props.data.id)
  }
}

// 关闭抽屉
const handleClose = () => {
  emit('update:visible', false)
  // 清空数据
  projectData.value = {}
  trackingData.value = []
}

// 监听数据变化
watch(() => props.data, (newData) => {
  if (newData && props.visible) {
    fillProjectData(newData)
    fetchTrackingData(newData.id)
  }
})
</script>

<style scoped>
.detail-content {
  padding: 20px;
}

.base-info,
.tracking-info {
  margin-bottom: 30px;
}

h3 {
  margin-bottom: 16px;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.track-type {
  font-weight: 500;
  color: #303133;
}

.tracker {
  color: #909399;
  font-size: 14px;
}

.track-content {
  line-height: 1.6;
}

.time-range,
.key-user,
.track-info {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  color: #606266;
}

.time-range .el-icon,
.key-user .el-icon,
.track-info .el-icon {
  margin-right: 8px;
  margin-top: 2px;
}

.info-content {
  flex: 1;
  white-space: pre-wrap;
  word-break: break-all;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

.drawer-footer {
  padding: 20px;
  text-align: right;
  border-top: 1px solid #ebeef5;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
}

:deep(.el-timeline-item__timestamp) {
  color: #909399;
}
</style>