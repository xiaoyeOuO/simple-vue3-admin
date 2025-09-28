# 通用问答信息弹窗组件 (CommonInfoDialog)

一个基于 Element Plus 的通用弹窗组件，支持通过 ID 从后端获取问答信息并展示，包括问题内容和回复信息。

## 功能特性

- 🔧 **通用性强**：支持任意 ID 和 API 地址
- 💬 **问答展示**：清晰展示问题内容和多条回复信息
- 🔄 **状态管理**：支持加载中、错误、空数据等状态
- 📱 **响应式设计**：适配不同屏幕尺寸
- 🎨 **美观界面**：集成 Element Plus 样式，区分问题和回复
- ⚡ **性能优化**：支持数据缓存和重复加载检测
- 📅 **时间显示**：自动格式化时间显示

## Props 参数

| 参数名 | 类型 | 默认值 | 必填 | 说明 |
|--------|------|--------|------|------|
| modelValue | Boolean | false | 是 | 控制弹窗显示状态，支持 v-model |
| id | String/Number | - | 是 | 用于获取数据的主键 ID |
| title | String | '详细信息' | 否 | 弹窗标题 |
| apiUrl | String | - | 是 | 后端 API 地址，不包含 ID |

## Events 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:modelValue | Boolean | 弹窗显示状态变化 |
| loaded | Array | 数据加载成功，返回表格数据 |
| error | String | 数据加载失败，返回错误信息 |

## 使用方法

### 基本使用

```vue
<template>
  <div>
    <el-button @click="openDialog" type="primary">
      查看问答详情
    </el-button>
    
    <CommonInfoDialog
      v-model="dialogVisible"
      :id="qaId"
      title="问答详情"
      api-url="/api/qa"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CommonInfoDialog from '@/components/CommonInfoDialog.vue'

const dialogVisible = ref(false)
const qaId = ref('123')

const openDialog = () => {
  dialogVisible.value = true
}
</script>
```

### 高级使用

```vue
<template>
  <div>
    <el-button 
      @click="showProjectInfo" 
      type="primary"
      size="small"
    >
      查看项目详情
    </el-button>
    
    <CommonInfoDialog
      v-model="dialogVisible"
      :id="currentId"
      :title="dialogTitle"
      :api-url="apiEndpoint"
      @loaded="handleDataLoaded"
      @error="handleError"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CommonInfoDialog from '@/components/CommonInfoDialog.vue'

const dialogVisible = ref(false)
const currentId = ref('')
const dialogTitle = ref('项目信息')
const apiEndpoint = ref('/api/projects')

const showProjectInfo = (id) => {
  currentId.value = id
  dialogTitle.value = `项目 ${id} 详情`
  dialogVisible.value = true
}

const handleDataLoaded = (data) => {
  console.log('数据加载完成:', data)
  // 可以在这里处理加载完成后的逻辑
}

const handleError = (error) => {
  console.error('加载失败:', error)
  // 可以在这里处理错误逻辑
}
</script>
```

## API 接口规范

组件支持两种数据返回格式：

### 问答数据格式（推荐）

```json
{
  "code": 200,
  "success": true,
  "message": "成功",
  "data": {
    "question": {
      "content": "这个问题怎么解决？",
      "createTime": "2024-01-15 10:30:00"
    },
    "reply": [
      {
        "content": "这是第一个回复",
        "createTime": "2024-01-15 11:00:00"
      },
      {
        "content": "这是第二个回复",
        "createTime": "2024-01-15 12:00:00"
      }
    ]
  }
}
```

### 兼容旧格式（表格数据）

```json
{
  "code": 200,
  "success": true,
  "message": "成功",
  "data": [
    { "name": "项目名称1" },
    { "name": "项目名称2" },
    { "name": "项目名称3" }
  ]
}
```

## 样式自定义

组件提供了以下 CSS 类名供自定义样式：

- `.dialog-content`：弹窗内容区域
- `.loading-container`：加载状态容器
- `.error-container`：错误状态容器
- `.table-container`：表格容器
- `.empty-container`：空数据状态容器
- `.dialog-footer`：底部按钮区域

## 注意事项

1. **ID 必填**：组件需要有效的 ID 才能加载数据
2. **API 地址**：请确保提供的 API 地址是正确的，且支持 GET 请求
3. **数据格式**：后端返回的数据需要符合预期的格式
4. **错误处理**：组件会自动处理网络错误和数据格式错误
5. **性能考虑**：建议在弹窗关闭时重置状态，避免数据残留

## 更新日志

### v1.0.0
- ✨ 初始版本发布
- 📝 支持基本的弹窗展示和数据加载
- 🎨 集成 Element Plus 样式
- ⚡ 支持响应式设计和状态管理