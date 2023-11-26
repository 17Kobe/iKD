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
            v-if="rsi5 && rsi5.length > 0"
            style="
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                position: absolute;
                top: 80px;
                padding: 0px 10px 0px 6px;
                width: 100%;
            "
        >
            <span style="order: 1; position: relative">
                <span
                    v-for="(status, index) in stockData.rsi_status"
                    :key="index"
                    :title="
                        status === 'RSI ≥ 70超買'
                            ? 'RSI(5)值>=70為超買'
                            : status === 'RSI ≤ 30超賣'
                            ? 'RSI(5)值<=30為超賣'
                            : status === 'RSI 接近最高'
                            ? 'RSI(5)值接近歷史最高(<=3以內)'
                            : status === 'RSI 最高' && rsi5[rsi5.length - 1][1] >= 50
                            ? 'RSI(5)值高於歷史最高值(' + Math.round(stockData.data.weekly_rsi_max * 100) / 100 + ')'
                            : status === 'RSI 最高' && rsi5[rsi5.length - 1][1] <= 50
                            ? 'RSI(5)值低於歷史最低值(' + Math.round(stockData.data.weekly_rsi_min * 100) / 100 + ')'
                            : ''
                    "
                    :style="{
                        position: 'absolute',
                        top: -index * 22 + 'px',
                        left: '0', // 左對齊
                        display: 'inline-block',
                        minWidth: ['RSI 超買', 'RSI 超賣', 'RSI 最高'].includes(status)
                            ? '58px'
                            : ['RSI ≥ 70超買', 'RSI ≤ 30超賣'].includes(status)
                            ? '78px'
                            : '80px',
                        background: ['RSI ≥ 70超買', 'RSI 超買', 'RSI 往下轉折', 'RSI 超買', 'RSI 最高', 'RSI 接近最高'].includes(
                            status
                        )
                            ? 'rgb(103, 194, 58)'
                            : 'rgb(242, 139, 130)',
                        color: 'white',
                        padding: '0px 3px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        opacity: '0.83',
                        lineHeight: '1.5',
                    }"
                    :class="[
                        ['RSI 超買', 'RSI 超賣', 'RSI 往下轉折', 'RSI 往上轉折'].includes(status) &&
                        !['取消買', '取消買x2', '取消賣', '取消賣½'].includes(stockData.badge)
                            ? 'shake-base'
                            : '',
                        'cell-chart',
                    ]"
                >
                    {{ status }}
                </span>
            </span>
            <span style="order: 2">
                <span style="color: #4286f5">RSI(5)</span>:
                {{ rsi5[rsi5.length - 1][1].toFixed(2) }}
                <span style="color: #e75c9a"> {{ rsi5[rsi5.length - 1][1] >= 50 ? '最高' : '最低' }} </span
                >{{
                    rsi5[rsi5.length - 1][1] >= 50
                        ? ': ' + Math.round(stockData.data.weekly_rsi_max * 100) / 100
                        : ': ' + Math.round(stockData.data.weekly_rsi_min * 100) / 100
                }}
            </span>
        </div>
        <el-popover placement="bottom-end" title="歷年股利" :offset="-65" :width="433" :trigger="popoverTrigger" :hide-after="0">
            <div v-if="dividend && dividend.length >= 1">
                <div v-for="(item, index) in dividend" :key="index">
                    <span
                        :style="[
                            (item.CashExDividendTradingDate
                                ? parseInt(item.CashExDividendTradingDate.substring(0, 4))
                                : parseInt(item.StockExDividendTradingDate.substring(0, 4))) %
                                2 ===
                            1
                                ? { 'background-color': '#eeeeee' }
                                : { 'background-color': '#ffffff' },
                            {
                                'font-size': '14px',
                                display: 'inline-block',
                                width: '100px',
                                'text-align': 'center',
                                'margin-top': '6px',
                            },
                        ]"
                        >{{
                            item.CashExDividendTradingDate ? item.CashExDividendTradingDate : item.StockExDividendTradingDate
                        }}</span
                    >&nbsp;&nbsp;

                    <span
                        :style="[
                            item.CashEarningsDistribution ? { 'background-color': '#e6a23c' } : { 'background-color': '#909399' },
                            {
                                'font-size': '14px',
                                display: 'inline-flex' /* 使用 inline-flex 以允許靠右對齊 */,
                                width: '130px',
                                'text-align': 'left',
                                'justify-content': 'space-between' /* 將子元素靠右對齊 */,
                                color: 'white',
                                'border-radius': '10px 100px / 120px',
                                padding: '5px',
                                'vertical-align': 'top' /* 將文字靠最上方 */,
                            },
                        ]"
                    >
                        {{ item.CashEarningsDistribution ? '現金股利' : '股票股利' }}
                        <span>
                            ({{
                                item.CashEarningsDistribution
                                    ? item.CashEarningsDistribution.toFixed(2) + '元'
                                    : item.StockEarningsDistribution.toFixed(2) + '股'
                            }}
                            )
                        </span>
                    </span>

                    &nbsp;&nbsp;<span
                        :style="[
                            parseInt(item.CashDividendPaymentDate.substring(0, 4)) % 2 === 1
                                ? { 'background-color': '#eeeeee' }
                                : { 'background-color': '#ffffff' },
                            {
                                'font-size': '14px',
                                display: 'inline-block',
                                width: '90px',
                                'text-align': 'center',
                                'margin-top': '6px',
                            },
                        ]"
                        >{{ item.CashDividendPaymentDate }}</span
                    >
                    &nbsp;&nbsp;<span
                        style="color: #ee3333; font-size: 14px; display: inline-block; width: 50px; text-align: right"
                        >{{ item.dividendYield ? item.dividendYield.toFixed(2) + ' %' : '' }}</span
                    >
                </div>
            </div>
            <template #reference>
                <div>
                    <el-button
                        type="info"
                        class="custom-button"
                        :plain="true"
                        size="mini"
                        style="position: absolute; left: 17px; top: 6px; padding: 0px 8px"
                        v-if="stockData.type !== 'exchange' && stockData.type !== 'fund'"
                        @click="getDividend"
                        >息</el-button
                    >
                </div>
            </template>
        </el-popover>

        <!-- :updateArgs="[true, true, true]" -->
    </div>
