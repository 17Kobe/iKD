<template>
    <div>
        <el-row class="row-bg" justify="space-between" style="align-items: center; max-width: 650px">
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
                >
                    <span v-if="modeSpread === '歷史' && show5HistorySpreadData">5筆</span>
                    <span v-else-if="modeSpread === '歷史'">全部</span></el-link
                >
            </el-col>
            <el-col :span="13" style="margin-right: 4px">
                <el-tag
                    class="ml-2"
                    size="large"
                    style="margin: 5px 2px; padding: 0 4px; float: right"
                    :type="totalSpread >= 0 ? 'primary' : 'danger'"
                    >總計
                    <span style="font-size: 24px"> $ </span>
                    <span style="font-size: 28px; font-weight: bold">
                        <!-- <number :from="0" :to="totalSpread" :format="currencyFormat" :duration="1" :delay="0" easing="Power1.easeOut" /> -->
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
                <el-tag
                    size="small"
                    style="float: right; position: relative; left: 7px; top: 2px; padding: 0 2px; border-radius: 10px"
                    :type="totalRateOfReturn >= 0 ? 'danger' : 'success '"
                >
                    <span style="font-size: 14px"
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
                    ></span>
                    <span style="font-size: 14px; font-weight: bold">
                        <!-- <number :from="0" :to="totalSpread" :format="currencyFormat" :duration="1" :delay="0" easing="Power1.easeOut" /> -->
                        <number
                            :from="0"
                            :to="Math.abs(totalRateOfReturn)"
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

        <el-table :data="showSpreadList" style="width: 100%" empty-text="無資料">
            <el-table-column label="名稱" width="90" align="center" fixed>
                <template #default="scope">
                    <el-badge
                        :value="scope.row.badge"
                        class="item"
                        :class="[
                            scope.row.badge === '買' || scope.row.badge === '賣' ? 'shake-base' : '',
                            scope.row.name.length >= 6
                                ? 'l6'
                                : scope.row.name.length >= 5
                                ? 'l5'
                                : scope.row.name.length >= 4
                                ? 'l4'
                                : '',
                            ['item', 'signal'],
                        ]"
                        :type="scope.row.badge === '買' || scope.row.badge === '準買' ? 'danger' : 'success'"
                    >
                        {{ scope.row.name.replace('A2', '') }}
                    </el-badge>
                </template>
            </el-table-column>
            <el-table-column label="成本價" width="45" align="center">
                <template #default="scope">
                    <span>
                        {{
                            scope.row.cost.avg >= 100
                                ? Number(scope.row.cost.avg.toFixed(1))
                                : Number(scope.row.cost.avg.toFixed(2))
                        }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column :label="modeSpread === '目前' ? '現價' : '賣價'" prop="last_price" width="45" align="center">
            </el-table-column>
            <el-table-column label="本金&nbsp;" width="75" align="right" header-align="right">
                <template #default="scope">
                    <span> $ {{ scope.row.cost.sum.toLocaleString('en-US') }} </span>
                </template>
            </el-table-column>
            <el-table-column label="報酬率" width="53" align="right" header-align="right">
                <template #default="scope">
                    <span style="font-weight: bold; color: #a8a8a8"
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
                        class="ml-2"
                        size="small"
                        style="margin: 1px 0px"
                        :type="scope.row.cost.return >= 0 ? 'primary' : 'danger'"
                        ><span style="font-size: 14px; font-weight: bold">
                            $ {{ scope.row.cost.return === 0 ? 0 : scope.row.cost.return.toLocaleString('en-US') }}
                        </span></el-tag
                    >
                </template>
            </el-table-column>
            <el-table-column label="漲跌幅" width="80" align="right" header-align="right" v-if="modeSpread === '目前'">
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
            <el-table-column
                :label="modeSpread === '目前' ? '累積股數&nbsp;&nbsp;' : '賣出股數&nbsp;&nbsp;'"
                width="80"
                align="right"
                header-align="right"
            >
                <template #default="scope"> {{ scope.row.cost.total.toLocaleString('en-US') }} 股&nbsp;&nbsp; </template>
            </el-table-column>
            <el-table-column label="市值&nbsp;" width="75" align="right" header-align="right">
                <template #default="scope">
                    $ {{ (scope.row.cost.sum + scope.row.cost.return).toLocaleString('en-US') }}
                </template>
            </el-table-column>
            <el-table-column label="賣出日期" prop="sell_date" width="90" align="center" v-if="modeSpread === '歷史'">
            </el-table-column>
        </el-table>

        <!-- ================================ 股利 -->
        <el-row class="row-bg" justify="space-between" style="margin-top: 10px; align-items: center; max-width: 650px">
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
                >
                    <span
                        v-if="
                            (modeDividend === '未來' && show5FutureDividendData) ||
                            (modeDividend === '歷史' && show5HistoryDividendData)
                        "
                        >5筆</span
                    >
                    <span v-else>全部</span></el-link
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
                <template #default="scope"> {{ scope.row.number_of_shares.toLocaleString('en-US') }} 股 </template>
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

        <!-- ================================ 未買進的股票 -->
        <el-row class="row-bg" justify="space-between" style="margin-top: 17px; align-items: center">
            <el-col :span="11" style="margin-left: 6px; font-size: 18px; font-weight: bold">追蹤中</el-col>
        </el-row>

        <el-table :data="noBuyList" style="width: 100%" empty-text="無資料" class="i-table">
            <el-table-column label="名稱" width="130" align="center">
                <template #default="scope">
                    <el-badge
                        :value="scope.row.badge"
                        class="item"
                        :class="[
                            scope.row.badge === '買' || scope.row.badge === '賣' ? 'shake-base' : '',
                            ['item', 'signal', 'signal-pos'],
                        ]"
                        :type="scope.row.badge === '買' || scope.row.badge === '準買' ? 'danger' : 'success'"
                    >
                        {{ scope.row.name.replace('A2', '') }}
                    </el-badge>
                </template>
            </el-table-column>
            <el-table-column label="現價" prop="last_price" width="45" align="right" header-align="right"> </el-table-column>
            <el-table-column label="漲跌幅" width="80" align="right" header-align="right">
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
        </el-table>

        <br /><br />
        <br /><br />
    </div>
</template>

<script>
// import _ from 'lodash';
//
// This starter template is using Vue 3 experimental <script setup> SFCs
// Check out https://github.com/vuejs/rfcs/blob/script-setup-2/active-rfcs/0000-script-setup.md

export default {
    name: 'component-dividend',
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
        noBuyList() {
            return this.$store.getters.getNoBuyList();
        },
        totalSpread() {
            return this.spreadList.reduce((acc, { cost }) => acc + cost.return, 0);
        },
        totalRateOfReturn() {
            return this.totalSpread == 0
                ? 0
                : (this.totalSpread * 100) / this.spreadList.reduce((acc, { cost }) => acc + cost.sum, 0);
        },
        totalDividend() {
            return this.dividendList.reduce(
                (acc, { number_of_shares, earnings_distribution }) => acc + Math.round(number_of_shares * earnings_distribution),
                0
            );
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
        this.$store.dispatch('GET_DIVIDEND');
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

// 使用 element plus  beta版在用 table 時 cell 有時最後一列的第一欄會有一半高度的白色區塊會擋住
.el-table__fixed
    height: 100%!important

.el-radio-button__original-radio:checked+.el-radio-button__inner
    font-weight: bold
</style>
