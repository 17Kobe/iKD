<template>
    <div>
        <el-row style="display: flex; flex-wrap: wrap">
            <el-col :xs="12" :sm="10" :md="7" :lg="7" :xl="5" style="display: flex; padding: 4px 2px 0 4px">
                <el-card shadow="hover" ref="leftCard" style="flex: 1">
                    <BarChart :chartData="barData" :options="barOptions" />
                </el-card>
            </el-col>
            <el-col :xs="12" :sm="10" :md="7" :lg="7" :xl="5" style="display: flex; padding: 4px 4px 0 2px">
                <el-card shadow="hover" style="flex: 1" id="line-chart-card">
                    <div style="font-size: 12px; text-align: center; font-weight: bold; margin-top: 2px; color: #6c6c6c">
                        資產走勢 (今日: $
                        <span :style="[todayAsset >= 0 ? { color: '#409eff' } : { color: '#f56c6c' }]">{{
                            (todayAsset >= 0 ? '+' : '') + todayAsset.toLocaleString('en-US')
                        }}</span
                        >)
                    </div>
                    <el-tooltip
                        class="box-item"
                        effect="dark"
                        :content="`今日增減： ${todayAsset.toLocaleString('en-US')}`"
                        placement="bottom"
                    >
                        <el-tag class="my-1" size="large" style="width: 100%; text-align: right"
                            >總計
                            <span style="font-size: 20px"> $ </span>
                            <span style="font-size: 24px; font-weight: bold">
                                <number
                                    :from="0"
                                    :to="assets"
                                    :format="currencyFormat"
                                    :duration="1"
                                    :delay="0"
                                    easing="Power1.easeOut"
                                /> </span
                            >&nbsp;元
                        </el-tag>
                    </el-tooltip>
                    <!-- <el-tag class="ml-2" size="small" style="margin: 1px 0px"
                        >股票損益 <span style="font-size: 20px; font-weight: bold">$ {{ assets.toLocaleString('en-US') }}</span>
                    </el-tag> -->
                    <br />
                    <!-- <span v-if="demandDeposit > 0" style="margin-right: 2px">
                        &nbsp;&nbsp;&nbsp;<el-tag type="info" class="ml-2" size="small" style="margin: 1px 0px"
                            >活存
                            <span style="font-size: 15px; font-weight: bold">$ {{ demandDeposit.toLocaleString('en-US') }}</span
                            ><span style="font-size: 10px"> 元</span>
                        </el-tag>
                    </span>
                    <span v-if="fixedDeposit > 0" style="margin-right: 2px">
                        <br />&nbsp;&nbsp;&nbsp;<el-tag type="info" class="ml-2" size="small" style="margin: 1px 0px"
                            >定存
                            <span style="font-size: 15px; font-weight: bold">$ {{ fixedDeposit.toLocaleString('en-US') }}</span
                            ><span style="font-size: 10px"> 元</span>
                        </el-tag>
                    </span>
                    <span v-if="stockDeposit > 0" style="margin-right: 2px">
                        <br />&nbsp;&nbsp;&nbsp;<el-tag type="info" class="ml-2" size="small" style="margin: 1px 0px"
                            >股票
                            <span style="font-size: 15px; font-weight: bold">$ {{ stockDeposit.toLocaleString('en-US') }}</span
                            ><span style="font-size: 10px"> 元</span>
                        </el-tag>
                    </span>
                    <span v-if="otherDeposit > 0" style="margin-right: 2px">
                        <br />&nbsp;&nbsp;&nbsp;<el-tag type="info" class="ml-2" size="small" style="margin: 1px 0px"
                            >其它
                            <span style="font-size: 15px; font-weight: bold">$ {{ otherDeposit.toLocaleString('en-US') }}</span
                            ><span style="font-size: 10px"> 元</span>
                        </el-tag>
                    </span> -->
                    <LineChart :chartData="lineData" :options="lineOptions" style="height: 100%" />
                </el-card>
            </el-col>
        </el-row>
        <el-row style="margin-bottom: 4px">
            <el-col :xs="12" :sm="10" :md="7" :lg="7" :xl="5" style="padding: 4px 2px 0 4px">
                <el-card shadow="hover" class="horizontal-bar">
                    <PieChart :chartData="pieData" :options="pieOptions" />
                </el-card>
            </el-col>
            <el-col :xs="12" :sm="10" :md="7" :lg="7" :xl="5" style="padding: 4px 4px 0 2px">
                <el-card shadow="hover" class="horizontal-bar">
                    <BarChart :chartData="horizontalBarData" :options="horizontalBarOptions" />
                </el-card>
            </el-col>
        </el-row>
        <!-- <chart v-if="loaded" :chartdata="chartdata" :options="options"> </chart> -->
        <template v-for="(item, index) in spreadList" :key="index">
            <el-row style="margin-bottom: 1px">
                <el-col :xs="12" :sm="10" :md="7" :lg="7" :xl="5" style="padding-left: 4px">
                    <el-input
                        size="small"
                        placeholder=""
                        v-model="item.name"
                        class="stock-deposit-bg"
                        readonly
                        :style="{ 'pointer-events': 'none' }"
                    >
                        <template #prepend><span>股票</span></template>
                    </el-input>
                </el-col>
                <el-col :xs="9" :sm="10" :md="7" :lg="7" :xl="5" style="padding-left: 4px">
                    <ElCurrencyInput
                        size="small"
                        placeholder=""
                        v-model="item.cost.market_value"
                        class="stock-deposit-bg"
                        :is-stock="true"
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
                <el-col :xs="3" :sm="10" :md="7" :lg="7" :xl="5" style="padding-left: 4px"> </el-col>
            </el-row>
        </template>
        <template v-for="(item, index) in assetList" :key="index">
            <el-row v-if="item.isPositive">
                <el-col :xs="12" :sm="10" :md="7" :lg="7" :xl="5" style="padding-left: 4px">
                    <el-input
                        size="small"
                        placeholder=""
                        v-model="item.account"
                        :ref="`deposit${index}`"
                        :class="[
                            item.account.includes('活存') || item.account.includes('現金')
                                ? 'demand-deposit-bg'
                                : item.account.includes('定存')
                                ? 'fixed-deposit-bg'
                                : item.account.includes('股票')
                                ? 'stock-deposit-bg'
                                : 'other-deposit-bg',
                        ]"
                        @change="onChangeAccount($event, index)"
                    >
                        <template #prepend><span>帳戶</span></template>
                    </el-input>
                </el-col>
                <el-col :xs="9" :sm="10" :md="7" :lg="7" :xl="5" style="padding-left: 4px">
                    <ElCurrencyInput
                        size="small"
                        placeholder=""
                        v-model="item.amount"
                        :ref="`deposit2${index}`"
                        @keyup="onChangeAmount($event, index)"
                        :class="[
                            item.account.includes('活存') || item.account.includes('現金')
                                ? 'demand-deposit-bg'
                                : item.account.includes('定存')
                                ? 'fixed-deposit-bg'
                                : item.account.includes('股票')
                                ? 'stock-deposit-bg'
                                : 'other-deposit-bg',
                        ]"
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
                <el-col :xs="3" :sm="3" :md="7" :lg="7" :xl="5" style="padding-left: 4px">
                    <el-button type="danger" size="small" @click="onDelAsset(index, item.account)" round plain
                        ><i class="el-icon-minus"></i
                    ></el-button>
                </el-col>
            </el-row>
        </template>
        <el-row>
            <el-col :xs="24" :sm="10" :md="7" :lg="7" :xl="5" style="padding: 2px 4px 5px 4px">
                <el-button type="primary" size="small" @click="onAddDeposit" round plain
                    ><i class="el-icon-plus"></i> 新增資產</el-button
                >
            </el-col>
            <!-- <el-col :xs="24" :sm="10" :md="7" :lg="7" :xl="3" style="padding-left: 4px; padding-top: 4px">
                <el-button type="primary" size="small" @click="onResetAsset" round><i class="el-icon-minus"></i></el-button>
            </el-col> -->
        </el-row>

        <template v-for="(item, index) in assetList" :key="index">
            <el-row v-if="!item.isPositive">
                <el-col :xs="12" :sm="10" :md="7" :lg="7" :xl="5" style="padding-left: 4px">
                    <el-input
                        size="small"
                        placeholder=""
                        v-model="item.account"
                        :ref="`debt${index}`"
                        class="liabilities-deposit-bg"
                        @change="onChangeAccount($event, index)"
                    >
                        <template #prepend>帳戶</template>
                    </el-input>
                </el-col>
                <el-col :xs="9" :sm="10" :md="7" :lg="7" :xl="5" style="padding-left: 4px">
                    <ElCurrencyInput
                        size="small"
                        placeholder=""
                        v-model="item.amount"
                        class="liabilities-deposit-bg"
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
                <el-col :xs="3" :sm="3" :md="7" :lg="7" :xl="5" style="padding-left: 4px">
                    <el-button type="danger" size="small" @click="onDelAsset(index, item.account)" round plain
                        ><i class="el-icon-minus"></i
                    ></el-button>
                </el-col>
            </el-row>
        </template>
        <el-row>
            <el-col :xs="24" :sm="10" :md="7" :lg="6" :xl="5" style="padding: 2px 4px 5px 4px">
                <el-button type="primary" size="small" @click="onAddDebt" round plain
                    ><i class="el-icon-plus"></i> 新增負債</el-button
                >
            </el-col>
            <!-- <el-col :xs="24" :sm="10" :md="7" :lg="7" :xl="3" style="padding-left: 4px; padding-top: 4px">
                <el-button type="primary" size="small" @click="onResetAsset" round><i class="el-icon-minus"></i></el-button>
            </el-col> -->
        </el-row>

        <div style="font-size: 14px; color: #999; margin: 20px">
            <div>
                【帳戶】請輸入帳戶名稱，輸入若包括關鍵字(活存|現金、
                定存)時會自動分類統計(現金、定存)至資產配置。股票則會自動同步。
            </div>
            <div>【$】請輸入帳戶目前金額。</div>
        </div>

        <el-row style="display: flex; flex-wrap: wrap">
            <el-col :xs="24" :sm="20" :md="14" :lg="14" :xl="20" style="display: flex; padding: 4px 2px 0 4px">
                <el-card shadow="hover" ref="leftCard" style="flex: 1">
                    <BarChart :chartData="bar2Data" :options="bar2Options" />
                </el-card>
            </el-col>
        </el-row>
        <br /><br />
        <br /><br />
    </div>
