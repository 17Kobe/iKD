<template>
    <div>
        <el-row class="row-bg" justify="space-between" style="align-items: center">
            <el-col :span="9" style="margin-left: 17px; font-size: 18px; font-weight: bold">最新價差</el-col>
            <el-col :span="9" style="margin-right: 17px">
                <el-tag
                    class="ml-2"
                    size="large"
                    style="margin: 5px 5px; float: right"
                    :type="totalSpread >= 0 ? 'danger' : 'success'"
                    >總計
                    <span style="font-size: 24px"> $ </span>
                    <span style="font-size: 28px; font-weight: bold">
                        <!-- <number :from="0" :to="totalSpread" :format="currencyFormat" :duration="1" :delay="0" easing="Power1.easeOut" /> -->
                        <number
                            :from="0"
                            :to="totalSpread"
                            :format="currencyFormat"
                            :duration="1"
                            :delay="0"
                            easing="Power1.easeOut"
                            ref="totalSpread"
                        /> </span
                    >&nbsp;元
                </el-tag>
            </el-col>
        </el-row>

        <el-table :data="spreadList" style="width: 100%" empty-text="無資料">
            <el-table-column label="名稱" prop="name" width="90" align="center"> </el-table-column>
            <el-table-column label="成本價" prop="cost.avg" width="45" align="center"> </el-table-column>
            <el-table-column label="現價" prop="last_price" width="45" align="right" header-align="right"> </el-table-column>
            <el-table-column label="本金&nbsp;&nbsp;&nbsp;" width="75" align="right" header-align="right">
                <template #default="scope">
                    <span> $ {{ scope.row.cost.sum.toLocaleString('en-US') }} </span>
                </template>
            </el-table-column>
            <el-table-column label="報酬率" width="53" align="right" header-align="right">
                <template #default="scope">
                    <span style="font-weight: bold"
                        >{{ scope.row.cost.rate_of_return.toFixed(1) }}<span style="margin-left: 2px">%</span></span
                    >
                </template>
            </el-table-column>
            <el-table-column label="價差&nbsp;&nbsp;" width="81" align="right" header-align="right">
                <template #default="scope">
                    <el-tag
                        class="ml-2"
                        size="small"
                        style="margin: 1px 0px"
                        :type="scope.row.cost.return >= 0 ? 'danger' : 'success'"
                        ><span style="font-size: 14px; font-weight: bold">
                            $ {{ scope.row.cost.return.toLocaleString('en-US') }}
                        </span></el-tag
                    >
                </template>
            </el-table-column>
        </el-table>

        <el-row class="row-bg" justify="space-between" style="margin-top: 10px; align-items: center">
            <el-col :span="9" style="margin-left: 17px; font-size: 18px; font-weight: bold">預估股利</el-col>
            <el-col :span="9" style="margin-right: 17px">
                <el-tag class="ml-2" size="large" style="margin: 5px 5px; float: right"
                    >總計
                    <span style="font-size: 24px"> $ </span>
                    <span style="font-size: 28px; font-weight: bold">
                        <!-- <number :from="0" :to="totalSpread" :format="currencyFormat" :duration="1" :delay="0" easing="Power1.easeOut" /> -->
                        <number
                            :from="0"
                            :to="totalDividend"
                            :format="currencyFormat"
                            :duration="1"
                            :delay="0"
                            easing="Power1.easeOut"
                            ref="totalDividend"
                        /> </span
                    >&nbsp;元
                </el-tag>
            </el-col>
        </el-row>

        <el-table :data="dividendList" style="width: 100%" empty-text="無資料">
            <el-table-column label="名稱" prop="name" width="90" align="center"> </el-table-column>
            <el-table-column label="除息日" width="42" align="center">
                <template #default="scope">
                    {{ scope.row.trading_date.substr(5, 5).replace('-', '/') }}
                </template>
            </el-table-column>
            <el-table-column label="現金股利&nbsp;" width="65" align="right" header-align="right">
                <template #default="scope">
                    <el-badge
                        value="估"
                        class="item"
                        type="warning"
                        style="position: relative; top: 6px"
                        v-if="!scope.row.isSure"
                    >
                    </el-badge>
                    <span style="font-weight: bold">{{ scope.row.earnings_distribution }}</span>
                </template>
            </el-table-column>
            <el-table-column label="發放日" width="42" align="center">
                <template #default="scope">
                    {{ scope.row.payment_date.substr(5, 5).replace('-', '/') }}
                </template>
            </el-table-column>
            <el-table-column label="累積股數" width="70" align="right" header-align="right">
                <template #default="scope"> {{ scope.row.number_of_shares.toLocaleString('en-US') }} 股 </template>
            </el-table-column>
            <el-table-column label="股利所得&nbsp;&nbsp;" width="80" align="right" header-align="right">
                <template #default="scope">
                    <el-tag class="ml-2" size="small" style="margin: 1px 0px"
                        ><span style="font-size: 14px; font-weight: bold">
                            $
                            {{ Math.round(scope.row.number_of_shares * scope.row.earnings_distribution).toLocaleString('en-US') }}
                        </span>
                    </el-tag>
                </template>
            </el-table-column>
        </el-table>
        <br /><br />
        <br /><br />
    </div>
</template>

<script>
// import _ from 'lodash';

// This starter template is using Vue 3 experimental <script setup> SFCs
// Check out https://github.com/vuejs/rfcs/blob/script-setup-2/active-rfcs/0000-script-setup.md

export default {
    name: 'component-dividend',
    data() {
        return {};
    },
    computed: {
        dividendList() {
            return this.$store.getters.getDividendList();
        },
        spreadList() {
            return this.$store.getters.getSpreadList();
        },
        totalDividend() {
            return this.dividendList.reduce(
                (acc, { number_of_shares, earnings_distribution }) => acc + Math.round(number_of_shares * earnings_distribution),
                0
            );
        },
        totalSpread() {
            return this.spreadList.reduce((acc, { cost }) => acc + cost.return, 0);
        },
    },
    watch: {
        '$store.state.app.routerName': {
            handler: function (newValue, oldValue) {
                if (newValue != oldValue && newValue === 'dividend') console.log(newValue);
                this.$refs.totalSpread.restart();
                this.$refs.totalDividend.restart();
            },
            //   immediate: true // provides initial (not changed yet) state
        },
    },
    created() {
        console.log('created dividend');
        const localdividendList = JSON.parse(localStorage.getItem('dividendList')) || [];
        // console.log(localdividendList);
        // localStockList 有可能是本地資料，或是預設資料。然後再呼叫載入 this.stockList
        this.$store.commit('SAVE_DIVIDEND_LIST', localdividendList);
        console.log('created dividend over');
    },
    mounted() {
        this.$store.dispatch('GET_DIVIDEND');
    },
    methods: {
        currencyFormat(number) {
            return Number(number.toFixed(0)).toLocaleString('en-US');
        },
    },
};
</script>
<style lang="sass">
.el-table .cell
    padding: 0
</style>
