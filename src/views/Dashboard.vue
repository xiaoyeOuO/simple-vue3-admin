<template>
  <div class="dashboard">
    <h1>仪表盘</h1>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <div class="card-content">
            <el-icon size="48" color="#409eff"><User /></el-icon>
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
            <el-icon size="48" color="#67c23a"><Document /></el-icon>
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
            <el-icon size="48" color="#e6a23c"><Star /></el-icon>
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
            <el-icon size="48" color="#f56c6c"><View /></el-icon>
            <div>
              <div class="card-number">3,456</div>
              <div class="card-title">浏览总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
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
</style>