<template>
    <div>
        <el-table :data="stockList" :row-class-name="tableRowClassName" style="width: 100%" empty-text="無資料">
            <el-table-column
                fixed
                label="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;名稱&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;股價"
                width="160"
                align="center"
                header-align="left"
            >
                <template #default="scope">
                    <div style="width: 95px; display: inline-block">
                        <el-badge
                            :value="scope.row.badge"
                            class="item"
                            :class="[scope.row.badge === '買' || scope.row.badge === '賣' ? 'shake-base' : '', , 'item']"
                            :type="scope.row.badge === '買' || scope.row.badge === '準買' ? 'danger' : 'success'"
                        >
                            <span style="font-size: 16px; font-weight: bold">
                                {{ scope.row.name }}
                            </span>
                        </el-badge>
                        <br />

                        <span style="color: #cccccc" v-if="scope.row.type !== 'fund'">{{ scope.row.id }}</span>
                        <el-rate v-model="scope.row.star" size="small" :max="3" @change="onChangeStar($event, scope.row.id)">
                        </el-rate>
                    </div>
                    <div style="width: 60px; display: inline-block; text-align: right">
                        <span v-if="scope.row.last_price">
                            <!-- vue style if 寫法 https://stackoverflow.com/questions/48455909/condition-in-v-bindstyle -->
                            <span
                                :style="[
                                    scope.row.last_price_spread < 0
                                        ? { color: '#01aa00' }
                                        : scope.row.last_price_spread > 0
                                        ? { color: '#ee3333' }
                                        : { color: '#495057' },
                                    { 'font-size': '16px' },
                                ]"
                            >
                                <div style="font-weight: bold">{{ scope.row.last_price }}</div>
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
                                <span style="font-size: 13px">
                                    {{ scope.row.last_price_spread !== null ? scope.row.last_price_spread + '%' : '' }}
                                </span>
                                <div style="color: #cccccc; font-size: 14px">{{ fmtDate(scope.row.last_price_date) }}</div>
                            </span>
                        </span>
                    </div>
                    <div v-if="scope.row.cost && scope.row.cost.settings.length >= 1">
                        <el-progress
                            :text-inside="true"
                            :stroke-width="20"
                            :percentage="
                                scope.row.cost.rate_of_return === null || Math.abs(scope.row.cost.rate_of_return) > 1000
                                    ? 100
                                    : Math.abs(scope.row.cost.rate_of_return) * progressMultiple
                            "
                            :color="
                                scope.row.cost.rate_of_return !== null && scope.row.cost.rate_of_return <= 0
                                    ? '#ffc2bd'
                                    : '#c5f4ff'
                            "
                            style="padding: 0 2px 0 18px"
                        >
                            <!-- style="width: 158px; z-index: 999; top: 3px" -->
                            <!-- '#fef0f0' #f690a9 -->
                            <span style="color: #222326; font-size: 9px">
                                損益&nbsp;&nbsp;<span
                                    :style="[
                                        scope.row.cost.return >= 0 ? { color: '#2cc8fb' } : { color: '#f56c70' },
                                        { 'font-size': '13px', 'font-weight': 'bold' },
                                    ]"
                                    >$ {{ Number(scope.row.cost.return.toFixed(1)).toLocaleString('en-US') }}</span
                                >&nbsp;&nbsp;<span style="font-size: 11px; font-weight: bold; color: #545454">{{
                                    scope.row.cost.rate_of_return === null
                                        ? 'N/A'
                                        : Math.abs(scope.row.cost.rate_of_return) >= 1000
                                        ? (scope.row.cost.rate_of_return / 1000).toFixed(1) + 'k'
                                        : Number(scope.row.cost.rate_of_return.toFixed(1))
                                }}</span>
                                <span style="color: #999999" v-if="scope.row.cost.rate_of_return !== null">%</span>
                            </span>
                        </el-progress>
                    </div>
                </template>
            </el-table-column>

            <el-table-column label="週KD" width="230" align="center">
                <template #default="scope">
                    <ChartWeekKd :parentData="scope.row.id" />
                    <!-- <ChartWeekKd :parentData="scope.row.id" v-if="renderStockCount >= scope.$index" /> -->
                </template>
            </el-table-column>

            <el-table-column label="週RSI" width="230" align="center" :visible="!isMobile" v-if="!isMobile">
                <template #default="scope">
                    <ChartWeekRsi :parentData="scope.row.id" />
                </template>
            </el-table-column>

            <el-table-column label="週K線" width="250" align="center">
                <template #default="scope">
                    <ChartWeekK :parentData="scope.row.id" />
                    <!-- <ChartWeekK :parentData="scope.row.id" v-if="renderStockCount >= scope.$index" /> -->
                </template>
            </el-table-column>

            <el-table-column label="成本" width="190" header-align="center" align="center">
                <template #default="scope">
                    <el-button
                        size="small"
                        type="info"
                        plain
                        @click="doShowCost(scope.row.id)"
                        :style="[
                            scope.row.cost && scope.row.cost.settings.length >= 1 ? { width: 'auto' } : {},
                            { 'text-align': 'left', 'line-height': '18px', padding: '3px 9px' },
                        ]"
                    >
                        <div v-if="scope.row.cost && scope.row.cost.settings.length >= 1" style="font-size: 13px">
                            <div>
                                成 <span style="margin-left: 4px">本</span>
                                <span style="margin-left: 5px">價</span>&nbsp;&nbsp;<el-tag
                                    :type="scope.row.cost.avg <= scope.row.last_price ? 'primary' : 'danger'"
                                    class="ml-2"
                                    size="small"
                                    effect="plain"
                                    style="margin: 1px 0px"
                                    ><span style="font-size: 14px; font-weight: bold">{{
                                        scope.row.cost.avg >= 100
                                            ? Number(scope.row.cost.avg.toFixed(1)).toLocaleString('en-US')
                                            : Number(scope.row.cost.avg.toFixed(2)).toLocaleString('en-US')
                                    }}</span>
                                    元</el-tag
                                >
                            </div>
                            <div>
                                累積股數&nbsp;&nbsp;<el-tag
                                    type="info"
                                    effect="plain"
                                    class="ml-2"
                                    size="small"
                                    style="margin: 1px 0px"
                                    ><span style="font-size: 14px; font-weight: bold">{{
                                        scope.row.cost.total.toLocaleString('en-US')
                                    }}</span>
                                    股</el-tag
                                >
                            </div>
                            <div>
                                本　　金&nbsp;&nbsp;<el-tag
                                    class="ml-2"
                                    type="info"
                                    size="small"
                                    effect="dark"
                                    style="margin: 1px 0px"
                                    ><span style="font-size: 14px; font-weight: bold">{{
                                        scope.row.cost.sum.toLocaleString('en-US')
                                    }}</span>
                                    元</el-tag
                                >
                            </div>

                            <!-- {{ parseFloat((scope.row.cost.total / 1000).toFixed(2)) }} 張) -->
                        </div>

                        <div v-else>
                            <i class="el-icon-s-tools text-xl"></i>
                        </div>
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column label="買賣策略" width="225" align="center">
                <template #default="scope">
                    <el-button
                        size="small"
                        type="info"
                        plain
                        @click="doShowPolicy(scope.row.id)"
                        :style="[
                            scope.row.policy &&
                            scope.row.policy.settings &&
                            scope.row.policy.settings.buy &&
                            scope.row.policy.settings.sell &&
                            (scope.row.policy.settings.buy.length >= 1 || scope.row.policy.settings.sell.length >= 1)
                                ? { width: 'auto' }
                                : {},
                            { 'text-align': 'left', 'line-height': '18px', padding: '6px 9px' },
                        ]"
                    >
                        <div
                            v-if="
                                scope.row.policy &&
                                scope.row.policy.settings &&
                                scope.row.policy.settings.buy &&
                                scope.row.policy.settings.sell &&
                                (scope.row.policy.settings.buy.length >= 1 || scope.row.policy.settings.sell.length >= 1)
                            "
                            style="font-size: 13px"
                        >
                            <div v-for="(item, index) in scope.row.policy.settings.buy" :key="index">
                                <div style="line-height: 24px">
                                    <span
                                        style="
                                            font-size: 14px;
                                            color: white;
                                            background-color: #f28b82;
                                            padding: 5px;
                                            border-radius: 10px 100px / 120px;
                                        "
                                        >買</span
                                    >
                                    <span>
                                        &nbsp;{{ item.label }}&nbsp;<span style="color: #4386f5; font-size: 14px">{{
                                            item.limit
                                        }}</span
                                        >&nbsp;{{ item.limit_desc }}</span
                                    >
                                </div>
                            </div>
                            <div v-for="(item, index) in scope.row.policy.settings.sell" :key="index">
                                <div style="line-height: 24px">
                                    <span
                                        style="
                                            font-size: 14px;
                                            color: white;
                                            background-color: #82d125;
                                            padding: 5px;
                                            border-radius: 10px 100px / 120px;
                                        "
                                        >賣</span
                                    >
                                    <span>
                                        &nbsp;{{ item.label }}&nbsp;<span style="color: #4386f5; font-size: 14px">{{
                                            item.limit
                                        }}</span
                                        >&nbsp;{{ item.limit_desc }}</span
                                    >
                                </div>
                            </div>

                            <!-- {{ parseFloat((scope.row.cost.total / 1000).toFixed(2)) }} 張) -->
                        </div>

                        <div v-else>
                            <i class="el-icon-s-tools text-xl"></i>
                        </div>
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column prop="city" label="策略歷史報酬" width="290" align="center">
                <template #default="scope">
                    <el-popover
                        placement="left-start"
                        title="策略歷史記錄"
                        width="500"
                        trigger="hover"
                        :hide-after="0"
                        :ref="`popover-${scope.row.id}`"
                    >
                        <!-- <el-table
                            :data="scope.row.policy && scope.row.policy.history ? scope.row.policy.history : []"
                            :ref="`popover-child-${scope.row.id}`"
                        >
                            <el-table-column width="130" property="date" label="日期"></el-table-column>
                            <el-table-column width="80" label="買賣">
                                {{ scope.row.buy_or_sell }}
                            </el-table-column>
                            <el-table-column width="80" property="price" label="股價"></el-table-column>
                            <el-table-column width="80" property="rate_of_return" label="報酬"></el-table-column>
                        </el-table> -->
                        <div v-if="scope.row.policy && scope.row.policy.history && scope.row.policy.history.length >= 1">
                            <div v-for="(item, index) in scope.row.policy.history" :key="index">
                                <span
                                    :style="[
                                        parseInt(item.date) % 2 === 0
                                            ? { 'background-color': '#eeeeee' }
                                            : { 'background-color': '#ffffff' },
                                        { 'font-size': '14px', display: 'inline-block', width: '100px', 'text-align': 'center' },
                                    ]"
                                    >{{ item.date }}</span
                                >&nbsp;&nbsp;
                                <span
                                    :style="[
                                        item.buy_or_sell === '買'
                                            ? { 'background-color': '#f28b82' }
                                            : { 'background-color': '#82d125' },
                                        {
                                            'font-size': '14px',
                                            display: 'inline-block',
                                            width: '30px',
                                            'text-align': 'center',
                                            color: 'white',
                                            'border-radius': '10px 100px / 120px',
                                            padding: '5px',
                                        },
                                    ]"
                                    >{{ item.buy_or_sell }}</span
                                >
                                &nbsp;&nbsp;<span
                                    :style="[
                                        parseInt(item.date) % 2 === 0
                                            ? { 'background-color': '#eeeeee' }
                                            : { 'background-color': '#ffffff' },
                                        { 'font-size': '14px', display: 'inline-block', width: '60px', 'text-align': 'center' },
                                    ]"
                                    >{{ item.price }}</span
                                >
                                &nbsp;&nbsp;<span
                                    :style="[
                                        item.rate_of_return.includes('-') ? { color: '#01aa00' } : { color: '#ee3333' },
                                        { 'font-size': '14px', display: 'inline-block', width: '50px', 'text-align': 'right' },
                                    ]"
                                    >{{ item.rate_of_return }}</span
                                >
                                &nbsp;&nbsp;<span
                                    :style="[
                                        item.buy_or_sell === '買'
                                            ? { 'background-color': '#f28b82' }
                                            : { 'background-color': '#82d125' },
                                        {
                                            'font-size': '14px',
                                            display: 'inline-block',
                                            width: '100px',
                                            'text-align': 'center',
                                            color: 'white',
                                            'border-radius': '15px / 120px',
                                            padding: '5px',
                                            margin: '1px',
                                        },
                                    ]"
                                >
                                    <span v-if="item.reason.includes('kd_gold')">KD 黃金交叉</span>
                                    <span v-if="item.reason.includes('kd_turn_up')">KD往 上轉折</span>
                                    <span v-if="item.reason.includes('rsi_over_sold')">RSI 超賣</span>
                                    <span v-if="item.reason.includes('rsi_turn_up')">RSI 往上轉折</span>

                                    <span v-if="item.reason.includes('kd_dead')">KD 死亡交叉</span>
                                    <span v-if="item.reason.includes('kd_turn_down')">KD 往下轉折</span>
                                    <span v-if="item.reason.includes('rsi_over_bought')">RSI 超買</span>
                                    <span v-if="item.reason.includes('rsi_turn_down')">RSI 往下轉折</span>

                                    <span v-if="item.reason.includes('latest')">現在</span>
                                </span>
                            </div>
                        </div>
                        <template #reference>
                            <div>
                                <div v-if="scope.row.policy && scope.row.policy.stats" style="font-size: 13px">
                                    <el-row>
                                        <el-col :span="7" style="padding: 0 0 0 12px; text-align: left"
                                            ><span>賣出次數</span></el-col
                                        >
                                        <el-col :span="5" style="padding: 0; text-align: right"
                                            ><el-tag type="info" class="ml-2" size="small" style="margin: 1px 0px"
                                                ><span style="font-size: 14px; font-weight: bold">{{
                                                    scope.row.policy.stats.number_of_sell
                                                }}</span
                                                >次</el-tag
                                            ></el-col
                                        >
                                        <el-col :span="7" style="padding: 0 0 0 12px; text-align: left"
                                            ><span>&nbsp;年化報酬率</span></el-col
                                        >
                                        <el-col :span="5" style="padding: 0; text-align: right"
                                            ><el-tag class="ml-2" size="small" style="margin: 1px 0px"
                                                ><span style="font-size: 14px; font-weight: bold">{{
                                                    Number((scope.row.policy.stats.internal_of_return * 100).toFixed(1))
                                                }}</span
                                                >%</el-tag
                                            >
                                        </el-col>
                                    </el-row>
                                    <el-row>
                                        <el-col :span="7" style="padding: 0 0 0 12px; text-align: left"
                                            ><span>每回天數</span></el-col
                                        >
                                        <el-col :span="5" style="padding: 0; text-align: right"
                                            ><el-tag type="warning" class="ml-2" size="small" style="margin: 1px 0px"
                                                ><span style="font-size: 14px; font-weight: bold">{{
                                                    scope.row.policy.stats.average_hold_days
                                                }}</span
                                                >天</el-tag
                                            >
                                        </el-col>

                                        <el-col :span="7" style="padding: 0 0 0 12px; text-align: left"
                                            ><span>&nbsp;每回報酬率</span></el-col
                                        >
                                        <el-col :span="5" style="padding: 0; text-align: right"
                                            ><span style="color: #4386f5; font-size: 14px">{{
                                                Number((scope.row.policy.stats.average_of_returns * 100).toFixed(1))
                                            }}</span
                                            >%</el-col
                                        >
                                        <!-- <el-col :span="6" style="padding: 0"><span>年均報酬率</span></el-col>
                                        <el-col :span="4" style="padding: 0; text-align: right"
                                            ><span style="color: #4386f5">{{
                                                Number((scope.row.policy.stats.average_annual_return * 100).toFixed(1))
                                            }}</span>
                                            %</el-col
                                        > -->
                                    </el-row>
                                    <el-row>
                                        <el-col :span="7" style="padding: 0 0 0 12px; text-align: left"
                                            ><span>最大賺幅</span></el-col
                                        >
                                        <el-col :span="5" style="padding: 0; text-align: right"
                                            ><el-tag type="danger" class="ml-2" size="small" style="margin: 1px 0px"
                                                ><span style="font-size: 14px; font-weight: bold">{{
                                                    Number((scope.row.policy.stats.max_earn * 100).toFixed(1))
                                                }}</span
                                                >%</el-tag
                                            >
                                        </el-col>
                                        <el-col :span="7" style="padding: 0 0 0 12px; text-align: left"
                                            ><span>&nbsp;累積報酬率</span></el-col
                                        >
                                        <el-col :span="5" style="padding: 0; text-align: right"
                                            ><span style="color: #4386f5; font-size: 14px">{{
                                                Number((scope.row.policy.stats.sum_of_returns * 100).toFixed(1))
                                            }}</span
                                            >%</el-col
                                        >
                                    </el-row>
                                    <el-row>
                                        <el-col :span="7" style="padding: 0 0 0 12px; text-align: left"
                                            ><span>最大賠幅</span></el-col
                                        >
                                        <el-col :span="5" style="padding: 0; text-align: right"
                                            ><el-tag type="success" class="ml-2" size="small" style="margin: 1px 0px"
                                                ><span style="font-size: 14px; font-weight: bold">{{
                                                    Number((scope.row.policy.stats.max_lose * 100).toFixed(1))
                                                }}</span
                                                >%</el-tag
                                            ></el-col
                                        >
                                        <el-col :span="7" style="padding: 0 0 0 12px; text-align: left"
                                            ><span>&nbsp;計算期間</span></el-col
                                        >
                                        <el-col :span="5" style="padding: 0; text-align: right"
                                            ><span style="color: #4386f5; font-size: 14px">{{
                                                Number(scope.row.policy.stats.diff_years.toFixed(1))
                                            }}</span
                                            >年
                                        </el-col>
                                    </el-row>
                                </div>
                            </div>
                        </template>
                    </el-popover>
                </template>
            </el-table-column>
            <!-- <el-table-column prop="city" label="功能" width="220" align="center">
                <el-button type="danger" @click="onDel()"><i class="el-icon-minus"></i></el-button>
            </el-table-column> -->
            <!-- <el-table-column prop="city" label="淨值比" width="120" />
                <el-table-column prop="city" label="本益比" width="120" />
                <el-table-column prop="city" label="EPS" width="120" /> -->
        </el-table>
        <el-button style="margin-top: 10px" type="info" plain @click="doShowSearch()"
            ><i class="el-icon-plus"></i>&nbsp;新增自選股</el-button
        >
        <el-button style="margin-top: 10px" type="info" plain @click="doShowExport()"
            ><i class="el-icon-place"></i>&nbsp;進階設定</el-button
        >
        <br /><br />
        <br /><br />
        <FormCost ref="childFormCost" />
        <FormPolicy ref="childFormPolicy" />
        <FormSearch ref="childFormSearch" />
        <FormExport ref="childFormExport" />
    </div>
