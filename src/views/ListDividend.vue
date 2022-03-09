<template>
    <div>
        <el-tag class="ml-2" size="large" style="margin: 5px 5px"
            >股利總計
            <span style="font-size: 24px"> $ </span>
            <span style="font-size: 28px; font-weight: bold">
                <number :from="0" :to="total" :format="currencyFormat" :duration="1" :delay="0" easing="Power1.easeOut" />
            </span>
        </el-tag>

        <el-table :data="dividendList" style="width: 100%" empty-text="無資料">
            <el-table-column fixed label="名稱" prop="name" width="90" align="center"> </el-table-column>
            <el-table-column label="除息日" prop="trading_date" width="75" align="center"> </el-table-column>
            <el-table-column label="現金股利" width="80" align="right" header-align="right">
                <template #default="scope">
                    <el-badge
                        value="估"
                        class="item"
                        type="warning"
                        style="position: relative; top: 4px"
                        v-if="!scope.row.isSure"
                    >
                    </el-badge>
                    {{ scope.row.earnings_distribution }}
                </template>
            </el-table-column>
            <el-table-column label="累積股數" width="80" align="right" header-align="right">
                <template #default="scope"> {{ scope.row.number_of_shares.toLocaleString('en-US') }} 股 </template>
            </el-table-column>

            <el-table-column label="股利所得" width="80" align="right" header-align="right">
                <template #default="scope">
                    <el-tag class="ml-2" size="small" style="margin: 1px 0px"
                        ><span style="font-size: 14px; font-weight: bold">
                            $ {{ (scope.row.number_of_shares * scope.row.earnings_distribution).toLocaleString('en-US') }}
                        </span>
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="現金發放日" prop="payment_date" width="90" align="center"> </el-table-column>
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
        total() {
            return this.dividendList.reduce(
                (acc, { number_of_shares, earnings_distribution }) => acc + number_of_shares * earnings_distribution,
                0
            );
        },
    },
    created() {
        console.log('created dividend');
        const localdividendList = JSON.parse(localStorage.getItem('dividendList')) || [];
        console.log(localdividendList);
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
