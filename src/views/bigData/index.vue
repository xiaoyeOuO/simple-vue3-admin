<template>
  <div class="big-data-page">
    <div class="page-header">
      <h1>大数据展示页面</h1>
      <div class="header-controls">
        <el-dropdown @command="handleColumnCommand">
          <el-button type="primary">
            <el-icon><Setting /></el-icon>
            列设置
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="toggleId">
                <el-checkbox v-model="columnsVisible.id" @click.stop>ID列</el-checkbox>
              </el-dropdown-item>
              <el-dropdown-item command="toggleIntroduction">
                <el-checkbox v-model="columnsVisible.introduction" @click.stop>简介列</el-checkbox>
              </el-dropdown-item>
              <el-dropdown-item command="toggleAddress">
                <el-checkbox v-model="columnsVisible.address" @click.stop>地址列</el-checkbox>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button type="success" @click="generateData">
          <el-icon><Refresh /></el-icon>
          重新生成数据
        </el-button>
      </div>
    </div>

    <div class="table-container">
      <el-auto-resizer>
        <template #default="{ height, width }">
          <el-table-v2
            :columns="dynamicColumns"
            :data="tableData"
            :width="width"
            :height="height"
            :row-height="60"
            fixed
            :merge-cells="mergeCells"
          />
        </template>
      </el-auto-resizer>
    </div>

    <div class="stats-info">
      <el-card>
        <div class="stats-content">
          <div class="stat-item">
            <span class="label">总数据量：</span>
            <span class="value">{{ tableData.length }} 条</span>
          </div>
          <div class="stat-item">
            <span class="label">分类数量：</span>
            <span class="value">{{ categoryCount }} 个</span>
          </div>
          <div class="stat-item">
            <span class="label">模块数量：</span>
            <span class="value">{{ moduleCount }} 个</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { ElTableV2, ElButton, ElDropdown, ElDropdownMenu, ElDropdownItem, ElCheckbox, ElCard, ElAutoResizer, ElIcon } from 'element-plus'
import { Setting, Refresh } from '@element-plus/icons-vue'

// 动态列显示控制
const columnsVisible = ref({
  id: true,
  introduction: true,
  address: true
})

// 表格数据
const tableData = ref([])

// 生成模拟数据
const generateMockData = () => {
  const categories = ['前端开发', '后端开发', '数据库', '运维部署', '测试管理']
  const modules = {
    '前端开发': ['Vue3组件', 'React组件', 'Angular模块', '小程序组件'],
    '后端开发': ['Spring Boot', 'Node.js服务', 'Python API', 'Go微服务'],
    '数据库': ['MySQL优化', 'Redis缓存', 'MongoDB文档', 'PostgreSQL'],
    '运维部署': ['Docker容器', 'Kubernetes集群', 'CI/CD流水线', '监控系统'],
    '测试管理': ['单元测试', '集成测试', '性能测试', '自动化测试']
  }
  const subModules = {
    'Vue3组件': ['组合式API', '响应式系统', '组件通信', '状态管理'],
    'React组件': ['Hooks', 'Context API', 'Redux', 'Router'],
    'Spring Boot': ['控制器', '服务层', '数据访问', '安全配置'],
    'MySQL优化': ['索引优化', '查询优化', '表结构设计', '性能监控']
  }
  const features = {
    '组合式API': ['ref响应式', 'reactive响应式', 'computed计算', 'watch监听'],
    '响应式系统': ['依赖收集', '派发更新', '虚拟DOM', 'diff算法'],
    '控制器': ['RESTful API', '参数验证', '异常处理', '拦截器'],
    '索引优化': ['B+树索引', '哈希索引', '全文索引', '复合索引']
  }
  const detailedFeatures = {
    'ref响应式': ['基本类型响应式', '对象响应式', '数组响应式', '深度响应式'],
    'RESTful API': ['GET请求', 'POST请求', 'PUT请求', 'DELETE请求'],
    'B+树索引': ['聚簇索引', '非聚簇索引', '覆盖索引', '索引下推']
  }

  const data = []
  let idCounter = 1

  categories.forEach(category => {
    const categoryModules = modules[category] || [`${category}模块1`, `${category}模块2`]
    categoryModules.forEach(module => {
      const moduleSubModules = subModules[module] || [`${module}子模块1`, `${module}子模块2`]
      moduleSubModules.forEach(subModule => {
        const subModuleFeatures = features[subModule] || [`${subModule}功能1`, `${subModule}功能2`]
        subModuleFeatures.forEach(feature => {
          const featureDetails = detailedFeatures[feature] || [`${feature}细分1`, `${feature}细分2`]
          featureDetails.forEach(detail => {
            // 为每个组合生成多条数据
            for (let i = 0; i < 5 + Math.floor(Math.random() * 10); i++) {
              data.push({
                id: idCounter++,
                category,
                module,
                subModule,
                feature,
                detail,
                introduction: `${detail}的详细介绍，包含技术实现、性能优化、最佳实践等内容。这是一个关于${category}领域的重要知识点。`,
                address: `https://docs.example.com/${category.toLowerCase()}/${module.toLowerCase()}/${detail.toLowerCase().replace(/\s+/g, '-')}`,
                level: Math.floor(Math.random() * 5) + 1,
                complexity: ['简单', '中等', '困难'][Math.floor(Math.random() * 3)],
                status: ['未开始', '进行中', '已完成'][Math.floor(Math.random() * 3)]
              })
            }
          })
        })
      })
    })
  })

  // 确保至少有1000条数据
  while (data.length < 1000) {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)]
    const randomModule = modules[randomCategory][Math.floor(Math.random() * modules[randomCategory].length)]
    const randomSubModule = subModules[randomModule] ? subModules[randomModule][Math.floor(Math.random() * subModules[randomModule].length)] : `${randomModule}子模块`
    const randomFeature = features[randomSubModule] ? features[randomSubModule][Math.floor(Math.random() * features[randomSubModule].length)] : `${randomSubModule}功能`
    const randomDetail = detailedFeatures[randomFeature] ? detailedFeatures[randomFeature][Math.floor(Math.random() * detailedFeatures[randomFeature].length)] : `${randomFeature}细分`
    
    data.push({
      id: idCounter++,
      category: randomCategory,
      module: randomModule,
      subModule: randomSubModule,
      feature: randomFeature,
      detail: randomDetail,
      introduction: `${randomDetail}的详细介绍，包含技术实现、性能优化、最佳实践等内容。`,
      address: `https://docs.example.com/${randomCategory.toLowerCase()}/${randomModule.toLowerCase()}/${randomDetail.toLowerCase().replace(/\s+/g, '-')}`,
      level: Math.floor(Math.random() * 5) + 1,
      complexity: ['简单', '中等', '困难'][Math.floor(Math.random() * 3)],
      status: ['未开始', '进行中', '已完成'][Math.floor(Math.random() * 3)]
    })
  }

  return data.slice(0, 1200) // 确保在1200条左右
}

