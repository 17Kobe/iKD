<template>
    <div>
        <el-row class="row-bg" justify="space-between" style="align-items: center; max-width: 1024px">
            <el-col :span="10" style="margin-left: 6px; font-size: 18px"
                ><span style="font-weight: bold">價差&nbsp;&nbsp;</span>
                <el-radio-group v-model="modeSpread" size="small" fill="#dedede" text-color="#373737">
                    <el-radio-button label="目前" />
                    <el-radio-button label="歷史" />
                </el-radio-group>

                <el-link
                    href="#"
                    style="margin-left: 3px; text-decoration: underline; color: #409eff"
                    @click="toggleShowSpreadData"
                    v-if="spreadList.length > 5"
                >
                    <span v-if="modeSpread === '歷史' && show5HistorySpreadData">更多</span>
                    <span v-else-if="modeSpread === '歷史'">5筆</span></el-link
                >
            </el-col>
            <el-col :span="13" style="margin-right: 4px">
                <el-tooltip effect="dark" placement="bottom" popper-class="tooltip-pre-line">
                    <template #content>
                        <div>
                            累計本金：<span style="color: rgb(176, 224, 230)">
                                $ {{ totalBuySpend.toLocaleString('en-US') }} </span
                            ><br />
                            目前市值：<span style="color: rgb(255 202 100)">
                                $ {{ totalMarketValue.toLocaleString('en-US') }}
                            </span>
                        </div>
                    </template>

                    <el-tag
                        class="ml-2"
                        size="large"
                        style="margin: 5px 2px; padding: 0 4px; float: right"
                        :type="totalSpread >= 0 ? 'primary' : 'danger'"
                    >
                        總計
                        <span style="font-size: 24px"> $ </span>
                        <span style="font-size: 28px; font-weight: bold">
                            <number
                                :from="0"
                                :to="totalSpread"
                                :format="currencyFormat"
                                :duration="1"
                                :delay="0"
                                easing="Power1.easeOut"
                                ref="totalSpread"
                            /> </span
                        >&nbsp;元
                    </el-tag>
                </el-tooltip>

                <el-tag
                    size="small"
                    style="float: right; position: relative; left: 7px; top: 2px; padding: 0 2px; border-radius: 10px"
                    :type="totalRateOfReturn >= 0 ? 'primary' : 'danger '"
                >
                    <!-- <span style="font-size: 14px"
                        ><i
                            :class="[
                                totalRateOfReturn < 0 ? 'el-icon-caret-bottom' : totalRateOfReturn > 0 ? 'el-icon-caret-top' : '',
                            ]"
                            :style="[
                                totalRateOfReturn > 0
                                    ? { position: 'relative', top: '2px' }
                                    : { position: 'relative', top: '1px' },
                            ]"
                        ></i
                    ></span> -->
                    <span style="font-size: 14px; font-weight: bold">
                        <!-- <number :from="0" :to="totalSpread" :format="currencyFormat" :duration="1" :delay="0" easing="Power1.easeOut" /> -->
                        <number
                            :from="0"
                            :to="totalRateOfReturn"
                            :format="currencyPointFormat"
                            :duration="1"
                            :delay="0"
                            easing="Power1.easeOut"
                            ref="totalRateOfReturn"
                        /> </span
                    >&nbsp;%
                </el-tag>
            </el-col>
        </el-row>

        <el-table
            :data="showSpreadList"
            id="tableSpreadList"
            style="width: 100%"
            empty-text="無資料"
            :row-class-name="tableRowClassName"
        >
            <el-table-column label="名稱" width="107" align="center" fixed>
                <template #default="scope">
                    <el-tooltip
                        class="box-item"
                        effect="dark"
                        :content="`${scope.row.name} ${getBadgeTitle(scope.row.badge_reason)}`"
                        placement="top"
                        v-if="modeSpread === '目前'"
                    >
                        <el-badge
                            :value="scope.row.badge"
                            :class="[
                                ['買', '買x2', '賣', '賣½', '賣⅓', '賣¼', '賣⅕', '賣⅙', '賣⅐'].includes(scope.row.badge)
                                    ? 'shake-base'
                                    : '',
                                ['買', '買x2', '準買', '準買x2'].includes(scope.row.badge) ? 'buy' : '',
                                ['賣', '賣½', '賣⅓', '準賣', '準賣½', '準賣⅓', '準賣¼', '準賣⅕', '準賣⅙', '準賣⅐'].includes(
                                    scope.row.badge
                                )
                                    ? 'sell'
                                    : '',
                                [
                                    '取消買',
                                    '取消買x2',
                                    '取消賣',
                                    '取消賣½',
                                    '取消賣⅓',
                                    '取消賣¼',
                                    '取消賣⅕',
                                    '取消賣⅙',
                                    '取消賣⅐',
                                ].includes(scope.row.badge)
                                    ? 'cancel'
                                    : '',
                                scope.row.name.length >= 6
                                    ? 'l6'
                                    : scope.row.name.length >= 5
                                    ? 'l5'
                                    : scope.row.name.length >= 4
                                    ? 'l4'
                                    : '',
                                ['item', 'signal'],
                            ]"
                            :type="
                                ['買', '買x2', '準買', '準買x2'].includes(scope.row.badge)
                                    ? 'danger'
                                    : ['取消買', '取消買x2', '取消賣', '取消賣½'].includes(scope.row.badge)
                                    ? 'info'
                                    : 'success'
                            "
                        >
                            <span
                                :style="{
                                    cursor: 'pointer',
                                    'font-weight': 'bold',
                                    color:
                                        scope.row.type === 'btc'
                                            ? '#f3c60d'
                                            : scope.row.type === 'fund'
                                            ? '#e6a23c'
                                            : scope.row.type === 'usStock'
                                            ? '#919191'
                                            : scope.row.type === 'exchange'
                                            ? '#f56c6c'
                                            : '#409eff',
                                }"
                                @click="goToStockAnalysis(scope.row.id, scope.row.url)"
                                >{{
                                    scope.row.name
                                        .replace(/(基金|A2|投資級)/g, '')
                                        .replace('群益台灣精選高息', '群益精選高息')
                                        .replace('元大台灣高息低波', '元大高息低波')
                                        .replace('復華台灣科技優息', '復華科技優息')
                                        .replace('元大AAA至A公司債', '元大AAA公司債')
                                        .replace('群益ESG投等債20+', '群益ESG投等債')
                                        .replace('元大2至10年企業債券', '元大2至10年債')
                                }}</span
                            >
                        </el-badge>
                    </el-tooltip>
                    <span v-else>{{
                        scope.row.name
                            .replace(/(基金|A2|投資級)/g, '')
                            .replace('群益台灣精選高息', '群益精選高息')
                            .replace('元大台灣高息低波', '元大高息低波')
                            .replace('復華台灣科技優息', '復華科技優息')
                            .replace('元大AAA至A公司債', '元大AAA公司債')
                            .replace('群益ESG投等債20+', '群益ESG投等債')
                            .replace('元大2至10年企業債券', '元大2至10年債')
                    }}</span>
                </template>
            </el-table-column>
            <el-table-column label="漲跌幅" width="70" align="right" header-align="right" v-if="modeSpread === '目前'">
                <template #default="scope">
                    <span
                        :style="[
                            scope.row.last_price_spread < 0
                                ? { color: '#01aa00' }
                                : scope.row.last_price_spread > 0
                                ? { color: '#ee3333' }
                                : { color: '#495057' },
                            { 'font-size': '14px' },
                        ]"
                    >
                        <!-- 依漲跌幅來顯示上下箭頭的圖示，下箭頭需要下移1px，上箭頭需要上移2px -->
                        <i
                            :class="[
                                scope.row.last_price_spread < 0
                                    ? 'el-icon-caret-bottom'
                                    : scope.row.last_price_spread > 0
                                    ? 'el-icon-caret-top'
                                    : '',
                            ]"
                            :style="[
                                scope.row.last_price_spread > 0
                                    ? { position: 'relative', top: '2px' }
                                    : { position: 'relative', top: '1px' },
                            ]"
                        ></i>
                        <!-- 漲跌幅 如，2.53% -->
                        <span style="font-size: 14px">
                            {{ scope.row.last_price_spread }}<span style="margin-left: 2px">%</span>
                        </span>
                    </span>
                </template>
            </el-table-column>
            <el-table-column label="市值&nbsp;&nbsp;" width="80" align="right" header-align="right" v-if="modeSpread === '歷史'">
                <template #default="scope">
                    <span
                        v-if="scope.row.cost"
                        :style="[
                            modeSpread === '目前' && scope.row.cost && scope.row.last_price < scope.row.cost.avg
                                ? { color: '#f56c6c' }
                                : modeSpread === '目前'
                                ? { color: '#409eff' }
                                : {},
                        ]"
                        >$ {{ (scope.row.cost.sum + scope.row.cost.return).toLocaleString('en-US') }}&nbsp;&nbsp;</span
                    >
                </template>
            </el-table-column>
            <el-table-column label="本金&nbsp;" width="80" align="right" header-align="right">
                <template #default="scope">
                    <span
                        ><span v-if="scope.row.cost"> $ {{ scope.row.cost.sum.toLocaleString('en-US') }} </span></span
                    >
                </template>
            </el-table-column>
            <el-table-column label="報酬率" width="60" align="right" header-align="right">
                <template #default="scope">
                    <span n v-if="scope.row.cost" style="font-weight: bold; color: #a8a8a8"
                        >{{
                            scope.row.cost.rate_of_return === null
                                ? 'N/A'
                                : scope.row.cost.rate_of_return >= 1000
                                ? (scope.row.cost.rate_of_return / 1000).toFixed(1) + 'k'
                                : Math.round(scope.row.cost.rate_of_return * 10) / 10
                        }}<span style="margin-left: 2px" v-if="scope.row.cost.rate_of_return !== null">%</span></span
                    >
                </template>
            </el-table-column>
            <el-table-column label="價差&nbsp;&nbsp;" width="81" align="right" header-align="right">
                <template #default="scope">
                    <el-tag
                        v-if="scope.row.cost"
                        class="ml-2"
                        size="small"
                        style="margin: 1px 0px"
                        :type="scope.row.cost.return >= 0 ? 'primary' : 'danger'"
                        ><span style="font-size: 14px; font-weight: bold">
                            $
                            {{
                                scope.row.cost && scope.row.cost.return !== undefined && scope.row.cost.return !== 0
                                    ? scope.row.cost.return.toLocaleString('en-US')
                                    : 0
                            }}
                        </span></el-tag
                    >
                </template>
            </el-table-column>

            <el-table-column label="市值&nbsp;&nbsp;" width="80" align="right" header-align="right" v-if="modeSpread === '目前'">
                <template #default="scope">
                    <span
                        v-if="scope.row.cost"
                        :style="[
                            modeSpread === '目前' && scope.row.cost && scope.row.last_price < scope.row.cost.avg
                                ? { color: '#f56c6c' }
                                : modeSpread === '目前'
                                ? { color: '#409eff' }
                                : {},
                        ]"
                        >$ {{ (scope.row.cost.sum + scope.row.cost.return).toLocaleString('en-US') }}&nbsp;&nbsp;</span
                    >
                </template>
            </el-table-column>
            <el-table-column label="星等" width="66" align="center" v-if="modeSpread === '目前'">
                <template #default="scope">
                    <el-rate v-model="scope.row.star" size="small" :max="3" disabled> </el-rate>
                </template>
            </el-table-column>

            <el-table-column label="日期" width="66" align="center" v-if="modeSpread === '目前'">
                <template #default="scope">
                    {{ formatLastPriceDate(scope.row.last_price_date) }}
                </template>
            </el-table-column>

            <el-table-column :label="modeSpread === '目前' ? '現價' : '賣價'" prop="last_price" width="70" align="center">
                <template #default="scope">
                    <span v-if="scope.row.last_price !== undefined && scope.row.last_price !== null">
                        <span v-if="Number(scope.row.last_price) % 1 === 0">
                            {{ Number(scope.row.last_price) }}
                        </span>
                        <span v-else>
                            {{ Number(scope.row.last_price).toFixed(2) }}
                        </span>
                    </span>
                </template>
            </el-table-column>
            <el-table-column label="成本價" width="70" align="center">
                <template #default="scope">
                    <span
                        v-if="scope.row.cost"
                        :style="[
                            modeSpread === '目前' && scope.row.cost && scope.row.last_price < scope.row.cost.avg
                                ? { color: '#f56c6c' }
                                : modeSpread === '目前'
                                ? { color: '#409eff' }
                                : {},
                        ]"
                    >
                        {{
                            scope.row.cost.avg >= 100
                                ? Number(scope.row.cost.avg.toFixed(1))
                                : Number(scope.row.cost.avg.toFixed(2))
                        }}
                    </span>
                </template>
            </el-table-column>
            <!-- <el-table-column label="合理價" width="66" align="center" prop="fair_value" v-if="modeSpread === '目前'">
            </el-table-column> -->
            <el-table-column
                :label="modeSpread === '目前' ? '累積股數&nbsp;&nbsp;' : '賣出股數&nbsp;&nbsp;'"
                width="80"
                align="right"
                header-align="right"
            >
                <template #default="scope"
                    ><span v-if="scope.row.cost"
                        >{{ scope.row.cost.total.toLocaleString('en-US') }} 股&nbsp;&nbsp;
                    </span></template
                >
            </el-table-column>
            <el-table-column label="今日增減" width="60" align="right" header-align="right" v-if="modeSpread === '目前'">
                <template #default="scope">
                    <span
                        v-if="scope.row.cost"
                        :style="[
                            scope.row.cost && scope.row.cost.today_return !== undefined && scope.row.cost.today_return < 0
                                ? { color: '#f56c6c' }
                                : { color: '#409eff' },
                        ]"
                        >$
                        {{
                            scope.row.cost && scope.row.cost.today_return !== undefined && scope.row.cost.today_return !== 0
                                ? scope.row.cost.today_return.toLocaleString('en-US')
                                : 0
                        }}</span
                    >
                </template>
            </el-table-column>
            <el-table-column label="賣出日期" prop="sell_date" width="90" align="center" v-if="modeSpread === '歷史'">
            </el-table-column>
            <el-table-column label="本益比" width="55" align="right" v-if="modeSpread === '目前'">
                <template #default="scope">
                    {{
                        scope.row.data && scope.row.data.per && scope.row.data.per.last !== undefined
                            ? parseFloat(scope.row.data.per.last).toFixed(2)
                            : ''
                    }}
                </template>
            </el-table-column>
            <el-table-column label="股價淨值比" width="78" align="right" v-if="modeSpread === '目前'">
                <template #default="scope">
                    {{
                        scope.row.data && scope.row.data.pbr && scope.row.data.pbr.last !== undefined
                            ? parseFloat(scope.row.data.pbr.last).toFixed(2)
                            : ''
                    }}
                </template>
            </el-table-column>
            <el-table-column label="殖利率" width="78" align="right" v-if="modeSpread === '目前'">
                <template #default="scope">
                    <span v-if="scope.row.data && scope.row.data.dy && scope.row.data.dy.last !== undefined">
                        {{ parseFloat(scope.row.data.dy.last).toFixed(2) }}<span style="margin-left: 2px">%</span>
                    </span>
                    <span v-else></span>
                </template>
            </el-table-column>
            <el-table-column label="代號&nbsp;&nbsp;" width="110" align="right" v-if="modeSpread === '目前'">
                <template #default="scope"> {{ scope.row.id }}&nbsp;&nbsp; </template>
            </el-table-column>
        </el-table>

        <!-- ================================ 股利 -->
        <el-row class="row-bg" justify="space-between" style="margin-top: 10px; align-items: center; max-width: 1024px">
            <el-col :span="10" style="margin-left: 6px; font-size: 18px"
                ><span style="font-weight: bold">股利&nbsp;&nbsp;</span>
                <el-radio-group v-model="modeDividend" size="small" fill="#dedede" text-color="#373737">
                    <el-radio-button label="未來" />
                    <el-radio-button label="歷史" />
                </el-radio-group>
                <el-link
                    href="#"
                    style="margin-left: 3px; text-decoration: underline; color: #409eff"
                    @click="toggleShowDividendData"
                    v-if="dividendList.length > 5"
                >
                    <span
                        v-if="
                            (modeDividend === '未來' && show5FutureDividendData) ||
                            (modeDividend === '歷史' && show5HistoryDividendData)
                        "
                        >更多</span
                    >
                    <span v-else>5筆</span></el-link
                >
            </el-col>
            <el-col :span="13" style="margin-right: 4px">
                <el-tag class="ml-2" size="large" style="margin: 5px 2px; padding: 0 4px; float: right"
                    >總計
                    <span style="font-size: 24px"> $ </span>
                    <span style="font-size: 28px; font-weight: bold">
                        <!-- <number :from="0" :to="totalSpread" :format="currencyFormat" :duration="1" :delay="0" easing="Power1.easeOut" /> -->
                        <number
                            :from="0"
                            :to="totalDividend"
                            :format="currencyFormat"
                            :duration="1"
                            :delay="0"
                            easing="Power1.easeOut"
                            ref="totalDividend"
                        /> </span
                    >&nbsp;元
                </el-tag>
            </el-col>
        </el-row>

        <el-table :data="showDividendList" style="width: 100%" empty-text="無資料">
            <el-table-column label="名稱" prop="name" width="90" align="center"> </el-table-column>
            <el-table-column label="除息日" width="42" align="right" v-if="modeDividend === '未來'">
                <template #default="scope">
                    {{ scope.row.trading_date.substr(5).replace(/^0+/, '').replace('-', '/') }}
                </template>
            </el-table-column>
            <el-table-column label="現金股利&nbsp;" width="65" align="right" header-align="right">
                <template #default="scope">
                    <el-badge
                        value="估"
                        class="item"
                        type="warning"
                        style="position: relative; top: 6px; opacity: 0.83"
                        v-if="!scope.row.isSure"
                    >
                    </el-badge>
                    <span style="font-weight: bold; color: #a8a8a8">{{
                        Math.round(scope.row.earnings_distribution * 100) / 100
                    }}</span>
                </template>
            </el-table-column>
            <el-table-column label="發放日" :width="modeDividend === '未來' ? 42 : 82" align="right">
                <template #default="scope">
                    {{
                        modeDividend === '未來'
                            ? scope.row.payment_date.substr(5).replace(/^0+/, '').replace('-', '/')
                            : scope.row.payment_date
                    }}
                </template>
            </el-table-column>
            <el-table-column label="累積股數" width="70" align="right" header-align="right">
                <template #default="scope">
                    {{ scope.row.number_of_shares ? scope.row.number_of_shares.toLocaleString('en-US') : '' }} 股
                </template>
            </el-table-column>
            <el-table-column label="股利所得&nbsp;&nbsp;" width="80" align="right" header-align="right">
                <template #default="scope">
                    <el-tag class="ml-2" size="small" style="margin: 1px 0px"
                        ><span style="font-size: 14px; font-weight: bold">
                            $
                            {{ Math.round(scope.row.number_of_shares * scope.row.earnings_distribution).toLocaleString('en-US') }}
                        </span>
                    </el-tag>
                </template>
            </el-table-column>
        </el-table>

        <!-- ================================ 價差走勢圖 -->
        <el-row style="margin-top: 20px">
            <el-col :xs="24" :sm="22" :md="18" :lg="16" :xl="14" style="padding: 4px 2px 0 4px">
                <el-card shadow="hover" style="height: 450px">
                    <div style="font-size: 14px; text-align: center; font-weight: bold; margin-bottom: 8px; color: #6c6c6c">
                        價差走勢圖 (近6個月)
                    </div>
                    <div style="height: 380px; position: relative">
                        <LineChart :chartData="spreadTrendData" :options="spreadTrendOptions" style="height: 100%; width: 100%" />
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- ================================ 股利走勢圖 -->
        <el-row style="margin-top: 20px">
            <el-col :xs="24" :sm="22" :md="18" :lg="16" :xl="14" style="padding: 4px 2px 0 4px">
                <el-card shadow="hover" style="height: 450px">
                    <div style="font-size: 14px; text-align: center; font-weight: bold; margin-bottom: 8px; color: #6c6c6c">
                        股利走勢圖 (近2年)
                    </div>
                    <div style="height: 380px; position: relative">
                        <LineChart
                            :chartData="dividendTrendData"
                            :options="dividendTrendOptions"
                            style="height: 100%; width: 100%"
                        />
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <br /><br />
        <br /><br />
    </div>
