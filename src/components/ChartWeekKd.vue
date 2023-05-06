<template>
    <div style="position: relative">
        <!-- {{ parentData.at(-1).close }} -->
        <highcharts
            :constructorType="'stockChart'"
            :options="chartOptions"
            style="position: relative; top: 5px; background: transparent"
        >
        </highcharts>
        <div style="position: absolute; top: 80px; left: 97px; font-size: 12px" v-if="k && k.length > 0">
            <span style="color: #4286f5">K</span>: {{ k[k.length - 1][1].toFixed(2) }} <span style="color: #e75c9a">D</span>:
            {{ d[d.length - 1][1].toFixed(2) }}
        </div>

        <!-- :updateArgs="[true, true, true]" -->
    </div>
</template>

<script>
import { Chart } from 'highcharts-vue';
import moment from 'moment';
import _ from 'lodash';

export default {
    components: { highcharts: Chart },
    props: ['parentData'],
    data() {
        return {
            // chartOptions: {
            // },
        };
    },
    computed: {
        // stockData 資料的改變是依賴 點擊 日線、週線、月線後，去取 vuex 資料
        k() {
            return this.stockDataOfKdPrice.map((value) => [value[0], value[1]]);
        },
        d() {
            return this.stockDataOfKdPrice.map((value) => [value[0], value[2]]);
        },
        stockData() {
            console.log('stockData');
            // 一開始時this.parentData會是null，所以要給[]來避免出錯
            return this.$store.getters.getStock(this.parentData);
        },

        stockDataOfKdPrice() {
            console.log('stockDataOfKdPrice');
            // console.log(this.stockDataOfPolicy);
            // 一開始時this.parentData會是null，所以要給[]來避免出錯
            // 只取出最後52筆的週KD資料出來，約1年，因為1年52週
            // return (
            //     (this.stockData.data &&
            //         this.stockData.data.weekly_kd &&
            //         _.slice(this.stockData.data.weekly_kd, -52).map((value) => [
            //             moment(value[0]).valueOf(),
            //             value[1],
            //             value[2],
            //         ])) ||
            //     []
            // );
            return this.$store.getters.getStockDataWeeklyKd(this.parentData);
        },

        stockDataOfPolicyResultBuy() {
            console.log('stockDataOfPolicyResultBuy');
            // console.log(this.stockDataOfPolicy);
            // 一開始時this.parentData會是null，所以要給[]來避免出錯
            // 需要小於365天，1年
            // 因為卜蜂曾經stockDataOfPolicyResultBuy只有一筆買訊在365天內而會出錯，所以加上this.stockData.data 來跟有資料一起才顯示
            return (
                (this.stockData.data &&
                    this.stockData.policy &&
                    this.stockData.policy.result &&
                    _.filter(
                        this.stockData.policy.result,
                        (o) =>
                            moment().diff(moment(o.date), 'days') <= 365 &&
                            _.some(o.reason, (el) => _.includes(el, 'kd')) && // 必需有 kd 的訊號設定
                            o.is_sure_buy
                    ).map((obj) => [moment(obj.date).valueOf(), obj.k])) ||
                []
            );
        },
        stockDataOfPolicyResultSell() {
            console.log('stockDataOfPolicyResultSell');
            // console.log(this.stockDataOfPolicy);
            // 一開始時this.parentData會是null，所以要給[]來避免出錯
            // 需要小於365天，1年
            return (
                (this.stockData.data &&
                    this.stockData.policy &&
                    this.stockData.policy.result &&
                    _.filter(
                        this.stockData.policy.result,
                        (o) =>
                            moment().diff(moment(o.date), 'days') <= 365 &&
                            _.some(o.reason, (el) => _.includes(el, 'kd')) && // 必需有 kd 的訊號設定
                            o.is_sure_sell
                    ).map((obj) => [moment(obj.date).valueOf(), obj.k])) ||
                []
            );
        },
        stockDataOfPolicyResultBuyOrSellCancel() {
            console.log('stockDataOfPolicyResultBuyOrSellCancel');
            // console.log(this.stockDataOfPolicy);
            // 一開始時this.parentData會是null，所以要給[]來避免出錯
            // 需要小於365天，1年
            return (
                (this.stockData.data &&
                    this.stockData.policy &&
                    this.stockData.policy.result &&
                    _.filter(
                        this.stockData.policy.result,
                        (o) =>
                            moment().diff(moment(o.date), 'days') <= 365 &&
                            _.some(o.reason, (el) => _.includes(el, 'kd')) && // 必需有 kd 的訊號設定
                            (o.is_buy_cancel || o.is_sell_cancel)
                    ).map((obj) => [moment(obj.date).valueOf(), obj.k])) ||
                []
            );
        },

        kdGoldLimit() {
            // 黃金交叉，值要畫橫線
            console.log('kdGoldLimit');
            let ret = -999; // 讓他畫線畫在看到到的地方
            if (this.stockData.policy && this.stockData.policy.settings && this.stockData.policy.settings.buy) {
                const found = _.find(this.stockData.policy.settings.buy, ['method', 'kd_gold']);
                if (found) ret = found.limit; // 若非 nundefined
            }
            // console.log(ret);
            return ret;
        },
        kdTurnUpLmit() {
            // 黃金轉折，值要畫橫線
            console.log('kdGoldTurn');
            let ret = -999; // 讓他畫線畫在看到到的地方
            if (this.stockData.policy && this.stockData.policy.settings && this.stockData.policy.settings.buy) {
                const found = _.find(this.stockData.policy.settings.buy, ['method', 'kd_turn_up']);
                if (found) ret = found.limit; // 若非 nundefined
            }
            return ret;
        },
        kdDeadLimit() {
            // 死亡交叉，值要畫橫線
            console.log('kdDeadLimit');
            let ret = -999; // 讓他畫線畫在看到到的地方
            if (this.stockData.policy && this.stockData.policy.settings && this.stockData.policy.settings.sell) {
                const found = _.find(this.stockData.policy.settings.sell, ['method', 'kd_dead']);
                if (found) ret = found.limit; // 若非 nundefined
            }
            return ret;
        },
        kdTurnDownLmit() {
            // 死亡交叉，值要畫橫線
            console.log('kdTurnUpLmit');
            let ret = -999; // 讓他畫線畫在看到到的地方
            if (this.stockData.policy && this.stockData.policy.settings && this.stockData.policy.settings.sell) {
                const found = _.find(this.stockData.policy.settings.sell, ['method', 'kd_turn_down']);
                if (found) ret = found.limit; // 若非 nundefined
            }
            return ret;
        },

        chartOptions() {
            // component 參考 https://stackoverflow.com/questions/68381856/how-to-access-highcharts-stock-tooltip-data-in-vue
            const component = this;
            let plotBands = [];
            if (this.kdTurnDownLmit !== -999) {
                plotBands.push({
                    from: this.kdTurnDownLmit,
                    to: 100,
                    color: 'rgba(75, 192, 192, 0.5)', // 設定填充顏色為紅色
                });
            }
            if (this.kdDeadLimit !== -999) {
                plotBands.push({
                    from: this.kdDeadLimit,
                    to: this.kdTurnDownLmit !== -999 ? this.kdTurnDownLmit : 100,
                    color: 'rgba(75, 192, 192, 0.05)', // 設定填充顏色為紅色
                });
            }

            if (this.kdTurnUpLmit !== -999) {
                plotBands.push({
                    from: 0,
                    to: this.kdTurnUpLmit,
                    color: 'rgba(255, 99, 132, 0.5)', // 設定填充顏色為紅色
                });
            }
            if (this.kdGoldLimit !== -999) {
                plotBands.push({
                    from: this.kdTurnUpLmit !== -999 ? this.kdTurnUpLmit : 0,
                    to: this.kdGoldLimit,
                    color: 'rgba(255, 99, 132, 0.2)', // 設定填充顏色為紅色
                });
            }

            return {
                chart: {
                    backgroundColor: 'rgba(0,0,0,0)', // 讓 highcharts的背景變透明後，滑鼠移到chart上時，不會看出它有白的只有下方，上方那個沒有
                    // zoomType: '', // x, y不能在放大縮小，避免手滑在移動時間又動到放大縮小
                    zoomType: 'none',
                    pinchType: 'none',
                    panning: false,
                    height: 100,
                    events: {
                        // 這裡指定後 就可以用
                        // 參考：https://codesandbox.io/s/vue-template-nutgx?file=/src/components/Chart.vue:598-660
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
                            // disable fading series on marker hover
                            // https://stackoverflow.com/questions/55595123/highcharts-disable-fading-series-on-marker-hover/55595271
                            inactive: {
                                opacity: 1,
                            },
                        },
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
                    followTouchMove: false,
                    split: false,
                    shared: true,
                    useHTML: true,
                    formatter() {
                        let str = '<div>';
                        const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
                        // 在畫買賣訊號有可能沒有 points，是 undefined
                        this.points.forEach((point, index) => {
                            // const fontColor = point.y > point.point.open ? '#ee3333' : '#01aa00';
                            if (index === 0) {
                                str += `<div style="text-align:center;">${moment(point.x).format(
                                    'YYYY-MM-DD'
                                )}(<span style="color: #3333ee; font-weight:bold;">${
                                    dayOfWeek[moment(point.x).day()]
                                }</span>)</div>`;
                                str += `<span style="color: #4286f5; font-weight:bold;">K</span>: ${Number(point.y.toFixed(2))} `;
                            } else if (index === 1) {
                                const found = _.find(
                                    component.stockData.data.weekly,
                                    (array) => array[0] === moment(point.x).format('YYYY-MM-DD')
                                );

                                // 取得該股價並且顯示
                                str += `<span style="color: #e75c9a; font-weight:bold;">D</span>: ${Number(
                                    point.y.toFixed(2)
                                )}<br><span style="color: #834beb; font-weight:bold;">股價</span>: ${found[4]}
                                `;

                                const foundPolicyResult = _.find(component.stockData.policy.result, {
                                    date: moment(point.x).format('YYYY-MM-DD'),
                                });
                                if (foundPolicyResult) {
                                    let showSignals = [];
                                    if (foundPolicyResult.reason.includes('kd_gold')) showSignals.push('[KD黃金]');
                                    if (foundPolicyResult.reason.includes('kd_dead')) showSignals.push('[KD死亡]');
                                    if (foundPolicyResult.reason.includes('kd_turn_down')) showSignals.push('[KD下折]');
                                    if (foundPolicyResult.reason.includes('kd_turn_up')) showSignals.push('[KD上折]');
                                    if (foundPolicyResult.reason.includes('cost_down')) showSignals.push('[成本價跌過]');
                                    if (foundPolicyResult.reason.includes('earn')) showSignals.push('[絕對正報酬]');
                                    if (showSignals.length > 0)
                                        str += `<br><span style="color: #e75c9a; font-weight:bold;">訊號</span>: ${showSignals.join(
                                            ', '
                                        )}`;
                                }
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
                        min: 0,
                        max: 100,
                        plotBands: plotBands,
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
                                    for (tick; tick - increment <= this.dataMax; tick += increment) {
                                        if (tick > 100) tick = 100;
                                        else if (tick < 0) tick = 0;
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
                        name: 'K線',
                        color: '#4286f5',
                        data: this.k,
                    },
                    {
                        name: 'D線',
                        color: '#e75c9a',
                        data: this.d,
                    },
                    {
                        type: 'scatter',

                        color: 'rgba(223, 83, 83, 0.9',

                        marker: {
                            symbol: 'circle',
                        },
                        // 此點將不要滑鼠追蹤，因為不要顯示 tooltip
                        enableMouseTracking: false,
                        data: this.stockDataOfPolicyResultBuy,
                    },
                    {
                        type: 'scatter',

                        color: 'rgba(82, 157, 1, 0.9',

                        marker: {
                            symbol: 'circle',
                        },
                        // 此點將不要滑鼠追蹤，因為不要顯示 tooltip
                        enableMouseTracking: false,
                        data: this.stockDataOfPolicyResultSell,
                    },
                    {
                        type: 'scatter',

                        color: 'rgba(153, 153, 153, 0.9',

                        marker: {
                            symbol: 'circle',
                        },
                        // 此點將不要滑鼠追蹤，因為不要顯示 tooltip
                        enableMouseTracking: false,
                        data: this.stockDataOfPolicyResultBuyOrSellCancel,
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
