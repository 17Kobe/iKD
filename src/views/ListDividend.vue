<template>
    <div>
        <el-table :data="dividendList" style="width: 100%">
            <el-table-column fixed label="名稱" prop="name" width="90" align="center"> </el-table-column>
            <el-table-column label="除息日" prop="trading_date" width="75" align="center"> </el-table-column>
            <el-table-column label="現金股利" prop="earnings_distribution" width="80" align="right" header-align="right">
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
        return {
            rateOfReturn: 0,
            historyData: [],
        };
    },
    computed: {
        dividendList() {
            return this.$store.state.dividend.dividendList;
        },
    },
    created() {
        console.log('created');
    },
    mounted() {
        this.$store.dispatch('GET_DIVIDEND');
    },
    methods: {
        // getSummaries(param) {
        //     const { columns, data } = param;
        //     const sums = [];
        //     columns.forEach((column, index) => {
        //         // if (index === 0) {
        //         //     sums[index] = 'Total Cost';
        //         // }
        //         // const values = data.map((item) => Number(item[column.property]))
        //         // if (!values.every((value) => isNaN(value))) {
        //         //     sums[index] = `$ ${values.reduce((prev, curr) => {
        //         //         const value = Number(curr)
        //         //         if (!isNaN(value)) {
        //         //         return prev + curr
        //         //         } else {
        //         //         return prev
        //         //         }
        //         //     }, 0)}`;
        //         // } else {
        //         //     sums[index] = 'N/A';
        //         // }
        //     });
        // },
    },
};
</script>

<style lang="sass"></style>
