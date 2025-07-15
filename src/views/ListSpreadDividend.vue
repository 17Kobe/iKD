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
                            累計本金：<span style="color: rgb(176, 224, 230); font-size: 15px; font-weight: bold">
                                $ {{ totalBuySpend.toLocaleString('en-US') }} 元</span
                            ><br />
                            目前市值：<span style="color: rgb(255 202 100); font-size: 15px; font-weight: bold">
                                $ {{ totalMarketValue.toLocaleString('en-US') }} 元
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
                        placement="bottom"
                        popper-class="custom-badge-tooltip"
                        v-if="modeSpread === '目前'"
                    >
                        <template #content>
                            <div v-html="getBadgeTooltipHtml(scope.row)"></div>
                        </template>
                        <el-badge
                            :value="scope.row.badge"
                            :class="[
                                ['比特幣'].includes(scope.row.name) ? 'btc' : '',
                                [
                                    '買',
                                    '買x2',
                                    '賣',
                                    '賣½',
                                    '賣⅓',
                                    '賣¼',
                                    '賣⅕',
                                    '賣⅙',
                                    '賣⅐',
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
                                    ? 'shake-base'
                                    : '',
                                // 準買系列：外框紅、字紅、底白
                                ['準買', '準買x2'].includes(scope.row.badge) ? 'pre_buy' : '',
                                // 準賣系列：外框綠、字綠、底淡綠
                                ['準賣', '準賣½', '準賣⅓', '準賣¼', '準賣⅕', '準賣⅙', '準賣⅐'].includes(scope.row.badge)
                                    ? 'pre_sell'
                                    : '',
                                // 其它買
                                ['買', '買x2', '取消買', '取消買x2'].includes(scope.row.badge) ? 'buy' : '',
                                // 其它賣
                                [
                                    '賣',
                                    '賣½',
                                    '賣⅓',
                                    '賣¼',
                                    '賣⅕',
                                    '賣⅙',
                                    '賣⅐',
                                    '取消賣',
                                    '取消賣½',
                                    '取消賣⅓',
                                    '取消賣¼',
                                    '取消賣⅕',
                                    '取消賣⅙',
                                    '取消賣⅐',
                                ].includes(scope.row.badge)
                                    ? 'sell'
                                    : '',
                                scope.row.name.length >= 6
                                    ? 'l6'
                                    : scope.row.name.length >= 5
                                    ? 'l5'
                                    : scope.row.name.length >= 4
                                    ? 'l4'
                                    : '',
                                'item',
                                'signal',
                            ]"
                            :type="
                                ['買', '買x2', '準買', '準買x2', '取消買', '取消買x2'].includes(scope.row.badge)
                                    ? 'danger'
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

            <el-table-column label="EPS" width="80" align="right" v-if="modeSpread === '目前'">
                <template #default="scope">
                    <span v-if="scope.row.data && Array.isArray(scope.row.data.eps) && scope.row.data.eps.length > 0">
                        <!-- 箭頭：與去年同季比 -->
                        <template v-if="scope.row.data.eps.length > 4">
                            <i
                                v-if="
                                    scope.row.data.eps[scope.row.data.eps.length - 1].value >
                                    scope.row.data.eps[scope.row.data.eps.length - 5].value
                                "
                                class="el-icon-caret-top"
                                style="color: #ee3333; font-size: 13px; margin-right: 2px"
                            ></i>
                            <i
                                v-else-if="
                                    scope.row.data.eps[scope.row.data.eps.length - 1].value <
                                    scope.row.data.eps[scope.row.data.eps.length - 5].value
                                "
                                class="el-icon-caret-bottom"
                                style="color: #01aa00; font-size: 13px; margin-right: 2px"
                            ></i>
                        </template>
                        <!-- EPS值 -->
                        {{ parseFloat(scope.row.data.eps[scope.row.data.eps.length - 1].value).toFixed(2) }}
                    </span>
                    <span v-else>-</span>
                </template>
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
            <el-table-column label="股淨比" width="78" align="right" v-if="modeSpread === '目前'">
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
            const sevenDaysAgo = moment().subtract(7, 'days');

            // 收集所有有持倉的股票
            const stocksWithCost = this.$store.getters.getSpreadList('目前').filter((stock) => stock.cost);

            // 獲取美金匯率資料
            const exchangeStock = this.$store.state.price.stockList.find((v) => v.name === '美金匯率');

            // 如果沒有持倉股票，返回空數據
            if (stocksWithCost.length === 0) {
                console.log('價差走勢圖: 無持倉股票資料');
                return { datasets: [] };
            }

            // 創建日期範圍內的每日價差數據
            const dailySpreadData = {};

            // 預建美金匯率索引以提高查找效率
            const exchangeRateIndex = {};
            if (exchangeStock && exchangeStock.data && exchangeStock.data.daily) {
                exchangeStock.data.daily.forEach((ex) => {
                    if (ex[0] && ex[1] && ex[1] > 0) {
                        exchangeRateIndex[ex[0]] = ex[1];
                    }
                });
            }

            // 先清理過期緩存
            this.$store.commit('CLEANUP_SPREAD_TREND_CACHE');

            // 重新檢查清理後的緩存狀態
            const cachedLatestDate = this.$store.getters.getSpreadTrendCacheLatestDate;
            const shouldUseCache = cachedLatestDate && moment(cachedLatestDate).isSameOrAfter(sevenDaysAgo);

            console.log('價差走勢圖緩存狀態 (清理後):', {
                cachedLatestDate,
                sevenDaysAgo: sevenDaysAgo.format('YYYY-MM-DD'),
                shouldUseCache,
            });

            // 決定計算範圍
            let calculationStartDate;
            if (shouldUseCache) {
                // 如果有有效緩存，從緩存的最新日期開始計算
                calculationStartDate = moment(cachedLatestDate).add(1, 'day');

                // 加載緩存數據
                let currentDate = sixMonthsAgo.clone();
                while (currentDate.isSameOrBefore(moment(cachedLatestDate), 'day')) {
                    const dateStr = currentDate.format('YYYY-MM-DD');
                    const cachedValue = this.$store.getters.getSpreadTrendCache(dateStr);
                    if (cachedValue !== undefined) {
                        dailySpreadData[dateStr] = cachedValue;
                    }
                    currentDate.add(1, 'day');
                }

                console.log('已加載緩存數據:', Object.keys(dailySpreadData).length, '天');
            } else {
                // 沒有有效緩存，從頭開始計算
                calculationStartDate = sixMonthsAgo.clone();
                console.log('沒有有效緩存，從頭計算');
            }

            // 如果計算開始日期已經超過今天，說明緩存是最新的
            if (calculationStartDate.isAfter(now, 'day')) {
                console.log('緩存已是最新，無需計算');
            } else {
                // 計算新的日期範圍
                console.log('開始計算價差:', calculationStartDate.format('YYYY-MM-DD'), '到', now.format('YYYY-MM-DD'));

                stocksWithCost.forEach((stock) => {
                    if (!stock.data || !stock.data.daily || !stock.cost.settings || stock.cost.settings.length === 0) {
                        console.warn(`跳過股票 ${stock.name} (${stock.id}): 缺少必要資料`);
                        return;
                    }

                    // 預建該股票的價格索引以提高查找效率
                    const priceIndex = {};
                    const sortedPrices = stock.data.daily
                        .filter((dp) => dp[0] && moment(dp[0]).isValid())
                        .sort((a, b) => moment(a[0]).diff(moment(b[0])));

                    // 建立直接索引
                    sortedPrices.forEach((dp) => {
                        priceIndex[dp[0]] = dp;
                    });

                    // 建立"最後可用價格"的快速查找索引
                    const lastAvailablePriceIndex = {};
                    let lastPrice = null;

                    // 為每個目標日期預建最後可用價格
                    const targetDates = [];
                    let currentDate = calculationStartDate.clone();
                    while (currentDate.isSameOrBefore(now, 'day')) {
                        const dateStr = currentDate.format('YYYY-MM-DD');
                        targetDates.push(dateStr);

                        // 如果當天有價格，更新最後可用價格
                        if (priceIndex[dateStr]) {
                            lastPrice = priceIndex[dateStr];
                        }

                        // 為該日期設定最後可用價格
                        if (lastPrice) {
                            lastAvailablePriceIndex[dateStr] = lastPrice;
                        }

                        currentDate.add(1, 'day');
                    }

                    // 預計算該股票每個購買記錄在美金的成本（使用買入匯率）
                    const processedPurchases = stock.cost.settings
                        .map((purchase) => {
                            if (!purchase.buy_date || !purchase.number || !purchase.cost) {
                                return null;
                            }

                            let costInTWD = purchase.number * purchase.cost;

                            // 如果是美金商品，需要用買入匯率轉換成本
                            if (stock.currency === 'USD') {
                                const buyDate = purchase.buy_date;
                                let buyExchangeRate = 30; // 預設匯率

                                // 查找買入日期的匯率
                                if (exchangeRateIndex[buyDate]) {
                                    buyExchangeRate = exchangeRateIndex[buyDate] + 0.075; // 買入匯率：匯率 + 0.075
                                } else {
                                    // 找最近的匯率
                                    const nearestRate = Object.keys(exchangeRateIndex)
                                        .filter((date) => moment(date).isSameOrBefore(moment(buyDate)))
                                        .sort((a, b) => moment(a).diff(moment(b)))[0];
                                    if (nearestRate) {
                                        buyExchangeRate = exchangeRateIndex[nearestRate] + 0.075;
                                    }
                                }

                                costInTWD = purchase.number * purchase.cost * buyExchangeRate;
                            }

                            return {
                                ...purchase,
                                buyDate: moment(purchase.buy_date),
                                costInTWD: costInTWD,
                            };
                        })
                        .filter((p) => p && p.buyDate.isValid());

                    targetDates.forEach((dateStr) => {
                        const dateMoment = moment(dateStr);

                        // 快速查找該日期的股價：先查直接索引，再查最後可用價格索引
                        let dailyPrice = priceIndex[dateStr] || lastAvailablePriceIndex[dateStr];

                        if (!dailyPrice) {
                            return; // 跳過無價格資料的日期
                        }

                        // 獲取股價 (收盤價)
                        const closePrice = dailyPrice.length === 2 ? dailyPrice[1] : dailyPrice[4];

                        // 檢查股價是否有效
                        if (!closePrice || closePrice <= 0) {
                            return; // 跳過無效股價
                        }

                        // 計算該日期該股票的持有股數和總成本（台幣）
                        let totalShares = 0;
                        let totalCostTWD = 0;

                        processedPurchases.forEach((purchase) => {
                            // 只計算在該日期前購買的股票
                            if (purchase.buyDate.isSameOrBefore(dateMoment)) {
                                totalShares += purchase.number;
                                totalCostTWD += purchase.costInTWD;
                            }
                        });

                        if (totalShares > 0 && totalCostTWD > 0) {
                            let marketValueTWD;

                            if (stock.currency === 'USD') {
                                // 美金商品：市值 = 股數 * 美金價格 * 賣出匯率
                                let sellExchangeRate = 30; // 預設匯率

                                // 查找該日期的賣出匯率
                                if (exchangeRateIndex[dateStr]) {
                                    sellExchangeRate = exchangeRateIndex[dateStr] - 0.075; // 賣出匯率：匯率 - 0.075
                                } else {
                                    // 找最近的匯率
                                    const nearestRate = Object.keys(exchangeRateIndex)
                                        .filter((date) => moment(date).isSameOrBefore(dateMoment))
                                        .sort((a, b) => moment(b).diff(moment(a)))[0];
                                    if (nearestRate) {
                                        sellExchangeRate = exchangeRateIndex[nearestRate] - 0.075;
                                    }
                                }

                                // 確保賣出匯率合理
                                if (sellExchangeRate <= 0) {
                                    sellExchangeRate = 30;
                                }

                                marketValueTWD = totalShares * closePrice * sellExchangeRate;
                            } else {
                                // 台幣商品：市值 = 股數 * 台幣價格
                                marketValueTWD = totalShares * closePrice;
                            }

                            const spread = marketValueTWD - totalCostTWD;

                            // 累加到該日期的總價差
                            if (!dailySpreadData[dateStr]) {
                                dailySpreadData[dateStr] = 0;
                            }
                            dailySpreadData[dateStr] += spread;
                        }
                    });
                });

                // 將新計算的數據保存到緩存
                const newCalculatedDates = [];
                let currentDate = calculationStartDate.clone();
                while (currentDate.isSameOrBefore(now, 'day')) {
                    const dateStr = currentDate.format('YYYY-MM-DD');
                    if (dailySpreadData[dateStr] !== undefined) {
                        this.$store.commit('SAVE_SPREAD_TREND_CACHE', {
                            dateStr,
                            value: dailySpreadData[dateStr],
                        });
                        newCalculatedDates.push(dateStr);
                    }
                    currentDate.add(1, 'day');
                }

                console.log('新計算並緩存的日期:', newCalculatedDates.length, '天');
            }

            // 轉換為圖表數據格式
            const sortedDates = Object.keys(dailySpreadData).sort();

            // 如果沒有有效的價差數據，返回空數據集
            if (sortedDates.length === 0) {
                console.log('價差走勢圖: 無有效的價差數據');
                return {
                    datasets: [
                        {
                            label: '價差走勢',
                            data: [],
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderWidth: 2,
                            fill: true,
                            pointRadius: 0,
                            pointHoverRadius: 6,
                            tension: 0,
                        },
                    ],
                };
            }

            const dataPoints = sortedDates.map((dateStr) => ({
                x: moment(dateStr).toDate(),
                y: Math.round(dailySpreadData[dateStr]),
            }));

            // 為最新一天輸出詳細的計算資訊
            if (sortedDates.length > 0) {
                const latestDate = sortedDates[sortedDates.length - 1];
                console.log('┌─────────────────────────────────────────────────────┐');
                console.log('│              價差走勢圖 - 最新一天計算詳情            │');
                console.log('├─────────────────────────────────────────────────────┤');
                console.log(`│ 日期: ${latestDate.padEnd(44)} │`);
                console.log(`│ 當天總價差: $${Math.round(dailySpreadData[latestDate]).toLocaleString('en-US').padEnd(35)} │`);
                console.log(`│ 緩存狀態: ${shouldUseCache ? '使用緩存+增量計算' : '完整重新計算'.padEnd(35)} │`);
                console.log('└─────────────────────────────────────────────────────┘');
            }

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
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        callbacks: {
                            title: function (tooltipItems) {
                                if (tooltipItems && tooltipItems.length > 0) {
                                    return moment(tooltipItems[0].parsed.x).format('YYYY/MM/DD');
                                }
                                return '';
                            },
                            label: function (context) {
                                const value = context.parsed.y;
                                const formattedValue = value.toLocaleString('en-US');
                                return `價差: $${formattedValue}`;
                            },
                        },
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
                        display: true,
                        position: 'top',
                        labels: {
                            boxWidth: 12,
                            padding: 20,
                        },
                    },
                    datalabels: {
                        display: false, // 確保不顯示數據標籤
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'nearest',
                        intersect: false,
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
        getBadgeTooltipHtml(row) {
            // 第一行：股票名稱
            let result = `<div style="line-height: 1.5; color: rgb(255, 202, 100);">${row.name}</div>`;

            // 如果有 badge，第二行顯示訊號（根據類型顯示不同顏色）
            if (row.badge) {
                let badgeColor = '#fff'; // 預設白色

                if (row.badge.includes('取消')) {
                    badgeColor = '#cbcbcd'; // 黑色
                } else if (row.badge.includes('買')) {
                    badgeColor = '#ff6666'; // 紅色
                } else if (row.badge.includes('賣')) {
                    badgeColor = '#53ed52'; // 綠色
                }

                // 動態判斷 badge 是否為賣類型（含準賣、賣、賣1/2等）
                let badgeText = `<span style="color: ${badgeColor}; font-weight: bold;">${row.badge}</span>`;

                // 僅處理含「賣」的 badge
                if (/賣/.test(row.badge) && row.cost && row.cost.market_value && row.cost.total) {
                    // 解析分數（如 1/2、1/3... 或 Unicode 分數符號）
                    let match = row.badge.match(/([1-9]\d*)\s*\/\s*([1-9]\d*)/); // 例如 1/2、1/3
                    let ratio = 1;
                    if (match) {
                        const numerator = parseInt(match[1], 10);
                        const denominator = parseInt(match[2], 10);
                        if (denominator && numerator) {
                            ratio = numerator / denominator;
                        }
                    } else {
                        // 支援 Unicode 分數符號
                        const unicodeFractionMap = {
                            '½': 1 / 2,
                            '⅓': 1 / 3,
                            '¼': 1 / 4,
                            '⅕': 1 / 5,
                            '⅙': 1 / 6,
                            '⅐': 1 / 7,
                        };
                        const uniMatch = row.badge.match(/[½⅓¼⅕⅙⅐]/);
                        if (uniMatch && unicodeFractionMap[uniMatch[0]]) {
                            ratio = unicodeFractionMap[uniMatch[0]];
                        }
                    }
                    // 若無分數，預設賣全部（ratio=1）
                    const value = Math.round(row.cost.market_value * ratio).toLocaleString('en-US');
                    const shares = Math.round(row.cost.total * ratio).toLocaleString('en-US');
                    badgeText += ` ($${value} 元)(${shares} 股)`;
                    // debug log
                    console.log('[SpreadDividend] badge:', row.badge, 'ratio:', ratio, 'value:', value, 'shares:', shares);
                }

                // 準買/準賣顯示預設預測價
                if (['準買', '準買x2'].includes(row.badge)) {
                    badgeText += `<br>預測黃金交叉股價：<span style="color: #bda3ef; font-weight:bold;">${
                        row.predictGoldPrice == null
                            ? '本週無法交叉'
                            : Number(row.predictGoldPrice).toLocaleString('en-US') + ' 元'
                    }</span>`;
                }
                if (['準賣', '準賣½', '準賣⅓', '準賣¼', '準賣⅕', '準賣⅙', '準賣⅐'].includes(row.badge)) {
                    badgeText += `<br>預測死亡交叉股價：<span style="color: #bda3ef; font-weight:bold;">${
                        row.predictDeadPrice == null
                            ? '本週無法交叉'
                            : Number(row.predictDeadPrice).toLocaleString('en-US') + ' 元'
                    }</span>`;
                }
                result += `<div style="line-height: 1.5;">訊號：${badgeText}</div>`;
            }

            // 如果有理由，第三行顯示理由
            const reasonText = this.getBadgeTitle(row.badge_reason);
            if (reasonText) {
                // 移除 " --- 理由: " 前綴，只保留實際理由內容
                const cleanReason = reasonText.replace(' --- 理由: ', '');
                // 將 [KD黃金交叉] 等標籤改為黃色
                const coloredReason = cleanReason.replace(
                    /\[([^\]]+)\]/g,
                    '<span style="color: rgb(176, 224, 230); font-weight: bold;">[$1]</span>'
                );
                result += `<div style="line-height: 1.5;">理由：${coloredReason}</div>`;
            }

            return result;
        },
        getBadgeTooltipContent(row) {
            // 第一行：股票名稱
            let result = row.name;

            // 如果有 badge，第二行顯示訊號
            if (row.badge) {
                result += `\n訊號：${row.badge}`;
            }

            // 如果有理由，第三行顯示理由
            const reasonText = this.getBadgeTitle(row.badge_reason);
            if (reasonText) {
                // 移除 " --- 理由: " 前綴，只保留實際理由內容
                const cleanReason = reasonText.replace(' --- 理由: ', '');
                result += `\n理由：${cleanReason}`;
            }

            return result;
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

// 自訂 badge tooltip 樣式
.custom-badge-tooltip
    font-size: 15px !important
    line-height: 1.5 !important
    max-width: 320px
    .el-tooltip__content
        font-size: 15px !important
        line-height: 1.5 !important
        white-space: normal
        text-align: left

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

.pre_buy .el-badge__content
    background: #fff !important
    color: #ff2828 !important
    font-weight: bold
    border: 1px solid #ff2828 !important

.pre_sell .el-badge__content
    background: #eaffea !important
    color: #00cd1f !important
    font-weight: bold
    border: 1px solid #04ef27 !important
</style>
