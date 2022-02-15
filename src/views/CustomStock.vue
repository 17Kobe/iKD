<template>
    <div>
        <el-table :data="stockList" style="width: 100%">
            <el-table-column fixed label="名稱" width="130" align="center">
                <template #default="scope">
                    <span style="font-size: 16px; font-weight: bold">
                        {{ scope.row.name }}
                    </span>
                    <br />
                    <span style="color: #cccccc">{{ scope.row.id }}</span>
                </template>
            </el-table-column>
            <el-table-column label="股價" width="85" align="right">
                <template #default="scope">
                    <span v-if="scope.row.data && scope.row.data.length >= 2">
                        <!-- vue style if 寫法 https://stackoverflow.com/questions/48455909/condition-in-v-bindstyle -->
                        <span
                            :style="[
                                scope.row.data.at(-2).close > scope.row.data.at(-1).close
                                    ? { color: '#01aa00' }
                                    : scope.row.data.at(-2).close < scope.row.data.at(-1).close
                                    ? { color: '#ee3333' }
                                    : { color: 'black' },
                                { 'font-size': '16px' },
                            ]"
                        >
                            {{ scope.row.data.at(-1).close }}<br />
                            <!-- 依漲跌幅來顯示上下箭頭的圖示，下箭頭需要下移1px，上箭頭需要上移2px -->
                            <i
                                :class="[
                                    scope.row.data.at(-2).close > scope.row.data.at(-1).close
                                        ? 'el-icon-caret-bottom'
                                        : scope.row.data.at(-2).close < scope.row.data.at(-1).close
                                        ? 'el-icon-caret-top'
                                        : '',
                                ]"
                                :style="[
                                    scope.row.data.at(-2).close < scope.row.data.at(-1).close
                                        ? { position: 'relative', top: '2px' }
                                        : { position: 'relative', top: '1px' },
                                ]"
                            ></i>
                            <!-- 漲跌幅 如，2.53% -->
                            <span style="font-size: 14px">
                                {{
                                    (
                                        ((scope.row.data.at(-1).close - scope.row.data.at(-2).close) * 100) /
                                        scope.row.data.at(-2).close
                                    ).toFixed(2)
                                }}%
                            </span>
                        </span>
                    </span>
                </template>
            </el-table-column>

            <el-table-column prop="city" label="週KD" width="220" align="center" />
            <el-table-column label="週K線" width="220" align="center">
                <template #default="scope">
                    <ChartWeekKd :parentData="scope.row.data" />
                </template>
            </el-table-column>
            <el-table-column prop="last_price1" label="成本" width="220" align="center">
                <template #default="scope">
                    <el-button
                        size="small"
                        @click="doShowDrawer(scope.row.id)"
                        style="text-align: left; width: 190px; line-height: 18px"
                    >
                        <div v-if="scope.row.cost && scope.row.cost.settings.length >= 1" style="font-size: 14px">
                            <div>平均成本：{{ scope.row.cost.avg }} 元</div>
                            <div>累積股數：{{ scope.row.cost.total }} 股</div>
                            <div>成本金額：{{ scope.row.cost.sum.toLocaleString('en-US') }} 元</div>
                            <el-progress
                                v-if="scope.row.data && scope.row.data.length >= 1"
                                :text-inside="true"
                                :stroke-width="20"
                                :percentage="
                                    getRateOfReturnPercent(scope.row.cost.sum, scope.row.data.at(-1).close, scope.row.cost.total)
                                "
                                :status="
                                    getRateOfReturn(scope.row.cost.sum, scope.row.data.at(-1).close, scope.row.cost.total) <= 0
                                        ? 'success'
                                        : 'exception'
                                "
                            >
                                <span style="color: #606266"
                                    >{{
                                        getRateOfReturn(scope.row.cost.sum, scope.row.data.at(-1).close, scope.row.cost.total)
                                    }}
                                    %</span
                                >
                            </el-progress>

                            <!-- {{ parseFloat((scope.row.cost.total / 1000).toFixed(2)) }} 張) -->
                        </div>

                        <div v-else>
                            <i class="el-icon-s-tools text-xl"></i>
                        </div>
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column prop="last_price1" label="訊號公式" width="220" align="center">
                <template #default="scope">
                    <el-button size="small" icon="el-icon-s-tools text-xl"></el-button>
                </template>
            </el-table-column>
            <el-table-column prop="city" label="訊號歷史報酬" width="220" align="center" />
            <!-- <el-table-column prop="city" label="淨值比" width="120" />
                <el-table-column prop="city" label="本益比" width="120" />
                <el-table-column prop="city" label="EPS" width="120" /> -->
        </el-table>
        <FormCost ref="childFormCost" />
    </div>