</template>

<script>
import moment from 'moment';
import _ from 'lodash';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-moment';
import { LineChart } from 'vue-chart-3';

Chart.register(...registerables);
//
// This starter template is using Vue 3 experimental <script setup> SFCs
// Check out https://github.com/vuejs/rfcs/blob/script-setup-2/active-rfcs/0000-script-setup.md

export default {
    name: 'component-dividend',
    components: { LineChart },
    data() {
        return {
            modeSpread: '目前',
            modeDividend: '未來',
            show5HistorySpreadData: true,
            show5FutureDividendData: true,
            show5HistoryDividendData: true,
        };
    },
    computed: {
        spreadList() {
            return this.$store.getters.getSpreadList(this.modeSpread);
        },
        showSpreadList() {
            if (this.modeSpread === '歷史' && this.show5HistorySpreadData) return this.spreadList.slice(0, 5);
            else return this.spreadList;
        },
        dividendList() {
            return this.$store.getters.getDividendList(this.modeDividend);
        },
        showDividendList() {
            if (
                (this.modeDividend === '未來' && this.show5FutureDividendData) ||
                (this.modeDividend === '歷史' && this.show5HistoryDividendData)
            )
                return this.dividendList.slice(0, 5);
            else return this.dividendList;
        },
        // noBuyList() {
        //     return this.$store.getters.getNoBuyList();
        // },
        totalSpread() {
            return this.spreadList.reduce((acc, { cost }) => acc + (cost ? cost.return : 0), 0);
        },
        totalBuySpend() {
            return this.spreadList.reduce((acc, { cost }) => acc + (cost ? cost.sum : 0), 0);
        },
        totalMarketValue() {
            // 目前市值 = 本金 + 價差總計
            return this.spreadList.reduce((acc, { cost }) => acc + (cost ? cost.sum + cost.return : 0), 0);
        },
        totalRateOfReturn() {
            return this.totalSpread == 0
                ? 0
                : (this.totalSpread * 100) / this.spreadList.reduce((acc, { cost }) => acc + (cost ? cost.sum : 0), 0);
        },
        totalDividend() {
            return this.dividendList.reduce(
                (acc, { number_of_shares, earnings_distribution }) => acc + Math.round(number_of_shares * earnings_distribution),
                0
            );
        },

        // 價差走勢圖相關計算屬性
        spreadTrendData() {
            const sixMonthsAgo = moment().subtract(6, 'months');
            const now = moment();

            // 收集所有有持倉的股票
            const stocksWithCost = this.$store.getters.getSpreadList('目前').filter((stock) => stock.cost);

            // 創建日期範圍內的每日價差數據
            const dailySpreadData = {};

            stocksWithCost.forEach((stock) => {
                if (!stock.data || !stock.data.daily || !stock.cost.settings) return;

                // 遍歷每日股價數據
                stock.data.daily.forEach((dailyPrice) => {
                    const dateStr = dailyPrice[0];
                    const dateMoment = moment(dateStr);

                    // 只處理最近6個月的數據
                    if (!dateMoment.isBetween(sixMonthsAgo, now, 'day', '[]')) return;

                    // 獲取該日期的股價 (收盤價)
                    const closePrice = dailyPrice.length === 2 ? dailyPrice[1] : dailyPrice[4];

                    // 計算該日期該股票的持有股數和成本
                    let totalShares = 0;
                    let totalCost = 0;

                    stock.cost.settings.forEach((purchase) => {
                        const buyDate = moment(purchase.buy_date);
                        // 只計算在該日期前購買的股票
                        if (buyDate.isSameOrBefore(dateMoment)) {
                            totalShares += purchase.number;
                            totalCost += purchase.number * purchase.cost;
                        }
                    });

                    if (totalShares > 0) {
                        const avgCost = totalCost / totalShares;
                        const marketValue = totalShares * closePrice;
                        const spread = marketValue - totalCost;

                        // 累加到該日期的總價差
                        if (!dailySpreadData[dateStr]) {
                            dailySpreadData[dateStr] = 0;
                        }
                        dailySpreadData[dateStr] += spread;
                    }
                });
            });

            // 轉換為圖表數據格式
            const dataPoints = Object.keys(dailySpreadData)
                .sort()
                .map((dateStr) => ({
                    x: moment(dateStr).toDate(),
                    y: Math.round(dailySpreadData[dateStr]),
                }));

            return {
                datasets: [
                    {
                        label: '價差走勢',
                        data: dataPoints,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderWidth: 2,
                        fill: true,
                        pointRadius: 0, // 隱藏所有數據點，避免密密麻麻的效果
                        pointHoverRadius: 6,
                        tension: 0, // 直線連接，不平滑
                    },
                ],
            };
        },

        spreadTrendOptions() {
            return {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 15,
                        bottom: 5,
                        left: 5,
                        right: 15,
                    },
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'month',
                            displayFormats: {
                                month: 'M',
                            },
                            tooltipFormat: 'YYYY/MM/DD',
                        },
                        ticks: {
                            maxTicksLimit: 6,
                            padding: 5,
                            callback: function (value, index, ticks) {
                                // 從 ticks 陣列中取得實際的時間戳
                                const tickItem = ticks[index];
                                if (!tickItem || !tickItem.value) return '';

                                const date = moment(tickItem.value);

                                // 確保日期有效
                                if (!date.isValid()) return '';

                                const month = date.month() + 1;
                                const year = date.year();

                                // 強制顯示每年的1月
                                if (month === 1) {
                                    return `${year}/${month}`;
                                }
                                return month.toString();
                            },
                            maxRotation: 0,
                            minRotation: 0,
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.1)',
                        },
                    },
                    y: {
                        beginAtZero: false,
                        ticks: {
                            maxTicksLimit: 6,
                            padding: 8,
                            callback(value) {
                                if (value.toString().includes('.')) return '';
                                if (Math.abs(value) >= 10000) {
                                    const sign = value < 0 ? '-' : '';
                                    return `${sign}$ ${Math.abs(value / 10000).toFixed(1)} 萬`;
                                } else if (value === 0) {
                                    return '$ 0';
                                } else {
                                    return `$ ${value.toLocaleString('en-US')}`;
                                }
                            },
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.1)',
                            // 在0線處添加特殊顯示
                            zeroLineColor: 'rgba(0, 0, 0, 0.3)',
                            zeroLineWidth: 2,
                        },
                    },
                },
                plugins: {
                    title: {
                        display: false,
                    },
                    legend: {
                        display: false,
                    },
                    datalabels: {
                        display: false, // 確保不顯示數據標籤
                    },
                    tooltip: {
                        enabled: false, // 完全禁用 tooltip
                    },
                },
                interaction: {
                    intersect: false,
                    mode: 'index', // 改為 index 模式，讓滑鼠靠近時更容易觸發 tooltip
                },
            };
        },

        // 股利走勢圖相關計算屬性
        dividendTrendData() {
            const twoYearsAgo = moment().subtract(2, 'years');
            const oneYearFromNow = moment().add(1, 'year');

            // 取得歷史配息資料（近2年）
            const historyDividends = this.$store.state.dividend.historyDividendList
                .filter((item) => moment(item.payment_date).isAfter(twoYearsAgo))
                .map((item) => ({
                    x: moment(item.payment_date).toDate(), // 轉換為 JavaScript Date 對象
                    y: Math.round(item.number_of_shares * item.earnings_distribution),
                    stockName: item.name,
                    stockId: item.id,
                    type: 'history',
                }));

            // 取得未來配息資料（1年內）
            const futureDividends = this.$store.getters
                .getDividendList('未來')
                .filter((item) => {
                    const paymentDate = moment(item.payment_date);
                    return paymentDate.isBefore(oneYearFromNow);
                })
                .map((item) => ({
                    x: moment(item.payment_date).toDate(), // 轉換為 JavaScript Date 對象
                    y: Math.round(item.number_of_shares * item.earnings_distribution),
                    stockName: item.name,
                    stockId: item.id,
                    type: 'future',
                }));

            // 合併所有配息資料並按日期分組
            const allDividends = [...historyDividends, ...futureDividends];
            const groupedByDate = _.groupBy(allDividends, (item) => moment(item.x).format('YYYY-MM-DD'));

            // 創建歷史和未來的資料集，包含0值點來實現"線條突起"效果
            const historyDataPoints = [];
            const futureDataPoints = [];

            // 處理分組後的資料
            Object.keys(groupedByDate).forEach((dateString) => {
                const dayDividends = groupedByDate[dateString];
                const totalAmount = _.sumBy(dayDividends, 'y');
                const stockNames = dayDividends.map((d) => d.stockName).join(', ');

                if (dayDividends.some((d) => d.type === 'history')) {
                    // 在配息日前後各添加一個0值點，實現"突起"效果
                    const dateMoment = moment(dateString);
                    const dayBefore = dateMoment.clone().subtract(1, 'day').toDate();
                    const dayAfter = dateMoment.clone().add(1, 'day').toDate();

                    historyDataPoints.push(
                        { x: dayBefore, y: 0 },
                        {
                            x: dateMoment.toDate(),
                            y: totalAmount,
                            stockNames: stockNames,
                            dividends: dayDividends,
                        },
                        { x: dayAfter, y: 0 }
                    );
                }

                if (dayDividends.some((d) => d.type === 'future')) {
                    // 在配息日前後各添加一個0值點，實現"突起"效果
                    const dateMoment = moment(dateString);
                    const dayBefore = dateMoment.clone().subtract(1, 'day').toDate();
                    const dayAfter = dateMoment.clone().add(1, 'day').toDate();

                    futureDataPoints.push(
                        { x: dayBefore, y: 0 },
                        {
                            x: dateMoment.toDate(),
                            y: totalAmount,
                            stockNames: stockNames,
                            dividends: dayDividends,
                        },
                        { x: dayAfter, y: 0 }
                    );
                }
            });

            return {
                datasets: [
                    {
                        label: '歷史配息',
                        data: _.orderBy(historyDataPoints, ['x'], ['asc']),
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderWidth: 2,
                        fill: false,
                        pointRadius: (context) => {
                            // 只在有配息的點顯示圓點，0值點不顯示
                            return context.parsed && context.parsed.y > 0 ? 5 : 0;
                        },
                        pointHoverRadius: 8,
                        stepped: false,
                        tension: 0, // 不平滑，直線連接
                        showLine: true, // 顯示連線
                    },
                    {
                        label: '未來配息',
                        data: _.orderBy(futureDataPoints, ['x'], ['asc']),
                        borderColor: 'rgb(255, 159, 64)',
                        backgroundColor: 'rgba(255, 159, 64, 0.6)',
                        borderWidth: 2,
                        fill: false,
                        pointRadius: (context) => {
                            // 只在有配息的點顯示圓點，0值點不顯示
                            return context.parsed && context.parsed.y > 0 ? 5 : 0;
                        },
                        pointHoverRadius: 8,
                        stepped: false,
                        tension: 0, // 不平滑，直線連接
                        showLine: true, // 顯示連線
                    },
                ],
            };
        },

        dividendTrendOptions() {
            return {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 15,
                        bottom: 5,
                        left: 5,
                        right: 15,
                    },
                },
                elements: {
                    point: {
                        radius: 5,
                        hitRadius: 12,
                        hoverRadius: 8,
                    },
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'month',
                            displayFormats: {
                                month: 'M',
                            },
                            tooltipFormat: 'YYYY/MM/DD',
                            parser: 'YYYY-MM-DD',
                        },
                        ticks: {
                            maxTicksLimit: 36,
                            padding: 5,
                            source: 'data',
                            callback: function (value, index, ticks) {
                                // Chart.js 在月份模式下傳遞的 value 是月份數字 (1-12)

                                // 從 ticks 陣列中取得實際的時間戳
                                const tickItem = ticks[index];
                                if (!tickItem || !tickItem.value) return '';

                                const date = moment(tickItem.value);
                                console.log('date from tick', date);

                                // 確保日期有效
                                if (!date.isValid()) {
                                    return '';
                                }

                                const month = date.month() + 1; // moment的月份從0開始，所以+1
                                const year = date.year();

                                // 強制顯示每年的1月，格式為 YYYY/1
                                if (month === 1) {
                                    return `${year}/${month}`;
                                }

                                // 檢查是否應該顯示其他月份（避免過度擁擠）
                                const totalTicks = ticks.length;
                                if (totalTicks > 24) {
                                    // 如果刻度太多，只顯示季度月份
                                    if ([1, 4, 7, 10].includes(month)) {
                                        return month.toString();
                                    }
                                    return '';
                                } else if (totalTicks > 12) {
                                    // 中等密度，顯示雙月
                                    if (month % 2 === 1) {
                                        return month.toString();
                                    }
                                    return '';
                                } else {
                                    // 低密度，顯示所有月份
                                    return month.toString();
                                }
                            },
                            // 強制包含每年1月的刻度
                            autoSkip: false,
                            maxRotation: 0,
                            minRotation: 0,
                        },
                        adapters: {
                            date: {
                                zone: 'UTC+8',
                            },
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.1)',
                        },
                    },
                    y: {
                        beginAtZero: true,
                        min: 0, // 強制從 0 開始
                        grace: 0, // 移除額外的留白
                        ticks: {
                            maxTicksLimit: 6,
                            padding: 8,
                            callback(value, index, ticks) {
                                if (value < 0) return ''; // 不顯示負數
                                if (value.toString().includes('.')) return '';
                                if (value >= 10000) return `$ ${Number((value / 10000).toFixed(1))} 萬`;
                                else if (value === 0) return '$ 0';
                                else return `$ ${value.toLocaleString('en-US')}`;
                            },
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.1)',
                        },
                    },
                },
                plugins: {
                    title: {
                        display: false,
                    },
                    legend: {
                        display: false, // 隱藏 legend 標籤
                    },
                    datalabels: {
                        display: false, // 確保不顯示數據標籤
                    },
                    tooltip: {
                        filter: function (tooltipItem) {
                            // 只在配息金額大於0的點上顯示tooltip
                            return tooltipItem.parsed && tooltipItem.parsed.y > 0;
                        },
                        callbacks: {
                            title(context) {
                                if (!context || !context[0] || !context[0].parsed) return '';
                                const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
                                return (
                                    moment(context[0].parsed.x).format('YYYY/MM/DD') +
                                    '(' +
                                    dayOfWeek[moment(context[0].parsed.x).day()] +
                                    ')'
                                );
                            },
                            label(context) {
                                if (!context || !context.parsed) return '';

                                const dataPoint = context.raw;
                                const value = context.parsed.y;

                                // 只對有配息的點顯示詳細資訊
                                if (value === 0 || !dataPoint || !dataPoint.dividends) return '';

                                // 返回每個股票的股利明細
                                return dataPoint.dividends.map((d) => `${d.stockName} $${d.y.toLocaleString('en-US')}`);
                            },
                            afterLabel(context) {
                                // 不再需要 afterLabel，因為所有資訊都在 label 中顯示
                                return '';
                            },
                        },
                        displayColors: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                    },
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest',
                },
            };
        },
    },
    watch: {
        '$store.state.app.routerName': {
            handler: function (newValue, oldValue) {
                if (newValue != oldValue && newValue === 'dividend') {
                    this.$refs.totalSpread.restart();
                    this.$refs.totalDividend.restart();
                }
            },
            //   immediate: true // provides initial (not changed yet) state
        },
    },
    created() {
        console.log('created dividend!!!');
        const localDividendList = JSON.parse(localStorage.getItem('dividendList')) || [];
        const localHistorySpreadList = JSON.parse(localStorage.getItem('historySpreadList')) || [];
        const localHistoryDividendList = JSON.parse(localStorage.getItem('historyDividendList')) || [];
        // console.log(localdividendList);
        // localStockList 有可能是本地資料，或是預設資料。然後再呼叫載入 this.stockList
        this.$store.commit('SAVE_DIVIDEND_LIST', localDividendList);
        this.$store.commit('SAVE_HISTORY_SPREAD_LIST', localHistorySpreadList);
        this.$store.commit('SAVE_HISTORY_DIVIDEND_LIST', localHistoryDividendList);

        console.log('created dividend over');
    },
    mounted() {
        // this.$store.dispatch('GET_DIVIDEND');
        this.$store.dispatch('GET_STOCK_DIVIDEND');
    },
    methods: {
        currencyFormat(number) {
            return !number || number === 0 ? '0' : Number(Math.round(number)).toLocaleString('en-US');
        },
        currencyPointFormat(number) {
            return !number || number === 0 ? '0' : Number(Math.round(number * 10) / 10).toLocaleString('en-US');
        },
        toggleShowSpreadData() {
            if (this.modeSpread === '歷史') this.show5HistorySpreadData = !this.show5HistorySpreadData;
        },
        toggleShowDividendData() {
            if (this.modeDividend === '未來') this.show5FutureDividendData = !this.show5FutureDividendData;
            else if (this.modeDividend === '歷史') this.show5HistoryDividendData = !this.show5HistoryDividendData;
        },
        tableRowClassName(row) {
            if (row.row.background) {
                return 'table-custom-row color-row';
            }
            return 'table-custom-row';
        },
        getBadgeTitle(array) {
            const options = {
                kd_gold: 'KD 黃金交叉',
                kd_turn_up: 'KD 往上轉折',
                kd_w: 'KD W底',
                rsi_over_sold: 'RSI 超賣',
                rsi_turn_up: 'RSI 往上轉折',
                annual_fixed_date_buy: '每年固定日買',
                cost_down: '成本價未跌過',
                previous_buy_down: '前買價未跌過',
                previous_sell_up: '前賣價未漲過',
                kd_dead: 'KD 死亡交叉',
                kd_turn_down: 'KD 往下轉折',
                kd_m: 'KD M頭',
                rsi_over_bought: 'RSI 超買',
                rsi_turn_down: 'RSI 往下轉折',
                annual_fixed_date_sell: '每年固定日賣',
            };

            const resultArray = [];

            if (array) {
                for (const option of array) {
                    if (options[option]) {
                        resultArray.push('[' + options[option] + ']');
                    }
                }
            }

            return resultArray.length > 0 ? ' --- 理由: ' + resultArray.join(', ') : '';
        },
        formatLastPriceDate(date) {
            const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
            return moment(date).format(`M/DD(${dayOfWeek[moment(date).day()]})`);
        },
        goToStockAnalysis(id, url) {
            // this.showStockAnalysis = true;
            // this.currentStockId = id;
            url ? window.open(url, '_blank') : window.open('https://www.wantgoo.com/stock/' + id + '/technical-chart', '_blank');
        },
    },
};
</script>
<style lang="sass">
.el-table .cell
    padding: 0
