<template>
    <div style="position: relative">
        <!-- {{ parentData.at(-1).close }} -->
        <highcharts
            :constructorType="'stockChart'"
            :options="chartOptions"
            style="position: relative; top: 5px; background: transparent"
        >
        </highcharts>
        <div
            style="position: absolute; top: 80px; font-size: 12px"
            :style="{ left: showJLine ? '75px' : '121px' }"
            v-if="k && k.length > 0"
        >
            <span style="color: #4286f5">K</span>: {{ k[k.length - 1][1].toFixed(2) }} <span style="color: #e75c9a">D</span>:
            {{ d[d.length - 1][1].toFixed(2) }}
            <span v-if="showJLine"><span style="color: #febd09">J</span>: {{ j[j.length - 1][1].toFixed(2) }}</span>
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
    props: ['parentData', 'showJLine'],
    data() {
        return {
            // chartOptions: {
            // },
        };
    },
    computed: {
        // stockData 資料的改變是依賴 點擊 日線、週線、月線後，去取 vuex 資料
        k() {
            return this.stockDataOfKdjPrice.map((value) => [value[0], value[1]]);
        },
        d() {
            return this.stockDataOfKdjPrice.map((value) => [value[0], value[2]]);
        },
        j() {
            return this.stockDataOfKdjPrice.map((value) => [value[0], value[3]]);
        },
        // 如果您希望最大值和最小值使用天花板和地板的十進位值，而不使用偏移量，您可以將 chartMinMaxValues 函數修改如下：
        chartMinMaxValues() {
            const kValues = this.k.map((value) => value[1]);
            const dValues = this.d.map((value) => value[1]);
            let allValues;

            if (this.showJLine) {
                const jValues = this.j.map((value) => value[1]);

                allValues = [...kValues, ...dValues, ...jValues];
            } else {
                allValues = [...kValues, ...dValues];
            }
            const minValue = Math.min(...allValues);
            const maxValue = Math.max(...allValues);

            // 最小值使用地板的十進位值
            const tickMin = Math.floor(minValue / 10) * 10;

            // 最大值使用天花板的十進位值
            const tickMax = Math.ceil(maxValue / 10) * 10;

            return { tickMin, tickMax };
        },
        stockData() {
            console.log('stockData');
            // 一開始時this.parentData會是null，所以要給[]來避免出錯
            return this.$store.getters.getStock(this.parentData);
        },

        stockDataOfKdjPrice() {
            console.log('stockDataOfKdjPrice');
            // console.log(this.stockDataOfPolicy);
            // 一開始時this.parentData會是null，所以要給[]來避免出錯
            // 只取出最後52筆的週KD資料出來，約1年，因為1年52週
            // return (
            //     (this.stockData.data &&
            //         this.stockData.data.weekly_kdj &&
            //         _.slice(this.stockData.data.weekly_kdj, -52).map((value) => [
            //             moment(value[0]).valueOf(),
            //             value[1],
            //             value[2],
            //         ])) ||
            //     []
            // );
            return this.$store.getters.getStockDataWeeklyKdj(this.parentData);
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
                            _.some(o.reason, (el) => _.includes(el, 'kd') || _.includes(el, 'rsi')) && // 必需有 kd 的訊號設定
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
                            _.some(o.reason, (el) => _.includes(el, 'kd') || _.includes(el, 'rsi')) && // 必需有 kd 的訊號設定
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

        allDividendList() {
            const dividendList = this.$store.getters.getStockDividendList(this.parentData);
            console.log(this.parentData);
            return _.filter(this.k, (entry, index) => {
                const startDate = index > 0 ? moment(this.k[index - 1][0]).add(1, 'day') : null;
                const endDate = moment(entry[0]);

                return Boolean(
                    _.find(dividendList, function (o) {
                        return moment(o.trading_date).isBetween(startDate, endDate);
                    })
                );
            });
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
            const { tickMin, tickMax } = this.chartMinMaxValues;

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
                        console.log('point');
                        console.log(this.points);
                        // 在畫買賣訊號有可能沒有 points，是 undefined
                        this.points.forEach((point, index) => {
                            console.log(point);
                            console.log(index);
                            // const fontColor = point.y > point.point.open ? '#ee3333' : '#01aa00';
                            if (index === 0) {
                                str += `<div style="text-align:center;">${moment(point.x).format(
                                    'YYYY-MM-DD'
                                )}(<span style="color: #3333ee; font-weight:bold;">${
                                    dayOfWeek[moment(point.x).day()]
                                }</span>)</div>`;
                                str += `K: <span style="color: #4286f5; font-weight:bold;">${Number(point.y.toFixed(2))}</span> `;
                            } else if (index === 1) {
                                const found = _.find(
                                    component.stockData.data.weekly,
                                    (array) => array[0] === moment(point.x).format('YYYY-MM-DD')
                                );

                                // 取得該股價並且顯示
                                str += `D: <span style="color: #e75c9a; font-weight:bold;">${Number(point.y.toFixed(2))}</span>`;
                            } else if (index === 2) {
                                // 取得該股價並且顯示
                                str += `<br>J: <span style="color: #febd09; font-weight:bold;">${Number(
                                    point.y.toFixed(2)
                                )}</span> `;
                            }

                            if (this.points.length - 1 == index) {
                                const found = _.find(
                                    component.stockData.data.weekly,
                                    (array) => array[0] === moment(point.x).format('YYYY-MM-DD')
                                );
                                if (index === 1) str += '<br>';
                                str += `股價: <span style="color: #834beb; font-weight:bold;">${found[4]}</span>
                                `;
                                if (component.stockData.policy && component.stockData.policy.result) {
                                    const foundPolicyResult = _.find(component.stockData.policy.result, {
                                        date: moment(point.x).format('YYYY-MM-DD'),
                                    });
                                    if (foundPolicyResult) {
                                        let showSignals = [];
                                        if (foundPolicyResult.reason.includes('kd_gold'))
                                            showSignals.push(
                                                '<span style="background-color:#ee3333; color:#ffffff; padding: 0 1px; border-radius:5px; font-weight:bold;">KD黃金</span>'
                                            );
                                        if (foundPolicyResult.reason.includes('kd_dead'))
                                            showSignals.push(
                                                '<span style="background-color:#01aa00; color:#ffffff; padding: 0 1px; border-radius:5px; font-weight:bold;">KD死亡</span>'
                                            );
                                        if (foundPolicyResult.reason.includes('kd_w'))
                                            showSignals.push(
                                                '<span style="background-color:#ee3333; color:#ffffff; padding: 0 1px; border-radius:5px; font-weight:bold;">KD W底</span>'
                                            );
                                        if (foundPolicyResult.reason.includes('kd_m'))
                                            showSignals.push(
                                                '<span style="background-color:#01aa00; color:#ffffff; padding: 0 1px; border-radius:5px; font-weight:bold;">KD M頭</span>'
                                            );
                                        if (foundPolicyResult.reason.includes('kd_turn_down'))
                                            showSignals.push(
                                                '<span style="background-color:#ee3333; color:#ffffff; padding: 0 1px; border-radius:5px; font-weight:bold;">KD下折</span>'
                                            );
                                        if (foundPolicyResult.reason.includes('kd_turn_up'))
                                            showSignals.push(
                                                '<span style="background-color:#01aa00; color:#ffffff; padding: 0 1px; border-radius:5px; font-weight:bold;">KD上折</span>'
                                            );
                                        if (foundPolicyResult.reason.includes('rsi_over_sold'))
                                            showSignals.push(
                                                '<span style="background-color:#ee3333; color:#ffffff; padding: 0 1px; border-radius:5px; font-weight:bold;">RSI超賣</span>'
                                            );
                                        if (foundPolicyResult.reason.includes('rsi_over_bought'))
                                            showSignals.push(
                                                '<span style="background-color:#01aa00; color:#ffffff; padding: 0 1px; border-radius:5px; font-weight:bold;">RSI超買</span>'
                                            );
                                        if (foundPolicyResult.reason.includes('rsi_turn_down'))
                                            showSignals.push(
                                                '<span style="background-color:#ee3333; color:#ffffff; padding: 0 1px; border-radius:5px; font-weight:bold;">RSI下折</span>'
                                            );
                                        if (foundPolicyResult.reason.includes('rsi_turn_up'))
                                            showSignals.push(
                                                '<span style="background-color:#01aa00; color:#ffffff; padding: 0 1px; border-radius:5px; font-weight:bold;">RSI上折</span>'
                                            );
                                        if (foundPolicyResult.reason.includes('cost_down'))
                                            showSignals.push(
                                                '<span style="background-color:#999999; color:#ffffff; padding: 0 1px; border-radius:5px; font-weight:bold;">成本未跌過</span>'
                                            );
                                        if (foundPolicyResult.reason.includes('earn'))
                                            showSignals.push(
                                                '<span style="background-color:#999999; color:#ffffff; padding: 0 1px; border-radius:5px; font-weight:bold;">絕對正報酬</span>'
                                            );
                                        if (foundPolicyResult.reason.includes('annual_fixed_date_buy'))
                                            showSignals.push(
                                                '<span style="background-color:#ee3333; color:#ffffff; padding: 0 1px; border-radius:5px; font-weight:bold;">每年固定日買</span>'
                                            );
                                        if (foundPolicyResult.reason.includes('annual_fixed_date_sell'))
                                            showSignals.push(
                                                '<span style="background-color:#01aa00; color:#ffffff; padding: 0 1px; border-radius:5px; font-weight:bold;">每年固定日賣</span>'
                                            );
                                        if (showSignals.length > 0) str += `<br>策略: ${showSignals.join(', ')}`;
                                    }
                                }

                                if (component.allDividendList && component.allDividendList.length > 0) {
                                    const point_index = this.points[0].point.index;
                                    if (point_index > 0) {
                                        const startDate = moment(this.points[0].series.xData[point_index - 1]).add(1, 'days');
                                        const endDate = moment(point.x);
                                        var foundDate = _.find(component.allDividendList, function (o) {
                                            return moment(o[0]).isBetween(startDate, endDate, undefined, '[]');
                                        });
                                        if (foundDate)
                                            str += `<br>除息日: <span style="background-color: #999999; color:#ffffff; padding: 0 1px; border-radius:5px; font-weight:bold;">${moment(
                                                foundDate[0]
                                            ).format('M/DD')}(${dayOfWeek[moment(foundDate[0]).day()]})</span>`;
                                    }
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
                        min: tickMin, // 設定 y 軸的最小值
                        max: tickMax, // 設定 y 軸的最大值
                        plotBands: plotBands,
                        showLastLabel: true,
                        // endOnTick: false,
                        resize: {
                            enabled: true,
                        },
                        // 調整 y 軸 tick的間距，運用到高度最大化，不浪費
                        tickPositioner() {
                            const positions = [];
                            const tickCount = 4; // 刻度數量

                            const tickInterval = Math.ceil((tickMax - tickMin) / (tickCount - 1)); // 計算刻度間隔

                            for (let i = 0; i < tickCount; i++) {
                                let tickValue;

                                if (i === 1 || i === 2) {
                                    tickValue = Math.round(tickMin + i * tickInterval); // 四捨五入到下一個個位數是0十位數是上述的值
                                    tickValue = Math.ceil(tickValue / 10) * 10; // 取十位數
                                } else if (i === 3) {
                                    tickValue = tickMax;
                                } else {
                                    tickValue = tickMin + i * tickInterval;
                                }

                                positions.push(tickValue);
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
                        name: 'J線',
                        color: '#febd09',
                        data: this.j,
                        visible: this.showJLine,
                    },
                    {
                        type: 'scatter',

                        color: 'rgba(223, 83, 83, 0.9)',

                        marker: {
                            symbol: 'circle',
                        },
                        // 此點將不要滑鼠追蹤，因為不要顯示 tooltip
                        enableMouseTracking: false,
                        data: this.stockDataOfPolicyResultBuy,
                    },
                    {
                        type: 'scatter',

                        color: 'rgba(82, 157, 1, 0.9)',

                        marker: {
                            symbol: 'circle',
                        },
                        // 此點將不要滑鼠追蹤，因為不要顯示 tooltip
                        enableMouseTracking: false,
                        data: this.stockDataOfPolicyResultSell,
                    },
                    {
                        type: 'scatter',

                        color: 'rgba(153, 153, 153, 0.9)',

                        marker: {
                            symbol: 'circle',
                        },
                        // 此點將不要滑鼠追蹤，因為不要顯示 tooltip
                        enableMouseTracking: false,
                        data: this.stockDataOfPolicyResultBuyOrSellCancel,
                    },
                    {
                        type: 'scatter',

                        color: 'rgba(153, 153, 153, 0.9)',

                        marker: {
                            symbol: 'triangle-down',
                        },
                        // 此點將不要滑鼠追蹤，因為不要顯示 tooltip
                        enableMouseTracking: false,
                        data: this.allDividendList,
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
