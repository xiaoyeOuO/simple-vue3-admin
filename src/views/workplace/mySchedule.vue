<template>
  <div class="schedule-container">
    <div class="schedule-header">
      <!-- 左侧：新建日程按钮 -->
      <div class="header-left">
        <el-button type="primary" size="default" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          新建日程
        </el-button>
      </div>
      
      <!-- 中间：月份导航 -->
      <div class="header-center">
        <div class="month-navigation">
          <el-button 
            size="small" 
            circle 
            @click="prev"
            :icon="ArrowLeft"
          />
          <span class="current-month">{{ currentMonth }}</span>
          <el-button 
            size="small" 
            circle 
            @click="next"
            :icon="ArrowRight"
          />
        </div>
        <el-button size="small" @click="today" class="today-btn">今天</el-button>
      </div>
      
      <!-- 右侧：视图切换 -->
      <div class="header-right">
        <el-radio-group v-model="viewType" size="small" @change="changeView">
          <el-radio-button label="dayGridMonth">月</el-radio-button>
          <el-radio-button label="timeGridWeek">周</el-radio-button>
          <el-radio-button label="timeGridDay">日</el-radio-button>
          <el-radio-button label="listWeek">列表</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    
    <FullCalendar
      ref="fullCalendar"
      :options="calendarOptions"
      class="full-calendar"
    />

    <!-- 日程详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="日程详情"
      width="600px"
      :close-on-click-modal="true"
    >
      <div v-if="currentEvent" class="event-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="日程名称">{{ currentEvent.title }}</el-descriptions-item>
          <el-descriptions-item label="参与人">
            <el-tag
              v-for="participant in currentEvent.participants"
              :key="participant"
              size="small"
              style="margin-right: 8px"
            >
              {{ participant }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ formatDateTime(currentEvent.start) }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ formatDateTime(currentEvent.end) }}</el-descriptions-item>
          <el-descriptions-item label="地点" v-if="currentEvent.location">{{ currentEvent.location }}</el-descriptions-item>
        </el-descriptions>
        
        <div v-if="currentEvent.description" class="description-section">
          <h4>描述</h4>
          <div class="description-content" v-html="currentEvent.description"></div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="editCurrentEvent">编辑</el-button>
        <el-button type="danger" @click="deleteCurrentEvent">删除</el-button>
      </template>
    </el-dialog>

    <!-- 添加/编辑日程对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑日程' : '添加日程'"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="scheduleForm" label-width="100px">
        <el-form-item label="日程名称" required>
          <el-input v-model="scheduleForm.title" placeholder="请输入日程名称" />
        </el-form-item>
        
        <el-form-item label="参与人">
          <el-select
            v-model="scheduleForm.participants"
            multiple
            filterable
            allow-create
            placeholder="请选择或输入参与人"
            style="width: 100%"
          >
            <el-option label="张三" value="张三" />
            <el-option label="李四" value="李四" />
            <el-option label="王五" value="王五" />
            <el-option label="赵六" value="赵六" />
          </el-select>
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" required>
              <el-date-picker
                v-model="scheduleForm.start"
                type="datetime"
                placeholder="选择开始时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" required>
              <el-date-picker
                v-model="scheduleForm.end"
                type="datetime"
                placeholder="选择结束时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="地点">
          <el-input v-model="scheduleForm.location" placeholder="请输入地点" />
        </el-form-item>
        
        <el-form-item label="描述">
          <div class="wangeditor-wrapper">
            <Toolbar
              :editor="editorRef"
              :defaultConfig="toolbarConfig"
              mode="default"
              class="wangeditor-toolbar"
            />
            <Editor
              :defaultConfig="editorConfig"
              v-model="scheduleForm.description"
              @onCreated="handleCreated"
              class="wangeditor-editor"
            />
          </div>
        </el-form-item>
        
        <el-form-item label="颜色">
          <el-color-picker v-model="scheduleForm.color" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSchedule">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount, computed, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import zhCnLocale from '@fullcalendar/core/locales/zh-cn'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { Plus, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { Lunar } from 'lunar-javascript'

const fullCalendar = ref()
const dialogVisible = ref(false)
const detailVisible = ref(false)
const viewType = ref('dayGridMonth')
const isEdit = ref(false)
const currentEventId = ref(null)
const currentEvent = ref(null)
const currentDate = ref(new Date()) // 添加当前日期状态

