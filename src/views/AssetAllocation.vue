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
        <el-row>
            <el-col :xs="12" :sm="10" :md="7" :lg="4" :xl="3" style="padding-left: 4px">
                <el-input size="small" placeholder="">
                    <template #prepend>帳戶</template>
                </el-input>
            </el-col>
            <el-col :xs="9" :sm="10" :md="7" :lg="4" :xl="3" style="padding-left: 4px">
                <el-input size="small" placeholder="">
                    <template #prepend>金額</template>
                </el-input>
            </el-col>
            <el-col :xs="3" :sm="10" :md="7" :lg="4" :xl="3" style="padding-left: 4px">
                <el-button type="danger" size="small"><i class="el-icon-minus"></i></el-button>
            </el-col>
        </el-row>
        <el-row>
            <el-col :xs="24" :sm="10" :md="7" :lg="4" :xl="3" style="padding-left: 4px; padding-top: 4px">
                <el-button type="primary" size="small"><i class="el-icon-plus"></i></el-button>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';
import { DoughnutChart, BarChart, PieChart } from 'vue-chart-3';

Chart.register(...registerables);

// Chart options
Chart.defaults.global.legend.display = false;
//   Chart.defaults.global.tooltips.enabled = false;

export default {
    name: 'component-asset',
    components: { DoughnutChart, BarChart, PieChart },
    data() {
        return {
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
};
</script>

<style lang="sass" scoped>
.el-input-group__prepend
    padding: 0 10px!important
</style>
