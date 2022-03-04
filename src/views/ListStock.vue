<template>
    <div>
        <el-table :data="stockList" style="width: 100%">
            <el-table-column fixed label="名稱" width="100" align="center">
                <template #default="scope">
                    <span style="font-size: 16px; font-weight: bold">
                        {{ scope.row.name }}
                    </span>

                    <br />
                    <el-badge
                        :value="scope.row.badge"
                        class="item"
                        :type="scope.row.badge === '買' || scope.row.badge === '準買' ? 'danger' : 'success'"
                    >
                        <span style="color: #cccccc">{{ scope.row.id }}</span>
                    </el-badge>
                    <el-rate v-model="scope.row.star" size="small" :max="3" @change="onChangeStar($event, scope.row.id)">
                    </el-rate>
                </template>
            </el-table-column>
            <el-table-column fixed label="股價" width="75" align="right">
                <template #default="scope">
                    <span v-if="scope.row.data && scope.row.data.daily && scope.row.data.daily.length >= 2">
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
                            <span style="font-size: 14px">
                                {{ scope.row.last_price_spread !== null ? scope.row.last_price_spread + '%' : '' }}
                            </span>
                            <div style="color: #cccccc; font-size: 14px">{{ scope.row.last_price_date }}</div>
                        </span>
                    </span>
                </template>
            </el-table-column>

            <el-table-column prop="city" label="週KD" width="230" align="center">
                <template #default="scope">
                    <ChartWeekKd :parentData="scope.row.id" />
                </template>
            </el-table-column>
            <el-table-column label="週K線" width="230" align="center">
                <template #default="scope">
                    <ChartWeekK :parentData="scope.row.id" />
                </template>
            </el-table-column>
            <el-table-column label="成本" width="200" align="center">
                <template #default="scope">
                    <el-button
                        size="small"
                        @click="doShowCost(scope.row.id)"
                        :style="[
                            scope.row.cost && scope.row.cost.settings.length >= 1 ? { width: '190px' } : {},
                            { 'text-align': 'left', 'line-height': '18px' },
                        ]"
                    >
                        <div v-if="scope.row.cost && scope.row.cost.settings.length >= 1" style="font-size: 13px">
                            <div>
                                持股成本&nbsp;&nbsp;<el-tag
                                    :type="scope.row.cost.avg <= scope.row.last_price ? 'danger' : 'success'"
                                    class="ml-2"
                                    size="small"
                                    style="margin: 1px 0px"
                                    ><span style="font-size: 14px; font-weight: bold">{{
                                        scope.row.cost.avg.toLocaleString('en-US')
                                    }}</span>
                                    元</el-tag
                                >
                            </div>
                            <div>
                                累積股數&nbsp;&nbsp;<el-tag type="info" class="ml-2" size="small" style="margin: 1px 0px"
                                    ><span style="font-size: 14px; font-weight: bold">{{
                                        scope.row.cost.total.toLocaleString('en-US')
                                    }}</span>
                                    股</el-tag
                                >
                            </div>
                            <div>
                                本　　金&nbsp;&nbsp;<el-tag class="ml-2" size="small" style="margin: 1px 0px"
                                    ><span style="font-size: 14px; font-weight: bold">{{
                                        scope.row.cost.sum.toLocaleString('en-US')
                                    }}</span>
                                    元</el-tag
                                >
                            </div>
                            <el-progress
                                v-if="scope.row.data && scope.row.data.daily && scope.row.data.daily.length >= 1"
                                :text-inside="true"
                                :stroke-width="20"
                                :percentage="
                                    getRateOfReturnPercent(
                                        scope.row.cost.sum,
                                        scope.row.data.daily[scope.row.data.daily.length - 1][4],
                                        scope.row.cost.total
                                    )
                                "
                                :color="
                                    getRateOfReturn(
                                        scope.row.cost.sum,
                                        scope.row.data.daily[scope.row.data.daily.length - 1][4],
                                        scope.row.cost.total
                                    ) <= 0
                                        ? '#ccff90'
                                        : '#ffc2bd'
                                "
                            >
                                <!-- '#fef0f0' #f690a9 -->
                                <span style="color: #222326; font-size: 12px">
                                    <span style="font-size: 14px; font-weight: bold">{{
                                        getReturn(
                                            scope.row.cost.sum,
                                            scope.row.data.daily[scope.row.data.daily.length - 1][4],
                                            scope.row.cost.total
                                        )
                                    }}</span>
                                    元&nbsp;&nbsp;&nbsp;&nbsp;<span style="font-size: 13px; font-weight: bold; color: #999999">{{
                                        getRateOfReturn(
                                            scope.row.cost.sum,
                                            scope.row.data.daily[scope.row.data.daily.length - 1][4],
                                            scope.row.cost.total
                                        )
                                    }}</span
                                    >&nbsp;%</span
                                >
                            </el-progress>

                            <!-- {{ parseFloat((scope.row.cost.total / 1000).toFixed(2)) }} 張) -->
                        </div>

                        <div v-else>
                            <i class="el-icon-s-tools text-xl"></i>
                        </div>
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column label="買賣策略" width="240" align="center">
                <template #default="scope">
                    <el-button
                        size="small"
                        @click="doShowPolicy(scope.row.id)"
                        :style="[
                            scope.row.policy &&
                            scope.row.policy.settings &&
                            scope.row.policy.settings.buy &&
                            scope.row.policy.settings.sell &&
                            (scope.row.policy.settings.buy.length >= 1 || scope.row.policy.settings.sell.length >= 1)
                                ? { width: '235px' }
                                : {},
                            { 'text-align': 'left', 'line-height': '18px' },
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
                                                }}</span>
                                                次</el-tag
                                            ></el-col
                                        >
                                        <el-col :span="7" style="padding: 0 0 0 12px; text-align: left"
                                            ><span>&nbsp;年化報酬率</span></el-col
                                        >
                                        <el-col :span="5" style="padding: 0; text-align: right"
                                            ><el-tag class="ml-2" size="small" style="margin: 1px 0px"
                                                ><span style="font-size: 14px; font-weight: bold">{{
                                                    Number((scope.row.policy.stats.internal_of_return * 100).toFixed(1))
                                                }}</span>
                                                %</el-tag
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
                                                }}</span>
                                                天</el-tag
                                            >
                                        </el-col>

                                        <el-col :span="7" style="padding: 0 0 0 12px; text-align: left"
                                            ><span>&nbsp;每回報酬率</span></el-col
                                        >
                                        <el-col :span="5" style="padding: 0; text-align: right"
                                            ><span style="color: #4386f5; font-size: 14px">{{
                                                Number((scope.row.policy.stats.average_of_returns * 100).toFixed(1))
                                            }}</span>
                                            %</el-col
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
                                                }}</span>
                                                %</el-tag
                                            >
                                        </el-col>
                                        <el-col :span="7" style="padding: 0 0 0 12px; text-align: left"
                                            ><span>&nbsp;累積報酬率</span></el-col
                                        >
                                        <el-col :span="5" style="padding: 0; text-align: right"
                                            ><span style="color: #4386f5; font-size: 14px">{{
                                                Number((scope.row.policy.stats.sum_of_returns * 100).toFixed(1))
                                            }}</span>
                                            %</el-col
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
                                                }}</span>
                                                %</el-tag
                                            ></el-col
                                        >
                                        <el-col :span="7" style="padding: 0 0 0 12px; text-align: left"
                                            ><span>&nbsp;計算期間</span></el-col
                                        >
                                        <el-col :span="5" style="padding: 0; text-align: right"
                                            ><span style="color: #4386f5; font-size: 14px">{{
                                                Number(scope.row.policy.stats.diff_years.toFixed(1))
                                            }}</span>
                                            年
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
        <el-button style="margin-top: 10px" @click="doShowSearch()"><i class="el-icon-edit"></i>&nbsp;新增自選股</el-button>
        <el-button style="margin-top: 10px" @click="doShowExport()"><i class="el-icon-download"></i>&nbsp;匯出設定檔</el-button>
        <FormCost ref="childFormCost" />
        <FormPolicy ref="childFormPolicy" />
        <FormSearch ref="childFormSearch" />
        <FormExport ref="childFormExport" />
    </div>