// 当前月份显示
const currentMonth = computed(() => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long'
  }).format(currentDate.value)
})

// wangEditor相关
const editorRef = ref()
const editorConfig = {
  placeholder: '请输入日程描述...',
  readOnly: false,
  autoFocus: false,
  scroll: true,
  maxLength: 5000,
  MENU_CONF: {
    uploadImage: {
      server: '/api/upload', // 后续可以替换为真实的上传接口
      fieldName: 'file',
      maxFileSize: 2 * 1024 * 1024, // 2M
      allowedFileTypes: ['image/*'],
      metaWithUrl: true,
      withCredentials: true,
      timeout: 5 * 1000, // 5秒
      onBeforeUpload: (file) => {
        console.log('准备上传图片:', file.name)
        return true
      },
      onSuccess: (file, res) => {
        console.log('图片上传成功:', res)
      },
      onFailed: (file, res) => {
        console.error('图片上传失败:', res)
      },
      onError: (file, err, res) => {
        console.error('图片上传出错:', err, res)
      }
    }
  }
}
const toolbarConfig = {
  toolbarKeys: [
    'headerSelect',
    'blockquote',
    '|',
    'bold',
    'underline',
    'italic',
    {
      key: 'group-more-style',
      title: '更多',
      iconSvg: '<svg viewBox="0 0 1024 1024"><path d="M1024 512c0 282.77-229.23 512-512 512S0 794.77 0 512 229.23 0 512 0s512 229.23 512 512z"></path></svg>',
      menuKeys: ['through', 'code', 'sup', 'sub', 'clearStyle']
    },
    'color',
    'bgColor',
    '|',
    'fontSize',
    'fontFamily',
    'lineHeight',
    '|',
    'bulletedList',
    'numberedList',
    'todo',
    {
      key: 'group-justify',
      title: '对齐',
      iconSvg: '<svg viewBox="0 0 1024 1024"><path d="M1024 512c0 282.77-229.23 512-512 512S0 794.77 0 512 229.23 0 512 0s512 229.23 512 512z"></path></svg>',
      menuKeys: ['justifyLeft', 'justifyRight', 'justifyCenter', 'justifyJustify']
    },
    '|',
    'emotion',
    'insertLink',
    'insertTable',
    'codeBlock',
    'divider',
    '|',
    'undo',
    'redo',
    'fullScreen'
  ]
}

const scheduleForm = reactive({
  title: '',
  participants: [],
  start: '',
  end: '',
  location: '',
  description: '',
  color: '#409EFF'
})

// 模拟日程数据
const events = ref([
  {
    id: '1',
    title: '项目会议',
    start: '2024-01-15T10:00:00',
    end: '2024-01-15T11:30:00',
    color: '#409EFF',
    participants: ['张三', '李四', '王五'],
    location: '会议室A',
    description: '<p><strong>讨论要点：</strong></p><ul><li>项目进度汇报</li><li>技术难点讨论</li><li>下阶段工作安排</li></ul>'
  },
  {
    id: '2',
    title: '客户拜访',
    start: '2024-01-16T14:00:00',
    end: '2024-01-16T16:00:00',
    color: '#67C23A',
    participants: ['赵六', '钱七'],
    location: '客户办公室',
    description: '<p>拜访<strong>ABC公司</strong>，讨论合作事宜</p><p>主要议题：</p><ol><li>产品介绍</li><li>合作模式</li><li>合同条款</li></ol>'
  },
  {
    id: '3',
    title: '产品评审',
    start: '2024-01-17T09:00:00',
    end: '2024-01-17T12:00:00',
    color: '#E6A23C',
    participants: ['全体成员'],
    location: '大会议室',
    description: '<p><span style="color: #e6a23c;">重要提醒：</span>请提前准备评审材料</p><p>评审内容：</p><ul><li>功能设计</li><li>UI界面</li><li>性能指标</li></ul>'
  },
  {
    id: '4',
    title: '团队建设',
    start: '2024-01-18T15:00:00',
    end: '2024-01-18T17:00:00',
    color: '#F56C6C',
    participants: ['技术部', '产品部', '运营部'],
    location: '活动中心',
    description: '<p><em>增强团队凝聚力，提升协作效率</em></p><p>活动安排：</p><ul><li>15:00-16:00 团建游戏</li><li>16:00-17:00 经验分享</li></ul>'
  }
])

