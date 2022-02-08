<template>
    <el-tabs id="stock-info-tabs" type="border-card" class="bg-keep-green mt-3">
        <el-tab-pane label="策略損益">
            <el-table style="width: 100%" size="mini" :data="stockInfo" max-height="225px" border stripe>
                <el-table-column prop="date" label="日期" align="center" width="103px"> </el-table-column>
                <el-table-column prop="close" label="淨值" align="right" width="65px"> </el-table-column>
                <el-table-column prop="return" label="報酬率" align="right" width="65px"></el-table-column>
                <!-- <template slot-scope="scope"> {{ scope.row.close }}% </template> -->

                <!-- <el-table-column prop="address" label="漲跌幅" width="56px"> </el-table-column>
                <el-table-column prop="address" label="訊號" width="49px"> </el-table-column> -->
            </el-table>
        </el-tab-pane>
        <el-tab-pane label="淨值"> </el-tab-pane>
        <el-tab-pane label="配息"> </el-tab-pane>
        <!-- <el-tab-pane label="持股"> </el-tab-pane> -->
    </el-tabs>
</template>
<script>
export default {
    data() {
        return {};
    },
    computed: {
        stockInfo() {
            console.log('stockInfo');
            return this.$store.getters.currStockInfo;
        },
    },
};
</script>

<style lang="sass">
/* global styles */
/* el 相關修改都要用 global 才可以  */
#stock-info-tabs.el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active
    color: #12c343
    background-color: #ccff90 !important
</style>