</template>

<script>
import _ from 'lodash';
import moment from 'moment';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-moment';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { BarChart, PieChart, LineChart } from 'vue-chart-3';
import { ElMessageBox, ElMessage } from 'element-plus';
import ElCurrencyInput from '@/components/ElCurrencyInput.vue';

Chart.register(...registerables);
// Register the plugin to all charts:
Chart.register(ChartDataLabels);

export default {
    name: 'component-asset',
    // components: { highcharts: Chart },
    components: { ElCurrencyInput, BarChart, PieChart, LineChart },

    data() {
        return {
            assetList: [],
            lineOptions: {
                // 隱藏點
                elements: {
                    point: {
                        radius: 0,
                        hitRadius: 3,
                        hoverRadius: 5,
                    },
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'month',
                            displayFormats: {
                                quarter: '[Q]Q - YYYY',
                            },
                        },
                        ticks: {
                            callback: function (value, index, ticks) {
                                let showMonth = '';
                                if (value.includes('Jan')) showMonth = value.replace('Jan ', '') + '-1月';
                                else if (value.includes('Feb')) showMonth = '2月';
                                else if (value.includes('Mar')) showMonth = '3月';
                                else if (value.includes('Apr')) showMonth = '4月';
                                else if (value.includes('May')) showMonth = '5月';
                                else if (value.includes('Jun')) showMonth = '6月';
                                else if (value.includes('Jul')) showMonth = '7月';
                                else if (value.includes('Aug')) showMonth = '8月';
                                else if (value.includes('Sep')) showMonth = '9月';
                                else if (value.includes('Oct')) showMonth = '10月';
                                else if (value.includes('Nov')) showMonth = '11月';
                                else if (value.includes('Dec')) showMonth = '12月';
                                return showMonth;
                            },
                        },
                    },
                    y: {
                        ticks: {
                            suggestedMin: 0,
                            // min: 0, // it is for ignoring negative step.
                            // beginAtZero: true,
                            // stepSize: 100000,
                            callback(value, index, ticks) {
                                // console.log(ticks);
                                //有小數點就不顯示，可以是 step以0.5前進
                                if (value.toString().includes('.')) return '';
                                // 超過5個就顯示3個，所以最多有可能顯示4個
                                else if (ticks.length >= 6 && index % 3 >= 1) return '';
                                else if (ticks.length === 5 && index % 2 === 1) return '';
                                // 怕顯示萬結果都一樣
                                else if (ticks.length >= 6 && ticks[4].value - ticks[0].value >= 1000 && value >= 10000)
                                    return `$ ${Number((value / 10000).toFixed(1))} 萬`;
                                else if (ticks.length === 5 && ticks[2].value - ticks[0].value >= 1000 && value >= 10000)
                                    return `$ ${Number((value / 10000).toFixed(1))} 萬`;
                                else if (
                                    ticks.length < 5 &&
                                    ticks.length >= 2 &&
                                    ticks[1].value - ticks[0].value >= 1000 &&
                                    value >= 10000
                                )
                                    return `$ ${Number((value / 10000).toFixed(1))} 萬`;
                                // else if (ticks.length >= 2 && ticks[1].value - ticks[0].value < 1000)
                                //     return `$ ${value.toLocaleString('en-US')}`;
                                // else if (value >= 10000) return `$ ${Number((value / 10000).toFixed(1))} 萬`;
                                else return `$ ${value.toLocaleString('en-US')}`;
                            },
                        },
                    },
                },
                plugins: {
                    title: {
                        display: false,
                    },
                    datalabels: {
                        display: false,
                        // formatter: (value, ctx) => {
                        //     console.log(ctx);
                        //     let sum = 0;
                        //     const dataArr = ctx.chart.data.datasets[0].data;
                        //     dataArr.map((data) => {
                        //         sum += data;
                        //     });
                        //     const itemName = ['活存', '定存', '股票', '其它'];
                        //     console.log(value);
                        //     if (value === 0) return '';
                        //     const percentage = `  ${itemName[ctx.dataIndex]}\n${((value * 100) / sum).toFixed(2)} %`;
                        //     return percentage;
                        // },
                        // color: '#fff',
                    },
                    tooltip: {
                        callbacks: {
                            title(context) {
                                const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
                                return (
                                    moment(context[0].parsed.x).format('M/DD') +
                                    '(' +
                                    dayOfWeek[moment(context[0].parsed.x).day()] +
                                    ')'
                                );
                            },
                            label(context) {
                                // console.log(context);
                                return (
                                    ' $ ' +
                                    context.parsed.y.toLocaleString('en-US') +
                                    ' ( ' +
                                    (context.raw.diff >= 0 ? '+' : '') +
                                    context.raw.diff.toLocaleString('en-US') +
                                    ' )'
                                );
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
        historyAssetList() {
            return this.$store.getters.getHistoryAssetList();
        },
        todayAsset() {
            const historyAssetList = this.historyAssetList;
            if (_.size(historyAssetList) === 1) {
                return 0;
            }
            const last = _.last(historyAssetList);
            const secondLast = _.nth(historyAssetList, -2);
            const diff = last.y - secondLast.y;
            return diff;
        },
        spreadList() {
            return this.$store.getters.getSpreadList('目前', true);
        },
        stockList() {
            return this.$store.state.price.stockList;
        },
        storeAssetList() {
            return this.$store.state.asset.assetList;
        },
        assets() {
            const tempAssets =
                this.stockDeposit +
                this.assetList.reduce((acc, { amount, isPositive }) => {
                    if (isPositive) return acc + amount;
                    return acc;
                }, 0);

            // console.log('=======assets');

            // 存到歷史存款去
            this.$store.commit('ADD_OR_UPDATE_HISTORY_ASSET_LIST', [
                moment().format('YYYY-MM-DD'), // 日期
                tempAssets, // 總存款
            ]);

            return tempAssets;
        },
        liabilities() {
            return this.assetList.reduce((acc, { amount, isPositive }) => {
                if (!isPositive) return acc + Math.abs(amount);
                return acc;
            }, 0);
        },
        netAssets() {
            return this.assets - this.liabilities;
        },
        usAssets() {
            const tempAssets = this.assetList.reduce((acc, { account, amount, isPositive }) => {
                if (isPositive && account.includes('美金')) return acc + amount;
                return acc;
            }, 0);

            return tempAssets;
        },
        leverageAssetsd() {
            return ((this.liabilities * 100) / this.assets).toFixed(1);
        },
        demandDeposit() {
            // 活存 sum
            return this.assetList.reduce((acc, { account, amount }) => {
                if (account.includes('活存') || account.includes('現金')) return acc + Math.abs(amount);
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
                if (cost && cost.sum) return acc + cost.sum + cost.return;
                return acc;
            }, 0);
        },
        // fundDeposit() {
        //     // 定存 sum
        //     return this.assetList.reduce((acc, { account, amount }) => {
        //         if (account.includes('基金')) return acc + Math.abs(amount);
        //         return acc;
        //     }, 0);
        // },
        otherDeposit() {
            // 其它 sum
            return this.assetList.reduce((acc, { account, amount, isPositive }) => {
                if (!account.includes('定存') && !account.includes('活存') && !account.includes('現金') && isPositive)
                    return acc + Math.abs(amount);
                return acc;
            }, 0);
        },
        stockSumOfCostReturn() {
            return _.sumBy(this.spreadList, 'cost.return');
        },
        stockCostExistAndTop5List() {
            // 存在 cost 設定的股票名稱
            return _.orderBy(
                _.filter(this.$store.state.price.stockList, (o) => o.cost),
                ['cost.sum'],
                ['desc']
            ).slice(0, 5);
            // return this.$store.state.price.stockList, ['cost.sum'], ['desc']);
        },
        stockCostExistOfName() {
            // 存在 cost 設定的股票名稱
            return this.stockCostExistAndTop5List.reduce((acc, { name }) => {
                let tempName = name;
                tempName = tempName.replace('基金', '').replace('A2', '');
                acc.push(tempName);
                return acc;
            }, []);
        },
        // stockCostExistOfRateReturn() {
        //     // 存在 cost 設定的股票回報率
        //     return this.$store.state.price.stockList.reduce((acc, { cost }) => {
        //         if (cost && cost.rate_of_return) acc.push(cost.rate_of_return);
        //         return acc;
        //     }, []);
        // },
        stockCostExistOfReturn() {
            // 存在 cost 設定的股票回報金額
            return this.stockCostExistAndTop5List.reduce((acc, { cost }) => {
                acc.push(cost.return);
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
        barOptions() {
            return {
                scales: {
                    y: {
                        ticks: {
                            callback(value, index, ticks) {
                                if (value >= 10000) return `$ ${Number((value / 10000).toFixed(1))} 萬`;
                                else return `$ ${value}`;
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
                        text: `淨資產: $ ${Number((this.netAssets / 10000).toFixed(1))} 萬。桿杆率: ${this.leverageAssetsd}%`,
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
            };
        },
        pieOptions() {
            return {
                plugins: {
                    title: {
                        display: true,
                        // text: '資產配置',
                        text: `美金: $ ${Number((this.usAssets / 10000).toFixed(1))} 萬。占比: ${(
                            (this.usAssets * 100) /
                            this.assets
                        ).toFixed(1)}%`,
                        // align: 'start',
                        padding: {
                            top: 5,
                            bottom: 3,
                        },
                        // color: 'blue',
                    },
                    subtitle: {
                        display: true,
                        align: 'end',
                        position: 'bottom',
                        text: [
                            `現金：$ ${this.demandDeposit.toLocaleString('en-US')} 元 ( ${(this.demandDeposit / 10000).toFixed(
                                1
                            )} 萬 ) `,
                            `定存：$ ${this.fixedDeposit.toLocaleString('en-US')} 元 ( ${(this.fixedDeposit / 10000).toFixed(
                                1
                            )} 萬 ) `,
                            `股票：$ ${this.stockDeposit.toLocaleString('en-US')} 元 ( ${(this.stockDeposit / 10000).toFixed(
                                1
                            )} 萬 ) `,
                        ],
                        font: {
                            size: 13,
                        },
                    },
                    datalabels: {
                        formatter: (value, ctx) => {
                            // console.log(ctx);

                            let sum = 0;
                            const dataArr = ctx.chart.data.datasets[0].data;
                            dataArr.map((data) => {
                                sum += data;
                            });
                            const itemName = ['現金', '定存', '股票', '其它'];
                            // console.log(value);
                            if (value === 0) return '';
                            const percentage = `  ${itemName[ctx.dataIndex]}\n${((value * 100) / sum).toFixed(2)} %`;
                            return percentage;
                        },
                        // color: '#fff',
                    },
                    tooltip: {
                        callbacks: {
                            label(context) {
                                // console.log(context);
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
            };
        },
        horizontalBarData() {
            return {
                labels: this.stockCostExistOfName,
                datasets: [
                    {
                        data: this.stockCostExistOfReturn,
                        backgroundColor: [
                            // 背景色
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 244, 117, 0.2)',
                            'rgba(255, 189, 219, 0.2)',
                            'rgba(204, 255, 144, 0.2)',
                            'rgba(201, 203, 207, 0.2)',
                            'rgba(255, 159, 64, 0.2)',
                        ],
                        borderColor: [
                            'rgb(153, 102, 255)',
                            'rgb(168, 152, 32)',
                            'rgb(157, 86, 135)',
                            'rgba(103, 194, 58)',
                            'rgb(201, 203, 207)',
                            'rgba(255, 159, 64, 1)',
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

                scales: {
                    x: {
                        ticks: {
                            callback(value, index, ticks) {
                                if (value >= 10000 || value <= -10000) return `$ ${Number((value / 10000).toFixed(1))} 萬`;
                                else return `$ ${value}`;
                            },
                        },
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label(context) {
                                // console.log(context);
                                // console.log(stockList);
                                // console.log(this.stockList);
                                // 用股票名稱去找
                                const foundStock = _.find(stockList, { name: context.label });
                                // console.log(foundStock);

                                let label = context.dataset.label || '';

                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += ` 成本：$ ${foundStock.cost.sum.toLocaleString('en-US')} ( ${Number(
                                        foundStock.cost.rate_of_return.toFixed(1)
                                    )}% )`;
                                }
                                return label;
                            },
                        },
                    },
                    title: {
                        display: true,
                        // text: '股票本金 Top 5 的損益',
                        text: `股票損益。總計: $ ${this.stockSumOfCostReturn.toLocaleString('en-US')} 元`,
                        // align: 'start',
                        padding: {
                            top: 5,
                            bottom: 10,
                        },
                        // color: 'blue',
                    },
                    datalabels: {
                        clip: true,
                        anchor: 'start',
                        align: 'end',
                        offset: -30,
                        formatter: (val) => {
                            if (!val || val === 0) return '';
                            return `$ ${Number(val.toFixed(1)).toLocaleString('en-US')}`;
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
                            'rgba(255, 205, 86, 0.5)',
                            'rgba(255, 159, 64, 0.5)',
                            'rgba(75, 192, 192, 0.4)',
                            'rgba(153, 102, 255, 0.5)',
                            'rgba(204, 255, 144, 0.5)',
                        ],
                        // borderColor: ['rgb(66, 66, 66)'],
                        borderWidth: 2, // 外框寬度
                    },
                ],
            };
        },
        lineData() {
            return {
                // labels: ['2022-04-01', '2022-04-02', '2022-04-03'],
                datasets: [
                    {
                        // pointRadius: 0,
                        // data: [
                        // {
                        //     x: moment('2021-09-06'),
                        //     y: 564450,
                        // },
                        // {
                        //     x: moment('2021-10-06'),
                        //     y: 564450,
                        // },
                        // {
                        //     x: moment('2021-11-06'),
                        //     y: 564411,
                        // },
                        // {
                        //     x: moment('2021-11-07'),
                        //     y: 566450,
                        // },
                        // {
                        //     x: moment('2021-11-08'),
                        //     y: 561350,
                        // },
                        //     {
                        //         x: moment('2022-04-03'),
                        //         y: 879789,
                        //     },
                        //     {
                        //         x: moment('2022-04-04'),
                        //         y: 881335,
                        //     },
                        // ],
                        data: this.historyAssetList,
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderWidth: 2, // 外框寬度
                        fill: true /* this option hide background-color */,
                    },
                ],
            };
        },

        annualPassiveIncome() {
            const currentYear = moment().year();
            // 過濾最近的五年
            const spreadData = this.$store.state.dividend.historySpreadList.filter(
                (item) => moment(item.sell_date).year() >= currentYear - 4
            );
            const spreadResult = _(spreadData)
                .groupBy((item) => moment(item.sell_date).format('YYYY'))
                .map((group, year) => ({ year, sumSpread: _.sumBy(group, 'sell_return') }))
                .value();

            // 過濾最近的五年
            const dividendData = this.$store.state.dividend.historyDividendList.filter(
                (item) => moment(item.payment_date).year() >= currentYear - 4
            );
            const dividendResult = _(dividendData)
                .groupBy((item) => moment(item.payment_date).format('YYYY'))
                .map((group, year) => ({
                    year,
                    sumDividend: _.sumBy(group, (item) => Math.round(item.number_of_shares * item.earnings_distribution)),
                }))
                .value();
            // console.log(spreadResult);
            // console.log(dividendResult);
            // 整合 spreadData 和 dividendData，但這是價差年去找配息也許會有可能找不到，不過應該每年都有賣吧
            const integratedData = spreadResult.map((spreadItem) => {
                const matchingDividendItem = dividendResult.find((dividendItem) => dividendItem.year === spreadItem.year);

                return {
                    year: spreadItem.year,
                    sumSpread: spreadItem.sumSpread || 0,
                    sumDividend: matchingDividendItem ? matchingDividendItem.sumDividend || 0 : 0,
                    total: (spreadItem.sumSpread || 0) + (matchingDividendItem ? matchingDividendItem.sumDividend || 0 : 0),
                };
            });
            return integratedData;
        },
        bar2Data() {
            const years = _.map(this.annualPassiveIncome, (item) => `${item.year} 年`);
            const totals = _.map(this.annualPassiveIncome, 'total');
            return {
                labels: years,
                datasets: [
                    {
                        data: totals,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgb(54, 162, 235)',
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
        bar2Options() {
            const { annualPassiveIncome } = this;
            return {
                scales: {
                    y: {
                        ticks: {
                            callback(value, index, ticks) {
                                if (value >= 10000) return `$ ${Number((value / 10000).toFixed(1))} 萬`;
                                else return `$ ${value}`;
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
                        text: `歷年被動收入`,
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
                            else if (val > 100000) return `$ ${Number((val / 10000).toFixed(1))} 萬`;
                            else return `$ ${Number(val.toFixed(1)).toLocaleString('en-US')} 元`;
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
                                const xLabel = context.label; // 取出 '2023 年'
                                const year = xLabel.split(' ')[0]; // 取出 '2023'
                                var foundObj = _.find(annualPassiveIncome, { year: year });
                                // console.log(foundObj);
                                let label = '';
                                if (foundObj.total) label += `總計 $ ${foundObj.total.toLocaleString('en-US')}`;
                                label += ' ( ';
                                if (foundObj.sumSpread) label += `價差 $ ${foundObj.sumSpread.toLocaleString('en-US')}`;
                                if (foundObj.sumDividend) label += `; 股利 $ ${foundObj.sumDividend.toLocaleString('en-US')}`;
                                label += ' )';
                                return label;
                            },
                        },
                    },
                },
            };
        },
    },
    created() {
        // console.log('created asset');
        // 取得 localstorage 自選股，最先開始是 null 時，會給予預設值空矩陣
        const localAssetList = JSON.parse(localStorage.getItem('assetList')) || [];
        // console.log(localAssetList);
        if (_.isEmpty(localAssetList)) {
            localAssetList.push(...this.storeAssetList); // 新增 append 預設到 localStockList
            localStorage.setItem('assetList', JSON.stringify(localAssetList)); // 將 localStockList 從 object 轉 string 後塞到 localstorage
        }

        this.$store.commit('SAVE_ASSET', localAssetList);

        // localstorage 儲存是有負值，在這要轉成無負債
        this.assetList = localAssetList.reduce((acc, { account, amount }) => {
            acc.push({ account: account, amount: Math.abs(amount), isPositive: amount >= 0 });
            return acc;
        }, []);
        // console.log('created asset over!');

        // 歷史存款
        const localHistoryAssettList = JSON.parse(localStorage.getItem('historyAssetList')) || [];
        this.$store.commit('SAVE_HISTORY_ASSET_LIST', localHistoryAssettList);
    },
    methods: {
        onAddDeposit() {
            console.log('onAddDeposit');

            const index = this.assetList.push({
                account: '',
                amount: 0,
                isPositive: true,
            });

            this.$nextTick(() => {
                this.$refs[`deposit${index - 1}`][0].focus();
            });
        },
        onAddDebt() {
            console.log('onAddDebt');

            const index = this.assetList.push({
                account: '',
                amount: 0,
                isPositive: false,
            });

            this.$nextTick(() => {
                this.$refs[`debt${index - 1}`][0].focus();
            });
        },
        onDelAsset(index, assetName) {
            // console.log(index);
            if (assetName) {
                ElMessageBox.confirm(`將要刪除[${assetName}]?`, '刪除', {
                    confirmButtonText: '刪除',
                    cancelButtonText: '取消',
                    type: 'warning',
                })
                    .then(() => {
                        this.assetList.splice(index, 1);
                        this.$store.commit('SAVE_ASSET', this.chgAssetListBrief(this.assetList));
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
                this.$store.commit('SAVE_ASSET', this.chgAssetListBrief(this.assetList));
            }
        },
        onResetAsset() {
            localStorage.removeItem('assetList');
            localStorage.removeItem('dividendList');
            localStorage.removeItem('crawlerDividendLastDate');
        },
        onChangeAccount(e, index) {
            // console.log('onChangeAccount');
            // console.log(index);
            // console.log(e);
            // console.log(e.target.value);
            this.assetList[index].account = e;
            this.$store.commit('SAVE_ASSET', this.chgAssetListBrief(this.assetList));
        },
        onChangeAmount(e, index) {
            // console.log('onChangeAmount');
            // console.log(index);
            // console.log(e.target.value);
            this.assetList[index].amount = e.target.value ? parseInt(e.target.value, 10) : 0;
            this.$store.commit('SAVE_ASSET', this.chgAssetListBrief(this.assetList));
        },
        // onChangeDepositAmount(e, index) {
        //     console.log('onChangeAmount');
        //     console.log(index);
        //     // this.assetList[index].amount = e.target.value ? parseInt(e.target.value, 10) : 0;
        //     // this.$store.commit('SAVE_ASSET', this.assetList);
        // },
        // onChangeDebtAmount(e, index) {
        //     console.log('onChangeAmount');
        //     console.log(e);
        //     this.assetList[index].amount = e.target.value ? -parseInt(e.target.value, 10) : -1000;
        //     this.$store.commit('SAVE_ASSET', this.assetList);
        // },
        onClickSelectAll(index) {
            this.$refs[`amount${index}`][0].select();
        },
        currencyFormat(number) {
            return Number(number.toFixed(0)).toLocaleString('en-US');
        },
        chgAssetListBrief(assetList) {
            return assetList.reduce((acc, { account, amount, isPositive }) => {
                if (isPositive) acc.push({ account: account, amount: amount });
                else acc.push({ account: account, amount: -amount });
                return acc;
            }, []);
        },
    },
};
</script>

<style lang="sass">
.el-input-group__prepend
    padding: 0 10px!important
.el-card__body
    padding: 3px
.horizontal-bar .el-card__body
    padding: 3px 2px
#line-chart
    height: 133px

.demand-deposit-bg > .el-input-group__prepend
    background: rgba(255, 205, 86, 0.5)
.fixed-deposit-bg > .el-input-group__prepend
    background: rgba(255, 159, 64, 0.5)
.stock-deposit-bg > .el-input-group__prepend
    background: rgba(75, 192, 192, 0.4)
.stock-deposit-bg > input
    background: #f7f7f7
.other-deposit-bg > .el-input-group__prepend
    background: rgba(153, 102, 255, 0.5)
.liabilities-deposit-bg > .el-input-group__prepend
    background: rgba(255, 99, 132, 0.2)
#line-chart-card > .el-card__body
    height: calc(100% - 61px)
</style>