const calendarOptions = reactive({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: 'dayGridMonth',
  locale: zhCnLocale,
  headerToolbar: false,
  events: events.value,
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventDrop: handleEventDrop,
  eventResize: handleEventResize,
  datesSet: handleDatesSet, // 添加日期变化监听
  dayCellContent: dayCellContent, // 自定义日期单元格内容
  buttonText: {
    today: '今天',
    month: '月',
    week: '周',
    day: '日',
    list: '列表'
  },
  allDayText: '全天',
  moreLinkText: '更多',
  noEventsText: '暂无日程'
})

// 日期选择处理
function handleDateSelect(selectInfo) {
  // 重置为添加模式
  isEdit.value = false
  currentEventId.value = null
  
  // 重置表单
  scheduleForm.title = ''
  scheduleForm.participants = []
  scheduleForm.start = selectInfo.startStr
  scheduleForm.end = selectInfo.endStr
  scheduleForm.location = ''
  scheduleForm.description = ''
  scheduleForm.color = '#409EFF'
  
  dialogVisible.value = true
  
  // 清除选择
  const calendarApi = selectInfo.view.calendar
  calendarApi.unselect()
}

// 日期范围变化处理
function handleDatesSet(dateInfo) {
  // 更新当前日期
  currentDate.value = dateInfo.start
}

// 事件点击处理
function handleEventClick(clickInfo) {
  const event = clickInfo.event
  
  // 查找对应的事件数据
  const eventData = events.value.find(e => e.id === event.id)
  if (!eventData) return
  
  // 显示详情弹窗
  currentEvent.value = eventData
  detailVisible.value = true
}

// 编辑当前事件
function editCurrentEvent() {
  detailVisible.value = false
  
  if (!currentEvent.value) return
  
  // 设置为编辑模式
  isEdit.value = true
  currentEventId.value = currentEvent.value.id
  
  // 填充表单数据
  scheduleForm.title = currentEvent.value.title
  scheduleForm.participants = currentEvent.value.participants || []
  scheduleForm.start = currentEvent.value.start
  scheduleForm.end = currentEvent.value.end
  scheduleForm.location = currentEvent.value.location || ''
  scheduleForm.description = currentEvent.value.description || ''
  scheduleForm.color = currentEvent.value.color || '#409EFF'
  
  dialogVisible.value = true
}

// 删除当前事件
function deleteCurrentEvent() {
  if (!currentEvent.value) return
  
  if (confirm(`确定要删除日程 "${currentEvent.value.title}" 吗？`)) {
    const calendarApi = fullCalendar.value.getApi()
    const event = calendarApi.getEventById(currentEvent.value.id)
    if (event) {
      event.remove()
    }
    
    // 从数据中删除
    const index = events.value.findIndex(e => e.id === currentEvent.value.id)
    if (index !== -1) {
      events.value.splice(index, 1)
    }
    
    detailVisible.value = false
    currentEvent.value = null
  }
}

// 格式化日期时间
function formatDateTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取农历信息
function getLunarInfo(date) {
  const lunar = Lunar.fromDate(date)
  const day = lunar.getDay()
  const month = lunar.getMonth()
  
  // 农历月份名称
  const monthNames = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']
  // 农历日子名称
  const dayNames = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                   '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                   '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']
  
  const monthName = monthNames[month - 1] || ''
  const dayName = dayNames[day - 1] || ''
  
  // 获取节日信息
  const festivals = lunar.getFestivals()
  const otherFestivals = lunar.getOtherFestivals()
  
  // 定义传统节日和节气列表
  const traditionalFestivals = [
    '春节', '元宵节', '龙抬头', '清明节', '端午节', '七夕节', '中元节', '中秋节', '重阳节', '腊八节', '小年', '除夕',
    '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
    '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
  ]
  
  // 特殊日子处理：只显示传统节日和节气
  if (festivals && festivals.length > 0) {
    const festival = festivals[0]
    if (traditionalFestivals.includes(festival)) {
      return festival
    }
  }
  
  if (day === 1) {
    return `${monthName}月`
  }
  
  // 返回农历日期
  return dayName
}

