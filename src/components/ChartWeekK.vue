<template>
    <div style="position: relative">
        <!-- {{ parentData.at(-1).close }} -->
        <highcharts
            :constructorType="'stockChart'"
            :options="chartOptions"
            style="position: relative; top: 5px; background: transparent"
            ref="chartRef"
        >
        </highcharts>
        <div
            v-if="ohlc && ohlc.length > 0"
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
                    v-for="(status, index) in stockData.k_status"
                    :key="index"
                    :style="{
                        position: 'absolute',
                        top: -index * 22 + 'px',
                        left: '0',
                        display: 'inline-block',
                        minWidth: status.includes('停利')
                            ? '68px'
                            : ['強多頭信號', '強空頭信號'].includes(status)
                            ? '71px'
                            : ['多頭信號', '空頭信號'].includes(status)
                            ? '60px'
                            : 'auto',
                        whiteSpace: status.includes('停利') ? 'normal' : 'nowrap',
                        backgroundColor:
                            status.includes('停利') || ['空頭', '強勢空頭', '空頭信號', '強空頭信號'].includes(status)
                                ? 'rgb(103, 194, 58)'
                                : 'rgb(242, 139, 130)',
                        color: 'white',
                        padding: '0px 5px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        opacity: '0.90',
                        lineHeight: '1.5',
                    }"
                    :class="[
                        (status.includes('停利') && stockData.last_price < parseFloat(status.split(' ')[1])) ||
                        ['多頭信號', '強多頭信號', '空頭信號', '強空頭信號'].includes(status)
                            ? 'shake-base'
                            : '',
                        'cell-chart',
                    ]"
                >
                    <el-tooltip :trigger="popoverTrigger" effect="dark" placement="bottom-end">
                        <template #content>
                            {{
                                status === '多頭'
                                    ? '股價在MA5、MA10、MA20之上視為多頭'
                                    : status === '空頭'
                                    ? '股價在MA5、MA10、MA20之下視為空頭'
                                    : status === '強勢多頭'
                                    ? '除了股價在MA5、MA10、MA20之上，且MA5在MA10和MA20之上，而MA10也在MA20之上視為強勢多頭'
                                    : status === '強勢空頭'
                                    ? '除了股價在MA5、MA10、MA20之下，且MA5在MA10和MA20之下，而MA10也在MA20之下視為強勢空頭'
                                    : status === '多頭信號'
                                    ? 'MA5上穿MA10視為多頭信號'
                                    : status === '空頭信號'
                                    ? 'MA5下穿MA10視為空頭信號'
                                    : status === '強多頭信號'
                                    ? 'MA10上穿MA20視為強多頭信號'
                                    : status === '強空頭信號'
                                    ? 'MA10下穿MA20視為強空頭信號'
                                    : status.includes('停利')
                                    ? '當KD高檔鈍化後，使用箱子戰法計算近3根且為紅燭的最高開盤價為停利價'
                                    : ''
                            }}
                        </template>
                        <div>{{ status }}</div>
                    </el-tooltip>
                </span>
            </span>
            <span style="order: 2">
                <span v-if="stockData.last_price"
                    ><span style="color: #000000" title="股價">&nbsp;{{ stockData.last_price }}</span></span
                >
                <span v-if="cost && cost.length > 0">
                    <span
                        title="平均成本線"
                        :style="[
                            stockData.last_price > cost[cost.length - 1][1]
                                ? { 'background-color': '#ededed', 'text-decoration': 'underline' }
                                : { 'background-color': 'none' },
                            { color: '#4286f5', 'margin-left': '4px' },
                        ]"
                        >{{
                            cost[cost.length - 1][1] >= 1000
                                ? Number(cost[cost.length - 1][1].toFixed(0))
                                : cost[cost.length - 1][1] >= 100
                                ? Number(cost[cost.length - 1][1].toFixed(1))
                                : Number(cost[cost.length - 1][1].toFixed(2))
                        }}</span
                    ></span
                >
                <span v-if="ma && ma.length > 0">
                    <span
                        title="MA(5)"
                        v-if="ma[ma.length - 1][1]"
                        :style="[
                            stockData.last_price > ma[ma.length - 1][1]
                                ? { 'background-color': '#ededed', 'text-decoration': 'underline' }
                                : { 'background-color': 'none' },
                            { color: '#834beb', 'margin-left': '4px' },
                        ]"
                        >{{
                            ma[ma.length - 1][1] >= 1000
                                ? Number(ma[ma.length - 1][1].toFixed(0))
                                : ma[ma.length - 1][1] >= 100
                                ? Number(ma[ma.length - 1][1].toFixed(1))
                                : Number(ma[ma.length - 1][1].toFixed(2))
                        }}</span
                    >
                    <span
                        title="MA(10)"
                        v-if="ma[ma.length - 1][2]"
                        :style="[
                            stockData.last_price > ma[ma.length - 1][2]
                                ? { 'background-color': '#ededed', 'text-decoration': 'underline' }
                                : { 'background-color': 'none' },
                            { color: '#febd09', 'margin-left': '4px' },
                        ]"
                        >{{
                            ma[ma.length - 1][1] >= 1000
                                ? Number(ma[ma.length - 1][2].toFixed(0))
                                : ma[ma.length - 1][2] >= 100
                                ? Number(ma[ma.length - 1][2].toFixed(1))
                                : Number(ma[ma.length - 1][2].toFixed(2))
                        }}</span
                    >
                    <span
                        title="MA(20)"
                        v-if="ma[ma.length - 1][3]"
                        :style="[
                            stockData.last_price > ma[ma.length - 1][3]
                                ? { 'background-color': '#ededed', 'text-decoration': 'underline' }
                                : { 'background-color': 'none' },
                            { color: '#fc7742', 'margin-left': '4px' },
                        ]"
                        >{{
                            ma[ma.length - 1][3] >= 1000
                                ? Number(ma[ma.length - 1][3].toFixed(0))
                                : ma[ma.length - 1][3] >= 100
                                ? Number(ma[ma.length - 1][3].toFixed(1))
                                : Number(ma[ma.length - 1][3].toFixed(2))
                        }}</span
                    ></span
                >
            </span>
        </div>
        <el-button
            type="info"
            class="custom-button"
            :plain="!stockData.show_trading_volume"
            size="mini"
            style="position: absolute; left: 17px; top: 6px; padding: 0px 8px"
            v-if="['exchange', 'fund', 'usStock'].indexOf(stockData.type) === -1"
            @click="toggleTradingVolume"
            >量</el-button
        >
        <!-- :updateArgs="[true, true, true]" -->
        <highcharts
            :options="columnChartOptions"
            style="position: relative; top: -2px; background: transparent"
            v-if="stockData.show_trading_volume"
        ></highcharts>
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
            popoverTrigger: 'hover', // 預設為 hover
            // showTradingVolume: false,
        };
    },
    mounted() {
        // 根據裝置類型設定觸發方式
        this.popoverTrigger = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            ? 'click'
            : 'hover';
    },
    computed: {
        stockData() {
            console.log('stockData');
            // 一開始時this.parentData會是null，所以要給[]來避免出錯
            return this.$store.getters.getStock(this.parentData);
        },
        ohlc() {
            console.log('ohlc');
            return this.$store.getters.getStockDataWeekly(this.parentData);
        },
        // tradingVolume() {
        //     console.log('tradingVolume');
        //     return this.$store.getters.getStockDataWeeklyTradingVolume(this.parentData);
        // },
        ma() {
            console.log('ma');
            return this.$store.getters.getStockDataWeeklyMa(this.parentData);
        },
        cost() {
            console.log('cost');
            return this.$store.getters.getStockDataWeeklyCost(this.parentData);
        },
        // ma_buy() {
        //     console.log('ma_buy');
        //     return this.$store.getters.getStockDataWeeklyMaBuy(this.parentData);
        // },
        // ma_sell() {
        //     console.log('ma_sell');
        //     return this.$store.getters.getStockDataWeeklyMaSell(this.parentData);
        // },
        // ma_policy() {
        //     console.log('ma_policy');
        //     return this.$store.getters.getStockPolicyMa(this.parentData);
        // },
        chartMinMaxValues() {
            // 用 minValue及 maxValue 來判斷，若maxValue<100，則用小數2位數。minValue>=100則用小數0位數
            const ohlcHighValues = this.ohlc.map((value) => value[2]);
            const ohlcLowValues = this.ohlc.map((value) => value[3]);
            const maValues = this.ma.map((value) => value.slice(1));
            const costValues = this.cost.map((value) => value[1]);

            const allHighValues = [...ohlcHighValues, ...maValues.flat(), ...costValues];
            const allLowValues = [...ohlcLowValues, ...maValues.flat(), ...costValues];
            const minValue = Math.min(...allLowValues);
            const maxValue = Math.max(...allHighValues);

            let tickMin;
            let tickMax;

            if (maxValue < 100) {
                tickMin = Math.floor(minValue * 100) / 100;
                tickMax = Math.ceil(maxValue * 100) / 100;
            } else if (minValue >= 100) {
                tickMin = Math.floor(minValue);
                tickMax = Math.ceil(maxValue);
            } else {
                const decimalPlaces = 2;
                const multiplier = Math.pow(10, decimalPlaces);
                tickMin = Math.floor(minValue * multiplier) / multiplier;
                tickMax = Math.ceil(maxValue * multiplier) / multiplier;
            }

            return { tickMin, tickMax };
        },
        chartOptions() {
            const component = this;
            const { tickMin, tickMax } = this.chartMinMaxValues;
            return {
                chart: {
                    backgroundColor: 'rgba(0,0,0,0)', // 讓 highcharts的背景變透明後，滑鼠移到chart上時，不會看出它有白的只有下方，上方那個沒有
                    zoomType: 'none',
                    pinchType: 'none',
                    marginLeft: 8, // 調整左邊邊界的空白
                    marginRight: 2, // 調整右邊邊界的空白
                    marginBottom: 27,
                    marginTop: 1,
                    panning: false,
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
                        pointWidth: 4, // 設定每個紅黑棒的寬度，以像素為單位
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
                                // console.log(component);
                                // const color = index === 1 ? '#834beb' : '#e6a23c';
                                // const limit = index === 1 ? component.ma_policy.ma_buy_limit : component.ma_policy.ma_sell_limit;
                                // str += `<span><span style="color: ${color}">MA(${limit})</span>: ${point.y.toFixed(2)}
                                // </span>`;
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
                    plotLines: [
                        {
                            color: '#e6e6e6', // 線的顏色
                            width: 1, // 線的寬度
                            value: this.ohlc && this.ohlc.length >= 5 ? moment(_.nth(this.ohlc, -5)[0]).valueOf() : null, // ma5扣抵值，垂直線的位置（倒數第五個 x 值的位置）
                            zIndex: 1, // 線的疊放順序，可自行調整
                        },
                        {
                            color: '#e6e6e6', // 線的顏色
                            width: 1, // 線的寬度
                            value: this.ohlc && this.ohlc.length >= 10 ? moment(_.nth(this.ohlc, -10)[0]).valueOf() : null, // ma10扣抵值，垂直線的位置（倒數第五個 x 值的位置）
                            zIndex: 1, // 線的疊放順序，可自行調整
                        },
                        {
                            color: '#e6e6e6', // 線的顏色
                            width: 1, // 線的寬度
                            value: this.ohlc && this.ohlc.length >= 20 ? moment(_.nth(this.ohlc, -20)[0]).valueOf() : null, // ma20扣抵值，垂直線的位置（倒數第五個 x 值的位置）
                            zIndex: 1, // 線的疊放順序，可自行調整
                        },
                    ],
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
                            // console.log('觀察 tickMax = ', tickMax);
                            // console.log('觀察 tickMax = ',tickMin);

                            const positions = [];
                            const tickCount = 4; // 刻度數量
                            const tickInterval = (tickMax - tickMin) / (tickCount - 1); // 計算刻度間隔

                            // 取得最大的小數位數
                            const decimalPlaces = Math.max(
                                tickMax.toString().split('.')[1]?.length || 0,
                                tickMin.toString().split('.')[1]?.length || 0
                            );

                            for (let i = 0; i < tickCount; i++) {
                                let tickValue;
                                if (i === 3) {
                                    tickValue = tickMax;
                                } else {
                                    tickValue = tickMin + i * tickInterval;
                                }

                                tickValue = Number(tickValue.toFixed(decimalPlaces)); // 將刻度值限制小數位數
                                positions.push(tickValue);
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
                        name: 'MA5線',
                        color: '#834beb',
                        lineWidth: 1,
                        data: this.ma.map((item) => [item[0], item[1]]),
                        dataGrouping: {
                            // anchor: 'end',
                            // firstAnchor: 'end',
                            lastAnchor: 'lastPoint',
                            units: [['day', [1]]],
                        },
                    },
                    {
                        type: 'line',
                        name: 'MA10線',
                        color: '#febd09',
                        lineWidth: 1,
                        data: this.ma.map((item) => [item[0], item[2]]),
                        dataGrouping: {
                            // anchor: 'end',
                            // firstAnchor: 'end',
                            lastAnchor: 'lastPoint',
                            units: [['day', [1]]],
                        },
                    },
                    {
                        type: 'line',
                        name: 'MA20線',
                        color: '#fc7742',
                        lineWidth: 1,
                        data: this.ma.map((item) => [item[0], item[3]]),
                        dataGrouping: {
                            // anchor: 'end',
                            // firstAnchor: 'end',
                            lastAnchor: 'lastPoint',
                            units: [['day', [1]]],
                        },
                    },
                    {
                        type: 'area',
                        name: '成本線',
                        lineColor: 'transparent', // 設定線條顏色為透明
                        fillColor: 'rgba(54, 162, 235, 0.2)', // 設定填滿顏色
                        data: this.cost,
                        // dashStyle: 'ShortDash',
                        step: 'right',
                        threshold: null, // 設置為 null，使 Y 軸動態範圍與其他圖表類型相同。否則會從0開始
                        dataGrouping: {
                            // anchor: 'end',
                            // firstAnchor: 'end',
                            // lastAnchor: 'lastPoint',
                            lastAnchor: 'lastPoint',
                            units: [['day', [1]]],
                        },
                    },
                    // {
                    //     type: 'line',
                    //     name: 'MA Buy線',
                    //     color: '#834beb',
                    //     data: this.ma_buy,
                    //     dataGrouping: {
                    //         // anchor: 'end',
                    //         // firstAnchor: 'end',
                    //         lastAnchor: 'lastPoint',
                    //         units: [['day', [1]]],
                    //     },
                    // },
                    // {
                    //     type: 'line',
                    //     name: 'MA Sell線',
                    //     color: '#e6a23c',
                    //     data: this.ma_sell,
                    //     dataGrouping: {
                    //         // anchor: 'end',
                    //         // firstAnchor: 'end',
                    //         lastAnchor: 'lastPoint',
                    //         units: [['day', [1]]],
                    //     },
                    // },
                ],
            };
        },
        columnChartOptions() {
            return {
                chart: {
                    type: 'column',
                    height: 55, // 設置圖表高度為100px
                    backgroundColor: 'rgba(0,0,0,0)', // 讓 highcharts的背景變透明後，滑鼠移到chart上時，不會看出它有白的只有下方，上方那個沒有
                    zoomType: 'none',
                    pinchType: 'none',
                    panning: false,
                    marginLeft: 8, // 調整左邊邊界的空白
                    marginRight: 2, // 調整右邊邊界的空白
                    marginTop: 0, // 調整圖表上邊距
                    marginBottom: 0, // 調整圖表下邊距
                },
                title: {
                    text: '',
                },
                legend: {
                    // 該線是什麼線的說明，原本顯示在最下方，現在把它隱藏
                    enabled: false,
                },
                xAxis: {
                    type: 'datetime',
                    labels: {
                        enabled: false, // 不顯示 x 軸的 Label
                    },
                },
                yAxis: {
                    title: {
                        text: '',
                    },
                    labels: {
                        enabled: false, // 沒有顯示 Y 軸標纖
                    },
                    gridLineWidth: 0, // 隱藏 Y 軸橫向灰線
                },
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
                                str += `<div style="text-align:center;">${moment(point.point.z).format(
                                    'YYYY-MM-DD'
                                )}(<span style="color: #3333ee; font-weight:bold;">${
                                    dayOfWeek[moment(point.point.z).day()]
                                }</span>)</div>`;
                                str += `<div>成交量：<span style="color: ${point.color}">${point.y.toLocaleString(
                                    'en-US'
                                )}</span></div>`;
                            }
                        });
                        str += '</div>';
                        return str;
                    },
                },
                plotOptions: {
                    column: {
                        pointWidth: 8, // 調整每個直方圖的寬度
                    },
                },
                series: [
                    {
                        name: '成交量',
                        data: this.ohlc.map((item) => {
                            const color = item[4] >= item[1] ? '#d41c1c' : '#65b206';
                            return {
                                z: item[0], // x: [0]可以不用，這樣會常紅燭對齊，但tooltip要顯示日期，就用 point.z
                                y: item[5], // 長條圖的高度
                                color: color, // 根據條件設置顏色
                            };
                        }),
                    },
                ],
            };
        },
    },
    created() {},
    watch: {
        chartMinMaxValues: {
            handler() {
                // chartMinMaxValues 发生变化时执行重新渲染图表的操作
                // 这里可以添加调用重新渲染图表的代码，例如 chart.repaint() 或其他更新图表的方法
                // 如果需要 chart 实例，请根据您的项目中如何获取 chart 实例来调用相应方法
                // 如果使用的是 Highcharts-Vue 插件，通常可以通过 this.$refs.chart 来获取 chart 实例
                // 例如：this.$refs.chart.redraw();
                // console.log('chartOptions 變化了');

                // 调用重新渲染图表的方法，具体方法根据您的项目和图表库来定
                // 以下是一个示例，具体方法名请根据实际情况修改
                // 使用 $refs.chartRef 访问组件引用
                const chartComponent = this.$refs.chartRef;
                // console.log(chartComponent);

                // 检查组件是否存在
                if (chartComponent) {
                    // 获取 Highcharts 图表实例
                    const chartInstance = chartComponent.chart;
                    console.log('chartComponent');

                    const { tickMin, tickMax } = this.chartMinMaxValues;

                    const positions = [];
                    const tickCount = 4; // 刻度數量
                    const tickInterval = (tickMax - tickMin) / (tickCount - 1); // 計算刻度間隔

                    // 取得最大的小數位數
                    const decimalPlaces = Math.max(
                        tickMax.toString().split('.')[1]?.length || 0,
                        tickMin.toString().split('.')[1]?.length || 0
                    );

                    for (let i = 0; i < tickCount; i++) {
                        let tickValue;
                        if (i === 3) {
                            tickValue = tickMax;
                        } else {
                            tickValue = tickMin + i * tickInterval;
                        }

                        tickValue = Number(tickValue.toFixed(decimalPlaces)); // 將刻度值限制小數位數
                        positions.push(tickValue);
                    }

                    // console.log(positions);
                    // console.log(tickMax);
                    // 调用图表的重新渲染方法
                    // const tickMiddle = Number(((tickMin + tickMax) / 2).toFixed(decimalPlaces));

                    chartInstance.update({
                        yAxis: [
                            {
                                tickPositions: positions, // 更新 y 轴的刻度值
                                // tickPositions: [tickMin, tickMiddle, tickMax], // 更新 y 轴的刻度值
                            },
                        ],
                    });
                }
            },
            deep: true, // 深度监听 chartMinMaxValues 及其子属性的变化
        },
    },
    methods: {
        toggleTradingVolume() {
            this.$store.commit('SAVE_SHOW_TRADING_VOLUME', { stockId: this.parentData });
            // this.showTradingVolume = !this.showTradingVolume;
        },
    },
};
</script>
