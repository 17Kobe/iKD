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
            v-if="stockData"
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
                    v-if="stockData.data && stockData.data.eps && stockData.data.eps.length > 0"
                    style="
                        position: absolute;
                        top: -63px;
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
                    <el-tooltip :trigger="popoverTrigger" raw-content placement="bottom-end">
                        <template #content>
                            <div style="white-space: pre; font-family: 'Lucida Console', monospace">
                                EPS: 每股盈餘，反映公司獲利能力。
                                <br />
                                <span style="display: block; border-top: 1px solid #ccc; margin: 4px 0"></span>
                                <!-- 標題列 -->
                                <div style="margin-left: 10px">
                                    &nbsp;&nbsp;&nbsp;日期&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;EPS&nbsp;&nbsp;累積EPS
                                    &nbsp;&nbsp;&nbsp;YOY(%)
                                </div>
                                <span style="display: block; border-top: 1px solid #ccc; margin: 4px 0"></span>
                                <span v-for="(item, index) in formattedEps.slice().reverse()" :key="index">
                                    <span style="margin-left: 10px">{{ item.date }}</span>
                                    <span style="margin-left: 23px"
                                        >{{ item.value < 10 ? ' ' : '' }}{{ item.value.toFixed(2) }}</span
                                    >
                                    <span
                                        v-if="item.acc"
                                        :style="{
                                            marginLeft: '23px',
                                            color: index === 0 ? 'rgb(255, 182, 193)' : 'inherit',
                                        }"
                                    >
                                        {{ item.acc < 10 ? ' ' : '' }}{{ item.acc }}
                                    </span>
                                    <!-- YOY 對齊處理，考慮負數與空值 -->
                                    <!-- YOY 顯示，只有在 YOY 有有效數據時顯示百分比 -->
                                    <span
                                        :style="{
                                            marginLeft: '10px',
                                            color:
                                                index === 0 && item.yoy && item.yoy !== null ? 'rgb(255, 202, 100)' : 'inherit',
                                        }"
                                    >
                                        {{
                                            item.yoy && item.yoy !== null
                                                ? item.yoy.startsWith('-')
                                                    ? item.yoy.padStart(7)
                                                    : (' ' + item.yoy).padStart(7)
                                                : '       '
                                        }}
                                    </span>

                                    <!-- 僅在 YOY 有有效數據時，顯示百分比符號 -->
                                    <span
                                        v-if="item.yoy && item.yoy !== null"
                                        :style="{
                                            marginLeft: '4px',
                                            color: index === 0 ? 'rgb(255, 202, 100)' : 'inherit',
                                        }"
                                        >%
                                    </span>
                                    <br />
                                    <span
                                        v-if="item.date.endsWith('03-31')"
                                        style="display: block; border-top: 1px solid #ccc; margin: 4px 0"
                                    ></span>
                                </span>
                            </div>
                        </template>
                        <div>
                            <span
                                :style="{
                                    color: 'rgb(34, 35, 38)',
                                    fontSize: '9px',
                                    marginRight: (() => {
                                        const eps = formattedEps.length > 0 ? formattedEps[formattedEps.length - 1].acc : 0;
                                        const base = eps < 10 ? 14 : 7;
                                        return base + (this.isMobile ? 1 : 0) + 'px';
                                    })(),
                                }"
                                >EPS</span
                            ><b>{{ formattedEps.length > 0 ? formattedEps[formattedEps.length - 1].acc : '' }}</b>
                        </div>
                    </el-tooltip>
                </span>
                <span
                    v-if="stockData.data && stockData.data.per && stockData.data.dy_per_pbr_date"
                    style="
                        position: absolute;
                        top: -42px;
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
                >
                    <el-tooltip :trigger="popoverTrigger" effect="dark" placement="bottom-end">
                        <template #content>
                            <div style="white-space: pre; font-family: 'Lucida Console', monospace">
                                PE: 本益比，評估股價相對於獲益及成長率是否合理。<br />
                                River Chart: 河流圖，顯示不同倍數本益比的股價範圍。
                                <br />
                                <span style="display: block; border-top: 1px solid #ccc; margin: 4px 0"></span>
                                &nbsp;<span style="color: #bbb">最新</span> 本益比:
                                <span style="color: rgb(255, 182, 193)"> {{ stockData.data.per.last.toFixed(2) }} </span>
                                <br />
                                <span v-for="(zone, index) in peZones" :key="index">
                                    &nbsp;近 4 季 EPS 估算 <span style="color: #bbb">{{ zone }} 倍</span> 本益比的股價:
                                    <span
                                        :style="{
                                        color: index === 2 ? 'rgb(255, 202, 100)' : 'rgb(176, 224, 230)',
                                        }"
                                    >
                                        {{ lastPERatios[index] }}
                                    </span>
                                    <br />
                                </span>
                                &nbsp;近 5 年 <span style="color: #bbb">中位數</span> 本益比:
                                <span style="color: rgb(255 202 100)">{{ stockData.data.per.median.toFixed(2) }}</span>
                                <br />
                                &nbsp;近 5 年 <span style="color: #bbb">平均</span> 本益比:
                                <span style="color: rgb(176, 224, 230)">{{ stockData.data.per.mean.toFixed(2) }}</span>
                                <br />
                                &nbsp;近 5 年 <span style="color: #bbb">最高</span> 本益比:
                                <span style="color: rgb(176, 224, 230)">{{ stockData.data.per.max.toFixed(2) }}</span>
                                <br />
                                &nbsp;近 5 年 <span style="color: #bbb">最低</span> 本益比:
                                <span style="color: rgb(255 202 100)">{{ stockData.data.per.min.toFixed(2) }}</span>
                                <br />
                                &nbsp;計算日期:
                                <span style="color: rgb(176, 224, 230)">{{ stockData.data.dy_per_pbr_date }}</span>
                                <LineChart :chart-data="combinedChartData" :options="peChartOptions" />
                            </div>
                        </template>
                        <div>
                            <span style="color: rgb(34, 35, 38); font-size: 9px; margin-right: 4px">本益比</span>
                            <b>{{ stockData.data.per.last.toFixed(1) }}</b>
                        </div>
                    </el-tooltip>
                </span>

                <span
                    v-if="stockData.data && stockData.data.pbr && stockData.data.dy_per_pbr_date"
                    style="
                        position: absolute;
                        top: -21px;
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
                >
                    <el-tooltip :trigger="popoverTrigger" effect="dark" placement="bottom-end">
                        <template #content>
                            <div style="white-space: pre; font-family: 'Lucida Console', monospace">
                                PB: 股價淨值比，評估公司股價相對於其資產價值的高低。
                                <br />
                                <span style="display: block; border-top: 1px solid #ccc; margin: 4px 0"></span>
                                &nbsp;<span style="color: #bbb">最新</span> 股價淨值比:
                                <span style="color: rgb(255, 182, 193)">{{ stockData.data.pbr.last.toFixed(2) }}</span>
                                <br />
                                &nbsp;近 5 年 <span style="color: #bbb">中位數</span> 股價淨值比:
                                <span style="color: rgb(255 202 100)">{{ stockData.data.pbr.median.toFixed(2) }}</span>
                                <br />
                                &nbsp;近 5 年 <span style="color: #bbb">平均</span> 股價淨值比:
                                <span style="color: rgb(176, 224, 230)">{{ stockData.data.pbr.mean.toFixed(2) }}</span>
                                <br />
                                &nbsp;近 5 年 <span style="color: #bbb">最高</span> 股價淨值比:
                                <span style="color: rgb(176, 224, 230)">{{ stockData.data.pbr.max.toFixed(2) }}</span>
                                <br />
                                &nbsp;近 5 年 <span style="color: #bbb">最低</span> 股價淨值比:
                                <span style="color: rgb(255 202 100)">{{ stockData.data.pbr.min.toFixed(2) }}</span>
                                <br />
                                &nbsp;計算日期:
                                <span style="color: rgb(176, 224, 230)">{{ stockData.data.dy_per_pbr_date }}</span>
                            </div>
                        </template>
                        <div>
                            <span style="color: rgb(34, 35, 38); font-size: 9px; margin-right: 10px">股淨比</span>
                            <b>{{ stockData.data.pbr.last.toFixed(1) }}</b>
                        </div>
                    </el-tooltip>
                </span>

                <span
                    v-if="stockData.data && stockData.data.pbr && stockData.data.dy_per_pbr_date"
                    style="
                        position: absolute;
                        top: 0px;
                        display: inline-block;
                        min-width: 64px;
                        background: rgb(235 246 255);
                        color: rgb(48 152 241);
                        padding: 0px 3px;
                        border-radius: 10px;
                        font-size: 12px;
                        opacity: 0.83;
                        line-height: 1.5;
                        text-align: left;
                        padding-left: 5px;
                    "
                >
                    <el-tooltip :trigger="popoverTrigger" effect="dark" placement="bottom-end">
                        <template #content>
                            <div style="white-space: pre; font-family: 'Lucida Console', monospace">
                                DY: 殖利率，該日的年化股息收益率。&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <br />
                                <span style="display: block; border-top: 1px solid #ccc; margin: 4px 0"></span>
                                &nbsp;<span style="color: #bbb">最新</span> 殖利率:
                                <span style="color: rgb(255, 182, 193)"
                                    >{{ stockData.data.dy.last.toFixed(2) }}<span style="margin-left: 2px">%</span></span
                                >
                                <br />
                                &nbsp;近 5 年 <span style="color: #bbb">中位數</span> 殖利率:
                                <span style="color: rgb(255 202 100)"
                                    >{{ stockData.data.dy.median.toFixed(2) }}<span style="margin-left: 2px">%</span></span
                                >
                                <br />
                                &nbsp;近 5 年 <span style="color: #bbb">平均</span> 殖利率:
                                <span style="color: rgb(176, 224, 230)"
                                    >{{ stockData.data.dy.mean.toFixed(2) }}<span style="margin-left: 2px">%</span></span
                                >
                                <br />
                                &nbsp;近 5 年 <span style="color: #bbb">最高</span> 殖利率:
                                <span style="color: rgb(255 202 100)"
                                    >{{ stockData.data.dy.max.toFixed(2) }}<span style="margin-left: 2px">%</span></span
                                >
                                <br />
                                &nbsp;近 5 年 <span style="color: #bbb">最低</span> 殖利率:
                                <span style="color: rgb(176, 224, 230)"
                                    >{{ stockData.data.dy.min.toFixed(2) }}<span style="margin-left: 2px">%</span></span
                                >
                                <br />
                                &nbsp;計算日期:
                                <span style="color: rgb(176, 224, 230)">{{ stockData.data.dy_per_pbr_date }}</span>
                                <BarChart :chartData="dyBarData" :options="dyBarOptions" />
                            </div>
                        </template>
                        <div>
                            <span style="color: rgb(34, 35, 38); font-size: 9px; margin-right: 2px">殖利率</span>
                            <b>{{ stockData.data.dy.last.toFixed(1) }}</b
                            ><span style="font-size: 9px; margin-left: 1px">%</span>
                        </div>
                    </el-tooltip>
                </span>
            </span>
        </div>

        <div
            v-if="kdj && kdj.length > 0"
            style="
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                position: absolute;
                top: 80px;
                left: 65px;
                padding: 0px 12px 0px 6px;
                width: 74%;
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
                    <el-tooltip :trigger="popoverTrigger" effect="dark" placement="bottom-end">
                        <template #content>
                            <div style="white-space: pre; font-family: 'Lucida Console', monospace">
                                {{
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
                                        : '無說明'
                                }}
                            </div>
                        </template>
                        <div>
                            {{ status }}
                        </div>
                    </el-tooltip>
                </span>
            </span>

            <span style="order: 2">
                <span style="color: #4286f5">K</span>: {{ kdj[kdj.length - 1][1].toFixed(2) }}
                <span style="color: #e75c9a">D</span>:
                {{ kdj[kdj.length - 1][2].toFixed(2) }}
                <span v-if="showJLine"><span style="color: #febd09">J</span>: {{ kdj[kdj.length - 1][3].toFixed(2) }}</span>
            </span>
        </div>

        <!-- :updateArgs="[true, true, true]" -->
    </div>
