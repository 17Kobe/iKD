<template>
    <div>
        <el-row type="flex" class="row-bg" justify="space-between">
            <el-col :span="10">
                <el-radio-group
                    v-model="selDataGrouping"
                    size="mini"
                    fill="#f5d44d"
                    text-color="black"
                    @change="onSelDataGrouping"
                >
                    <el-radio-button label="day" class="border-transparent">日線</el-radio-button>
                    <el-radio-button label="week" class="border-transparent">週線</el-radio-button>
                    <el-radio-button label="month" class="border-transparent">月線</el-radio-button>
                </el-radio-group>
                <br />&nbsp;
                <el-radio-group
                    id="timeRange"
                    v-model="timeRange"
                    size="mini"
                    fill="#fdcfe8"
                    text-color="black"
                    @change="onSelTimeRange"
                >
                    <el-radio-button label="3m">3個月</el-radio-button>
                    <el-radio-button label="6m">6個月</el-radio-button>
                    <el-radio-button label="1y">1年</el-radio-button>
                    <el-radio-button label="3y">3年</el-radio-button>
                    <el-radio-button label="5y">5年</el-radio-button>
                    <el-radio-button label="10y">10年</el-radio-button>
                </el-radio-group>
            </el-col>
            <el-col :span="4" class="text-center">
                <el-tag id="stock-name" effect="light" class="text-white bg-element-red">{{ stockName }}</el-tag>
                <el-tag id="stock-name" effect="light" class="text-black bg-i-gray">{{ stockSymbol }}</el-tag>
                <!-- 統一 (1216) -->
            </el-col>
            <el-col :span="10" class="text-right">
                <!-- <el-select v-model="techLineValue" placeholder="請選擇" size="mini" @change="onSelTechLine">
                    <el-option v-for="item in techLineOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                </el-select> -->
            </el-col>
        </el-row>
        <!-- :updateArgs="[true, true, true]" -->
        <highcharts :constructorType="'stockChart'" :options="options"></highcharts>
    </div>
</template>

<script>
// 這裡是用局部註冊，而非寫在 main.js 是全局註冊
import Highcharts from 'highcharts';
import loadStock from 'highcharts/modules/stock';
// 參考 https://github.com/weizhenye/vue-highcharts/issues/39
import loadIndicatorsAll from 'highcharts/indicators/indicators-all';
// 在這裡一定要用大括號，不然會錯，因為highcharts-vue.js中有命名為 Chart 的export
import { Chart } from 'highcharts-vue';
import moment from 'moment';
import _ from 'lodash';

// 因為 series 是股票圖，所以要導入 stock 模組，才能有 type: 'candlestick'
loadStock(Highcharts);
loadIndicatorsAll(Highcharts);

// highcharts 全域設定
// const offset = new Date().getTimezoneOffset();
Highcharts.setOptions({
    lang: { rangeSelectorZoom: '' }, // 不顯示 'zoom' 文字
    global: {
        // timezone: 'Asia/Taipei',
        useUTC: false,

        // timezoneOffset: 0,
        // timezoneOffset: offset,
    },
    // time: { timezoneOffset: offset },
});