// 自定义日期单元格内容
function dayCellContent(info) {
  const date = info.date
  const day = date.getDate()
  const lunarInfo = getLunarInfo(date)
  
  // 检查是否是节日
  const lunar = Lunar.fromDate(date)
  const festivals = lunar.getFestivals()
  const otherFestivals = lunar.getOtherFestivals()
  
  // 定义传统节日和节气列表
  const traditionalFestivals = [
    '春节', '元宵节', '龙抬头', '清明节', '端午节', '七夕节', '中元节', '中秋节', '重阳节', '腊八节', '小年', '除夕',
    '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
    '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
  ]
  
  // 判断是否为传统节日
  let isFestival = false
  if (festivals && festivals.length > 0) {
    isFestival = traditionalFestivals.includes(festivals[0])
  }
  if (!isFestival && otherFestivals && otherFestivals.length > 0) {
    isFestival = traditionalFestivals.includes(otherFestivals[0])
  }
  
  return {
    html: `<div class="day-cell ${isFestival ? 'festival' : ''}">
      <div class="day-cell-header">
        <div class="solar-day">${day}</div>
        <div class="lunar-day ${isFestival ? 'festival-text' : ''}">${lunarInfo}</div>
      </div>
    </div>`
  }
}

// 事件拖拽处理
function handleEventDrop(dropInfo) {
  console.log('事件已移动:', dropInfo.event.title)
}

// 事件大小调整处理
function handleEventResize(resizeInfo) {
  console.log('事件已调整大小:', resizeInfo.event.title)
}

// 保存日程（添加或编辑）
function saveSchedule() {
  if (!scheduleForm.title) {
    alert('请输入日程名称')
    return
  }
  
  if (!scheduleForm.start || !scheduleForm.end) {
    alert('请选择开始和结束时间')
    return
  }
  
  const calendarApi = fullCalendar.value.getApi()
  
  if (isEdit.value && currentEventId.value) {
    // 编辑模式
    const eventIndex = events.value.findIndex(e => e.id === currentEventId.value)
    if (eventIndex !== -1) {
      // 更新数据
      events.value[eventIndex] = {
        ...events.value[eventIndex],
        title: scheduleForm.title,
        participants: scheduleForm.participants,
        start: scheduleForm.start,
        end: scheduleForm.end,
        location: scheduleForm.location,
        description: scheduleForm.description,
        color: scheduleForm.color
      }
      
      // 更新日历事件
      const event = calendarApi.getEventById(currentEventId.value)
      if (event) {
        event.setProp('title', scheduleForm.title)
        event.setStart(scheduleForm.start)
        event.setEnd(scheduleForm.end)
        event.setProp('color', scheduleForm.color)
      }
    }
  } else {
    // 添加模式
    const newEvent = {
      id: Date.now().toString(),
      title: scheduleForm.title,
      participants: scheduleForm.participants,
      start: scheduleForm.start,
      end: scheduleForm.end,
      location: scheduleForm.location,
      description: scheduleForm.description,
      color: scheduleForm.color
    }
    
    events.value.push(newEvent)
    calendarApi.addEvent(newEvent)
  }
  
  // 重置表单
  resetForm()
  dialogVisible.value = false
}

// 重置表单
function resetForm() {
  scheduleForm.title = ''
  scheduleForm.participants = []
  scheduleForm.start = ''
  scheduleForm.end = ''
  scheduleForm.location = ''
  scheduleForm.description = ''
  scheduleForm.color = '#409EFF'
  isEdit.value = false
  currentEventId.value = null
}

// 视图切换
function changeView(newViewType) {
  const calendarApi = fullCalendar.value.getApi()
  calendarApi.changeView(newViewType)
  viewType.value = newViewType
  
  // 切换到非月视图时，确保选中今天所在的周、日或列表
  if (newViewType !== 'dayGridMonth') {
    // 延迟一下确保视图切换完成
    setTimeout(() => {
      const today = new Date()
      calendarApi.gotoDate(today)
      // 更新当前日期显示
      currentDate.value = today
    }, 100)
  }
}

// 导航功能
function prev() {
  const calendarApi = fullCalendar.value.getApi()
  calendarApi.prev()
  // 更新当前日期
  currentDate.value = calendarApi.getDate()
}

function next() {
  const calendarApi = fullCalendar.value.getApi()
  calendarApi.next()
  // 更新当前日期
  currentDate.value = calendarApi.getDate()
}

