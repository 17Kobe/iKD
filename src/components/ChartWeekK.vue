<template>
    <div style="position: relative">
        <!-- {{ parentData.at(-1).close }} -->
        <highcharts
            :constructorType="'stockChart'"
            :options="chartOptions"
            style="position: relative; top: 5px; background: transparent"
        >
        </highcharts>
        <div style="position: absolute; top: 80px; right: 14px; font-size: 12px" v-if="ohlc && ohlc.length > 0">
            <!-- <span style="color: #834beb">P</span>: {{ Number(ohlc.at(-1)[3].toFixed(2)) }} -->
            <span v-if="ma_buy && ma_buy.length > 0"
                ><span style="color: #834beb">&nbsp;MA({{ ma_policy.ma_buy_limit }})</span>:
                {{ Number(ma_buy[ma_buy.length - 1][1].toFixed(2)) }}</span
            >
            <span v-if="ma_sell && ma_sell.length > 0"
                ><span style="color: #e6a23c">&nbsp;MA({{ ma_policy.ma_sell_limit }})</span>:
                {{ Number(ma_sell[ma_sell.length - 1][1].toFixed(2)) }}</span
            >
        </div>
        <!-- :updateArgs="[true, true, true]" -->
    </div>
</template>

<script>
import { Chart } from 'highcharts-vue';
import moment from 'moment';

export default {
    components: { highcharts: Chart },
    props: ['parentData'],
    data() {
        return {};
    },
    computed: {
        ohlc() {
            console.log('ohlc');
            return this.$store.getters.getStockDataWeekly(this.parentData);
        },
        ma_buy() {
            console.log('ma_buy');
            return this.$store.getters.getStockDataWeeklyMaBuy(this.parentData);
        },
        ma_sell() {
            console.log('ma_sell');
            return this.$store.getters.getStockDataWeeklyMaSell(this.parentData);
        },
        ma_policy() {
            console.log('ma_policy');
            return this.$store.getters.getStockPolicyMa(this.parentData);
        },
        chartOptions() {
            const component = this;
            return {
                chart: {
                    backgroundColor: 'rgba(0,0,0,0)', // 讓 highcharts的背景變透明後，滑鼠移到chart上時，不會看出它有白的只有下方，上方那個沒有
                    zoomType: null, // x, y不能在放大縮小，避免手滑在移動時間又動到放大縮小
                    panning: false, // x, y不能在放大縮小，避免手滑在移動時間又動到放大縮小
                    // pinchType: 'x',
                    height: 100,
                    // events: {
                    //     // 這裡指定後 就可以用
                    //     // 參考：https://codesandbox.io/s/vue-template-nutgx?file=/src/components/Chart.vue:598-660
                    //     load: (function (self) {
                    //         return function () {
                    //             // console.log('---------------------------------------');

                    //             // 預設顯示的時間範圍是6個月
                    //             self.chart = this;
                    //             const end = moment().unix() * 1000;
                    //             const start = moment().subtract(6, 'months').unix() * 1000;
                    //             self.chart.xAxis[0].setExtremes(start, end);
                    //         };
                    //     })(this),
                    // },
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
                tooltip: {
                    // backgroundColor: 'transparent',
                    shadow: false,
                    // borderWidth: 0,
                    borderColor: '#999999',
                    split: false,
                    shared: true,
                    useHTML: true,
                    formatter() {
                        let str = '<div>';
                        const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
                        this.points.forEach((point, index) => {
                            if (index === 0) {
                                const fontColor = point.y > point.point.open ? '#ee3333' : '#01aa00';

                                str += `<div style="text-align:center;">${moment(point.x).format(
                                    'YYYY-MM-DD'
                                )}(<span style="color: #3333ee; font-weight:bold;">${
                                    dayOfWeek[moment(point.x).day()]
                                }</span>)</div>`;
                                str += `<div>開：${point.point.open} <span style="color: #3333ee">收</span>：<span style="color: ${fontColor}; font-weight:bold;">${point.y}</span></div>`;
                                str += `<div>高：${point.point.high} 低：${point.point.low}</div>`;
                            } else {
                                console.log(component);

                                const color = index === 1 ? '#834beb' : '#e6a23c';
                                const limit = index === 1 ? component.ma_policy.ma_buy_limit : component.ma_policy.ma_sell_limit;
                                str += `<span><span style="color: ${color}">MA(${limit})</span>: ${point.y.toFixed(2)}
                                </span>`;
                            }
                        });

                        str += '</div>';
                        return str;
                    },
                },
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
                            // 一開始時 dataMax 及 dataMin會是null，然後再用 toFixed就會有錯，所以加 if 來避免
                            if (this.dataMin && this.dataMax) {
                                let tick = 0;
                                let increment = (this.dataMax - this.dataMin) / 2;
                                // const max = this.dataMax;
                                const min = this.dataMin;
                                if (increment > 1) {
                                    increment = Math.ceil(increment);
                                    tick = Math.floor(this.dataMin);
                                    for (tick; tick <= this.dataMax + increment / 2; tick += increment) {
                                        // let tmpTick = tick;
                                        // if (tick > this.dataMax) tmpTick = this.dataMax + increment / 10;
                                        // positions.push(tmpTick);
                                        positions.push(tick);
                                    }
                                } else {
                                    tick = Number(min.toFixed(1));
                                    increment = Number(increment.toFixed(3));
                                    for (tick; tick - increment <= this.dataMax; tick += increment) {
                                        positions.push(Number(tick.toFixed(2)));
                                    }
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
                        dataGrouping: {
                            // anchor: 'end',
                            // firstAnchor: 'end',
                            lastAnchor: 'lastPoint',
                            units: [['day', [1]]],
                        },
                        data: this.ohlc,
                    },
                    {
                        type: 'line',
                        name: 'MA Buy線',
                        color: '#834beb',
                        data: this.ma_buy,
                        dataGrouping: {
                            // anchor: 'end',
                            // firstAnchor: 'end',
                            lastAnchor: 'lastPoint',
                            units: [['day', [1]]],
                        },
                    },
                    {
                        type: 'line',
                        name: 'MA Sell線',
                        color: '#e6a23c',
                        data: this.ma_sell,
                        dataGrouping: {
                            // anchor: 'end',
                            // firstAnchor: 'end',
                            lastAnchor: 'lastPoint',
                            units: [['day', [1]]],
                        },
                    },
                ],
            };
        },
    },
    created() {},
    watch: {},
    methods: {},
};
</script>