<template>
  <div class="workplace-container">
    <el-row :gutter="16">
      <!-- 我的任务 -->
      <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <el-card class="workplace-card">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span class="card-logo">📋</span>
                <span class="card-title">我的任务</span>
              </div>
              <div class="header-right">
                <el-select
                  v-model="projectId"
                  placeholder="选择项目"
                  size="small"
                  style="width: 120px; margin-right: 8px;"
                  clearable
                  @change="handleProjectChange"
                >
                  <el-option
                    v-for="item in projectOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <el-date-picker
                  v-model="selectedDate"
                  type="date"
                  placeholder="选择日期"
                  size="small"
                  style="width: 140px;"
                  clearable
                  @change="handleDateChange"
                />
              </div>
            </div>
          </template>
          <div class="card-content">
            <MyTasks :project-id="projectId" :date="selectedDate" />
          </div>
        </el-card>
      </el-col>

      <!-- 我的软件 -->
      <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <el-card class="workplace-card">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span class="card-logo">💻</span>
                <span class="card-title">我的软件</span>
              </div>
              <div class="header-right">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="$refs.mySoftRef.handleAddSoftware()"
                >
                  添加软件
                </el-button>
              </div>
            </div>
          </template>
          <div class="card-content">
            <MySoft ref="mySoftRef" />
          </div>
        </el-card>
      </el-col>

      <!-- 有问必答 -->
      <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <el-card class="workplace-card">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span class="card-logo">❓</span>
                <span class="card-title">有问必答</span>
              </div>
              <div class="header-right">
                <!-- 有问必答的操作按钮或选择器可以放在这里 -->
              </div>
            </div>
          </template>
          <div class="card-content">
            <MyQA />
          </div>
        </el-card>
      </el-col>

      <!-- 我的日程 -->
      <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <el-card class="workplace-card">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span class="card-logo">📅</span>
                <span class="card-title">我的日程</span>
              </div>
              <div class="header-right">
                <!-- 我的日程的操作按钮或选择器可以放在这里 -->
              </div>
            </div>
          </template>
          <div class="card-content">
            <MySchedule />
          </div>
        </el-card>
      </el-col>

      <!-- 软件使用权限 -->
      <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <el-card class="workplace-card">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span class="card-logo">🔑</span>
                <span class="card-title">软件使用权限</span>
              </div>
              <div class="header-right">
                <!-- 软件使用权限的操作按钮或选择器可以放在这里 -->
              </div>
            </div>
          </template>
          <div class="card-content">
            <!-- 软件使用权限内容 -->
          </div>
        </el-card>
      </el-col>

      <!-- 我的打分 -->
      <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <el-card class="workplace-card">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span class="card-logo">⭐</span>
                <span class="card-title">我的打分</span>
              </div>
              <div class="header-right">
                <!-- 我的打分的操作按钮或选择器可以放在这里 -->
              </div>
            </div>
          </template>
          <div class="card-content">
            <!-- 我的打分内容 -->
          </div>
        </el-card>
      </el-col>

      <!-- 我的勋章 -->
      <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <el-card class="workplace-card">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span class="card-logo">🏆</span>
                <span class="card-title">我的勋章</span>
              </div>
              <div class="header-right">
                <!-- 我的勋章的操作按钮或选择器可以放在这里 -->
              </div>
            </div>
          </template>
          <div class="card-content">
            <!-- 我的勋章内容 -->
          </div>
        </el-card>
      </el-col>

      <!-- 我的等级 -->
      <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
        <el-card class="workplace-card">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span class="card-logo">📊</span>
                <span class="card-title">我的等级</span>
              </div>
              <div class="header-right">
                <!-- 我的等级的操作按钮或选择器可以放在这里 -->
              </div>
            </div>
          </template>
          <div class="card-content">
            <!-- 我的等级内容 -->
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MyTasks from './MyTasks.vue'
import MySoft from './mySoft.vue'
import MyQA from './myQA.vue'
import MySchedule from './mySchedule.vue'

// 项目ID和时间参数
const projectId = ref('')
const selectedDate = ref('')

// 项目选项（可以根据实际需求从API获取）
const projectOptions = ref([
  { label: '项目A', value: 'project-a' },
  { label: '项目B', value: 'project-b' },
  { label: '项目C', value: 'project-c' },
  { label: '项目D', value: 'project-d' }
])

// 监听选择器变化
const handleProjectChange = (value) => {
  console.log('选择的项目:', value)
  // 这里可以触发数据重新加载
}

const handleDateChange = (value) => {
  console.log('选择的日期:', value)
  // 这里可以触发数据重新加载
}

// 这里可以添加每个模块的具体逻辑
</script>

<style scoped>
.workplace-container {
}

.workplace-card {
  margin-bottom: 16px;
  min-height: 200px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-right {
  display: flex;
  align-items: center;
}

.card-logo {
  font-size: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
}

.card-content {
  min-height: 200px;
  padding: 0;
}
</style>