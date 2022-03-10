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
                    <br />
                    <el-tag class="ml-2" size="large" style="margin: 1px 0px"
                        >資產
                        <span style="font-size: 20px"> $ </span>
                        <span style="font-size: 24px; font-weight: bold">
                            <number
                                :from="0"
                                :to="assets"
                                :format="currencyFormat"
                                :duration="1"
                                :delay="0"
                                easing="Power1.easeOut"
                            />
                        </span>
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
                <el-input
                    size="small"
                    placeholder=""
                    v-model="item.account"
                    :ref="`asset${index}`"
                    @keyup="onChangeAccount($event, index)"
                >
                    <template #prepend>帳戶</template>
                </el-input>
            </el-col>
            <el-col :xs="9" :sm="10" :md="7" :lg="4" :xl="3" style="padding-left: 4px">
                <ElCurrencyInput
                    size="small"
                    placeholder=""
                    v-model="item.amount"
                    @keyup="onChangeAmount($event, index)"
                    :options="{
                        locale: 'en-US',
                        currency: 'USD',
                        currencyDisplay: 'hidden',
                        hideCurrencySymbolOnFocus: true,
                        hideGroupingSeparatorOnFocus: true,
                        hideNegligibleDecimalDigitsOnFocus: true,
                        autoDecimalDigits: false,
                        autoSign: true,
                        useGrouping: true,
                        accountingSign: false,
                    }"
                />
            </el-col>
            <el-col :xs="3" :sm="10" :md="7" :lg="4" :xl="3" style="padding-left: 4px">
                <el-button type="danger" size="small" @click="onDelAsset(index, item.account)" round plain
                    ><i class="el-icon-minus"></i
                ></el-button>
            </el-col>
        </el-row>
        <el-row>
            <el-col :xs="24" :sm="10" :md="7" :lg="4" :xl="3" style="padding-left: 4px; padding-top: 4px">
                <el-button type="primary" size="small" @click="onAddAsset" round plain><i class="el-icon-plus"></i></el-button>
            </el-col>
            <!-- <el-col :xs="24" :sm="10" :md="7" :lg="4" :xl="3" style="padding-left: 4px; padding-top: 4px">
                <el-button type="primary" size="small" @click="onResetAsset" round><i class="el-icon-minus"></i></el-button>
            </el-col> -->
        </el-row>
        <br />
        <div style="font-size: 14px; color: #999; margin: 20px">
            <div>【帳戶】請輸入帳戶名稱，若輸入包括關鍵字(活存、 定存)時，將會統計至「資產配置表」</div>
            <div>【$】請輸入帳戶目前金額，若輸入正值(或 負值)時，將會累計金額至「資產負債表」的資產(或 負債)。」</div>
        </div>
        <br /><br />
        <br /><br />
    </div>
</template>

<script>
import _ from 'lodash';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { BarChart, PieChart } from 'vue-chart-3';
import { ElMessageBox, ElMessage } from 'element-plus';
import ElCurrencyInput from '../components/ElCurrencyInput.vue';

Chart.register(...registerables);
// Register the plugin to all charts:
Chart.register(ChartDataLabels);

export default {
    name: 'component-asset',
    // components: { highcharts: Chart },
    components: { ElCurrencyInput, BarChart, PieChart },

    data() {
        return {
            // assetList: [],
            value: 1234,
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
                    tooltip: {
                        callbacks: {
                            label(context) {
                                let label = context.dataset.label || '';

                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += `$ ${context.parsed.y.toLocaleString('en-US')}`;
                                }
                                return label;
                            },
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
                    tooltip: {
                        callbacks: {
                            label(context) {
                                console.log(context);
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += `$ ${context.parsed.toLocaleString('en-US')}`;
                                }
                                return label;
                            },
                        },
                    },
                    legend: {
                        display: false,
                    },
                },
            },
        };
    },
    computed: {
        stockList() {
            return this.$store.state.price.stockList;
        },
        assetList() {
            return this.$store.state.asset.assetList;
        },
        assets() {
            return (
                this.stockDeposit +
                this.assetList.reduce((acc, { amount }) => {
                    if (amount >= 0) return acc + amount;
                    return acc;
                }, 0)
            );
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
        stockCostExistOfRateReturn() {
            // 定存 sum
            return this.$store.state.price.stockList.reduce((acc, { cost }) => {
                if (cost && cost.rate_of_return) acc.push(cost.rate_of_return);
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
                        data: this.stockCostExistOfRateReturn,
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
        horizontalBarOptions() {
            const { stockList } = this;
            return {
                indexAxis: 'y',

                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label(context) {
                                console.log(context);
                                console.log(stockList);
                                console.log(this.stockList);
                                // 用股票名稱去找
                                const foundStock = _.find(stockList, { name: context.label });
                                console.log(foundStock);

                                let label = context.dataset.label || '';

                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += ` 成本：$ ${foundStock.cost.sum.toLocaleString(
                                        'en-US'
                                    )} (+$ ${foundStock.cost.return.toLocaleString('en-US')})`;
                                }
                                return label;
                            },
                        },
                    },
                    title: {
                        display: true,
                        text: '股票損益表',
                        // align: 'start',
                        padding: {
                            top: 5,
                            bottom: 10,
                        },
                        // color: 'blue',
                    },
                    datalabels: {
                        anchor: 'end', // remove this line to get label in middle of the bar
                        align: 'end',
                        formatter: (val) => {
                            if (!val || val === 0) return '';
                            return `${Number(val.toFixed(1))} %`;
                        },
                        labels: {
                            // value: {
                            //     color: 'blue',
                            // },
                        },
                    },
                },
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
        console.log('created asset');
        // 取得 localstorage 自選股，最先開始是 null 時，會給予預設值空矩陣
        const localAssetList = JSON.parse(localStorage.getItem('assetList')) || [];
        console.log(localAssetList);
        if (_.isEmpty(localAssetList)) {
            localAssetList.push(...this.assetList); // 新增 append 預設到 localStockList
            localStorage.setItem('assetList', JSON.stringify(localAssetList)); // 將 localStockList 從 object 轉 string 後塞到 localstorage
        }

        this.$store.commit('SAVE_ASSET', localAssetList);
        console.log('created asset over');
    },
    methods: {
        onAddAsset() {
            console.log('onAddAsset');

            const index = this.assetList.push({
                account: '',
                amount: 0,
            });

            this.$nextTick(() => {
                this.$refs[`asset${index - 1}`][0].focus();
            });
        },
        onDelAsset(index, assetName) {
            if (assetName) {
                ElMessageBox.confirm(`將要刪除[${assetName}]?`, '刪除', {
                    confirmButtonText: '刪除',
                    cancelButtonText: '取消',
                    type: 'warning',
                })
                    .then(() => {
                        this.assetList.splice(index, 1);
                        this.$store.commit('SAVE_ASSET', this.assetList);
                        ElMessage({
                            type: 'success',
                            message: '完成刪除!',
                        });
                    })
                    .catch(() => {
                        ElMessage({
                            type: 'info',
                            message: '取消刪除!',
                        });
                    });
            } else {
                // 沒有名稱，可能剛新增就想刪，就直接刪
                this.assetList.splice(index, 1);
                this.$store.commit('SAVE_ASSET', this.assetList);
            }
        },
        onResetAsset() {
            localStorage.removeItem('assetList');
            localStorage.removeItem('dividendList');
            localStorage.removeItem('crawlerDividendLastDate');
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
        onClickSelectAll(index) {
            this.$refs[`amount${index}`][0].select();
        },
        currencyFormat(number) {
            return Number(number.toFixed(0)).toLocaleString('en-US');
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