</template>

<script>
import _ from 'lodash';
import moment from 'moment';
import ChartWeekKd from '@/components/ChartWeekKd.vue';
import ChartWeekRsi from '@/components/ChartWeekRsi.vue';
import ChartWeekK from '@/components/ChartWeekK.vue';
import FormCost from '@/components/FormCost.vue';
import FormPolicy from '@/components/FormPolicy.vue';
import FormSearch from '@/components/FormSearch.vue';
import FormExport from '@/components/FormExport.vue';
import DefaultStockList from '../store/data/default-stock-list.json';
import GlobalSettings from '../store/data/global-settings.json';
// This starter template is using Vue 3 experimental <script setup> SFCs
// Check out https://github.com/vuejs/rfcs/blob/script-setup-2/active-rfcs/0000-script-setup.md

export default {
    name: 'component-list',
    components: { ChartWeekKd, ChartWeekRsi, ChartWeekK, FormCost, FormPolicy, FormSearch, FormExport },
    data() {
        return {
            // rateOfReturn: 0,
            // historyData: [],
            // renderStockCount: 0,
            queueStockDataList: [],
            isMobile: true, // 預設要先隱藏再顯示，否則手機看有的股票的KD會拉長
        };
    },
    computed: {
        stockList() {
            // console.log('======stockList');
            // console.log(this.firstRender);
            // // 先畫6筆，符合iphone XR一次可以看到的數量，之後再畫全部
            // if (this.firstRender) return this.$store.state.price.stockList.slice(0, 6);
            return this.$store.getters.getStockSortedList();
            // return this.$store.state.price.stockList;

            // return this.$store.state.price.stockList.reduce((acc, obj) => {
            //     if (obj.data) {
            //         // console.log(obj);
            //         // const removeDateObj = ;
            //         // console.log(removeDateObj);
            //         acc.push(_.omit(obj, ['data']));
            //     }
            //     return acc;
            // }, []);
        },
        progressMultiple() {
            return this.$store.getters.getProgressMultiple();
        },
    },
    created() {
        console.log('created');
        this.$store.commit('SAVE_GLOBAL_SETTINGS', GlobalSettings);
        // 8秒後再畫全部
        // setInterval(() => {
        //     this.renderStockCount += 1;
        // }, 400);
        // 取得 localstorage 自選股，最先開始是 null 時，會給予預設值空矩陣
        let localStockList = JSON.parse(localStorage.getItem('stockList')) || [];
        // console.log(localStockList);

        // 將 stockList 預設的塞進到 localstorage
        // console.log(this.stockList);
        // const diffDefault = this.getDifference(this.stockList, localStockList); // 預設有，但本地沒有，則要新增
        // const diffLocal = this.getDifference(localStockList, this.stockList); // 本地有，但預設沒有，則要砍掉

        // 空時，或沒資料(有可能刪光)，就載入預設清單
        if (_.isEmpty(localStockList)) {
            // this.$store.commit('SAVE_STOCK_LIST', DefaultStockList);
            localStockList.push(...DefaultStockList); // 新增 append 預設到 localStockList
            localStorage.setItem('stockList', JSON.stringify(localStockList)); // 將 localStockList 從 object 轉 string 後塞到 localstorage
            // console.log(diffLocal);
            // console.log(diffDefault);
            // console.log(localStockList);
            // console.log(this.stockList);

            // 將 localstorage 重塞回到 vuex 的 stockList
        } else {
            // 若已有資料時則先去除 data, policy(因為policy也會畫KD圖訊號)資料，用 setInterval來載入資料比較好
            localStockList = _.orderBy(localStockList, ['order'], ['asc']).reduce((acc, obj) => {
                acc.push(_.omit(obj, ['data']));
                if (obj.data) {
                    let tempStockObj = _.pick(obj, ['id', 'data']);
                    // 若是基金時，在這裡是塞JSON的data.daily資料，因為是可能最新的。但不修改data.weekly資料喔，這部份還是由vuex去算
                    if (obj.type === 'fund') {
                        const foundStock = DefaultStockList.find((v) => v.id === tempStockObj.id);
                        tempStockObj.data.daily = _.cloneDeep(foundStock.data.daily);
                    }
                    console.log(tempStockObj);
                    this.queueStockDataList.push(tempStockObj);
                } else if (obj.type === 'fund') {
                    // 無資料，且是基金時，但無資料還是蠻怪，localstorage不可能無資料
                    const foundStock = DefaultStockList.find((v) => v.id === obj.id);
                    this.queueStockDataList.push(_.pick(foundStock, ['id', 'data']));
                }

                return acc;
            }, []);
            // console.log(tmpLocalStockList);
            // localStockList = tmpLocalStockList;
        }
        // localStockList 有可能是本地資料，或是預設資料。然後再呼叫載入 this.stockList
        // console.log(localStockList);
        this.$store.commit('SAVE_STOCK_LIST', localStockList);
    },
    mounted() {
        // 在 mounted() 事件時就可以發送，因為此時不須 data 及 computed 資料都準備好(因為沒有要data 參數，在create())
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // 看起來此timer會 commit裡面一個一個都跑完，才進行下一個，所以不用擔心 dispatch是還沒commit
        var timerIdOfSetStockData = setInterval(() => {
            // 判斷0在前面做可以下個100後，或是安全判斷會有
            if (this.queueStockDataList.length === 0) {
                // console.log('GET_STOCK_PRICE');
                this.$store.dispatch('GET_STOCK_PRICE');
                clearInterval(timerIdOfSetStockData);
                // console.log('commit real over');
            }
            // console.log('timerIdOfSetStockData');
            const stockDataAndPolicy = this.queueStockDataList.splice(0, 6); // 一次取6個
            // console.log('commit begin');
            // console.log(stockDataAndPolicy);
            if (stockDataAndPolicy && !_.isEmpty(stockDataAndPolicy))
                // 最後1個沒有資料時 stockDataAndPolicy = undefined
                this.$store.commit('SAVE_STOCK_DATA_AND_POLICY', stockDataAndPolicy);
            // console.log('commit over');

            // console.log(this.queueStockDataList.length);

            // console.log('commit 1 over');
        }, 10);
        // setTimeout(() => {
        //     // 加這個確定是2秒後才會去 dispatch
        //     this.$store.dispatch('GET_STOCK_PRICE');
        // }, 3000);
        // 欄位設成fixed然後table又設成header在最上方，會造成欄位自行多加 Is-hidden而使得看不到欄位名稱
        // this.$nextTick(() => {
        //     const elems = document.querySelectorAll('.is-hidden');
        //     [].forEach.call(elems, (el) => {
        //         el.classList.remove('is-hidden');
        //     });
        // });
    },
    methods: {
        fmtDate(timestamp) {
            // (${dayOfWeek[currStockLastDate.day()]})`;
            const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
            const dt = moment(timestamp);
            return dt.format('M/DD') + '(' + dayOfWeek[dt.day()] + ')';
        },
        getDifference(array1, array2) {
            return array1.filter((object1) => !array2.some((object2) => object1.id === object2.id));
        },
        tableRowClassName(row) {
            if (row.row.background) {
                return 'color-row';
            }
            return '';
        },
        doShowCost(id) {
            // console.log(this.$refs);
            // 父改子去顯示 drawer 變數 不好，子要被改值
            // 父傳一堆變數給子也不太好
            // 所以父傳id給子，最簡單，子拿此參數再去 vuex 取值，改值，再填回 localstorage
            this.$refs.childFormCost.onInit(id);
        },
        doShowPolicy(id) {
            // console.log(this.$refs);
            // 父改子去顯示 drawer 變數 不好，子要被改值
            // 父傳一堆變數給子也不太好
            // 所以父傳id給子，最簡單，子拿此參數再去 vuex 取值，改值，再填回 localstorage
            this.$refs.childFormPolicy.onInit(id);
        },
        doShowSearch() {
            // console.log(this.$refs);
            // 父改子去顯示 drawer 變數 不好，子要被改值
            // 父傳一堆變數給子也不太好
            // 所以父傳id給子，最簡單，子拿此參數再去 vuex 取值，改值，再填回 localstorage
            this.$store.dispatch('GET_TAIWAN_STOCK');
            this.$refs.childFormSearch.onInit();
        },
        doShowExport() {
            this.$refs.childFormExport.onInit();
        },
        onChangeStar(selValue, index) {
            this.$store.commit('SAVE_STOCK_STAR', { stockId: index, star: selValue });
        },
        // buyOrSellFormatter(row, column, cellValue) {
        //     return '<b>buy</b>';
        // },
    },
};
</script>