</template>

<script>
import ChartWeekKd from '../components/ChartWeekKd.vue';
import FormCost from '../components/FormCost.vue';
// This starter template is using Vue 3 experimental <script setup> SFCs
// Check out https://github.com/vuejs/rfcs/blob/script-setup-2/active-rfcs/0000-script-setup.md

export default {
    components: { ChartWeekKd, FormCost },
    data() {
        return {
            rateOfReturn: 0,
        };
    },
    computed: {
        stockList() {
            return this.$store.state.stock.stockList;
        },
    },
    created() {
        console.log('created');
        // 取得 localstorage 自選股，最先開始是 null 時，會給予預設值空矩陣
        const localStockList = JSON.parse(localStorage.getItem('stockList')) || [];
        // console.log(localStockList);

        // 將 stockList 預設的塞進到 localstorage
        // console.log(this.stockList);
        const diffDefault = this.getDifference(this.stockList, localStockList); // 預設有，但本地沒有，則要新增
        // const diffLocal = this.getDifference(localStockList, this.stockList); // 本地有，但預設沒有，則要砍掉

        localStockList.push(...diffDefault); // 新增 append 預設到 localStockList
        localStorage.setItem('stockList', JSON.stringify(localStockList)); // 將 localStockList 從 object 轉 string 後塞到 localstorage
        // console.log(diffLocal);
        // console.log(diffDefault);
        // console.log(localStockList);
        // console.log(this.stockList);

        // 將 localstorage 重塞回到 vuex 的 stockList
        this.$store.commit('SAVE_STOCK_LIST', localStockList);
    },
    mounted() {
        console.log('mounted');
        // 在 mounted() 事件時就可以發送，因為此時不須 data 及 computed 資料都準備好(因為沒有要data 參數，在create())

        this.$store.commit('SAVE_STOCK_PRICE');
    },
    methods: {
        getDifference(array1, array2) {
            return array1.filter((object1) => !array2.some((object2) => object1.id === object2.id));
        },
        doShowDrawer(id) {
            console.log(id);
            // console.log(this.$refs);
            // 父改子去顯示 drawer 變數 不好，子要被改值
            // 父傳一堆變數給子也不太好
            // 所以父傳id給子，最簡單，子拿此參數再去 vuex 取值，改值，再填回 localstorage
            this.$refs.childFormCost.onInit(id);
        },
        getRateOfReturn(sum, close, total) {
            return parseFloat((((close * total - sum) * 100) / sum).toFixed(2));
        },
        getRateOfReturnPercent(sum, close, total) {
            //* 2 則最大值為50%
            return Math.abs(parseFloat((((close * total - sum) * 100) / sum).toFixed(2))) * 2;
        },
    },
};
</script>

<style lang="sass">
#app
    font-family: Avenir, Helvetica, Arial, sans-serif
    -webkit-font-smoothing: antialiased
    -moz-osx-font-smoothing: grayscale
    /* text-align: center; */
    color: #2c3e50
    /* margin-top: 60px; */

.el-menu-item,
.el-submenu__title
    height: 40px !important
    line-height: 40px !important

.el-menu-item.is-active
    /* font-size: 16px; */
    /* background-color: #f28b82 !important; */
    /* background-color: #ffcc9c !important; */
    background-color: #e5e5e5 !important
    color: black !important
    border-radius: 3px
    // box-shadow: 0 2px 4px 0 rgb(0 0 0 / 12%), 0 0 6px 0 rgb(0 0 0 / 4%)

.el-menu-item.is-active [class*="el-icon-"]
    color: #F56C6C
// 為了讓highchart圖更不會佔td
.el-table .el-table__body td
    padding: 0px 0
// 為了解決table內cell要/n換行的問題
.el-table .el-table__body .cell
    white-space: pre-line
</style>