</template>

<script>
import { Chart } from 'highcharts-vue';
import moment from 'moment';
import _ from 'lodash';
import { ElMessage } from 'element-plus';

export default {
    components: { highcharts: Chart },
    props: ['parentData'],
    data() {
        return {
            popoverTrigger: 'hover',
            // chartOptions: {
            // },
        };
    },
    mounted() {
        // 在 mounted() 事件時就可以發送，因為此時不須 data 及 computed 資料都準備好(因為沒有要data 參數，在create())
        this.popoverTrigger = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            ? 'click'
            : 'hover';
    },
    computed: {
        // stockData 資料的改變是依賴 點擊 日線、週線、月線後，去取 vuex 資料
        stockData() {
            console.log('stockData');
            // 一開始時this.parentData會是null，所以要給[]來避免出錯
            return this.$store.getters.getStock(this.parentData);
        },

        dividend() {
            console.log('stockDataOfDividend');
            return this.$store.getters.getStockDataDividend(this.parentData);
        },

        rsi5() {
            console.log('stockDataOfRsiPrice');
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
            return this.$store.getters.getStockDataWeeklyRsi(this.parentData);
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
                            _.some(o.reason, (el) => _.includes(el, 'rsi')) && // 必需有 rsi 的訊號設定
                            o.is_sure_buy
                    ).map((obj) => [moment(obj.date).valueOf(), obj.rsi])) ||
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
                            _.some(o.reason, (el) => _.includes(el, 'rsi')) && // 必需有 rsi 的訊號設定
                            o.is_sure_sell
                    ).map((obj) => [moment(obj.date).valueOf(), obj.rsi])) ||
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
                            _.some(o.reason, (el) => _.includes(el, 'rsi')) && // 必需有 rsi 的訊號設定
                            (o.is_buy_cancel || o.is_sell_cancel)
                    ).map((obj) => [moment(obj.date).valueOf(), obj.rsi])) ||
                []
            );
        },

        rsiOverSoldLimit() {
            // 超賣，值要畫橫線
            console.log('kdGoldLimit');
            let ret = -999; // 讓他畫線畫在看到到的地方
            if (this.stockData.policy && this.stockData.policy.settings && this.stockData.policy.settings.buy) {
                const found = _.find(this.stockData.policy.settings.buy, ['method', 'rsi_over_sold']);
                if (found) ret = found.limit; // 若非 nundefined
            }
            // console.log(ret);
            return ret;
        },
        rsiTurnUpLmit() {
            // 往下轉折，值要畫橫線
            console.log('kdGoldTurn');
            let ret = -999; // 讓他畫線畫在看到到的地方
            if (this.stockData.policy && this.stockData.policy.settings && this.stockData.policy.settings.buy) {
                const found = _.find(this.stockData.policy.settings.buy, ['method', 'rsi_turn_up']);
                if (found) ret = found.limit; // 若非 nundefined
            }
            return ret;
        },
        rsiOverBoughtLimit() {
            // 超買，值要畫橫線
            console.log('rsiOverBoughtLimit');
            let ret = -999; // 讓他畫線畫在看到到的地方
            if (this.stockData.policy && this.stockData.policy.settings && this.stockData.policy.settings.sell) {
                const found = _.find(this.stockData.policy.settings.sell, ['method', 'rsi_over_bought']);
                if (found) ret = found.limit; // 若非 nundefined
            }
            return ret;
        },
        rsiTurnDownLmit() {
            // 往下轉折，值要畫橫線
            console.log('rsiTurnDownLmit');
            let ret = -999; // 讓他畫線畫在看到到的地方
            if (this.stockData.policy && this.stockData.policy.settings && this.stockData.policy.settings.sell) {
                const found = _.find(this.stockData.policy.settings.sell, ['method', 'rsi_turn_down']);
                if (found) ret = found.limit; // 若非 nundefined
            }
            return ret;
        },

        chartOptions() {
            // component 參考 https://stackoverflow.com/questions/68381856/how-to-access-highcharts-stock-tooltip-data-in-vue
            const component = this;

            let plotBands = [];
            if (this.rsiOverBoughtLimit !== -999) {
                plotBands.push({
                    from: this.rsiOverBoughtLimit,
                    to: 100,
                    color: 'rgba(75, 192, 192, 0.5)', // 設定填充顏色為紅色
                });
            }
            if (this.rsiTurnDownLmit !== -999) {
                plotBands.push({
                    from: this.rsiTurnDownLmit,
                    to: this.rsiOverBoughtLimit !== -999 ? this.rsiOverBoughtLimit : 100,
                    color: 'rgba(75, 192, 192, 0.05)', // 設定填充顏色為紅色
                });
            }

            if (this.rsiOverSoldLimit !== -999) {
                plotBands.push({
                    from: 0,
                    to: this.rsiOverSoldLimit,
                    color: 'rgba(255, 99, 132, 0.5)', // 設定填充顏色為紅色
                });
            }
            if (this.rsiTurnUpLmit !== -999) {
                plotBands.push({
                    from: this.rsiOverSoldLimit !== -999 ? this.rsiOverSoldLimit : 0,
                    to: this.rsiTurnUpLmit,
                    color: 'rgba(255, 99, 132, 0.2)', // 設定填充顏色為紅色
                });
            }

            return {
                chart: {
                    backgroundColor: 'rgba(0,0,0,0)', // 讓 highcharts的背景變透明後，滑鼠移到chart上時，不會看出它有白的只有下方，上方那個沒有
                    // zoomType: '', // x, y不能在放大縮小，避免手滑在移動時間又動到放大縮小
                    zoomType: 'none',
                    pinchType: 'none',
                    marginLeft: 8, // 調整左邊邊界的空白
                    marginRight: 2, // 調整右邊邊界的空白
                    marginBottom: 27,
                    marginTop: 1,
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
                                str += `<div><span style="color: #4286f5; font-weight:bold;">RSI(5)</span>: ${Number(
                                    point.y.toFixed(2)
                                )} `;

                                // 取得該股價並且顯示
                                const found = _.find(
                                    component.stockData.data.weekly,
                                    (array) => array[0] === moment(point.x).format('YYYY-MM-DD')
                                );
                                str += `<br><span style="color: #834beb; font-weight:bold;">股價</span>: ${found[4]}
                                </div>`;
                            }
                        });

                        str += '</div>';
                        return str;
                    },
                },
                xAxis: {
                    type: 'datetime',
                    gridLineWidth: 0, // 顯示圖表X軸上的直色灰線
                    tickWidth: 0,
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

                    // tickPositioner() {
                    //     const positions = [];
                    //     let tick = Math.floor(this.dataMin);
                    //     const increment = 1000 * 3600 * 24 * 91.5; // 3 months

                    //     for (tick; tick <= this.dataMax; tick += increment) {
                    //         positions.push(tick);
                    //     }
                    //     if (positions.indexOf(this.dataMax) === -1) positions.push(this.dataMax);
                    //     return positions;
                    // },
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
                        labels: {
                            enabled: false, // 不显示刻度标签
                        },
                        plotLines: [
                            {
                                value: 30, // 20 的位置
                                color: '#e6e6e6', // 线的颜色
                                width: 1, // 线的宽度
                                zIndex: 1, // 线的层级
                                label: {
                                    text: '30', // 刻度值
                                    align: 'right', // 刻度值的对齐方式
                                    x: -1, // 刻度值的水平偏移
                                    y: 3,
                                },
                            },
                            {
                                value: 70, // 80 的位置
                                color: '#e6e6e6', // 线的颜色
                                width: 1, // 线的宽度
                                zIndex: 1, // 线的层级
                                label: {
                                    text: '70', // 刻度值
                                    align: 'right', // 刻度值的对齐方式
                                    x: -1, // 刻度值的水平偏移
                                    y: 3,
                                },
                            },
                        ],
                        // tickPositioner() {
                        //     const positions = [0, 20, 50, 80, 100];
                        //     if (this.dataMin && this.dataMax) {
                        //         // ... 你原本的 tickPositioner 設定
                        //     }
                        //     return positions;
                        // },

                        // 調整 y 軸 tick的間距，運用到高度最大化，不浪費
                        // tickPositioner() {
                        //     const positions = [];
                        //     // 一開始時 dataMax 及 dataMin會是null，然後再用 toFixed就會有錯，所以加 if 來避免
                        //     if (this.dataMin && this.dataMax) {
                        //         let tick = 0;
                        //         let increment = (this.dataMax - this.dataMin) / 2;
                        //         // const max = this.dataMax;
                        //         const min = this.dataMin;
                        //         if (increment > 1) {
                        //             increment = Math.ceil(increment);
                        //             tick = Math.floor(this.dataMin);
                        //             for (tick; tick - increment <= this.dataMax; tick += increment) {
                        //                 if (tick > 100) tick = 100;
                        //                 else if (tick < 0) tick = 0;
                        //                 positions.push(tick);
                        //             }
                        //         } else {
                        //             tick = Number(min.toFixed(1));
                        //             increment = Number(increment.toFixed(3));
                        //             for (tick; tick - increment <= this.dataMax; tick += increment) {
                        //                 positions.push(Number(tick.toFixed(2)));
                        //             }
                        //         }
                        //     }
                        //     return positions;
                        // },
                    },
                ],
                series: [
                    {
                        name: 'RSI(5)',
                        // color: '#e65596',
                        data: this.rsi5,
                        type: 'area',
                        threshold: 80,
                        zones: [
                            {
                                value: 20,
                                color: '#e65596',
                                fillColor: 'none',
                            },
                            {
                                value: 80.01,
                                color: '#4286f5',
                                fillColor: 'none',
                            },
                            {
                                value: 100,
                                color: '#e65596',
                                fillColor: 'rgba(255, 99, 132, 0.2)',
                            },
                        ],
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
    methods: {
        getDividend() {
            const crawlerDividendLastDate = this.stockData.crawler_dividend_last_date
                ? moment(this.stockData.crawler_dividend_last_date)
                : '2023-11-06';
            const duration = moment.duration(moment().diff(crawlerDividendLastDate));
            const minutesDiff = duration.minutes();
            const secondsDiff = duration.seconds();

            if (minutesDiff <= 4 && secondsDiff <= 59) {
                ElMessage({
                    type: 'warning',
                    message: `禁止在5分鐘內多次發送配息資料的請求，前次發送請求距今時間 ${minutesDiff}分 ${secondsDiff}秒!`,
                });
            } else {
                this.$store.dispatch('GET_STOCK_DIVIDEND', this.parentData);
                ElMessage({
                    type: 'success',
                    message: '送出配息資料的請求!',
                });
            }
            // this.$store.commit('SAVE_SHOW_TRADING_VOLUME', { stockId: this.parentData });
            // this.showTradingVolume = !this.showTradingVolume;
        },
    },
};
</script>
