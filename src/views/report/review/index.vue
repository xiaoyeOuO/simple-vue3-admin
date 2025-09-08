<script setup>
import { ref, reactive, computed } from 'vue'

// 响应式数据
const tableData = ref([
    {
        targetName: '产品支线1',
        configSummaryType: 1,
        users: [{
            realName: '张三',
            userId: 1
        }],
        instances: [
            {
                instanceId: '995008',
                endTime: '2021-09-01 00:00:00',
                details: [
                    {
                        fieldName: '工作时长',
                        content: '1小时',
                        type: 'duration'
                    },
                    {
                        fieldName: '任务数量',
                        content: '10个',
                        type: 'taskCount'
                    },
                    {
                        fieldName: '完成率',
                        content: '85%',
                        type: 'completionRate'
                    }
                ]
            },
            {
                instanceId: '995009',
                endTime: '2021-09-02 00:00:00',
                details: [
                    {
                        fieldName: '工作时长',
                        content: '1.5小时',
                        type: 'duration'
                    },
                    {
                        fieldName: '任务数量',
                        content: '12个',
                        type: 'taskCount'
                    },
                    {
                        fieldName: '完成率',
                        content: '90%',
                        type: 'completionRate'
                    }
                ]
            }
        ]
    },
    {
        targetName: '产品支线2',
        configSummaryType: 1,
        users: [{
            realName: '李四',
            userId: 2
        }],
        instances: [
            {
                instanceId: '995777',
                endTime: '2021-09-01 00:00:00',
                details: [
                    {
                        fieldName: '工作时长',
                        content: '2小时',
                        type: 'duration'
                    },
                    {
                        fieldName: '任务数量',
                        content: '8个',
                        type: 'taskCount'
                    },
                    {
                        fieldName: '完成率',
                        content: '75%',
                        type: 'completionRate'
                    }
                ]
            }
        ]
    },
    {
        targetName: '王五',
        configSummaryType: 2,
        users: [{
            realName: '王五',
            userId: 3
        }],
        instances: [
            {
                instanceId: '995666',
                endTime: '2021-09-03 00:00:00',
                details: [
                    {
                        fieldName: '工作时长',
                        content: '3小时',
                        type: 'duration'
                    },
                    {
                        fieldName: '任务数量',
                        content: '15个',
                        type: 'taskCount'
                    },
                    {
                        fieldName: '完成率',
                        content: '95%',
                        type: 'completionRate'
                    }
                ]
            }
        ]
    }
])

// 响应式状态
const loading = ref(false)
const dialogVisible = ref(false)
const currentDetail = reactive({
    title: '',
    data: null
})

// 计算所有实例（用于动态列）
const allInstances = computed(() => {
    const instances = []
    tableData.value.forEach(item => {
        item.instances.forEach(instance => {
            if (!instances.find(i => i.instanceId === instance.instanceId)) {
                instances.push(instance)
            }
        })
    })
    return instances.sort((a, b) => new Date(a.endTime) - new Date(b.endTime))
})

// 方法
const handleReviewDetail = (scope) => {
    const { row, detail, instance } = scope
    currentDetail.title = `${row.targetName || row.users[0]?.realName} - ${detail.fieldName || detail}`
    currentDetail.data = {
        row,
        detail,
        instance
    }
    dialogVisible.value = true
}

const getDisplayName = (row) => {
    return row.configSummaryType === 1 ? row.targetName : row.users[0]?.realName
}

const getInstanceDetails = (row, instanceId) => {
    const instance = row.instances.find(i => i.instanceId === instanceId)
    return instance ? instance.details : []
}

// 格式化数据
const formatContent = (content, type) => {
    if (type === 'completionRate') {
        return `${content}`
    }
    return content
}

// 获取标签类型
const getTagType = (content, type) => {
    if (type === 'completionRate') {
        const rate = parseInt(content)
        if (rate >= 90) return 'success'
        if (rate >= 70) return 'warning'
        return 'danger'
    }
    return 'info'
}
</script>

