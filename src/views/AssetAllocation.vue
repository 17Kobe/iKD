<template>
    <div>
        <el-row>
            <el-col :xs="12" :sm="10" :md="7" :lg="4" :xl="3" style="padding-left: 4px; padding-top: 4px">
                <el-card shadow="hover"> <BarChart :chartData="barData" /> </el-card>
            </el-col>
            <el-col :xs="12" :sm="10" :md="7" :lg="4" :xl="3" style="padding-left: 4px; padding-top: 4px">
                <el-card shadow="hover"> <PieChart :chartData="pieData" /> </el-card>
            </el-col>
        </el-row>

        <!-- <chart v-if="loaded" :chartdata="chartdata" :options="options"> </chart> -->
        <br /><br /><br />
        <el-row v-for="(item, index) in assetList" :key="index">
            <el-col :xs="12" :sm="10" :md="7" :lg="4" :xl="3" style="padding-left: 4px">
                <el-input size="small" placeholder="" v-model="item.account" @keyup="onChangeAccount($event, index)">
                    <template #prepend>帳戶</template>
                </el-input>
            </el-col>
            <el-col :xs="9" :sm="10" :md="7" :lg="4" :xl="3" style="padding-left: 4px">
                <el-input size="small" placeholder="" v-model="item.amount" @keyup="onChangeAmount($event, index)">
                    <template #prepend>金額</template>
                </el-input>
            </el-col>
            <el-col :xs="3" :sm="10" :md="7" :lg="4" :xl="3" style="padding-left: 4px">
                <el-button type="danger" size="small"><i class="el-icon-minus"></i></el-button>
            </el-col>
        </el-row>
        <el-row>
            <el-col :xs="24" :sm="10" :md="7" :lg="4" :xl="3" style="padding-left: 4px; padding-top: 4px">
                <el-button type="primary" size="small" @click="onAddAsset"><i class="el-icon-plus"></i></el-button>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import { DoughnutChart, BarChart, PieChart } from 'vue-chart-3';

Chart.register(...registerables);

// Chart options
// Chart.defaults.global.legend.display = false;
//   Chart.defaults.global.tooltips.enabled = false;

export default {
    name: 'component-asset',
    components: { DoughnutChart, BarChart, PieChart },
    data() {
        return {
            // assetList: [],
            barData: {
                labels: ['Paris', 'Nîmes', 'Toulon'],
                datasets: [
                    {
                        data: [30, 40, 60],
                        backgroundColor: [
                            // 背景色
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                        ],
                        borderColor: ['rgb(54, 162, 235)', 'rgb(255, 99, 132)', 'rgb(75, 192, 192)'],
                        borderWidth: 2, // 外框寬度
                        options: {
                            legend: {
                                display: false,
                            },
                        },
                    },
                ],
                options: {
                    legend: {
                        display: false,
                    },
                    tooltips: {
                        enabled: false,
                    },
                },
            },
            pieData: {
                labels: ['Paris', 'Nîmes', 'Toulon'],
                datasets: [
                    {
                        data: [30, 40, 60],
                        backgroundColor: [
                            // 背景色
                            'rgba(255, 99, 132, 0.5)',
                            'rgba(255, 205, 86, 0.5)',
                            'rgba(54, 162, 235, 0.5)',
                            'rgba(153, 102, 255, 0.5)',
                            'rgba(255, 159, 64, 0.5)',
                        ],
                        borderWidth: 2, // 外框寬度
                    },
                ],
            },
        };
    },
    // setup() {
    //     const testData = {
    //         labels: ['Paris', 'Nîmes', 'Toulon'],
    //         datasets: [
    //             {
    //                 data: [30, 40, 60],
    //                 backgroundColor: [
    //                     // 背景色
    //                     'rgba(54, 162, 235, 0.2)',
    //                     'rgba(255, 99, 132, 0.2)',
    //                     'rgba(75, 192, 192, 0.2)',
    //                 ],
    //                 borderColor: ['rgb(54, 162, 235)', 'rgb(255, 99, 132)', 'rgb(75, 192, 192)'],
    //                 borderWidth: 2, // 外框寬度
    //             },
    //         ],
    //     };

    //     return { testData };
    // },
    computed: {
        assetList() {
            return this.$store.state.asset.assetList;
        },
    },
    created() {
        console.log('created');
        // 取得 localstorage 自選股，最先開始是 null 時，會給予預設值空矩陣
        const assetList = JSON.parse(localStorage.getItem('assetList')) || [];
        this.$store.commit('SAVE_ASSET', assetList);
    },
    methods: {
        onAddAsset() {
            console.log('onAddAsset');

            this.assetList.push({
                account: '',
                amount: 0,
            });
        },
        onChangeAccount(e, index) {
            console.log('onChangeAccount');
            this.assetList[index].account = e.target.value;
            this.$store.commit('SAVE_ASSET', this.assetList);
        },
        onChangeAmount(e, index) {
            console.log('onChangeAmount');
            this.assetList[index].amount = e.target.value;
            this.$store.commit('SAVE_ASSET', this.assetList);
        },
    },
};
</script>

<style lang="sass" scoped>
.el-input-group__prepend
    padding: 0 10px!important
</style>