function today() {
  const calendarApi = fullCalendar.value.getApi()
  calendarApi.today()
  // 更新当前日期
  currentDate.value = calendarApi.getDate()
}

// wangEditor创建回调
function handleCreated(editor) {
  editorRef.value = editor
}

// 组件挂载时确保显示当前月份
onMounted(() => {
  // 确保currentDate是当前日期，而不是日历视图的开始日期
  currentDate.value = new Date()
})

// 组件卸载时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

// 显示添加日程对话框
function showAddDialog() {
  resetForm()
  dialogVisible.value = true
}
</script>

<style>
/* wangEditor基础样式 - 全局导入避免样式隔离问题 */
@import '@wangeditor/editor/dist/css/style.css';
</style>

<style scoped>

.schedule-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header-left {
  flex: 0 0 auto;
}

.header-center {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 12px;
}

.current-month {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  min-width: 120px;
  text-align: center;
}

.today-btn {
  margin-left: 12px;
}

.header-right {
  flex: 0 0 auto;
}

.full-calendar {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 自定义FullCalendar样式 */
:deep(.fc-toolbar-chunk) {
  display: flex;
  align-items: center;
}

:deep(.fc-button) {
  background: #409EFF;
  border-color: #409EFF;
  color: #fff;
}

:deep(.fc-button:hover) {
  background: #66b1ff;
  border-color: #66b1ff;
}

:deep(.fc-button-primary:not(:disabled)):active {
  background: #3a8ee6;
  border-color: #3a8ee6;
}

:deep(.fc-button-primary:disabled) {
  background: #a0cfff;
  border-color: #a0cfff;
}

:deep(.fc-event) {
  cursor: pointer;
  border-radius: 4px;
  padding: 2px 4px;
  font-size: 12px;
}

:deep(.fc-day-today) {
  background: rgba(64, 158, 255, 0.1);
}

:deep(.fc-daygrid-day:hover) {
  background: #f5f7fa;
}

:deep(.fc-highlight) {
  background: rgba(64, 158, 255, 0.2);
}

/* 农历日期样式 */
.day-cell {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 4px;
}

.day-cell-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  padding: 2px 4px;
}

.solar-day {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  line-height: 1.2;
}

.lunar-day {
  font-size: 10px;
  color: #909399;
  line-height: 1.2;
}

/* 今日的特殊样式 */
:deep(.fc-day-today .day-cell-header .solar-day) {
  color: #409EFF;
  font-weight: 600;
}

:deep(.fc-day-today .day-cell-header .lunar-day) {
  color: #409EFF;
}

/* 周末的农历样式 */
:deep(.fc-day-sat .day-cell-header .lunar-day),
:deep(.fc-day-sun .day-cell-header .lunar-day) {
  color: #F56C6C;
}

/* 日期单元格悬停效果 */
:deep(.fc-daygrid-day:hover) .day-cell {
  background: rgba(64, 158, 255, 0.05);
  border-radius: 4px;
}

/* 节日特殊样式 */
.day-cell.festival {
  background: rgba(245, 108, 108, 0.1);
  border-radius: 4px;
}

.day-cell-header .lunar-day.festival-text {
  color: #F56C6C;
  font-weight: 600;
}

/* 详情弹窗样式 */
.event-detail {
  padding: 0 20px;
}

.description-section {
  margin-top: 20px;
}

.description-section h4 {
  margin-bottom: 12px;
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.description-content {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  max-height: 200px;
  overflow-y: auto;
  line-height: 1.6;
}

.description-content:empty::after {
  content: '暂无描述';
  color: #909399;
  font-style: italic;
}

/* wangEditor自定义样式 */
.wangeditor-wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.wangeditor-toolbar {
  border-bottom: 1px solid #dcdfe6 !important;
}

.wangeditor-editor {
  height: 200px !important;
  overflow-y: hidden;
}

/* 修复wangEditor在scoped样式下的显示问题 */
:deep(.w-e-toolbar) {
  border-bottom: 1px solid #dcdfe6 !important;
}

:deep(.w-e-text-container) {
  min-height: 200px !important;
}

:deep(.w-e-text-container .w-e-scroll) {
  min-height: 200px !important;
}

:deep(.w-e-text-container [data-slate-editor]) {
  min-height: 180px !important;
  padding: 10px !important;
}
</style>