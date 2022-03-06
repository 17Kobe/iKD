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
                <el-card> <PieChart :chartData="pieData" /> </el-card>
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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { BarChart, PieChart } from 'vue-chart-3';

// import { Chart } from 'highcharts-vue';

Chart.register(...registerables);
// Register the plugin to all charts:
Chart.register(ChartDataLabels);
// Chart.register(...registerables);

// Chart options
// Chart.defaults.global.legend.display = false;
//   Chart.defaults.global.tooltips.enabled = false;

export default {
    name: 'component-asset',
    // components: { highcharts: Chart },
    components: { BarChart, PieChart },
    data() {
        return {
            // assetList: [],
            barData: {
                labels: ['資產', '負債'],
                datasets: [
                    {
                        data: [30, 40],
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
            },
            barOptions: {
                plugins: {
                    legend: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: '資產負債表',
                    },
                    datalabels: {
                        // anchor: 'end', // remove this line to get label in middle of the bar
                        align: 'start',
                        formatter: (val) => `$ ${val}`,
                        labels: {
                            // value: {
                            //     color: 'blue',
                            // },
                        },
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
        // chartOptions() {
        //     return {
        //         chart: {
        //             type: 'column',
        //         },
        //         title: {
        //             text: '2015年1月-5月，各浏览器的市场份额',
        //         },
        //         subtitle: {
        //             text: '点击可查看具体的版本数据，数据来源: <a href="https://netmarketshare.com">netmarketshare.com</a>.',
        //         },
        //         xAxis: {
        //             type: 'category',
        //         },
        //         yAxis: {
        //             title: {
        //                 text: '总的市场份额',
        //             },
        //         },
        //         legend: {
        //             enabled: false,
        //         },
        //         plotOptions: {
        //             series: {
        //                 borderWidth: 0,
        //                 dataLabels: {
        //                     enabled: true,
        //                     format: '{point.y:.1f}%',
        //                 },
        //             },
        //         },
        //         tooltip: {
        //             headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        //             pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>',
        //         },
        //         series: [
        //             {
        //                 name: '浏览器品牌',
        //                 colorByPoint: true,
        //                 data: [
        //                     {
        //                         name: 'Microsoft Internet Explorer',
        //                         y: 56.33,
        //                         drilldown: 'Microsoft Internet Explorer',
        //                     },
        //                     {
        //                         name: 'Chrome',
        //                         y: 24.03,
        //                         drilldown: 'Chrome',
        //                     },
        //                     {
        //                         name: 'Firefox',
        //                         y: 10.38,
        //                         drilldown: 'Firefox',
        //                     },
        //                     {
        //                         name: 'Safari',
        //                         y: 4.77,
        //                         drilldown: 'Safari',
        //                     },
        //                     {
        //                         name: 'Opera',
        //                         y: 0.91,
        //                         drilldown: 'Opera',
        //                     },
        //                     {
        //                         name: 'Proprietary or Undetectable',
        //                         y: 0.2,
        //                         drilldown: null,
        //                     },
        //                 ],
        //             },
        //         ],
        //         drilldown: {
        //             series: [
        //                 {
        //                     name: 'Microsoft Internet Explorer',
        //                     id: 'Microsoft Internet Explorer',
        //                     data: [
        //                         ['v11.0', 24.13],
        //                         ['v8.0', 17.2],
        //                         ['v9.0', 8.11],
        //                         ['v10.0', 5.33],
        //                         ['v6.0', 1.06],
        //                         ['v7.0', 0.5],
        //                     ],
        //                 },
        //                 {
        //                     name: 'Chrome',
        //                     id: 'Chrome',
        //                     data: [
        //                         ['v40.0', 5],
        //                         ['v41.0', 4.32],
        //                         ['v42.0', 3.68],
        //                         ['v39.0', 2.96],
        //                         ['v36.0', 2.53],
        //                         ['v43.0', 1.45],
        //                         ['v31.0', 1.24],
        //                         ['v35.0', 0.85],
        //                         ['v38.0', 0.6],
        //                         ['v32.0', 0.55],
        //                         ['v37.0', 0.38],
        //                         ['v33.0', 0.19],
        //                         ['v34.0', 0.14],
        //                         ['v30.0', 0.14],
        //                     ],
        //                 },
        //                 {
        //                     name: 'Firefox',
        //                     id: 'Firefox',
        //                     data: [
        //                         ['v35', 2.76],
        //                         ['v36', 2.32],
        //                         ['v37', 2.31],
        //                         ['v34', 1.27],
        //                         ['v38', 1.02],
        //                         ['v31', 0.33],
        //                         ['v33', 0.22],
        //                         ['v32', 0.15],
        //                     ],
        //                 },
        //                 {
        //                     name: 'Safari',
        //                     id: 'Safari',
        //                     data: [
        //                         ['v8.0', 2.56],
        //                         ['v7.1', 0.77],
        //                         ['v5.1', 0.42],
        //                         ['v5.0', 0.3],
        //                         ['v6.1', 0.29],
        //                         ['v7.0', 0.26],
        //                         ['v6.2', 0.17],
        //                     ],
        //                 },
        //                 {
        //                     name: 'Opera',
        //                     id: 'Opera',
        //                     data: [
        //                         ['v12.x', 0.34],
        //                         ['v28', 0.24],
        //                         ['v27', 0.17],
        //                         ['v29', 0.16],
        //                     ],
        //                 },
        //             ],
        //         },
        //     };
        // },
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
