# Simple Vue3 Admin

一个基于 Vue 3 + Element Plus 的现代化后台管理系统模板，采用最新的前端技术栈，提供完整的企业级管理功能。

## ✨ 特性

- 🚀 **现代技术栈**：基于 Vue 3 + Composition API + Vite
- 🎨 **优雅UI**：使用 Element Plus 组件库，界面美观易用
- 📊 **数据可视化**：集成 ECharts 图表库
- 📋 **表格组件**：使用 vxe-table 高级表格组件
- 📅 **甘特图**：内置项目甘特图功能
- 🔐 **权限管理**：完整的用户权限体系
- 📱 **响应式设计**：完美适配桌面端和移动端
- 🎯 **TypeScript 友好**：良好的类型提示支持
- 🔥 **热重载**：Vite 提供极速的开发体验

## 🛠️ 技术栈

### 核心框架
- **Vue 3.3.8** - 渐进式JavaScript框架
- **Vite 5.0.0** - 新一代前端构建工具
- **Vue Router 4.2.5** - Vue.js 官方路由管理器
- **Pinia 2.3.1** - Vue 3 状态管理库

### UI & 组件
- **Element Plus 2.4.4** - Vue 3 组件库
- **@element-plus/icons-vue 2.1.0** - Element Plus 图标库
- **vxe-table 4.16.0** - Vue 表格组件
- **ECharts 6.0.0** - 数据可视化图表库

### 工具库
- **moment 2.30.1** - 时间处理库
- **xe-utils 3.7.8** - 工具函数库
- **@wangeditor/editor 5.1.23** - 富文本编辑器

### 样式预处理器
- **Sass 1.69.5** - CSS 预处理器
- **Less 4.4.1** - CSS 预处理器

## 📦 安装

### 环境要求

- Node.js >= 16.x
- pnpm >= 7.x（推荐）或 npm >= 8.x

### 克隆项目

```bash
git clone https://github.com/your-username/simple-vue3-admin.git
cd simple-vue3-admin
```

### 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

## 🚀 快速开始

### 开发环境

```bash
# 启动开发服务器
pnpm dev

# 或
npm run dev
```

开发服务器将在 `http://localhost:3001` 启动

### 生产构建

```bash
# 构建生产版本
pnpm build

# 或
npm run build
```

### 预览构建

```bash
# 预览生产构建
pnpm preview

# 或
npm run preview
```

## 📁 项目结构

```
simple-vue3-admin/
├── public/                 # 静态资源目录
├── src/                    # 源代码目录
│   ├── components/         # 全局组件
│   │   └── TabBreadcrumb.vue
│   ├── composables/        # 组合式函数
│   │   └── useTabs.js
│   ├── layouts/           # 布局组件
│   │   └── AdminLayout.vue
│   ├── router/            # 路由配置
│   │   └── index.js
│   ├── stores/            # Pinia 状态管理
│   │   └── tabs.js
│   ├── utils/             # 工具函数
│   │   └── tabUtils.js
│   ├── views/             # 页面组件
│   │   ├── system/        # 系统管理
│   │   ├── project/       # 项目管理
│   │   ├── report/        # 数据洞察中心
│   │   ├── supplier/      # 客商管理
│   │   ├── coding/        # 开发管理
│   │   ├── content/       # 内容管理
│   │   ├── bigData/       # 大数据展示
│   │   ├── Dashboard.vue  # 仪表盘
│   │   └── Login.vue      # 登录页
│   ├── App.vue            # 根组件
│   ├── main.js            # 入口文件
│   └── style.css          # 全局样式
├── index.html             # HTML 模板
├── package.json           # 项目配置
├── vite.config.js         # Vite 配置
└── README.md              # 项目说明
```

## 🔧 主要功能模块

### 🏠 仪表盘
- 数据概览
- 快速导航
- 图表展示

### 👥 系统管理
- **用户管理**：用户增删改查、权限分配
- **角色管理**：角色权限配置
- **菜单管理**：动态菜单配置
- **字典管理**：系统字典维护
- **工时管理**：员工工时统计
- **人员档案**：员工信息管理

### 📊 项目管理
- **合同项目管理**：
  - 项目列表与详情
  - 项目看板（甘特图）
  - 模块管理（树形结构 + 甘特图）
  - 任务管理
  - 缺陷管理
- **经营项目管理**
- **项目类型管理**

### 📈 数据洞察中心
- **日报管理**
- **我的待办**
- **报表配置管理**
- **报表填写**
- **实例管理**
- **报表审核**

### 🏢 客商管理
- **客商信息管理**
- **联系人管理**

### 💻 开发管理
- **项目配置**
- **模块推送**
- **项目列表管理**
- **软件项目绑定**

### 📝 内容管理
- **文章管理**
- **分类管理**

### 📊 大数据展示
- 数据可视化大屏

## 🎨 核心特性详解

### 多标签页导航
- 支持多页面标签切换
- 标签页缓存机制
- 右键菜单操作

### 甘特图功能
- 项目进度可视化
- 开发阶段与测试阶段区分
- 树形结构展开折叠
- 时间轴精确对齐

### 响应式布局
- 顶部导航 + 侧边栏布局
- 自适应屏幕尺寸
- 移动端友好

### 权限控制
- 路由级权限控制
- 菜单动态显示/隐藏
- 按钮级权限控制

## 📝 更新日志

### v1.0.0 (2024-01-01)
- 🎉 初始版本发布
- ✨ 完整的后台管理功能
- 📊 甘特图组件实现
- 🎨 响应式布局设计

## 📄 许可证

[MIT License](LICENSE)
