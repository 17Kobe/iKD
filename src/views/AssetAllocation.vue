<template>
    <div>
        <el-row>
            <el-col :xs="12" :sm="10" :md="7" :lg="4" :xl="3" style="padding: 4px 2px 0 4px">
                <el-card shadow="hover">
                    <BarChart :chartData="barData" :options="barOptions" />
                </el-card>
            </el-col>
            <el-col :xs="12" :sm="10" :md="7" :lg="4" :xl="3" style="padding: 4px 4px 0 2px">
                <el-card shadow="hover" style="height: 201px">
                    <el-tag class="ml-2" size="small" style="margin: 1px 0px"
                        >資產 <span style="font-size: 32px; font-weight: bold">$ {{ assets.toLocaleString('en-US') }}</span>
                    </el-tag>
                    <!-- <el-tag class="ml-2" size="small" style="margin: 1px 0px"
                        >股票損益 <span style="font-size: 20px; font-weight: bold">$ {{ assets.toLocaleString('en-US') }}</span>
                    </el-tag> -->
                    <br />
                    <br />
                    <el-tag type="info" class="ml-2" size="small" style="margin: 1px 0px"
                        >活存總額
                        <span style="font-size: 15px; font-weight: bold">$ {{ demandDeposit.toLocaleString('en-US') }}</span>
                    </el-tag>
                    <el-tag type="info" class="ml-2" size="small" style="margin: 1px 0px"
                        >定存總額
                        <span style="font-size: 15px; font-weight: bold">$ {{ fixedDeposit.toLocaleString('en-US') }}</span>
                    </el-tag>
                    <el-tag type="info" class="ml-2" size="small" style="margin: 1px 0px"
                        >股票總額
                        <span style="font-size: 15px; font-weight: bold">$ {{ stockDeposit.toLocaleString('en-US') }}</span>
                    </el-tag>
                </el-card>
            </el-col>
        </el-row>
        <el-row>
            <el-col :xs="12" :sm="10" :md="7" :lg="4" :xl="3" style="padding: 4px 2px 0 4px">
                <el-card shadow="hover">
                    <PieChart :chartData="pieData" :options="pieOptions" />
                </el-card>
            </el-col>
            <el-col :xs="12" :sm="10" :md="7" :lg="4" :xl="3" style="padding: 4px 4px 0 2px">
                <el-card shadow="hover">
                    <BarChart :chartData="horizontalBarData" :options="horizontalBarOptions" />
                </el-card>
            </el-col>
        </el-row>
        <!-- <chart v-if="loaded" :chartdata="chartdata" :options="options"> </chart> -->
        <br />
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
                <el-button type="danger" size="small" @click="onDelAsset(index)" round><i class="el-icon-minus"></i></el-button>
            </el-col>
        </el-row>
        <el-row>
            <el-col :xs="24" :sm="10" :md="7" :lg="4" :xl="3" style="padding-left: 4px; padding-top: 4px">
                <el-button type="primary" size="small" @click="onAddAsset" round><i class="el-icon-plus"></i></el-button>
            </el-col>
            <!-- <el-col :xs="24" :sm="10" :md="7" :lg="4" :xl="3" style="padding-left: 4px; padding-top: 4px">
                <el-button type="primary" size="small" @click="onResetAsset" round><i class="el-icon-minus"></i></el-button>
            </el-col> -->
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
                scales: {
                    y: {
                        ticks: {
                            // Include a dollar sign in the ticks
                            callback(value, index, ticks) {
                                return `$ ${Number((value / 10000).toFixed(1))} 萬`;
                            },
                        },
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: '資產負債表',
                        // align: 'start',
                        padding: {
                            top: 5,
                            bottom: 20,
                        },
                        // color: 'blue',
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
                        // align: 'start',
                        padding: {
                            top: 5,
                            bottom: 10,
                        },
                        // color: 'blue',
                    },
                    datalabels: {
                        formatter: (value, ctx) => {
                            console.log(ctx);

                            let sum = 0;
                            const dataArr = ctx.chart.data.datasets[0].data;
                            dataArr.map((data) => {
                                sum += data;
                            });
                            const itemName = ['活存', '定存', '股票', '其它'];
                            console.log(value);
                            if (value === 0) return '';
                            const percentage = `  ${itemName[ctx.dataIndex]}\n${((value * 100) / sum).toFixed(2)} %`;
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
            horizontalBarOptions: {
                indexAxis: 'y',

                plugins: {
                    legend: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: '股票損益表',
                        // align: 'start',
                        padding: {
                            top: 5,
                            bottom: 20,
                        },
                        // color: 'blue',
                    },
                    datalabels: {
                        anchor: 'end', // remove this line to get label in middle of the bar
                        align: 'start',
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
        fixedDeposit() {
            // 定存 sum
            return this.assetList.reduce((acc, { account, amount }) => {
                if (account.includes('定存')) return acc + Math.abs(amount);
                return acc;
            }, 0);
        },
        stockDeposit() {
            // 定存 sum
            return this.$store.state.price.stockList.reduce((acc, { cost }) => {
                if (cost && cost.sum) return acc + cost.sum;
                return acc;
            }, 0);
        },
        otherDeposit() {
            // 定存 sum
            return this.assetList.reduce((acc, { account, amount }) => {
                if (!account.includes('定存') && !account.includes('活存') && amount >= 0) return acc + Math.abs(amount);
                return acc;
            }, 0);
        },
        stockCostExistOfName() {
            // 定存 sum
            return this.$store.state.price.stockList.reduce((acc, { name, cost }) => {
                if (cost && cost.sum) acc.push(name);
                return acc;
            }, []);
        },
        stockCostExistOfSum() {
            // 定存 sum
            return this.$store.state.price.stockList.reduce((acc, { cost }) => {
                if (cost && cost.sum) acc.push(cost.sum);
                return acc;
            }, []);
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
        horizontalBarData() {
            return {
                labels: this.stockCostExistOfName,
                datasets: [
                    {
                        data: this.stockCostExistOfSum,
                        backgroundColor: [
                            // 背景色
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(201, 203, 207, 0.2)',
                            'rgba(255, 205, 86, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)',
                        ],
                        borderColor: [
                            'rgb(75, 192, 192)',
                            'rgb(201, 203, 207)',
                            'rgb(255, 205, 86)',
                            'rgb(153, 102, 255)',
                            'rgb(255, 159, 64)',
                        ],
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
                labels: ['活存', '定存', '股票', '其它'],
                datasets: [
                    {
                        data: [this.demandDeposit, this.fixedDeposit, this.stockDeposit, this.otherDeposit],
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
