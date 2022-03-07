<template>
    <div>
        <el-row>
            <el-col :xs="12" :sm="10" :md="7" :lg="4" :xl="3" style="padding-left: 4px; padding-top: 4px">
                <el-card>
                    <BarChart :chartData="barData" :options="barOptions" />
                    <!-- <highcharts :options="chartOptions" style="background: transparent"> </highcharts> -->
                </el-card>
            </el-col>
            <el-col :xs="12" :sm="10" :md="7" :lg="4" :xl="3" style="padding-left: 4px; padding-top: 4px">
                <el-card>
                    <PieChart :chartData="pieData" :options="pieOptions" />
                </el-card>
            </el-col>
        </el-row>

        <!-- <chart v-if="loaded" :chartdata="chartdata" :options="options"> </chart> -->
        <br />
        <el-row v-for="(item, index) in assetList" :key="index" style="margin: 1px 0">
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
                <el-button type="danger" size="small" @click="onDelAsset(index)" round><i class="el-icon-minus"></i></el-button>
            </el-col>
        </el-row>
        <el-row>
            <el-col :xs="24" :sm="10" :md="7" :lg="4" :xl="3" style="padding-left: 4px; padding-top: 4px">
                <el-button type="primary" size="small" @click="onAddAsset" round><i class="el-icon-plus"></i></el-button>
            </el-col>
            <el-col :xs="24" :sm="10" :md="7" :lg="4" :xl="3" style="padding-left: 4px; padding-top: 4px">
                <el-button type="primary" size="small" @click="onResetAsset" round><i class="el-icon-minus"></i></el-button>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import _ from 'lodash';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { BarChart, PieChart } from 'vue-chart-3';

Chart.register(...registerables);
// Register the plugin to all charts:
Chart.register(ChartDataLabels);

export default {
    name: 'component-asset',
    // components: { highcharts: Chart },
    components: { BarChart, PieChart },
    data() {
        return {
            // assetList: [],

            barOptions: {
                plugins: {
                    legend: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: '資產負債表',
                        align: 'start',
                        color: 'blue',
                    },
                    datalabels: {
                        anchor: 'end', // remove this line to get label in middle of the bar
                        align: 'end',
                        formatter: (val) => {
                            if (!val || val === 0) return '';
                            return `$ ${Number((val / 10000).toFixed(1))} 萬`;
                        },
                        labels: {
                            // value: {
                            //     color: 'blue',
                            // },
                        },
                    },
                },
            },
            pieOptions: {
                plugins: {
                    title: {
                        display: true,
                        text: '資產配置表',
                        align: 'start',
                        color: 'blue',
                    },
                    datalabels: {
                        formatter: (value, ctx) => {
                            console.log(ctx);

                            let sum = 0;
                            const dataArr = ctx.chart.data.datasets[0].data;
                            dataArr.map((data) => {
                                sum += data;
                            });
                            const percentage = `${((value * 100) / sum).toFixed(2)}%`;
                            return percentage;
                        },
                        // color: '#fff',
                    },
                    // layout: {
                    //     padding: {
                    //         left: 15,
                    //         right: 15,
                    //         top: 15,
                    //         bottom: 15,
                    //     },
                    // },

                    // tooltips: {
                    //     callbacks: {
                    //         label(tooltipItem, data) {
                    //             const value = data.datasets[0].data[tooltipItem.index];
                    //             // if (parseInt(value) >= 1000) {
                    //             return [
                    //                 `${data.labels[tooltipItem.index]}: $ ${value
                    //                     .toString()
                    //                     .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
                    //             ];
                    //         },
                    //     }, // end callbacks:
                    // },
                    legend: {
                        display: false,
                    },
                    // labels: [
                    //     {
                    //         render: 'label',
                    //         position: 'outside',
                    //         fontStyle: 'bold',
                    //         textMargin: 0,
                    //     },
                    //     {
                    //         render: 'percentage',
                    //         fontColor: 'black',
                    //         precision: 0,
                    //         overlap: true,
                    //     },
                    // ],
                },
            },
        };
    },
    computed: {
        assetList() {
            return this.$store.state.asset.assetList;
        },
        assets() {
            return this.assetList.reduce((acc, { amount }) => {
                if (amount >= 0) return acc + amount;
                return acc;
            }, 0);
        },
        liabilities() {
            return this.assetList.reduce((acc, { amount }) => {
                if (amount < 0) return acc + Math.abs(amount);
                return acc;
            }, 0);
        },
        demandDeposit() {
            // 活存 sum
            return this.assetList.reduce((acc, { account, amount }) => {
                if (account.includes('活存')) return acc + Math.abs(amount);
                return acc;
            }, 0);
        },
        FixedDeposit() {
            // 定存 sum
            return this.assetList.reduce((acc, { account, amount }) => {
                if (account.includes('定存')) return acc + Math.abs(amount);
                return acc;
            }, 0);
        },
        barData() {
            return {
                labels: ['資產', '負債'],
                datasets: [
                    {
                        data: [this.assets, this.liabilities],
                        backgroundColor: [
                            // 背景色
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 99, 132, 0.2)',
                        ],
                        borderColor: ['rgb(54, 162, 235)', 'rgb(255, 99, 132)'],
                        borderWidth: 2, // 外框寬度
                        options: {
                            legend: {
                                display: false,
                            },
                        },
                    },
                ],
            };
        },
        pieData() {
            return {
                labels: ['活存', '定存', '股票'],
                datasets: [
                    {
                        data: [this.demandDeposit, this.FixedDeposit, 60],
                        backgroundColor: [
                            // 背景色
                            'rgba(255, 159, 64, 0.5)',
                            'rgba(255, 205, 86, 0.5)',
                            'rgba(153, 102, 255, 0.5)',
                            'rgba(75, 192, 192, 0.2)',
                        ],
                        // borderColor: ['rgb(66, 66, 66)'],
                        borderWidth: 2, // 外框寬度
                    },
                ],
            };
        },
    },
    created() {
        console.log('created');
        // 取得 localstorage 自選股，最先開始是 null 時，會給予預設值空矩陣
        const localAssetList = JSON.parse(localStorage.getItem('assetList')) || [];
        if (_.isEmpty(localAssetList)) {
            localAssetList.push(...this.assetList); // 新增 append 預設到 localStockList
            localStorage.setItem('assetList', JSON.stringify(localAssetList)); // 將 localStockList 從 object 轉 string 後塞到 localstorage
        }

        this.$store.commit('SAVE_ASSET', localAssetList);
    },
    methods: {
        onAddAsset() {
            console.log('onAddAsset');

            this.assetList.push({
                account: '',
                amount: 0,
            });
        },
        onDelAsset(index) {
            this.assetList.splice(index, 1);
            this.$store.commit('SAVE_ASSET', this.assetList);
        },
        onResetAsset() {
            localStorage.removeItem('assetList');
        },
        onChangeAccount(e, index) {
            console.log('onChangeAccount');
            this.assetList[index].account = e.target.value;
            this.$store.commit('SAVE_ASSET', this.assetList);
        },
        onChangeAmount(e, index) {
            console.log('onChangeAmount');
            this.assetList[index].amount = e.target.value ? parseInt(e.target.value, 10) : 0;
            this.$store.commit('SAVE_ASSET', this.assetList);
        },
    },
};
</script>

<style lang="sass">
.el-input-group__prepend
    padding: 0 10px!important
.el-card__body
    padding: 8px
</style>
