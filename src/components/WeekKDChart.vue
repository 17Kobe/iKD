<template>
    <div>
        <!-- {{ parentData.at(-1).close }} -->
        <highcharts :constructorType="'stockChart'" :options="options" style="position: relative; top: 8px"></highcharts>
        <!-- :updateArgs="[true, true, true]" -->
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
Highcharts.setOptions({
    lang: { rangeSelectorZoom: '' }, // 不顯示 'zoom' 文字
    global: {
        useUTC: false,
    },
    credits: {
        // 將 highchart credit 圖最下方超連結隱藏
        enabled: false,
    },
});

export default {
    components: { highcharts: Chart },
    props: ['parentData'],
    data() {
        return {
            chartOptions: {
                chart: {
                    height: 100,
                    events: {
                        // 這裡指定後 就可以用
                        // 參考：https://codesandbox.io/s/vue-template-nutgx?file=/src/components/Chart.vue:598-660
                        load: (function (self) {
                            return function () {
                                console.log('---------------------------------------');

                                // 預設顯示的時間範圍是6個月
                                self.chart = this;
                                const end = moment().unix() * 1000;
                                const start = moment().subtract(6, 'months').unix() * 1000;
                                self.chart.xAxis[0].setExtremes(start, end);
                            };
                        })(this),
                    },
                },
                plotOptions: {
                    series: {
                        showInLegend: false,
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
                },
                rangeSelector: {
                    selected: 2,
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
                },

                title: {
                    text: '',
                },
                legend: {
                    // 該線是什麼線的說明，原本顯示在最下方，現在把它隱藏
                    enabled: false,
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
                // tooltip: {
                //     // backgroundColor: 'transparent',
                //     shadow: false,
                //     borderWidth: 0,
                //     split: false,
                //     shared: true,
                //     useHTML: true,
                //     formatter() {
                //         let str = '<div>';

                //         Highcharts.each(this.points, (point) => {
                //             str += `<div style="height: ${point.series.yAxis.height}px">${point.series.name}: ${point.y}</div>`;
                //         });

                //         str += '</div>';
                //         return str;
                //     },
                // },
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
                        enabled: false, // 不顯示 x 軸的 Label
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
                        startOnTick: false,
                        showLastLabel: true,
                        // endOnTick: false,
                        resize: {
                            enabled: true,
                        },
                        // 調整 y 軸 tick的間距，運用到高度最大化，不浪費
                        tickPositioner() {
                            const positions = [];
                            let tick = 0;
                            let increment = (this.dataMax - this.dataMin) / 2;
                            // const max = this.dataMax;
                            const min = this.dataMin;
                            if (increment > 1) {
                                increment = Math.ceil(increment);
                                tick = Math.floor(this.dataMin);
                                for (tick; tick - increment <= this.dataMax; tick += increment) {
                                    positions.push(tick);
                                }
                            } else {
                                tick = Number(min.toFixed(1));
                                increment = Number(increment.toFixed(3));
                                for (tick; tick - increment <= this.dataMax; tick += increment) {
                                    positions.push(Number(tick.toFixed(2)));
                                }
                            }
                            return positions;
                        },
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
                    },
                ],
            },
        };
    },
    computed: {
        ohlc() {
            return this.stockData.map((value) => [value[0], value[1], value[2], value[3], value[4]]);
        },

        // stockData 資料的改變是依賴 點擊 日線、週線、月線後，去取 vuex 資料
        stockData() {
            return this.parentData.map((value) => [
                moment(value.date).valueOf(),
                value.open,
                value.max,
                value.min,
                value.close,
                value.Trading_Volume,
            ]);
        },

        options() {
            const options = Object.assign(this.chartOptions, {});
            console.log('==================');
            console.log(`this.timeRange=${this.timeRange}`);

            options.series[0].data = this.ohlc;
            options.rangeSelector.selected = this.timeRange;
            return options;
        },
    },
    created() {},
    watch: {
        // 重整頁面不會進來 watch stockData()，此時 stockData_len=0
        // 若資料有時，會依序呼叫 onSelDataGrouping，再呼叫 onSelTimeRange
        stockData() {
            console.log('stockData watch');
            const end = moment().unix() * 1000;
            const start = moment().subtract(3, 'months').unix() * 1000;
            this.chart.xAxis[0].setExtremes(start, end);
        },
    },
    methods: {},
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
