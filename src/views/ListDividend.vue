<template>
    <div>
        <el-tag class="ml-2" size="large" style="margin: 5px 5px; float: right" :type="totalSpread >= 0 ? 'danger' : 'success'"
            >價差總計
            <span style="font-size: 24px"> $ </span>
            <span style="font-size: 28px; font-weight: bold">
                <!-- <number :from="0" :to="totalSpread" :format="currencyFormat" :duration="1" :delay="0" easing="Power1.easeOut" /> -->
                {{ totalSpread.toLocaleString('en-US') }} </span
            >&nbsp;元
        </el-tag>

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
                    <span>{{ Number(scope.row.cost.rate_of_return.toFixed(1)) }} %</span>
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
        <br /><br />
        <el-tag class="ml-2" size="large" style="margin: 5px 5px; float: right"
            >股利總計
            <span style="font-size: 24px"> $ </span>
            <span style="font-size: 28px; font-weight: bold">
                <!-- <number :from="0" :to="totalDividend" :format="currencyFormat" :duration="1" :delay="0" easing="Power1.easeOut" /> -->
                {{ totalDividend.toLocaleString('en-US') }} </span
            >&nbsp;元
        </el-tag>

        <el-table :data="dividendList" style="width: 100%" empty-text="無資料">
            <el-table-column label="名稱" prop="name" width="90" align="center"> </el-table-column>
            <el-table-column label="除息日" width="42" align="center">
                <template #default="scope">
                    {{ scope.row.trading_date.substr(5, 5).replace('-', '/') }}
                </template>
            </el-table-column>
            <el-table-column label="現金股利" width="65" align="right" header-align="right">
                <template #default="scope">
                    <el-badge
                        value="估"
                        class="item"
                        type="warning"
                        style="position: relative; top: 6px"
                        v-if="!scope.row.isSure"
                    >
                    </el-badge>
                    {{ scope.row.earnings_distribution }}
                </template>
            </el-table-column>
            <el-table-column label="累積股數" width="70" align="right" header-align="right">
                <template #default="scope"> {{ scope.row.number_of_shares.toLocaleString('en-US') }} 股 </template>
            </el-table-column>
            <el-table-column label="發放日" width="42" align="center">
                <template #default="scope">
                    {{ scope.row.payment_date.substr(5, 5).replace('-', '/') }}
                </template>
            </el-table-column>
            <el-table-column label="股利所得&nbsp;" width="80" align="right" header-align="right">
                <template #default="scope">
                    <el-tag class="ml-2" size="small" style="margin: 1px 0px"
                        ><span style="font-size: 14px; font-weight: bold">
                            $ {{ (scope.row.number_of_shares * scope.row.earnings_distribution).toLocaleString('en-US') }}
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
                (acc, { number_of_shares, earnings_distribution }) => acc + number_of_shares * earnings_distribution,
                0
            );
        },
        totalSpread() {
            return this.spreadList.reduce((acc, { cost }) => acc + cost.return, 0);
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
