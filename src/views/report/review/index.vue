<script setup>
const tableData = [{
    targetName: '产品支线1',
    configSummaryType: 1,
    users: [{
        realName: '张三'
    }],
    instances: [{
        instanceId: '995008',
        endTime: '2021-09-01 00:00:00',
        details: [
            {
                fieldName: '工作时长',
                content: '1小时'
            },
            {
                fieldName: '任务数量',
                content: '10个'
            }
        ]
    }]
}, {
    targetName: '产品支线2',
    configSummaryType: 1,
    users: [{
        realName: '李四'
    }],
    instances: [{
        instanceId: '995777',
        endTime: '2021-09-01 00:00:00',
        details: [
            {
                fieldName: '工作时长',
                content: '2小时'
            },
            {
                fieldName: '任务数量',
                content: '8个'
            }
        ]
    }]
}]

const instances = tableData[0].instances
</script>

<template>
    <div class="table-content">
        <el-table :data="tableData" border>
            <el-table-column prop="user" label="名称">
                <template #defaul="{ row }">
                    <span>{{ row.configSummaryType === 1 ? row.targetName : row.users[0]?.realName }}</span>
                </template>
            </el-table-column>
            <el-table-column v-for="instance in instances" :label="instance.endTime" width="120" :key="instance.id">
                <el-table-column v-for="detail in instance.details" :label="detail.fieldName" :key="detail.id">
                    <template #default="scope">
                        <el-button type="primary" size="default" @click="handleReviewDetail(scope)">查看</el-button>
                    </template>
                </el-table-column>
            </el-table-column>
        </el-table>
    </div>
</template>

<style lang="less" scoped></style>