// 合并单元格计算
const mergeCells = computed(() => {
  const merges = []
  if (!tableData.value.length) return merges

  // 按category、module、subModule、feature、detail分组
  let currentCategory = ''
  let currentModule = ''
  let currentSubModule = ''
  let currentFeature = ''
  let currentDetail = ''

  let categoryStart = 0
  let moduleStart = 0
  let subModuleStart = 0
  let featureStart = 0
  let detailStart = 0

  tableData.value.forEach((row, index) => {
    // 分类合并
    if (row.category !== currentCategory) {
      if (index > categoryStart) {
        merges.push({ row: categoryStart, col: 0, rowspan: index - categoryStart, colspan: 1 })
      }
      currentCategory = row.category
      categoryStart = index
      moduleStart = index
      subModuleStart = index
      featureStart = index
      detailStart = index
    }

    // 模块合并
    if (row.module !== currentModule) {
      if (index > moduleStart) {
        merges.push({ row: moduleStart, col: 1, rowspan: index - moduleStart, colspan: 1 })
      }
      currentModule = row.module
      moduleStart = index
      subModuleStart = index
      featureStart = index
      detailStart = index
    }

    // 子模块合并
    if (row.subModule !== currentSubModule) {
      if (index > subModuleStart) {
        merges.push({ row: subModuleStart, col: 2, rowspan: index - subModuleStart, colspan: 1 })
      }
      currentSubModule = row.subModule
      subModuleStart = index
      featureStart = index
      detailStart = index
    }

    // 功能点合并
    if (row.feature !== currentFeature) {
      if (index > featureStart) {
        merges.push({ row: featureStart, col: 3, rowspan: index - featureStart, colspan: 1 })
      }
      currentFeature = row.feature
      featureStart = index
      detailStart = index
    }

    // 细分功能点合并
    if (row.detail !== currentDetail) {
      if (index > detailStart) {
        merges.push({ row: detailStart, col: 4, rowspan: index - detailStart, colspan: 1 })
      }
      currentDetail = row.detail
      detailStart = index
    }
  })

  // 添加最后的合并
  const lastIndex = tableData.value.length - 1
  if (lastIndex >= categoryStart) {
    merges.push({ row: categoryStart, col: 0, rowspan: lastIndex - categoryStart + 1, colspan: 1 })
  }
  if (lastIndex >= moduleStart) {
    merges.push({ row: moduleStart, col: 1, rowspan: lastIndex - moduleStart + 1, colspan: 1 })
  }
  if (lastIndex >= subModuleStart) {
    merges.push({ row: subModuleStart, col: 2, rowspan: lastIndex - subModuleStart + 1, colspan: 1 })
  }
  if (lastIndex >= featureStart) {
    merges.push({ row: featureStart, col: 3, rowspan: lastIndex - featureStart + 1, colspan: 1 })
  }
  if (lastIndex >= detailStart) {
    merges.push({ row: detailStart, col: 4, rowspan: lastIndex - detailStart + 1, colspan: 1 })
  }

  return merges
})