<style lang="sass">

// 為了讓highchart圖更不會佔td
.el-tabs--border-card>.el-tabs__content
    padding: 0px
    // height: calc(100vh - 51px)

.el-table__header tr, .el-table__header th
    padding: 0
    height: 15px
//標題字往下移一點
.el-table th>.cell
    top: 1px
    position: relative
.el-table .el-table__body .el-table_1_column_1 .cell
    line-height: normal
    padding-right: 5px

.el-table .el-table__body .el-table_1_column_3
    padding: 0 0 0 14px
.el-table .el-table__body td
    padding: 0px 0
// 為了解決table內cell要/n換行的問題
// 用badge會被裁缺的解決
.el-table .el-table__body .cell
    white-space: pre-line
    overflow: visible
    padding-left: 0
    padding-right: 0

// 隱藏 input 若有屬性 type="number" 會出現上下箭頭的問題, 寫在各別vue用 scoped不行，不加scoped又會報錯，所以寫在global
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button
    -webkit-appearance: none
    margin: 0
.el-badge__content.is-fixed
    top: -2px
    right: calc(2px + var(--el-badge-size) / 2)
    opacity: 0.83
// group button padding 左右小一點
.el-input-group__prepend
    padding: 0 10px

.shake-base > .el-badge__content
    animation-name: shake-base
    animation-duration: 5s
    animation-iteration-count: infinite
    animation-timing-function: ease-in-out
    animation-delay: 0s
    animation-play-state: running
    right: -20px
    top: -9px
    opacity: 0.83

// 全部 drawer title 變下面沒那麼多
.el-drawer__header
    margin-bottom: 10px

// 進度列中的文字靠左對齊
.el-progress-bar__inner
    text-align: left

@keyframes shake-base
    0%, 100%
        transform: translate3d(-2px, 0, 0)
    10%, 90%
        transform: translate3d(+4px, 0, 0)
    20%, 80%
        transform: translate3d(-4px, 0, 0)
    30%, 70%
        transform: translate3d(+4px, 0, 0)
    40%, 60%
        transform: translate3d(-4px, 0, 0)
    50%
        transform: translate3d(+4px, 0, 0)

// 自訂想專注的顏色
.el-table .color-row
    background: #fffbec

.el-table--striped .el-table__body tr.el-table__row--striped.color-row td
    background: #fffbec
</style>