</template>

<script>
import { Chart } from 'highcharts-vue';
import moment from 'moment';
import _ from 'lodash';
import { Chart as ChartJS, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { LineChart, BarChart } from 'vue-chart-3';

ChartJS.register(...registerables);
// Register the plugin to all charts:
ChartJS.register(ChartDataLabels);

export default {
    components: { highcharts: Chart, LineChart, BarChart },
    props: ['parentData', 'showJLine'],
    data() {
        return {
            isMobile: true,

            popoverTrigger: 'hover', // 預設為 hover
            // chartOptions: {
            // },
            //

            peChartOptions: {
                responsive: true,
                plugins: {
                    background: {
                        color: '#ffffff',
                    },
                    tooltip: {
                        backgroundColor: '#ffffff',
                        titleColor: '#000000',
                        bodyColor: '#000000',
                    },
                    legend: { display: false },
                    datalabels: {
                        display: false,
                    },
                },
                layout: {
                    padding: 10,
                },
                animation: {
                    x: {
                        duration: 0 // 禁用 x 軸動畫
                    },
                    y: {
                        duration: 1000, // 動畫時間
                        easing: 'easeOutBounce' // 動畫效果，可自訂
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'year',
                            displayFormats: {
                                year: 'YYYY/MM', // 顯示格式為 YYYY/MM
                            },
                        },
                        ticks: {
                            color: '#ffffff', // 白色字體
                            callback: function (value, index, ticks) {
                                const tick = ticks[index];
                                if (!tick || !tick.value) return ''; // 確保 tick 和 tick.value 存在

                                // 使用 moment 將 tick.value 轉換為日期
                                const date = moment(tick.value);
                                if (!date.isValid()) return ''; // 確保日期有效

                                // 判斷是否為每年的 1 月
                                const year = date.format('YYYY');
                                const month = date.format('MM');
                                return month === '01' ? `${year}` : ''; // 只顯示每年的 1 月
                            },
                        },
                        grid: {
                            display: true, // 顯示格線
                            color: '#aaa', // 格線顏色為淡灰色
                        },
                    },
                    y: {
                        beginAtZero: false,
                        ticks: { color: '#fff' }, // Y 軸刻度白色
                        grid: { display: false }, // 不顯示 Y 軸格線
                        title: { display: false }, // 不顯示 Y 軸標題
                    },
                },
            },
        };
    },
    mounted() {
        this.isMobile =
            /Mobi|Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

        // 根據裝置類型設定觸發方式
        this.popoverTrigger = this.isMobile ? 'click' : 'hover';
    },
    methods: {
        calculatePEZones(max, min, median) {
            // 四捨五入平均
            let center = Math.round(median);

            // 根據範圍大小決定 step（可調整策略）
            let step = (max - min > 10) ? 5 : 1;

            // 從中心往左右擴展兩格，得到五個區間
            return [
            center - 2 * step,
            center - step,
            center,
            center + step,
            center + 2 * step
            ];
        }
    },
    computed: {
        peZones() {
            if (!this.stockData || !this.stockData.data || !this.stockData.data.per) return [];

            const max = this.stockData.data.per.max;
            const min = this.stockData.data.per.min;
            const median = this.stockData.data.per.median;

            // 使用 calculatePEZones 方法計算區間
            return this.calculatePEZones(max, min, median);
        },
        peChartData() {
            const daily = this.stockData.data.daily || [];

            if (!daily.length) return { labels: [], datasets: [] };

            const cutoff = moment().subtract(5, 'years'); // 五年前的日期

            // 建立 YYYY-MM => 最後日期的 close
            const monthlyMap = new Map();

            _.forEach(daily, (item) => {
                const dateStr = item[0];
                const close = item[4];
                const date = moment(dateStr, 'YYYY-MM-DD');

                if (!date.isValid() || date.isBefore(cutoff)) return;

                const ym = date.format('YYYY-MM');
                monthlyMap.set(ym, { date: dateStr, close }); // 覆蓋表示保留當月最後一筆
            });

            const sorted = _.sortBy(Array.from(monthlyMap.entries()), ([ym]) => ym);

            const monthlyLabels = _.map(sorted, ([, { date }]) => date);
            const monthlyCloses = _.map(sorted, ([, { close }]) => close);

            return {
                labels: monthlyLabels,
                datasets: [
                    {
                        label: '月收盤價',
                        data: monthlyCloses,
                        borderColor: 'rgba(255, 255, 255, 1)', // 純白線條
                        backgroundColor: 'rgba(255, 255, 255, 0.08)', // 非常淡的底色，避免干擾
                        fill: false,
                        pointRadius: 0,
                        borderWidth: 2,
                        tension: 0.3,
                    },
                ],
            };
        },
        peRiverChartData() {
            const labels = this.peChartData.labels; // 使用 peChartData 的 X 軸日期
            const datasets = []; // 用於存放每個倍數的數據

            // 初始化 datasets
            const colorMap = [
            { borderColor: 'rgba(0, 128, 255, 1)', backgroundColor: 'rgba(0, 128, 255, 0.4)' },
            { borderColor: 'rgba(0, 255, 191, 1)', backgroundColor: 'rgba(0, 255, 191, 0.4)' },
            { borderColor: 'rgba(255, 255, 0, 1)', backgroundColor: 'rgba(255, 255, 0, 0.4)' },
            { borderColor: 'rgba(255, 100, 0, 1)', backgroundColor: 'rgba(255, 100, 0, 0.4)' },
            { borderColor: 'rgba(255, 0, 80, 1)', backgroundColor: 'rgba(255, 0, 80, 0.4)' },
            ];

            // 使用動態計算的 peZones
            this.peZones.forEach((multiple, index) => {
            datasets.push({
                label: `${multiple} 倍本益比`,
                data: [],
                borderColor: colorMap[index].borderColor,
                backgroundColor: colorMap[index].backgroundColor,
                fill: true,
                pointRadius: 0,
                borderWidth: 1,
                tension: 0.3,
            });
            });

            // 遍歷每個日期，計算當時的本益比範圍
            labels.forEach((label) => {
            const currentDate = moment(label, 'YYYY-MM-DD');

            // 找到當前日期及之前的近四季 EPS
            const recentFourQuarters = this.formattedEps
                .filter((eps) => moment(eps.date, 'YYYY-MM-DD').isSameOrBefore(currentDate))
                .slice(-4);

            // 如果不足四季，跳過
            if (recentFourQuarters.length < 4) {
                this.peZones.forEach((_, index) => {
                datasets[index].data.push(null); // 填充空值
                });
                return;
            }

            // 計算近四季 EPS 總和
            const recentEpsSum = recentFourQuarters.reduce((sum, item) => sum + item.value, 0);

            // 計算本益比範圍，並填充到對應的 dataset
            this.peZones.forEach((multiple, index) => {
                datasets[index].data.push((recentEpsSum * multiple).toFixed(2));
            });
            });

            return {
            labels,
            datasets,
            };
        },
        combinedChartData() {
            // 獲取原始的 peChartData 和 peRiverChartData
            const peChartData = this.peChartData;
            const peRiverChartData = this.peRiverChartData;

            // 合併 datasets
            const combinedDatasets = [
                ...peChartData.datasets, // 原始的月收盤價數據
                ...peRiverChartData.datasets, // 河流圖數據
            ];

            return {
                labels: peChartData.labels, // 使用相同的 X 軸標籤
                datasets: combinedDatasets,
            };
        },
        lastPERatios() {
            if (!this.peRiverChartData || !this.peRiverChartData.datasets) return [];

            return this.peRiverChartData.datasets.map((dataset) => {
                const data = dataset.data;
                return data.length > 0 ? data[data.length - 1] : null;
            });
        },

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

        yearlyDividends() {
            if (!this.stockData.data || !this.stockData.data.dividend || this.stockData.data.dividend.length === 0) {
                return [];
            }

            // 整理每年的現金股利、股票股利及殖利率
            const yearlyData = this.stockData.data.dividend.reduce((acc, curr) => {
                const year = curr.date.split("-")[0];
                if (!acc[year]) {
                    acc[year] = {
                        cashDividend: 0,
                        stockDividend: 0,
                        totalDividend: 0,
                        cashYield: 0,
                        stockYield: 0,
                        totalYield: 0,
                    };
                }

                acc[year].cashDividend += curr.CashEarningsDistribution || 0;
                acc[year].stockDividend += curr.StockEarningsDistribution || 0;
                acc[year].totalDividend += (curr.CashEarningsDistribution || 0) + (curr.StockEarningsDistribution || 0);
                
                // 只有當 CashEarningsDistribution > 0 時，才加上 dividendYield
                acc[year].cashYield += curr.CashEarningsDistribution > 0 ? curr.dividendYield : 0;
                acc[year].stockYield += curr.StockEarningsDistribution > 0 ? curr.dividendYield : 0;

                acc[year].totalYield = acc[year].cashYield + acc[year].stockYield;

                return acc;
            }, {});

            // 格式化輸出
            return Object.entries(yearlyData).map(([year, data]) => ({
                year,
                cashDividend: data.cashDividend.toFixed(2),
                stockDividend: data.stockDividend.toFixed(2),
                totalDividend: data.totalDividend.toFixed(2),
                cashYield: data.cashYield.toFixed(2),
                stockYield: data.stockYield.toFixed(2),
                totalYield: data.totalYield.toFixed(2),
            }));
        },
        dyBarData() {
            // 取得近 6 年的資料
            const currentYear = new Date().getFullYear();
            const filteredDividends = this.yearlyDividends.filter(
                (item) => parseInt(item.year) >= currentYear - 5
            );

            const labels = filteredDividends.map((item) => item.year);
            const cashYieldData = filteredDividends.map((item) =>
                isFinite(item.cashYield) && item.cashYield > 0 ? parseFloat(item.cashYield) : null
            );
            const stockYieldData = filteredDividends.map((item) =>
                isFinite(item.stockYield) && item.stockYield > 0 ? parseFloat(item.stockYield) : null
            );

            return {
                labels,
                datasets: [
                    {
                        label: '現金殖利率 (%)',
                        data: cashYieldData,
                        backgroundColor: 'rgba(75, 192, 192, 0.8)', // 現金殖利率顏色
                    },
                    {
                        label: '股票殖利率 (%)',
                        data: stockYieldData,
                        backgroundColor: 'rgba(255, 159, 64, 0.8)', // 股票殖利率顏色
                    },
                ],
            };
        },

        dyBarOptions() {
            return {
                responsive: true,
                plugins: {
                    legend: {
                        display: false, // 移除圖例
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `${context.dataset.label}: ${context.raw.toFixed(2)}%`;
                            },
                        },
                    },
                    datalabels: {
                        display: function (context) {
                            // 如果值為 0，則不顯示標籤
                            return context.raw !== 0;
                        },
                        color: '#ffffff', // 標籤文字顏色
                        font: {
                            size: 10, // 標籤文字大小
                        },
                        formatter: function (value) {
                            // 確保 value 是有效數字，否則返回空字串
                            if (value === null || value === undefined || isNaN(value)) {
                                return '';
                            }
                            // 格式化數值，加上 %
                            return `${value.toFixed(2)} %`;
                        },
                    },
                },
                animation: {
                    x: {
                        duration: 0, // 禁用 X 軸動畫
                    },
                    y: {
                        from: 0, // 動畫從 0 開始
                        duration: 1000, // 動畫時間
                        easing: 'easeOutBounce', // 動畫效果，可自訂
                    },
                },
                scales: {
                    x: {
                        stacked: true,
                        title: {
                            display: false, // 移除 "年份" 標題字
                        },
                        ticks: {
                            color: '#ffffff', // 設定 X 軸刻度值為白色字
                        },
                    },
                    y: {
                        stacked: true,
                        title: {
                            display: true,
                            text: '殖利率 (%)',
                            color: '#ffffff', // 設定 Y 軸標題為白色
                        },
                        ticks: {
                            color: '#ffffff', // 設定 Y 軸刻度值為白色字
                            callback: function (value) {
                                return `${value}%`;
                            },
                        },
                    },
                },
            };
        },

        stockData() {
            console.log('stockData');
            // 一開始時this.parentData會是null，所以要給[]來避免出錯
            return this.$store.getters.getStock(this.parentData);
        },
        formattedEps() {
            if (!this.stockData || !this.stockData.data || !this.stockData.data.eps) return [];

            const epsList = this.stockData.data.eps;
            const groupedByYear = _.groupBy(epsList, (item) => item.date.split('-')[0]);

            const result = [];

            for (const [year, data] of Object.entries(groupedByYear)) {
                let acc = 0;
                let cumValues = []; // 用於累積 Q1、Q1+Q2... 計算用

                const sortedData = _.sortBy(data, 'date'); // 確保順序 3→6→9→12

                for (let i = 0; i < sortedData.length; i++) {
                    const entry = { ...sortedData[i] };
                    acc += entry.value;
                    cumValues.push(entry.value);

                    const date = entry.date;
                    const month = date.split('-')[1];

                    // 判斷是否為 3、6、9、12月
                    if (['03', '06', '09', '12'].includes(month)) {
                        let yoy = null;

                        const lastYear = (parseInt(year) - 1).toString();
                        const lastYearData = groupedByYear[lastYear];

                        if (lastYearData) {
                            const lastSorted = _.sortBy(lastYearData, 'date');
                            const prevCum = _.take(lastSorted, i + 1).reduce((sum, item) => sum + item.value, 0);

                            // 計算 YOY
                            if (prevCum !== 0) {
                                const thisCum = _.sum(cumValues);
                                yoy = (((thisCum - prevCum) / prevCum) * 100).toFixed(2);
                            }
                        }

                        entry.acc = acc.toFixed(2);
                        entry.yoy = yoy;
                    } else {
                        entry.acc = null;
                        entry.yoy = null;
                    }

                    result.push(entry);
                }
            }

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
};
</script>