// 其它未買進股票高度也跟上面2個表格一樣高，一致性比較好
.el-table.i-table .cell
    min-height: 26px
    position: relative
    top: 2px
.el-radio-button__inner
    padding: 7px 10px!important
.signal .el-badge__content
    position: absolute
    top: 7px
    right: 14px
    opacity: 0.83
.signal.shake-base .el-badge__content
    position: absolute
    top: -2px
    right: -20px
    opacity: 0.83

.signal.l4 .el-badge__content
    right: 21px
.signal.l5 .el-badge__content
    right: 28px
.signal.l6 .el-badge__content
    right: 38px

.signal.shake-base.l4 .el-badge__content
    right: -13px
.signal.shake-base.l5 .el-badge__content
    right: -6px
.signal.shake-base.l6 .el-badge__content
    right: 4px

.signal.signal-pos .el-badge__content
    right: 2px
    top: 6px

.signal.signal-pos.shake-base .el-badge__content
    right: -27px
    top: 0px

.el-radio-button__original-radio:not(:checked)+.el-radio-button__inner
    font-weight: unset
    color: #aaaaaa

// 使用 element plus  beta版在用 table 時 cell 有時最後一列的第一欄會有一半高度的白色區塊會擋住
.el-table__fixed
    height: 100%!important

.el-radio-button__original-radio:checked+.el-radio-button__inner
    font-weight: bold

.table-custom-row
    height: 26px

#tableSpreadList .el-rate__icon
    margin-right: 0

.sell .el-badge__content
    background-color: #04ef27

.buy .el-badge__content
    background-color: #ff2828

.cancel .el-badge__content
    background-color: #404059
</style>
