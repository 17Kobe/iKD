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
            v-if="kdj && kdj.length > 0"
            style="
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                position: absolute;
                top: 80px;
                padding: 0px 12px 0px 6px;
                width: 100%;
            "
        >
            <span style="order: 1; position: relative">
                <span
                    v-for="(status, index) in stockData.kd_status"
                    :key="index"
                    :title="
                        status === 'KD 高檔鈍化'
                            ? '連續3根K值在80以上'
                            : status === 'KD 低檔鈍化'
                            ? '連續3根K值在20以下'
                            : status === 'KD ≥ 80超買'
                            ? 'K值>=80為超買'
                            : status === 'KD ≤ 20超賣'
                            ? 'K值<=20為超賣'
                            : status.includes('合理價')
                            ? '近7年平均殖利率的20倍作為估算(中華電使用25倍)'
                            : ''
                    "
                    :style="{
                        position: 'absolute',
                        top: -index * 22 + 'px',
                        left: '0', // 左對齊
                        display: 'inline-block',
                        minWidth: ['KD W底', 'KD M頭'].includes(status)
                            ? '53px'
                            : ['KD ≥ 80超買', 'KD ≤ 20超賣'].includes(status)
                            ? '76px'
                            : ['成本價未跌過'].includes(status)
                            ? '83px'
                            : ['每年固定日買', '每年固定日賣'].includes(status)
                            ? '81px'
                            : '77px',
                        background: ['KD 高檔鈍化', 'KD 低檔鈍化', '成本價未跌過'].includes(status)
                            ? 'rgb(170, 170, 170)'
                            : ['KD ≥ 80超買', 'KD 死亡交叉', 'KD 往下轉折', 'KD M頭', '每年固定日賣'].includes(status)
                            ? 'rgb(103, 194, 58)'
                            : 'rgb(242, 139, 130)',
                        color: 'white',
                        padding: '0px 3px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        opacity: '0.83',
                        lineHeight: '1.5',
                        boxShadow: status.includes('合理價') ? '1px 1px 5px rgba(0, 0, 0, 0.3)' : 'none',
                    }"
                    :class="[
                        (status.includes('合理價') && stockData.last_price < parseFloat(status.split(' ')[1])) ||
                        ([
                            'KD 黃金交叉',
                            'KD 往上轉折',
                            'KD W底',
                            'KD 死亡交叉',
                            'KD 往下轉折',
                            'KD M頭',
                            '每年固定日買',
                            '每年固定日賣',
                        ].includes(status) &&
                            !['取消買', '取消買x2', '取消賣', '取消賣½', '取消賣⅓'].includes(stockData.badge))
                            ? 'shake-base'
                            : '',
                        'cell-chart',
                    ]"
                >
                    {{ status }}
                </span>
            </span>

            <span style="order: 2">
                <span style="color: #4286f5">K</span>: {{ kdj[kdj.length - 1][1].toFixed(2) }}
                <span style="color: #e75c9a">D</span>:
                {{ kdj[kdj.length - 1][2].toFixed(2) }}
                <span v-if="showJLine"><span style="color: #febd09">J</span>: {{ kdj[kdj.length - 1][3].toFixed(2) }}</span>
            </span>
        </div>

        <div
            v-if="stockData"
            style="
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                position: absolute;
                top: 80px;
                left: 79px;
                padding: 0px 12px 0px 6px;
                width: 100%;
            "
        >
            <span style="order: 1; position: relative">
                <span
                    v-if="stockData.eps && stockData.eps.length > 0"
                    style="
                        position: absolute;
                        top: -42px;
                        display: inline-block;
                        min-width: 64px;
                        background: rgb(231 255 251);
                        color: rgb(62 207 188);
                        padding: 0px 3px;
                        border-radius: 10px;
                        font-size: 12px;
                        opacity: 0.83;
                        line-height: 1.5;
                        text-align: left;
                        padding-left: 5px;
                    "
                >
                <el-tooltip
                    :visible="tooltipVisible"
                    raw-content
                    placement="bottom-end"
                    >
                    <template #content>
                        <div style="white-space: pre; font-family: 'Lucida Console', monospace;">
                            EPS: 每股盈餘，反映公司獲利能力。
                            <br />
                            <span style="display: block; border-top: 1px solid #ccc; margin: 4px 0;"></span>
                            <span v-for="(item, index) in formattedEps.slice().reverse()" :key="index">
                                <span style="margin-left: 10px">{{ item.date }}</span>
                                <span style="margin-left: 23px">{{ item.value < 10 ? ' ' : '' }}{{ item.value.toFixed(2) }}</span>
                                <span v-if="item.acc" style="margin-left: 23px">{{ item.acc < 10 ? ' ' : '' }}{{ item.acc }}</span>
                                <br />
                                <span v-if="item.date.endsWith('03-31')" style="display: block; border-top: 1px solid #ccc; margin: 4px 0;"></span>
                            </span>
                        </div>
                    </template>
                    <div @click="tooltipVisible = !tooltipVisible">
                        <span
                        :style="{
                            color: 'rgb(34, 35, 38)',
                            fontSize: '11px',
                            marginRight: (() => {
                            const eps = formattedEps.length > 0 ? formattedEps[formattedEps.length - 1].acc : 0;
                            const base = eps < 10 ? 9 + (this.isMobile ? 1 : 0) : 3;
                            return base + (this.isMobile ? 1 : 0) + 'px';
                            })(),
                        }"
                        >EPS</span><b>{{ formattedEps.length > 0 ? formattedEps[formattedEps.length - 1].acc : '' }}</b>
                    </div>
                </el-tooltip>
                </span>
                <span
                    v-if="stockData.per_pbr"
                    style="
                        position: absolute;
                        top: -21px;
                        display: inline-block;
                        min-width: 64px;
                        background: rgb(241, 256, 209);
                        color: rgb(81 177 35);
                        padding: 0px 3px;
                        border-radius: 10px;
                        font-size: 12px;
                        opacity: 0.83;
                        line-height: 1.5;
                        text-align: left;
                        padding-left: 5px;
                    "
                    :title="`${stockData.per_pbr.date}，PE: 本益比，評估股價相對於獲益及成長率是否合理`"
                >
                    <span style="color: rgb(34, 35, 38); font-size: 11px">PE</span>&nbsp;&nbsp;&nbsp;<b>{{
                        stockData.per_pbr.per.toFixed(2)
                    }}</b>
                </span>
                <span
                    v-if="stockData.per_pbr"
                    style="
                        position: absolute;
                        top: 0px;
                        display: inline-block;
                        min-width: 64px;
                        background: rgb(255 241 208);
                        color: rgb(237 172 15);
                        padding: 0px 3px;
                        border-radius: 10px;
                        font-size: 12px;
                        opacity: 0.83;
                        line-height: 1.5;
                        text-align: left;
                        padding-left: 5px;
                    "
                    :title="`${stockData.per_pbr.date}，PB: 股價淨值比，評估公司股價相對於其資產價值的高低`"
                >
                    <span style="color: rgb(34, 35, 38); font-size: 11px; margin-right: 16px">PB</span
                    ><b>{{ stockData.per_pbr.pbr.toFixed(2) }}</b>
                </span>
            </span>
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
            isMobile: true,
            tooltipVisible: false,
            // chartOptions: {
            // },
            //
        };
    },
    mounted() {
        this.isMobile =
            /Mobi|Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    },
    computed: {
        // 如果您希望最大值和最小值使用天花板和地板的十進位值，而不使用偏移量，您可以將 chartMinMaxValues 函數修改如下：
        // chartMinMaxValues() {
        //     const kValues = this.kdj.map((value) => value[1]);
        //     const dValues = this.kdj.map((value) => value[2]);
        //     let allValues;

        //     if (this.showJLine) {
        //         const jValues = this.kdj.map((value) => value[3]);

        //         allValues = [...kValues, ...dValues, ...jValues];
        //     } else {
        //         allValues = [...kValues, ...dValues];
        //     }
        //     const minValue = Math.min(...allValues);
        //     const maxValue = Math.max(...allValues);

        //     // 最小值使用地板的十進位值
        //     const tickMin = Math.floor(minValue / 10) * 10;

        //     // 最大值使用天花板的十進位值
        //     const tickMax = Math.ceil(maxValue / 10) * 10;

        //     return { tickMin, tickMax };
        // },
        stockData() {
            console.log('stockData');
            // 一開始時this.parentData會是null，所以要給[]來避免出錯
            return this.$store.getters.getStock(this.parentData);
        },
        formattedEps() {
            if (!this.stockData || !this.stockData.eps) return [];

            // 按年份分組
            const groupedByYear = _.groupBy(this.stockData.eps, (item) => item.date.split('-')[0]);

            // 計算每年累積值，並保留所有月份資料，但只有最後一個日期有 acc
            const result = _.flatMap(groupedByYear, (yearData) => {
                const acc = _.sumBy(yearData, 'value'); // 計算累積值
                const lastDate = _.last(yearData).date; // 每年最後一個日期
                return yearData.map((entry) => ({
                    ...entry,
                    acc: entry.date === lastDate ? acc.toFixed(2) : null, // 只有最後一個日期有 acc
                }));
            });

            return result;
        },
        kdj() {
            console.log('kdj');
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

        stockDataDividend() {
            return this.$store.getters.getStockDataDividend(this.parentData);
        },

        stockDataDividendToKdjList() {
            // const dividendList = this.$store.getters.getStockDataDividend(this.parentData);
            // console.log(this.parentData);
            // console.log(dividendList);
            return _.filter(this.kdj, (entry, index) => {
                // console.log(entry);
                const startDate =
                    index > 0
                        ? moment(this.kdj[index - 1][0])
                              .clone()
                              .add(1, 'day')
                        : null;
                const endDate = moment(entry[0]).set({ hour: 23, minute: 59, second: 59 });
                // if (startDate) console.log(startDate.format('YYYY-MM-DD HH:mm:ss'));
                // if (endDate) console.log(endDate.format('YYYY-MM-DD HH:mm:ss'));
                // CashExDividendTradingDate
                return Boolean(
                    _.find(this.stockDataDividend, function (o) {
                        const cashExDividendDateCheck =
                            startDate && o.CashExDividendTradingDate
                                ? moment(o.CashExDividendTradingDate).isBetween(startDate, endDate, null, '[]')
                                : false;
                        const stockExDividendDateCheck =
                            startDate && o.StockExDividendTradingDate
                                ? moment(o.StockExDividendTradingDate).isBetween(startDate, endDate, null, '[]')
                                : false;

                        // console.log(moment(o.CashExDividendTradingDate).format('YYYY-MM-DD HH:mm:ss'));
                        // console.log(moment(o.StockExDividendTradingDate).format('YYYY-MM-DD HH:mm:ss'));
                        // console.log(cashExDividendDateCheck);
                        // console.log(stockExDividendDateCheck);

                        return cashExDividendDateCheck || stockExDividendDateCheck;
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
            // const { tickMin, tickMax } = this.chartMinMaxValues;

            let plotBands = [];
            if (this.kdTurnDownLmit !== -999) {
                plotBands.push({
                    from: this.kdTurnDownLmit,
                    to: this.showJLine ? 115 : 100,
                    color: 'rgba(75, 192, 192, 0.5)', // 設定填充顏色為紅色
                });
            }
            if (this.kdDeadLimit !== -999) {
                plotBands.push({
                    from: this.kdDeadLimit,
                    to: this.kdTurnDownLmit !== -999 ? this.kdTurnDownLmit : this.showJLine ? 115 : 100,
                    color: 'rgba(75, 192, 192, 0.05)', // 設定填充顏色為紅色
                });
            }

            if (this.kdTurnUpLmit !== -999) {
                plotBands.push({
                    from: this.showJLine ? -15 : 0,
                    to: this.kdTurnUpLmit,
                    color: 'rgba(255, 99, 132, 0.5)', // 設定填充顏色為紅色
                });
            }
            if (this.kdGoldLimit !== -999) {
                plotBands.push({
                    from: this.kdTurnUpLmit !== -999 ? this.kdTurnUpLmit : this.showJLine ? -15 : 0,
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
                    // marginLeft: 2, // 調整左邊邊界的空白
                    marginRight: 15, // 調整右邊邊界的空白
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
                        // console.log('point');
                        // console.log(this.points);
                        // 在畫買賣訊號有可能沒有 points，是 undefined
                        this.points.forEach((point, index) => {
                            // console.log(point);
                            // console.log(index);
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

                                if (component.stockDataDividend && component.stockDataDividend.length > 0) {
                                    const point_index = this.points[0].point.index;
                                    if (point_index > 0) {
                                        const startDate = moment(this.points[0].series.xData[point_index - 1])
                                            .clone()
                                            .add(1, 'days');
                                        const endDate = moment(point.x).set({ hour: 23, minute: 59, second: 59 });
                                        // console.log(startDate.format('YYYY-MM-DD HH:mm:ss'));
                                        // console.log(endDate.format('YYYY-MM-DD HH:mm:ss'));
                                        var foundObj = _.find(component.stockDataDividend, function (o) {
                                            var cashExDividendDateCheck =
                                                startDate && o.CashExDividendTradingDate
                                                    ? moment(o.CashExDividendTradingDate).isBetween(
                                                          startDate,
                                                          endDate,
                                                          undefined,
                                                          '[]'
                                                      )
                                                    : false;
                                            var stockExDividendDateCheck =
                                                startDate && o.StockExDividendTradingDate
                                                    ? moment(o.StockExDividendTradingDate).isBetween(
                                                          startDate,
                                                          endDate,
                                                          undefined,
                                                          '[]'
                                                      )
                                                    : false;

                                            return cashExDividendDateCheck || stockExDividendDateCheck;
                                        });
                                        // console.log(component.stockDataDividend);
                                        // console.log(foundObj);
                                        if (foundObj) {
                                            // console.log(foundObj);
                                            const foundDate = foundObj.CashExDividendTradingDate
                                                ? foundObj.CashExDividendTradingDate
                                                : foundObj.StockExDividendTradingDate;
                                            // console.log(moment(foundDate).format('YYYY-MM-DD HH:mm:ss'));
                                            str += `<br>除息日: <span style="background-color: #999999; color:#ffffff; padding: 0 1px; border-radius:5px; font-weight:bold;">${moment(
                                                foundDate
                                            ).format('M/DD')}(${dayOfWeek[moment(foundDate).day()]})</span>`;
                                        }
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
                        min: this.showJLine ? -15 : 0, // 設定 y 軸的最小值
                        max: this.showJLine ? 115 : 100, // 設定 y 軸的最大值
                        plotBands: plotBands,
                        tickInterval: 20,
                        gridLineWidth: 0,
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
                                value: 20, // 20 的位置
                                color: '#e6e6e6', // 线的颜色
                                width: 1, // 线的宽度
                                zIndex: 1, // 线的层级
                                label: {
                                    text: '20', // 刻度值
                                    align: 'right', // 刻度值的对齐方式
                                    x: -1, // 刻度值的水平偏移
                                    y: 3,
                                },
                            },
                            {
                                value: 50, // 50 的位置
                                color: '#e6e6e6', // 线的颜色
                                width: 1, // 线的宽度
                                zIndex: 1, // 线的层级
                                label: {
                                    text: '50', // 刻度值
                                    align: 'right', // 刻度值的对齐方式
                                    x: -1, // 刻度值的水平偏移
                                    y: 3,
                                },
                            },
                            {
                                value: 80, // 80 的位置
                                color: '#e6e6e6', // 线的颜色
                                width: 1, // 线的宽度
                                zIndex: 1, // 线的层级
                                label: {
                                    text: '80', // 刻度值
                                    align: 'right', // 刻度值的对齐方式
                                    x: -1, // 刻度值的水平偏移
                                    y: 3,
                                },
                            },
                            {
                                value: this.showJLine ? 115 : 100, // 100 的位置
                                color: '#e6e6e6', // 线的颜色
                                width: 1, // 线的宽度
                                zIndex: 1, // 线的层级
                                label: {
                                    text: '', // 刻度值
                                },
                            },
                        ],
                        // 調整 y 軸 tick的間距，運用到高度最大化，不浪費
                        // tickPositioner() {
                        //     const positions = [];
                        //     const tickCount = 4; // 刻度數量

                        //     const tickInterval = Math.ceil((tickMax - tickMin) / (tickCount - 1)); // 計算刻度間隔

                        //     for (let i = 0; i < tickCount; i++) {
                        //         let tickValue;

                        //         if (i === 1 || i === 2) {
                        //             tickValue = Math.round(tickMin + i * tickInterval); // 四捨五入到下一個個位數是0十位數是上述的值
                        //             tickValue = Math.ceil(tickValue / 10) * 10; // 取十位數
                        //         } else if (i === 3) {
                        //             tickValue = tickMax;
                        //         } else {
                        //             tickValue = tickMin + i * tickInterval;
                        //         }

                        //         positions.push(tickValue);
                        //     }
                        //     return positions;
                        // },
                    },
                ],
                series: [
                    {
                        name: 'K線',
                        color: '#4286f5',
                        data: this.kdj.map((item) => [item[0], item[1]]),
                    },
                    {
                        name: 'D線',
                        color: '#e75c9a',
                        data: this.kdj.map((item) => [item[0], item[2]]),
                    },
                    {
                        name: 'J線',
                        color: '#febd09',
                        data: this.kdj.map((item) => [item[0], item[3]]),
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
                        data: this.stockDataDividendToKdjList,
                    },
                ],
            };
        },
    },
    watch: {},
    methods: {},
};
</script>