// 动态列配置
const dynamicColumns = computed(() => {
  const baseColumns = [
    {
      key: 'category',
      dataKey: 'category',
      title: '分类',
      width: 120,
      cellRenderer: ({ cellData }) => {
        return h('div', { 
          style: { 
            fontWeight: 'bold', 
            color: '#409EFF',
            padding: '8px',
            backgroundColor: '#f0f9ff',
            borderRadius: '4px'
          } 
        }, cellData)
      }
    },
    {
      key: 'module',
      dataKey: 'module',
      title: '模块',
      width: 150,
      cellRenderer: ({ cellData }) => {
        return h('div', { 
          style: { 
            fontWeight: '600', 
            color: '#67C23A',
            padding: '8px'
          } 
        }, cellData)
      }
    },
    {
      key: 'subModule',
      dataKey: 'subModule',
      title: '子模块',
      width: 140,
      cellRenderer: ({ cellData }) => {
        return h('div', { 
          style: { 
            fontWeight: '500', 
            color: '#E6A23C',
            padding: '8px'
          } 
        }, cellData)
      }
    },
    {
      key: 'feature',
      dataKey: 'feature',
      title: '功能点',
      width: 130,
      cellRenderer: ({ cellData }) => {
        return h('div', { 
          style: { 
            color: '#909399',
            padding: '8px'
          } 
        }, cellData)
      }
    },
    {
      key: 'detail',
      dataKey: 'detail',
      title: '细分功能点',
      width: 150,
      cellRenderer: ({ cellData }) => {
        return h('div', { 
          style: { 
            color: '#606266',
            padding: '8px'
          } 
        }, cellData)
      }
    }
  ]

  const dynamicCols = []

  if (columnsVisible.value.id) {
    dynamicCols.push({
      key: 'id',
      dataKey: 'id',
      title: 'ID',
      width: 80,
      align: 'center',
      cellRenderer: ({ cellData }) => {
        return h('div', { 
          style: { 
            fontWeight: 'bold',
            color: '#409EFF'
          } 
        }, cellData)
      }
    })
  }

  if (columnsVisible.value.introduction) {
    dynamicCols.push({
      key: 'introduction',
      dataKey: 'introduction',
      title: '简介',
      width: 300,
      cellRenderer: ({ cellData }) => {
        return h('div', { 
          style: { 
            color: '#606266',
            padding: '8px',
            lineHeight: '1.5'
          } 
        }, cellData)
      }
    })
  }

  if (columnsVisible.value.address) {
    dynamicCols.push({
      key: 'address',
      dataKey: 'address',
      title: '地址',
      width: 250,
      cellRenderer: ({ cellData }) => {
        return h('a', { 
          href: cellData,
          target: '_blank',
          style: { 
            color: '#409EFF',
            textDecoration: 'none',
            padding: '8px'
          } 
        }, cellData.length > 40 ? cellData.substring(0, 40) + '...' : cellData)
      }
    })
  }

  return [...baseColumns, ...dynamicCols]
})

// 统计数据
const categoryCount = computed(() => {
  const categories = new Set(tableData.value.map(item => item.category))
  return categories.size
})

const moduleCount = computed(() => {
  const modules = new Set(tableData.value.map(item => item.module))
  return modules.size
})

// 列控制方法
const handleColumnCommand = (command) => {
  switch (command) {
    case 'toggleId':
      columnsVisible.value.id = !columnsVisible.value.id
      break
    case 'toggleIntroduction':
      columnsVisible.value.introduction = !columnsVisible.value.introduction
      break
    case 'toggleAddress':
      columnsVisible.value.address = !columnsVisible.value.address
      break
  }
}

// 生成数据
const generateData = () => {
  tableData.value = generateMockData()
}

// 初始化
onMounted(() => {
  generateData()
})
</script>

<style scoped>
.big-data-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.header-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.table-container {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.stats-info {
  margin-top: 20px;
}

.stats-content {
  display: flex;
  gap: 40px;
  padding: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-item .label {
  font-weight: 500;
  color: #606266;
}

.stat-item .value {
  font-weight: bold;
  color: #409EFF;
  font-size: 18px;
}

:deep(.el-table-v2__row) {
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-table-v2__header-cell) {
  background-color: #f5f7fa !important;
  font-weight: 600;
  color: #303133;
}
</style>