export default {
    components: { highcharts: Chart },
    data() {
        return {
            techLineValue: 'sma',
            techLineOptions: [
                {
                    value: 'abands',
                    label: 'Acceleration Bands',
                },
                {
                    value: 'bb',
                    label: 'Bollinger Bands',
                },
                {
                    value: 'dema',
                    label: 'DEMA (Double Exponential Moving Average)',
                },
                {
                    value: 'ema',
                    label: 'EMA (Exponential Moving Average)',
                },
                {
                    value: 'ikh',
                    label: 'Ichimoku Kinko Hyo',
                },
                {
                    value: 'keltnerchannels',
                    label: 'Keltner Channels',
                },
                {
                    value: 'linearRegression',
                    label: 'Linear Regression',
                },
                {
                    value: 'pivotpoints',
                    label: 'Pivot Points',
                },
                {
                    value: 'pc',
                    label: 'Price Channel',
                },
                {
                    value: 'priceenvelopes',
                    label: 'Price Envelopes',
                },
                {
                    value: 'psar',
                    label: 'PSAR (Parabolic SAR)',
                },
                {
                    value: 'sma',
                    label: 'SMA (Simple Moving Average)',
                },
                {
                    value: 'supertrend',
                    label: 'Super TrendSuper Trend',
                },
                {
                    value: 'tema',
                    label: 'TEMA (Triple Exponential Moving Average)',
                },
                {
                    value: 'vbp',
                    label: 'VbP (Volume by Price)',
                },
                {
                    value: 'wma',
                    label: 'WMA (Weighted Moving Average)',
                },
                {
                    value: 'vwap',
                    label: 'VWAP (Volume Weighted Average Price)',
                },
                {
                    value: 'zigzag',
                    label: 'Zig Zag',
                },
            ],
            selDataGrouping: 'week',
            timeRange: '3y', // 全部，三年會有問題
            // groupingUnits: [
            //     ['day', [1]],
            //     ['week', [1]],
            //     ['month', [1]],
            // ],

            chartOptions: {
                chart: {
                    height: 750,
                    events: {
                        // 這裡指定後 就可以用
                        // 參考：https://codesandbox.io/s/vue-template-nutgx?file=/src/components/Chart.vue:598-660
                        load: (function (self) {
                            return function () {
                                self.chart = this;
                            };
                        })(this),
                    },
                },
                // time: {
                //     timezone: 'Asia/Taipei',
                //     timezoneOffset: -8 * 60,
                //     // useUTC: true,
                // },
                //
                plotOptions: {
                    series: {
                        showInLegend: true,
                        // 禁用游標懸浮高亮, 去掉hover事件
                        states: {
                            hover: {
                                enabled: false,
                            },
                        },
                    },
                    line: {
                        marker: {
                            enabled: false,
                        },
                    },
                    candlestick: {
                        // 顏色值參考 https://www.jianshu.com/p/703d8ab8012e
                        color: '#65b206',
                        upColor: '#d41c1c',
                        // 綠棒上下的線
                        lineColor: '#4f9900',
                        // 紅棒上下的線
                        upLineColor: '#af0b0b', // docs
                    },
                    rsi: {
                        lineColor: '#e65596',
                        marker: { enabled: false }, // 不要每個點都顯示
                    },
                    stochastic: {
                        // 顏色值參考 https://www.jianshu.com/p/703d8ab8012e
                        color: '#409EFF',
                        lineColor: '#EF403C',
                    },
                    // macd: {
                    // zones: [
                    //     {
                    //         // value: 0,
                    //         color: 'green',
                    //     },
                    //     {
                    //         color: 'red',
                    //     },
                    // ],
                    // colors: ['cyan', 'navy'],
                    // signalLine: { color: '#409EFF' },
                    // lineColor: '#e65596',
                    // },
                    // signalLine: {
                    //     // macd signalLine 顏色配置
                    //     styles: {
                    //         lineColor: 'red',
                    //     },
                    // },
                    // macdLine: {
                    //     // macd macdLine 顏色配置
                    //     styles: {
                    //         lineColor: '#409EFF',
                    //     },
                    // },
                },
                rangeSelector: {
                    selected: 3,
                    // 參考 http://snippets.barretlee.com/snippets/javascript/highstock-range-selector/
                    // rangeSelector 生效，但是不顯示相對應的按鈕
                    buttonTheme: {
                        fill: 'white',
                        style: {
                            // border: '1px solid #d9ecff';
                            // background-color: '#ccff90',
                            // display: 'none', // 不顯示日期範圍按鈕
                        },
                        states: {
                            hover: {},
                            select: {
                                fill: '#fdcfe8',
                                style: {
                                    // color: 'b',
                                },
                            },
                            // disabled: { ... }
                        },
                    },
                    enabled: false,
                    allButtonsEnabled: true,
                    inputEnabled: false, // 不顯示日期輸入框
                    // buttons: [
                    //     {
                    //         type: 'month',
                    //         count: 3,
                    //         text: '3月',
                    //     },
                    //     {
                    //         type: 'month',
                    //         count: 6,
                    //         text: '6月',
                    //     },
                    //     // {
                    //     //     type: 'ytd',
                    //     //     text: '1季度',
                    //     // },
                    //     {
                    //         type: 'year',
                    //         count: 1,
                    //         text: '1年',
                    //     },
                    //     {
                    //         type: 'year',
                    //         count: 3,
                    //         text: '3年',
                    //     },
                    //     {
                    //         type: 'year',
                    //         count: 5,
                    //         text: '5年',
                    //     },
                    //     {
                    //         type: 'all',
                    //         text: '全部',
                    //     },
                    // ],

                    // enabled: false,
                    // inputEnabled: true,
                    // enabled: false,
                    // inputEnabled: false,
                    // buttonTheme: {
                    //     visibility: 'hidden',
                    // },
                    // labelStyle: {
                    //     visibility: 'hidden',
                    // },
                },

                title: {
                    text: '',
                },
                legend: {
                    enabled: true,
                },

                // 隱藏最下方的導航日期bar
                navigator: {
                    enabled: false,
                },
                // 隱藏最下方的導航日期 scrollbara
                scrollbar: {
                    enabled: false,
                },

                // 這篇中文寫的最清楚 https://ithelp.ithome.com.tw/articles/10245718?sc=hot
                // 有可能是答案但好複雜 https://www.twblogs.net/a/5b8ee6ce2b71771883489ae9
                // 去掉tooltip 直接顯示的範例 https://jsfiddle.net/BlackLabel/a8hjdpcb/1/
                // 可參考 https://stackoverflow.com/questions/19438942/how-to-auto-format-dates-in-custom-tooltip-formatter
                // 可參考 https://stackoverflow.com/questions/19932556/highstocks-tooltip-remove-the-phrase-week-from-monday
                // 無關看看 http://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/tooltip/split/
                tooltip: {
                    shared: true,

                    // formatter() {
                    //     // const { series } = this.point.series.chart;
                    //     // const index = this.point.series.points.indexOf(this.point);
                    //     // let str = '';

                    //     // for (let i = 0; i < series.length - 1; i++) {
                    //     //     str += `Series: ${series[i].name} : ${series[i].points[index].y}`;
                    //     // }
                    //     // return str;

                    //     return [moment.unix(this.x / 1000).format('LLL')].concat(
                    //         this.points.map((point) => `<span style='color:${point.series.color}'>\u25CF</span> ${point.series.name}: ${point.y}`)
                    //     );
                    // },
                    // formatter() {
                    // The first returned item is the header, subsequent items are the
                    // points
                    // console.log(this.points);
                    // return [`<b>${this.x}</b>`].concat(this.points ? this.points.map((point) => `${point.series.name}: ${point.y}m`) : []);
                    // },
                },
                // responsive: {
                //     rules: [
                //         {
                //             // 在图表小于 500px 的情况下关闭图例
                //             condition: {
                //                 // 响应条件
                //                 maxWidth: 300,
                //             },
                //             chartOptions: {
                //                 // 响应内容
                //                 legend: {
                //                     enabled: false,
                //                 },
                //             },
                //         },
                //     ],
                // },
                xAxis: {
                    type: 'datetime',

                    gridLineWidth: 1, // 顯示圖表X軸上的直色灰線

                    endOnTick: false,
                    labels: {
                        staggerLines: 1,
                        formatter() {
                            // return Highcharts.dateFormat('YYYY/mm', this.value);
                            const m = moment(this.value).format('MM');
                            return m === '01' ? moment(this.value).format('YYYY/MM') : m;
                        },
                    },
                    // 有參考這個，但是根據資料去畫的 https://jsfiddle.net/BlackLabel/9yxmw7zv/ 應該要固定顯示月份
                    // 改參考這個 http://jsfiddle.net/kka8eyg5/3/

                    tickPositioner() {
                        const positions = [];
                        let tick = Math.floor(this.dataMin);
                        const increment = 1000 * 3600 * 24 * 91.5; // 3 months

                        for (tick; tick <= this.dataMax; tick += increment) {
                            positions.push(tick);
                        }
                        if (positions.indexOf(this.dataMax) === -1) positions.push(this.dataMax);
                        return positions;
                    },
                },
                yAxis: [
                    {
                        // labels: {
                        //     align: 'right',
                        //     x: -3,
                        // },
                        // title: {
                        //     text: 'K線',
                        // },
                        startOnTick: false,
                        showLastLabel: true,
                        // endOnTick: false,
                        height: '40%',
                        resize: {
                            enabled: true,
                        },
                        // tickPositioner() {
                        //     const positions = [];
                        //     let tick = 0;
                        //     let increment = (this.dataMax - this.dataMin) / 5;
                        //     const max = this.dataMax;
                        //     const min = this.dataMin;
                        //     if (increment > 1) {
                        //         increment = Math.ceil(increment);
                        //         tick = Math.floor(this.dataMin);
                        //         for (tick; tick - increment <= this.dataMax; tick += increment) {
                        //             positions.push(tick);
                        //         }
                        //     } else {
                        //         tick = Number(min.toFixed(1));
                        //         increment = Number(increment.toFixed(3));
                        //         for (tick; tick - increment <= this.dataMax; tick += increment) {
                        //             positions.push(Number(tick.toFixed(2)));
                        //         }
                        //     }
                        //     return positions;
                        // },
                    },
                    {
                        top: '40%',
                        height: '5%',
                        // startOnTick: true,
                    },
                    {
                        top: '47%',
                        height: '15%',
                        // startOnTick: false,
                        // endOnTick: false,
                        tickPositions: [0, 100],
                    },
                    {
                        startOnTick: false,
                        endOnTick: false,
                        // visible: false,
                        // tickPositions: [-10, 10],
                        allowDecimals: true, // 允許 tick 是有符點數
                        tickPositions: [-3, -2.5, 0, 2.5, 3], // -3, 3 是 softMin, softMax 超過時會加個大小但要畫橫線
                        showLastLabel: true, // Y軸 First 預設是開，但 LastLabel是關，所以要打開
                        softMin: -2.5, // 超過時會自動再加一個大小
                        softMax: 2.5,
                        top: '66%',
                        height: '15%',
                        plotLines: [
                            {
                                label: {
                                    text: '30', // 標籤的?容
                                    align: 'right', // 標籤的水平位置，水平居右
                                    x: 0, // 標籤相對於被定位的水平偏移的像素，水平居左0px
                                },
                                color: '#f05f5f', // 線的顏色，定義為紅色
                                dashStyle: 'shortdot', // 預設值，這裡定義為實約
                                value: 30, // 定義在那個值上顯示標示線，這裡是在x軸上刻度為3的值處垂直化一條線
                                width: 1, // 標示線的寬度，2px
                            },
                            {
                                label: {
                                    text: '70', // 標籤的?容
                                    align: 'right', // 標籤的水平位置，水平居右
                                    x: 0, // 標籤相對於被定位的水平偏移的像素，水平居左0px
                                },
                                color: '#31c26d', // 線的顏色，定義為紅色
                                dashStyle: 'shortdot', // 預設值，這裡定義為實約
                                value: 70, // 定義在那個值上顯示標示線，這裡是在x軸上刻度為3的值處垂直化一條線
                                width: 1, // 標示線的寬度，2px
                            },
                        ],
                    },
                    {
                        top: '85%',
                        height: '15%',
                        // tickPositions: [0, 100], // 0, 100
                        showLastLabel: true, // Y軸 First 預設是開，但 LastLabel是關，所以要打開
                        // plotLines: [
                        //     {
                        //         color: 'gray', // 線的顏色，定義為紅色
                        //         dashStyle: 'shortdot', // 預設值，這裡定義為實約
                        //         value: 75, // 定義在那個值上顯示標示線，這裡是在x軸上刻度為3的值處垂直化一條線
                        //         width: 1, // 標示線的寬度，2px
                        //     },
                        // ],
                    },
                ],
                series: [
                    {
                        yAxis: 0,
                        // showInNavigator: false,
                        type: 'candlestick',
                        name: 'K線',
                        id: 'aapl',
                        zIndex: 2,
                        data: [],
                        dataGrouping: {
                            units: [['week', [1]]],
                        },

                        // this.stockData,
                        // [],
                        // dataGrouping: {
                        //     // forced: true,
                        //     // enabled: false, // 若紅黑棒不要合併就用此方式
                        //     units: [
                        //         ['week', [1]],
                        //         // [
                        //         //     'week', // unit name
                        //         //     [1], // allowed multiples
                        //         // ],
                        //         // ['month', [1, 2, 3, 4, 6]],
                        //     ],
                        // },
                        // dataGrouping: {
                        //     anchor: 'end',
                        // },
                    },
                    {
                        yAxis: 1,
                        type: 'column',
                        id: 'volume',
                        name: '成交量',
                        data: [],
                        dataGrouping: {
                            units: [['week', [1]]],
                        },
                    },
                    {
                        yAxis: 2,
                        type: 'stochastic',
                        // type: 'slowstochastic',
                        id: 'stochastic',
                        // name: 'KD(9, 9)',
                        linkedTo: 'aapl',
                        lineWidth: 1, // 線寬用1，預設是2
                        dataGrouping: {
                            units: [['week', [1]]],
                        },
                        params: { periods: [9, 9] },
                        // color: '#409EFF',
                        // colors: ['red', 'green'],
                        // colorByPoint: true,
                        // signalLine: {
                        //     // macd signalLine 顏色配置
                        //     styles: {
                        //         lineColor: 'red',
                        //     },
                        // },
                        // macdLine: {
                        //     // macd macdLine 顏色配置
                        //     styles: {
                        //         lineColor: 'red',
                        //     },
                        // },
                        // https://www.coder.work/article/5870953
                        // params: {
                        //     period: 14,
                        //     overbought: 70,
                        //     oversold: 30,
                        // },
                        // dataGrouping: {
                        //     units: [['week', [1]]],
                        // },
                    },
                    {
                        yAxis: 3,
                        type: 'macd',
                        id: 'macd',
                        linkedTo: 'aapl',
                        lineWidth: 1, // 線寬用1，預設是2
                        negativeColor: '#2eba07', // 綠棒
                        color: '#ee3333', // 紅棒
                        macdLine: {
                            zones: [
                                {
                                    value: -1, // < -1
                                    color: '#fd0373',
                                },
                                {
                                    value: 1, // -1 ~ 1
                                    color: '#eb78ab',
                                },
                                {
                                    color: '#a7205c', // > 1
                                },
                            ],
                        },
                        signalLine: {
                            zones: [
                                // {
                                //     value: -1.5,
                                //     color: 'blue',
                                // },
                                {
                                    color: '#4286f5',
                                },
                            ],
                        },

                        // 線的顏色 參考 https://jshare.com.cn/indicator/RSdgr8/26

                        // signalLine: {
                        //     // macd signalLine 顏色配置
                        //     styles: {
                        //         lineColor: 'red',
                        //     },
                        // },
                        // macdLine: {
                        //     // macd macdLine 顏色配置
                        //     styles: {
                        //         lineColor: '#409EFF',
                        //     },
                        // },
                        // dataGrouping: {
                        //     units: [['week', [1]]],
                        // },
                        params: {
                            shortPeriod: 12,
                            longPeriod: 26,
                            signalPeriod: 9,
                            period: 26,
                        },
                        dataGrouping: {
                            units: [['week', [1]]],
                        },
                    },
                    {
                        yAxis: 4,
                        type: 'rsi',
                        id: 'rsi',
                        linkedTo: 'aapl',
                        // color: '#E6A23C',
                        lineWidth: 1, // 線寬用1，預設是2

                        // https://www.coder.work/article/5870953
                        // params: {
                        //     period: 14,
                        //     overbought: 70,
                        //     oversold: 30,
                        // },
                        // dataGrouping: {
                        //     units: [['week', [1]]],
                        // },
                        dataGrouping: {
                            units: [['week', [1]]],
                        },
                    },
                    // 因為有很多 ma 線所以放最後
                    {
                        yAxis: 0,
                        type: 'sma',
                        name: 'MA(5)',
                        id: 'overlay',
                        linkedTo: 'aapl',
                        zIndex: 1,
                        // pointStart: Date.UTC(2021, 3, 26),
                        lineWidth: 1, // 線寬用1，預設是2
                        // 這裡的 index 表示要用資料 close 來算
                        // 5是5個有值去平均，而非5天內的值
                        params: { index: 3, period: 5 },
                        marker: {
                            enabled: false,
                        },
                    },
                ],
            },
        };
    },

    computed: {
        stockId() {
            // 假設 URL 為 /stock/1， $route.params.id 的值就是 1
            // route 在 vue 取得而不在 vuex 才去取，讓 vuex 清爽一點
            console.log('stockId');
            return this.$route.params.id;
        },

        stockName() {
            console.log('stockName');
            const findStockName = _.find(this.$store.state.star.starList, ['id', _.toNumber(this.stockId)]);

            // return _.isEmpty(findStockName) ? '' : `${findStockName.name} (${findStockName.symbol})`;
            return _.isEmpty(findStockName) ? '' : findStockName.name;
        },

        stockSymbol() {
            const findStockName = _.find(this.$store.state.star.starList, ['id', _.toNumber(this.stockId)]);
            return _.isEmpty(findStockName) ? '' : findStockName.symbol;
        },

        // xAxisCate() {
        //     return Object.keys(this.data);
        // },

        // dataGroupingUnits() {
        //     if (this.selDataGrouping === 'day') return ['day', [1]];
        //     if (this.selDataGrouping === 'week') return ['week', [1]];
        //     if (this.selDataGrouping === 'month') return ['month', [1]];
        //     return [];
        // },
        // pointWidth(){
        //     if (this.selDataGrouping === 'day') {
        //         return 6;
        //     }
        //     if (this.selDataGrouping === 'week') {
        //         return 4;
        //         }
        //     if (this.selDataGrouping === 'month') {
        //         return 11
        //     };
        //     return 1;
        // }
        // rangeSelector() {
        //     if (this.timeRange === 'm3') return 2;
        //     if (this.timeRange === 'y1') return 5;
        //     if (this.timeRange === 'y3') return 6;
        //     if (this.timeRange === 'all') return 8;
        //     return 8;
        // },

        ohlc() {
            console.log('ohlc');
            return this.stockData.map((value) => [value[0], value[1], value[2], value[3], value[4]]);
            // console.log(bbb);
            // return this.stockData;
        },
        volume() {
            console.log('volume');
            return this.stockData.map((value) => [value[0], value[5]]);
        },

        // stockData 資料的改變是依賴 點擊 日線、週線、月線後，去取 vuex 資料
        stockData() {
            console.log('stockData');
            console.log(`stockData_len=${this.$store.state.stock.currStockDayData.length}`);
            // this.onSelDataGrouping();
            // console.log(this.$store.state.stock.currStockDayData);
            // return this.$store.state.stock.currStockDayData;
            // console.log('stockData');
            // if (this.selDataGrouping === 'day' || this.selDataGrouping === 'month') return this.$store.state.stock.currStockDayData;
            // if (this.selDataGrouping === 'week') {
            //     console.log('week');
            //     return this.$store.getters.currStockWeekData;
            // }
            // return [];
            // this.onSelDataGrouping();
            return this.$store.state.stock.currStockDayData;
        },

        options() {
            const options = Object.assign(this.chartOptions, {});
            // options.xAxis.categories = this.xAxisCate;
            console.log('==================');
            console.log(`this.timeRange=${this.timeRange}`);

            // options.series[0].dataGrouping.units[0] = this.groupingUnits;
            // options.series[1].dataGrouping.units[0] = this.groupingUnits;
            // options.series[2].dataGrouping.units[0] = this.groupingUnits;
            // options.series[3].dataGrouping.units[0] = this.groupingUnits;
            // options.series[4].dataGrouping.units[0] = this.groupingUnits;
            // options.series[0].dataGrouping.units.push(this.dataGrouping);
            // console.log(options.series[0].dataGrouping.units);
            // if (this.dataGrouping === 'week') options.series[0].dataGrouping.unit.push(['week', [1]]);
            // else if (this.dataGrouping === 'month') options.series[0].dataGrouping.unit.push(['month', [1]]);
            // options.series[0].dataGrouping.unit.push(['month', [1]]);

            // if (this.selDataGrouping === 'day') {
            //     options.series[0].dataGrouping.units[0] = ['day', [1]];
            // } else if (this.selDataGrouping === 'week') {
            //     options.series[0].dataGrouping.units[0] = ['week', [1]];
            // } else if (this.selDataGrouping === 'month') {
            //     options.series[0].dataGrouping.units[0] = ['month', [1]];
            // }

            // let stockData = [];
            // if (this.selDataGrouping === 'day') stockData = this.$store.state.stock.currStockDayData;
            // else if (this.selDataGrouping === 'week') stockData = this.$store.getters.currStockWeekData;
            // else if (this.selDataGrouping === 'month') stockData = this.$store.state.stock.currStockDayData;
            // console.log(stockData.length);

            // options.series[0].data = stockData;
            // options.series[0].setData(this.ohlc, true);
            // options.series[1].setData(this.volume, true);
            // options.series[0].data = stockData.map((value) => [value[0], value[1], value[2], value[3], value[4]]);
            // options.series[1].data = stockData.map((value) => [value[0], value[5]]);

            options.series[0].data = this.ohlc;
            options.series[1].data = this.volume;
            options.rangeSelector.selected = this.timeRange;
            // console.log(options);
            return options;
        },

        // currStockWeekData() {
        //     // getters 在 vuex 只有在全域，沒有在個別 module，所以不用加 stock
        //     // 參考 https://ithelp.ithome.com.tw/articles/10186481
        //     return this.$store.getters.currStockWeekData;
        // },
    },
    created() {
        // console.log('created');
        // console.log(this.stockId);
        // // 在 created() 事件時就可以發送，因為此時 data 及 computed 資料都準備好了
        // // 取得單一支的股票淨但內容
        // this.$store.dispatch('GET_STOCK_VALUE', this.stockId);
    },
    watch: {
        // 因為左側樹可以選哪支股票，所以要放在watch，而不能放在create
        stockId: {
            immediate: true, // 須要立即，否則頁面重整就可能沒呼叫
            handler(newVal, oldVal) {
                console.log(newVal, oldVal);
                if (newVal) {
                    this.$store.dispatch('GET_STOCK_VALUE', this.stockId);
                }
            },
        },
        // 重整頁面不會進來 watch stockData()，此時 stockData_len=0
        // 若資料有時，會依序呼叫 onSelDataGrouping，再呼叫 onSelTimeRange
        stockData() {
            console.log('stockData watch');

            this.onSelDataGrouping();
        },
        // timeRange(newValue) {
        // console.log('timeRange');
        // console.log(Highcharts.charts.length);
        // Highcharts.charts[0].rangeSelector.clickButton(newValue, {}, true);
        // },
    },
    methods: {
        onSelTechLine(selVal) {
            console.log('onSelTechLine');
            console.log(this.techLineValue);
            this.chartOptions.series[5].type = selVal;
            // this.chartOptions.series.push({
            //     name: 'Series 2',
            //     data: [11, 22, 33, 44, 55, 66],
            // });
            // var series = chart.get('overlay');

            // if (series) {
            //     series.remove(false);
            //     chart.addSeries({
            //         type: e.target.value,
            //         linkedTo: 'aapl',
            //         id: 'overlay'
            //     });
            // }
        },
        // 不能寫在 dataGrouping() {} ，因為calc又去管this.timeRange，所以寫在這
        // 而且dataGrouping.units寫在這是避免option可能會呼叫2次

        onSelDataGrouping() {
            console.log('onSelDataGrouping');

            let dataGroupingUnits;
            let pointWidth = 2;
            let timeRange = 'all';
            if (this.selDataGrouping === 'day') {
                dataGroupingUnits = [['day', [1]]];
                pointWidth = 6;
                timeRange = '6m';
            }
            if (this.selDataGrouping === 'week') {
                dataGroupingUnits = [['week', [1]]];
                // dataGroupingUnits = undefined;
                pointWidth = 4;
                timeRange = '3y';
            }
            if (this.selDataGrouping === 'month') {
                dataGroupingUnits = [['month', [1]]];
                pointWidth = 11;
                timeRange = '5y';
            }
            this.chartOptions.series[0].dataGrouping.units = dataGroupingUnits;
            this.chartOptions.series[1].dataGrouping.units = dataGroupingUnits;
            this.chartOptions.series[2].dataGrouping.units = dataGroupingUnits;
            this.chartOptions.series[3].dataGrouping.units = dataGroupingUnits;
            this.chartOptions.series[4].dataGrouping.units = dataGroupingUnits;

            this.chartOptions.series[0].pointWidth = pointWidth;
            this.chartOptions.series[1].pointWidth = pointWidth;

            this.timeRange = timeRange;
            this.onSelTimeRange();
        },

        onSelTimeRange() {
            console.log('onSelTimeRange');
            const end = moment().unix() * 1000;
            let start;
            if (this.timeRange === '3m') start = moment().subtract(3, 'months').unix() * 1000;
            else if (this.timeRange === '6m') start = moment().subtract(6, 'months').unix() * 1000;
            else if (this.timeRange === '1y') start = moment().subtract(1, 'years').unix() * 1000;
            else if (this.timeRange === '3y') start = moment().subtract(3, 'years').unix() * 1000;
            else if (this.timeRange === '5y') start = moment().subtract(5, 'years').unix() * 1000;
            else if (this.timeRange === '10y') start = moment().subtract(10, 'years').unix() * 1000;

            this.chart.xAxis[0].setExtremes(start, end);

            console.log(this.chart);
            console.log(this.chart.pointCount);
            console.log(this.stockData);
            console.log(this.chart.series[0].data.length);
            console.log(this.chart.series[0].xData);
            console.log(this.chart.xAxis[0].len);
            console.log(this.chartOptions.series[0].data.length);
        },
    },
};
</script>

<style lang="sass">
/* 要修改 element 要不帶 scoped，可參考 https://www.cnblogs.com/baebae996/p/13717082.html */
.el-radio-button__inner
    border: none !important

/* 為了把 radio button 都變成 圓邊 */
.el-radio-button__orig-radio:checked + .el-radio-button__inner
    border-radius: 3px !important

#timeRange .el-radio-button__inner
    padding: 8px

#timeRange .el-radio-button__orig-radio:checked + .el-radio-button__inner
    background-color: #f5d44d !important
    box-shadow: none !important
    color: black
</style>

<style lang="sass" scoped>
// #stock-name
//     border: 1px solid #dcdfe6
//     box-shadow: 0 2px 4px 0 rgb(0 0 0 / 12%), 0 0 6px 0 rgb(0 0 0 / 4%)
</style>