</template>

<script>
import _ from 'lodash';
import ChartWeekKd from '../components/ChartWeekKd.vue';
import ChartWeekK from '../components/ChartWeekK.vue';
import FormCost from '../components/FormCost.vue';
import FormPolicy from '../components/FormPolicy.vue';
import FormSearch from '../components/FormSearch.vue';
import FormExport from '../components/FormExport.vue';
// This starter template is using Vue 3 experimental <script setup> SFCs
// Check out https://github.com/vuejs/rfcs/blob/script-setup-2/active-rfcs/0000-script-setup.md

export default {
    name: 'component-list',
    components: { ChartWeekKd, ChartWeekK, FormCost, FormPolicy, FormSearch, FormExport },
    data() {
        return {
            rateOfReturn: 0,
            historyData: [],
        };
    },
    computed: {
        stockList() {
            return this.$store.state.price.stockList;
        },
        progressMultiple() {
            return this.$store.getters.getProgressMultiple();
        },
    },
    created() {
        console.log('created');
        // 取得 localstorage 自選股，最先開始是 null 時，會給予預設值空矩陣
        const localStockList = JSON.parse(localStorage.getItem('stockList')) || [];
        // console.log(localStockList);

        // 將 stockList 預設的塞進到 localstorage
        // console.log(this.stockList);
        // const diffDefault = this.getDifference(this.stockList, localStockList); // 預設有，但本地沒有，則要新增
        // const diffLocal = this.getDifference(localStockList, this.stockList); // 本地有，但預設沒有，則要砍掉

        // 空時，或沒資料(有可能刪光)，就載入預設清單
        if (_.isEmpty(localStockList)) {
            localStockList.push(...this.stockList); // 新增 append 預設到 localStockList
            localStorage.setItem('stockList', JSON.stringify(localStockList)); // 將 localStockList 從 object 轉 string 後塞到 localstorage
            // console.log(diffLocal);
            // console.log(diffDefault);
            // console.log(localStockList);
            // console.log(this.stockList);

            // 將 localstorage 重塞回到 vuex 的 stockList
        }
        // localStockList 有可能是本地資料，或是預設資料。然後再呼叫載入 this.stockList
        this.$store.commit('SAVE_STOCK_LIST', localStockList);
    },
    mounted() {
        // 在 mounted() 事件時就可以發送，因為此時不須 data 及 computed 資料都準備好(因為沒有要data 參數，在create())

        this.$store.dispatch('GET_STOCK_PRICE');
    },
    methods: {
        getDifference(array1, array2) {
            return array1.filter((object1) => !array2.some((object2) => object1.id === object2.id));
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
        getReturn(sum, close, total) {
            return Number((close * total - sum).toFixed(2)).toLocaleString('en-US');
        },
        getRateOfReturn(sum, close, total) {
            if (!sum || sum === 0) return 0; // sum 等於0不能做為除法
            return Number((((close * total - sum) * 100) / sum).toFixed(2));
        },
        getRateOfReturnPercent(sum, close, total) {
            if (!sum || sum === 0) return 0; // sum 等於0不能做為除法
            //* 4 則最大值為25%。 * 2 則最大值為50%。 * 1 則最大值為100%。 0.6%最大值為166% 0.5最大值為200%  0.2 最大值為500% 0.1 最大值為1000%
            return Math.abs(Number((((close * total - sum) * 100) / sum).toFixed(2))) * this.progressMultiple;
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
#app
    font-family: Avenir, Helvetica, Arial, sans-serif
    -webkit-font-smoothing: antialiased
    -moz-osx-font-smoothing: grayscale
    /* text-align: center; */
    color: #2c3e50
    /* margin-top: 60px; */

.el-menu-item,
.el-submenu__title
    height: 40px !important
    line-height: 40px !important

.el-menu-item.is-active
    /* font-size: 16px; */
    /* background-color: #f28b82 !important; */
    /* background-color: #ffcc9c !important; */
    background-color: #e5e5e5 !important
    color: black !important
    border-radius: 3px
    // box-shadow: 0 2px 4px 0 rgb(0 0 0 / 12%), 0 0 6px 0 rgb(0 0 0 / 4%)

.el-menu-item.is-active [class*="el-icon-"]
    color: #F56C6C
// 為了讓highchart圖更不會佔td
.el-tabs--border-card>.el-tabs__content
    padding: 0px

.el-table__header tr, .el-table__header th
    padding: 0
    height: 15px
.el-table .el-table__body .el-table_1_column_2
    padding-right: 10px
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
    top: 0px
    right: calc(0px + var(--el-badge-size) / 2)
</style>
