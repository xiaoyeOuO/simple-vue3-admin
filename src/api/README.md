# 后端API接口文档

## 饼图数据接口

### 1. 获取研究所人员统计数据

**接口地址**: `GET /api/dashboard/institute-personnel-stats`

**请求参数**: 无

**响应格式**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "name": "第一研究所",
      "data": [
        { "value": 120, "name": "在册人员" },
        { "value": 45, "name": "劳务人员" },
        { "value": 30, "name": "外包人员" },
        { "value": 15, "name": "集中办公人员" }
      ]
    },
    {
      "name": "第二研究所",
      "data": [
        { "value": 98, "name": "在册人员" },
        { "value": 38, "name": "劳务人员" },
        { "value": 25, "name": "外包人员" },
        { "value": 12, "name": "集中办公人员" }
      ]
    },
    {
      "name": "第三研究所",
      "data": [
        { "value": 135, "name": "在册人员" },
        { "value": 52, "name": "劳务人员" },
        { "value": 35, "name": "外包人员" },
        { "value": 18, "name": "集中办公人员" }
      ]
    },
    {
      "name": "第四研究所",
      "data": [
        { "value": 110, "name": "在册人员" },
        { "value": 42, "name": "劳务人员" },
        { "value": 28, "name": "外包人员" },
        { "value": 14, "name": "集中办公人员" }
      ]
    }
  ]
}
```

### 2. 获取指定研究所人员详情

**接口地址**: `GET /api/dashboard/institute-personnel-detail/{instituteId}`

**请求参数**:
- `instituteId` (路径参数): 研究所ID

**响应格式**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "instituteId": "inst-001",
    "instituteName": "第一研究所",
    "totalPersonnel": 210,
    "personnelTypes": [
      {
        "type": "在册人员",
        "count": 120,
        "percentage": 57.14,
        "details": [
          { "name": "张三", "position": "高级工程师", "department": "研发一部" },
          { "name": "李四", "position": "中级工程师", "department": "研发二部" }
        ]
      },
      {
        "type": "劳务人员",
        "count": 45,
        "percentage": 21.43,
        "details": [
          { "name": "王五", "company": "外包公司A", "project": "项目X" }
        ]
      }
    ]
  }
}
```

### 3. 获取人员类型统计（带筛选）

**接口地址**: `GET /api/dashboard/personnel-type-stats`

**请求参数**:
- `date` (可选): 统计日期，格式: `YYYY-MM-DD`，默认为当天
- `instituteId` (可选): 研究所ID，获取指定研究所数据

**响应格式**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "instituteName": "第一研究所",
      "date": "2024-01-15",
      "personnelTypes": [
        { "type": "在册人员", "count": 120 },
        { "type": "劳务人员", "count": 45 },
        { "type": "外包人员", "count": 30 },
        { "type": "集中办公人员", "count": 15 }
      ]
    }
  ]
}
```

## 数据库表结构建议

### 研究所表 (institutes)
```sql
CREATE TABLE institutes (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 人员表 (personnel)
```sql
CREATE TABLE personnel (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  employee_id VARCHAR(20) UNIQUE,
  institute_id VARCHAR(50) NOT NULL,
  type ENUM('在册人员', '劳务人员', '外包人员', '集中办公人员') NOT NULL,
  department VARCHAR(100),
  position VARCHAR(100),
  status ENUM('在职', '离职', '试用期') DEFAULT '在职',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (institute_id) REFERENCES institutes(id)
);
```

## 后端实现示例（Node.js + Express）

```javascript
// routes/dashboard.js
const express = require('express');
const router = express.Router();

// 获取研究所人员统计数据
router.get('/institute-personnel-stats', async (req, res) => {
  try {
    const stats = await getPersonnelStats();
    res.json({
      code: 200,
      message: 'success',
      data: stats
    });
  } catch (error) {
    console.error('获取人员统计数据失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    });
  }
});

// 获取人员类型统计
router.get('/personnel-type-stats', async (req, res) => {
  try {
    const { date, instituteId } = req.query;
    const stats = await getPersonnelTypeStats(date, instituteId);
    res.json({
      code: 200,
      message: 'success',
      data: stats
    });
  } catch (error) {
    console.error('获取人员类型统计失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    });
  }
});

module.exports = router;
```