<template>
    <div class="report-review-page">
        <div class="page-header">
            <h2>报告审核</h2>
            <p class="page-desc">查看和分析各产品支线和用户的工作报告数据</p>
        </div>

        <div class="table-content">
            <el-card shadow="hover">
                <template #header>
                    <div class="card-header">
                        <span>审核数据列表</span>
                        <el-button type="primary" size="small" @click="loading = !loading">
                            <el-icon><Refresh /></el-icon>
                            刷新数据
                        </el-button>
                    </div>
                </template>

                <el-table 
                    :data="tableData" 
                    border 
                    stripe
                    v-loading="loading"
                    style="width: 100%">
                    <el-table-column label="名称" min-width="150" fixed>
                        <template #default="{ row }">
                            <div class="name-cell">
                                <el-avatar 
                                    :size="32" 
                                    :style="{ backgroundColor: row.configSummaryType === 1 ? '#409EFF' : '#67C23A' }">
                                    {{ getDisplayName(row).charAt(0) }}
                                </el-avatar>
                                <span class="name-text">{{ getDisplayName(row) }}</span>
                            </div>
                        </template>
                    </el-table-column>
                    
                    <el-table-column 
                        v-for="instance in allInstances" 
                        :key="instance.instanceId"
                        :label="instance.endTime" 
                        min-width="300">
                        <template #default="{ row }">
                            <div class="instance-data">
                                <div 
                                    v-for="detail in getInstanceDetails(row, instance.instanceId)" 
                                    :key="detail.fieldName"
                                    class="detail-item">
                                    <span class="field-name">{{ detail.fieldName }}：</span>
                                    <el-tag 
                                        :type="getTagType(detail.content, detail.type)"
                                        size="small"
                                        effect="light">
                                        {{ formatContent(detail.content, detail.type) }}
                                    </el-tag>
                                    <el-button 
                                        type="primary" 
                                        link 
                                        size="small" 
                                        @click="handleReviewDetail({ row, detail, instance })">
                                        详情
                                    </el-button>
                                </div>
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" width="120" fixed="right">
                        <template #default="{ row }">
                            <div class="action-buttons">
                                <el-button 
                                    type="primary" 
                                    size="small" 
                                    @click="handleReviewDetail({ row, type: 'summary' })">
                                    查看汇总
                                </el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>
        </div>

        <!-- 详情弹窗 -->
        <el-dialog
            v-model="dialogVisible"
            :title="currentDetail.title"
            width="600px"
            :close-on-click-modal="false">
            <div class="detail-content">
                <el-descriptions :column="1" border>
                    <el-descriptions-item label="名称">
                        {{ currentDetail.data?.row?.targetName || currentDetail.data?.row?.users[0]?.realName }}
                    </el-descriptions-item>
                    <el-descriptions-item label="类型">
                        {{ currentDetail.data?.row?.configSummaryType === 1 ? '产品支线' : '用户' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="负责人">
                        {{ currentDetail.data?.row?.users[0]?.realName }}
                    </el-descriptions-item>
                </el-descriptions>

                <div class="instance-details" v-if="currentDetail.data?.instance">
                    <h4>实例详情</h4>
                    <el-timeline>
                        <el-timeline-item 
                            v-for="detail in currentDetail.data?.instance?.details" 
                            :key="detail.fieldName"
                            :type="getTagType(detail.content, detail.type)"
                            :timestamp="currentDetail.data?.instance?.endTime">
                            <strong>{{ detail.fieldName }}：</strong>
                            {{ formatContent(detail.content, detail.type) }}
                        </el-timeline-item>
                    </el-timeline>
                </div>
            </div>
            <template #footer>
                <el-button @click="dialogVisible = false">关闭</el-button>
                <el-button type="primary" @click="dialogVisible = false">确认</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style lang="less" scoped>
.report-review-page {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;

    .page-header {
        margin-bottom: 20px;
        text-align: center;

        h2 {
            margin: 0 0 8px 0;
            color: #303133;
            font-size: 24px;
        }

        .page-desc {
            margin: 0;
            color: #909399;
            font-size: 14px;
        }
    }

    .table-content {
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .name-cell {
            display: flex;
            align-items: center;
            gap: 8px;

            .name-text {
                font-weight: 500;
                color: #303133;
            }
        }

        .instance-data {
            .detail-item {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;

                &:last-child {
                    margin-bottom: 0;
                }

                .field-name {
                    color: #606266;
                    font-size: 13px;
                    min-width: 70px;
                }
            }
        }

        .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
    }

    .detail-content {
        .instance-details {
            margin-top: 20px;

            h4 {
                margin: 0 0 16px 0;
                color: #303133;
                font-size: 16px;
            }
        }
    }
}
</style>