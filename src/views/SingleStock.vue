<template>
    <!-- 有試過 el-row 變 div 搭配 flex，但會變都固定寬度了 -->
    <el-row>
        <el-col :xs="16" :sm="18" :md="15" :lg="18" :xl="20">
            <StockChart />
        </el-col>
        <el-col :xs="8" :sm="6" :md="9" :lg="6" :xl="4">
            <!-- <div class="flex-none w-72 ml-2"> -->
            <SignalSetting />
            <StockInfo />
        </el-col>
    </el-row>
</template>

<script>
import StockChart from '../components/StockChart.vue';
import SignalSetting from '../components/SignalSetting.vue';
import StockInfo from '../components/StockInfo.vue';

export default {
    components: { StockChart, SignalSetting, StockInfo },
};
</script>
