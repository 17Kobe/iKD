<template>
    <el-drawer :title="title" @closed="onClosed()" v-model="isShow" :show-close="true" direction="rtl" size="85%">
        <el-form ref="formPolicyBuyRef" :model="form.buy">
            <el-button type="success" size="small" @click="onOptimizePolicy" style="margin-left: 10px">
                <i class="el-icon-magic-stick"></i>&nbsp;最佳參數
            </el-button>

            <el-button type="primary" size="small" @click="onExportFeature" style="margin-left: 5px">
                <i class="el-icon-download"></i>&nbsp;匯出訓練特徵檔
            </el-button>

            <div style="font-size: 24px; margin: 0px 10px 10px">買進策略</div>

            <el-row v-for="(item, index) in form.buy" :key="index">
                <el-col :xs="12" :sm="6" :md="4" :lg="5" :xl="3" style="padding-left: 3px">
                    <el-form-item>
                        <el-select size="small" v-model="item.method" @change="onChangeBuyMethod($event, index)">
                            <el-option v-for="item in buyOptions" :key="item.value" :label="item.label" :value="item.value">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :xs="8" :sm="6" :md="5" :lg="4" :xl="2" style="padding-left: 3px; position: relative; top: 4px">
                    <el-form-item>
                        <el-date-picker
                            v-if="typeof item.limit === 'object'"
                            v-model="item.limit"
                            size="small"
                            type="date"
                            placeholder="選擇日期"
                            style="vertical-align: top; width: 100%"
                        >
                        </el-date-picker>
                        <el-input
                            v-else
                            size="small"
                            v-model="item.limit"
                            placeholder="ex: 33.43"
                            :ref="`method_buy_${index}`"
                            type="number"
                            inputmode="numeric"
                            @focus="$event.target.select()"
                        >
                            <template #suffix
                                ><span style="font-size: 10px; position: relative; left: 2px; top: 8px">{{
                                    item.limit_desc
                                }}</span></template
                            >
                            <template #prepend>限制</template>
                        </el-input>
                    </el-form-item>
                </el-col>
                <!-- <el-col :xs="2" :sm="6" :md="5" :lg="5" :xl="3" style="margin: 9px 2px">
                    
                </el-col> -->
                <el-col :xs="4" :sm="6" :md="3" :lg="2" :xl="1" style="display: flex; align-items: center; padding-left: 7px">
                    <el-button size="small" type="danger" @click="onDelBuy(index)"><i class="el-icon-minus"></i></el-button
                ></el-col>
            </el-row>

            <el-form-item>
                <el-button type="primary" size="small" @click="onAddBuy" style="margin-left: 5px"
                    ><i class="el-icon-plus"></i>&nbsp;新增買進策略</el-button
                >
            </el-form-item>
        </el-form>

        <el-form ref="formPolicySellRef" :model="form.sell">
            <div style="font-size: 24px; margin: 0px 10px 10px">賣出策略</div>

            <el-row v-for="(item, index) in form.sell" :key="index">
                <el-col :xs="12" :sm="6" :md="4" :lg="5" :xl="3" style="padding-left: 3px">
                    <el-form-item>
                        <el-select
                            size="small"
                            multiple-limit="10"
                            v-model="item.method"
                            @change="onChangeSellMethod($event, index)"
                        >
                            <el-option v-for="item in sellOptions" :key="item.value" :label="item.label" :value="item.value">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :xs="8" :sm="6" :md="5" :lg="4" :xl="2" style="padding-left: 3px; position: relative; top: 4px">
                    <el-form-item>
                        <el-date-picker
                            v-if="typeof item.limit === 'object'"
                            v-model="item.limit"
                            size="small"
                            type="date"
                            placeholder="選擇日期"
                            style="vertical-align: top; width: 100%"
                        >
                        </el-date-picker>
                        <el-input
                            v-else
                            size="small"
                            v-model="item.limit"
                            placeholder="ex: 33.43"
                            :ref="`method_buy_${index}`"
                            type="number"
                            inputmode="numeric"
                            @focus="$event.target.select()"
                        >
                            <template #suffix
                                ><span style="font-size: 10px; position: relative; left: 2px; top: 8px">{{
                                    item.limit_desc
                                }}</span></template
                            >
                            <template #prepend>限制</template>
                        </el-input>
                    </el-form-item>
                </el-col>
                <el-col :xs="4" :sm="6" :md="3" :lg="2" :xl="1" style="display: flex; align-items: center; padding-left: 7px">
                    <el-button size="small" type="danger" @click="onDelSell(index)"><i class="el-icon-minus"></i></el-button
                ></el-col>
            </el-row>

            <el-form-item>
                <el-button type="primary" size="small" @click="onAddSell" style="margin-left: 5px"
                    ><i class="el-icon-plus"></i>&nbsp;新增賣出策略</el-button
                >
            </el-form-item>
        </el-form>
    </el-drawer>
</template>

<script>
import _ from 'lodash';
import moment from 'moment';
import { ElMessageBox, ElMessage } from 'element-plus';

export default {
    name: 'component-form-policy',
    data() {
        return {
            stockId: null,
            isShow: false,
            title: '設定成本',
            stockData: {},
            costList: [],
            // totalNumber: 0,
            form: { buy: [], sell: [] },
            buyOptions: [
                {
                    value: 'kd_gold',
                    label: '週 KD 黃金交叉',
                    default_limit: 40,
                    default_limit_desc: '以下',
                },
                {
                    value: 'kd_turn_up',
                    label: '週 KD 往上轉折',
                    default_limit: 40,
                    default_limit_desc: '以下',
                },
                {
                    value: 'kd_w',
                    label: '週 KD 形成 W 底',
                    default_limit: 2,
                    default_limit_desc: '個底以上',
                },
                {
                    value: 'rsi_over_sold',
                    label: '週 RSI 超賣',
                    default_limit: 5,
                    default_limit_desc: '以下',
                },
                {
                    value: 'rsi_turn_up',
                    label: '週 RSI 往上轉折',
                    default_limit: 10,
                    default_limit_desc: '以下',
                },
                // {
                //     value: 'ma_buy',
                //     label: '搭配 MA 均線',
                //     default_limit: 14,
                //     default_limit_desc: '日之上', // 均線之下或均線之上，先做均線之上好了
                // },
                {
                    value: 'previous_buy_down',
                    label: '搭配 前買價跌超過',
                    default_limit: 5,
                    default_limit_desc: '% 以上',
                },
                {
                    value: 'cost_down',
                    label: '搭配 成本價跌超過',
                    default_limit: 5,
                    default_limit_desc: '% 以上',
                },
                {
                    value: 'annual_fixed_date_buy',
                    label: '每年固定日買',
                    default_limit: '10/01',
                    default_limit_desc: '買',
                },
                // {
                //     value: 'fixed_Date',
                //     label: '每年固定日期',
                //     default_limit: '2021-10-28',
                //     default_limit_desc: '',
                // },
            ],
            sellOptions: [
                {
                    value: 'kd_dead',
                    label: '週 KD 死亡交叉',
                    default_limit: 80,
                    default_limit_desc: '以上',
                },
                {
                    value: 'kd_turn_down',
                    label: '週 KD 往下轉折',
                    default_limit: 80,
                    default_limit_desc: '以上',
                },
                {
                    value: 'kd_m',
                    label: '週 KD 形成 M 頭',
                    default_limit: 2,
                    default_limit_desc: '個頭以上',
                },
                {
                    value: 'rsi_over_bought',
                    label: '週 RSI 超買',
                    default_limit: 95,
                    default_limit_desc: '以上',
                },
                {
                    value: 'rsi_turn_down',
                    label: '週 RSI 往下轉折',
                    default_limit: 90,
                    default_limit_desc: '以上',
                },
                // {
                //     value: 'ma_sell',
                //     label: '搭配 MA 均線',
                //     default_limit: 14,
                //     default_limit_desc: '日之下', // 均線之下或均線之上，先做均線之上好了
                // },
                {
                    value: 'earn',
                    label: '搭配 絕對正報酬',
                    default_limit: 0,
                    default_limit_desc: '% 以上',
                },
                {
                    value: 'take_profit',
                    label: '停利',
                    default_limit: '10',
                    default_limit_desc: '%',
                },
                {
                    value: 'previous_sell_up',
                    label: '搭配 前賣價漲超過',
                    default_limit: 5,
                    default_limit_desc: '% 以上',
                },
                {
                    value: 'stop_loss',
                    label: '停損',
                    default_limit: '10',
                    default_limit_desc: '%',
                },
                {
                    value: 'annual_fixed_date_sell',
                    label: '每年固定日賣',
                    default_limit: '5/01',
                    default_limit_desc: '賣',
                },
            ],
        };
    },
    computed: {},
    mounted() {},
    methods: {
        onAddBuy() {
            console.log('onAddBuy');

            // 預設是 push 第0那一個值
            // 如果 0 有找到就變1，1有找到就變2...依序下去，全部都有找到就0

            let foundIndex = 0;
            // for 每個 option
            const { form } = this;
            this.buyOptions.some((item, index) => {
                // 如果沒找到就用
                if (_.findLastIndex(form.buy, { method: item.value }) === -1) {
                    foundIndex = index;
                    return true;
                }
            });
            // value: 'kd_gold',
            // label: '週 KD 黃金交叉',
            const index = this.form.buy.push({
                method: this.buyOptions[foundIndex].value,
                label: this.buyOptions[foundIndex].label, // 前端顯示用，非 selected value用
                limit: this.buyOptions[foundIndex].default_limit,
                limit_desc: this.buyOptions[foundIndex].default_limit_desc,
            });
            // nextTick()會在DOM已掛載、渲染完成後，執行nextTick()內的程式碼
            // https://stackoverflow.com/questions/59749325/vue-set-focus-to-dynamic-input-box
            // this.$nextTick(() => {
            //     this.$refs[`method_buy_${index - 1}`][0].focus();
            // });
        },
        onAddSell() {
            console.log('onAddSell');

            // 預設是 push 第0那一個值
            // 如果 0 有找到就變1，1有找到就變2...依序下去，全部都有找到就0

            let foundIndex = 0;
            // for 每個 option
            const { form } = this;
            this.sellOptions.some((item, index) => {
                // 如果沒找到就用
                if (_.findLastIndex(form.sell, { method: item.value }) === -1) {
                    foundIndex = index;
                    return true;
                }
            });
            // value: 'kd_gold',
            // label: '週 KD 黃金交叉',
            const index = this.form.sell.push({
                method: this.sellOptions[foundIndex].value,
                label: this.sellOptions[foundIndex].label, // 前端顯示用，非 selected value用
                limit: this.sellOptions[foundIndex].default_limit,
                limit_desc: this.sellOptions[foundIndex].default_limit_desc,
            });
            // console.log(index);
            // nextTick()會在DOM已掛載、渲染完成後，執行nextTick()內的程式碼
            // https://stackoverflow.com/questions/59749325/vue-set-focus-to-dynamic-input-box
            // this.$nextTick(() => {
            //     this.$refs[`method_buy_${index - 1}`][0].focus();
            // });
        },
        onDelBuy(index) {
            ElMessageBox.confirm(`將要刪除 [${this.form.buy[index].label}] 此買進策略?`, '確定', {
                confirmButtonText: '確定',
                cancelButtonText: '取消',
                type: 'warning',
            })
                .then(() => {
                    this.form.buy.splice(index, 1);
                    ElMessage({
                        type: 'success',
                        message: '完成刪除!',
                    });
                })
                .catch(() => {
                    ElMessage({
                        type: 'info',
                        message: '取消刪除!',
                    });
                });
        },
        onDelSell(index) {
            ElMessageBox.confirm(`將要刪除 [${this.form.sell[index].label}] 此賣出策略?`, '確定', {
                confirmButtonText: '確定',
                cancelButtonText: '取消',
                type: 'warning',
            })
                .then(() => {
                    this.form.sell.splice(index, 1);
                    ElMessage({
                        type: 'success',
                        message: '完成刪除!',
                    });
                })
                .catch(() => {
                    ElMessage({
                        type: 'info',
                        message: '取消刪除!',
                    });
                });
        },
        onChangeBuyMethod(selValue, index) {
            // console.log(selValue);
            // console.log(index);
            // 用選到的 method 先找到 value，再去看其它值設進去
            const found = _.find(this.buyOptions, ['value', selValue]);

            // 若有包括 /，則要轉成 日期格式
            let limit = found.default_limit;
            if (typeof limit === 'string' && limit.includes('/')) {
                const year = moment().year();
                const newDateString = `${year}/${limit}`;
                limit = moment(newDateString, 'YYYY/MM/DD');
            }

            this.form.buy[index].label = found.label;
            this.form.buy[index].limit = limit;
            this.form.buy[index].limit_desc = found.default_limit_desc;
        },
        onChangeSellMethod(selValue, index) {
            // console.log(selValue);
            // console.log(index);
            // 用選到的 method 先找到 value，再去看其它值設進去
            const found = _.find(this.sellOptions, ['value', selValue]);

            // 若有包括 /，則要轉成 日期格式
            let limit = found.default_limit;
            if (typeof limit === 'string' && limit.includes('/')) {
                const year = moment().year();
                const newDateString = `${year}/${limit}`;
                limit = moment(newDateString, 'YYYY/MM/DD');
            }

            this.form.sell[index].label = found.label;
            this.form.sell[index].limit = limit;
            this.form.sell[index].limit_desc = found.default_limit_desc;
        },
        onInit(stockId) {
            console.log('onInit');
            this.stockId = stockId;
            this.isShow = true;
            // getters 在 vuex 只有在全域，沒有在個別 module，所以不用加 stock
            this.stockData = this.$store.getters.getStock(stockId); // 因為 computed 是在網頁開啟時就跑了，那時還沒有id就會變成沒過濾全都取了。為了在點擊設定才去取，所以要這樣
            // eslint-disable-next-line prefer-destructuring
            this.title = `${this.stockData.name}(${this.stockData.id}) 設定買賣策略`;

            // 深拷貝，不然一直畫KD的橫線
            if (_.has(this.stockData, 'policy.settings')) {
                this.form = _.cloneDeep(this.stockData.policy.settings);
                _.forEach([...this.form.buy, ...this.form.sell], (item) => {
                    if (item.method === 'annual_fixed_date_buy' || item.method === 'annual_fixed_date_sell') {
                        const year = moment().year();
                        const newDateString = `${year}/${item.limit}`;
                        item.limit = moment(newDateString, 'YYYY/MM/DD');
                    }
                });
            } else this.form = { buy: [], sell: [] };

            // this.$nextTick(() => {
            // this.$refs.cost0[0].focus();
            // });
        },

        async onOptimizePolicy() {
            const stockId = this.stockId;
            let bestParams = null;
            let bestReturn = -Infinity;
            let bestPolicy = null;

            for (let kdGold = 60; kdGold >= 24; kdGold -= 3) {
                for (let kdDead = 65; kdDead <= 92; kdDead += 3) {
                    for (let rsiOverBought = 85; rsiOverBought <= 97; rsiOverBought += 3) {
                        try {
                            await this.tryPolicy(
                                stockId,
                                kdGold,
                                kdDead,
                                rsiOverBought,
                                async (params, unitReturn, numberOfBuy, numberOfSell, minBuyCount, minSellCount, policyList) => {
                                    if (unitReturn > bestReturn && numberOfBuy >= minBuyCount && numberOfSell >= minSellCount) {
                                        bestReturn = unitReturn;
                                        bestParams = { ...params };
                                        bestPolicy = _.cloneDeep(policyList);
                                        // 立即印出
                                        console.log(
                                            `目前最佳報酬率: ${bestReturn}（最佳參數: KD黃金交叉≤${
                                                bestParams?.kdGold ?? '-'
                                            }，KD死亡交叉≥${bestParams?.kdDead ?? '-'}，RSI超買≥${
                                                bestParams?.rsiOverBought ?? '-'
                                            })`
                                        );

                                        // 細部搜尋（步進1）只針對這組附近
                                        for (
                                            let kdGold2 = Math.max(25, params.kdGold - 2);
                                            kdGold2 <= Math.min(60, params.kdGold + 2);
                                            kdGold2++
                                        ) {
                                            for (
                                                let kdDead2 = Math.max(65, params.kdDead - 2);
                                                kdDead2 <= Math.min(90, params.kdDead + 2);
                                                kdDead2++
                                            ) {
                                                for (
                                                    let rsi2 = Math.max(85, params.rsiOverBought - 2);
                                                    rsi2 <= Math.min(97, params.rsiOverBought + 2);
                                                    rsi2++
                                                ) {
                                                    // 跳過自己
                                                    if (
                                                        kdGold2 === params.kdGold &&
                                                        kdDead2 === params.kdDead &&
                                                        rsi2 === params.rsiOverBought
                                                    )
                                                        continue;
                                                    try {
                                                        await this.tryPolicy(
                                                            stockId,
                                                            kdGold2,
                                                            kdDead2,
                                                            rsi2,
                                                            (
                                                                params2,
                                                                unitReturn2,
                                                                numberOfBuy2,
                                                                numberOfSell2,
                                                                minBuyCount2,
                                                                minSellCount2,
                                                                policyList2
                                                            ) => {
                                                                if (
                                                                    unitReturn2 > bestReturn &&
                                                                    numberOfBuy2 >= minBuyCount2 &&
                                                                    numberOfSell2 >= minSellCount2
                                                                ) {
                                                                    bestReturn = unitReturn2;
                                                                    bestParams = { ...params2 };
                                                                    bestPolicy = _.cloneDeep(policyList2);
                                                                    // 細部搜尋也即時印出
                                                                    console.log(
                                                                        `目前最佳報酬率: ${bestReturn}（最佳參數: KD黃金交叉≤${
                                                                            bestParams?.kdGold ?? '-'
                                                                        }，KD死亡交叉≥${bestParams?.kdDead ?? '-'}，RSI超買≥${
                                                                            bestParams?.rsiOverBought ?? '-'
                                                                        })`
                                                                    );
                                                                }
                                                            }
                                                        );
                                                    } catch (e) {
                                                        console.error(
                                                            `細部搜尋錯誤: KD黃金交叉≤${kdGold2}，KD死亡交叉≥${kdDead2}，RSI超買≥${rsi2}`,
                                                            e
                                                        );
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            );
                        } catch (e) {
                            console.error(
                                `tryPolicy 發生錯誤: KD黃金交叉≤${kdGold}，KD死亡交叉≥${kdDead}，RSI超買≥${rsiOverBought}`,
                                e
                            );
                        }
                    }
                }
            }

            console.log('算完囉');

            // 設定最佳參數到表單
            if (bestPolicy) {
                this.form = bestPolicy;
                this.$message.success(
                    `最佳參數：KD黃金交叉≤${bestParams.kdGold}，KD死亡交叉≥${bestParams.kdDead}，RSI超買≥${
                        bestParams.rsiOverBought
                    }，單位報酬率${bestReturn.toFixed(2)}%`
                );
                console.log('※最佳參數', bestParams);
                console.log('※最佳單位報酬率', bestReturn);
            } else {
                this.$message.warning('找不到最佳參數組合');
            }
        },

        // 封裝策略計算與條件判斷
        async tryPolicy(stockId, kdGold, kdDead, rsiOverBought, cb) {
            const policyList = {
                buy: [
                    { method: 'kd_gold', label: '週 KD 黃金交叉', limit: kdGold, limit_desc: '以下' },
                    { method: 'kd_w', label: '週 KD 形成 W 底', limit: 2, limit_desc: '個底以上' },
                    { method: 'previous_buy_down', label: '搭配 前買價跌超過', limit: 5, limit_desc: '% 以上' },
                ],
                sell: [
                    { method: 'kd_dead', label: '週 KD 死亡交叉', limit: kdDead, limit_desc: '以上' },
                    { method: 'rsi_over_bought', label: '週 RSI 超買', limit: rsiOverBought, limit_desc: '以上' },
                    { method: 'previous_sell_up', label: '搭配 前賣價漲超過', limit: 5, limit_desc: '% 以上' },
                    { method: 'earn', label: '搭配 絕對正報酬', limit: 0, limit_desc: '% 以上' },
                ],
            };

            await this.$store.dispatch('APPLY_AND_WAIT_POLICY_RESULT', { stockId, policyList });
            const stock = this.$store.getters.getStock(stockId);
            const stats = stock?.policy?.stats;
            const unitReturn = stats?.unit_rate_of_return ?? -9999;
            const numberOfSell = stats?.number_of_sell ?? 0;
            const numberOfBuy = stats?.number_of_buy ?? 0;
            const duration = stats?.duration_from_first_weekly ?? 0; // 天數
            const star = stock?.star ?? 3; // 預設3星
            const name = stock?.name ?? '';

            let buyPeriod = 365;
            let sellPeriod = 547;
            // 中華電及卜蜂要特別處理，因為他們是3星要存股，但允許久一點再買， || (star === 3 && ['中華電', '卜蜂'].includes(name))
            if (star <= 2) {
                buyPeriod = 365 + 90; // 1.25年，可多3個月
                sellPeriod = 547; // 1.5年，2顆星不再延長因為會太久沒賣了
            }
            const minBuyCount = Math.max(0, Math.round(duration / buyPeriod) - 1); // //1年要買一次，四捨取整數。並給予少一次機會，因為有可能前1年還沒有機會買
            const minSellCount = Math.max(0, Math.round(duration / sellPeriod) - 1); //1年半要賣一次，四捨取整數。並給予少一次機會，因為有可能第沒有買就沒有賣，我是用daily來算

            // log
            console.log(
                `KD黃金交叉≤${kdGold}，KD死亡交叉≥${kdDead}，RSI超買≥${rsiOverBought}，單位報酬率: ${unitReturn}，買入次數: ${numberOfBuy} (min: ${minBuyCount})，賣出次數: ${numberOfSell} (min: ${minSellCount})`
            );

            await cb(
                { kdGold, kdDead, rsiOverBought },
                unitReturn,
                numberOfBuy,
                numberOfSell,
                minBuyCount,
                minSellCount,
                policyList
            );
        },

        onClosed() {
            // 將日期轉成 'MM/DD'，方便顯示及計算
            _.forEach([...this.form.buy, ...this.form.sell], (item) => {
                if (
                    (item.method === 'annual_fixed_date_buy' || item.method === 'annual_fixed_date_sell') &&
                    moment(item.limit).isValid()
                ) {
                    const newLimit = moment(item.limit).format('MM/DD');
                    item.limit = newLimit;
                }
            });

            this.$store.commit('SAVE_STOCK_POLICY', {
                stockId: this.stockId,
                policyList: this.form,
            });
        },
        // ...existing code...
        async onExportFeature() {
            // 先套用目前策略並等待計算完成
            console.log('onExportFeature1');
            try {
                const policyList = {
                    buy: [{ method: 'kd_gold', label: '週 KD 黃金交叉', limit: 50, limit_desc: '以下' }],
                    sell: [{ method: 'kd_dead', label: '週 KD 死亡交叉', limit: 50, limit_desc: '以上' }],
                };

                // 為了hash 有不同，所以多算這個
                await this.$store.dispatch('APPLY_AND_WAIT_POLICY_RESULT', {
                    stockId: this.stockId,
                    policyList: policyList,
                });

                await this.$store.dispatch('APPLY_AND_WAIT_POLICY_RESULT', {
                    stockId: this.stockId,
                    policyList: this.form,
                });
            } catch (e) {
                console.error('APPLY_AND_WAIT_POLICY_RESULT error', e);
            }
            console.log('onExportFeature2');

            // 重新取得最新 stockData
            this.stockData = this.$store.getters.getStock(this.stockId);

            // 反轉歷史
            const history = _.cloneDeep(this.stockData.policy.history).reverse();

            // 取得 tempStockList 中對應的 stock
            const tempStock = this.$store.getters.getTempStock(this.stockId);
            if (!tempStock) {
                this.$message.error('找不到 tempStock 資料');
                return;
            }

            // 轉成日期對應表
            const weeklyMap = Object.fromEntries(tempStock.data.weekly.map((arr) => [arr[0], arr]));
            const kdjMap = Object.fromEntries(tempStock.data.weekly_kdj.map((arr) => [arr[0], arr]));
            const maMap = Object.fromEntries(tempStock.data.weekly_ma.map((arr) => [arr[0], arr]));
            const rsiMap = Object.fromEntries(tempStock.data.weekly_rsi.map((arr) => [arr[0], arr]));

            const reasonPriority = ['kd_w', 'kd_gold', 'kd_dead', 'rsi_over_bought'];
            // 組合特徵
            const features = history
                .map((item) => {
                    // reason處理
                    let reasonStr = '';
                    if (Array.isArray(item.reason)) {
                        if (item.reason.length === 1) {
                            if (item.reason[0] === 'latest') return null; // 濾除
                            reasonStr = item.reason[0];
                        } else if (item.reason.length > 1) {
                            // 依優先權取
                            const found = reasonPriority.find((r) => item.reason.includes(r));
                            reasonStr = found || item.reason[0];
                        }
                    } else {
                        reasonStr = item.reason || '';
                    }

                    const date = item.date;
                    const weekly = weeklyMap[date] || [];
                    const kdj = kdjMap[date] || [];
                    const ma = maMap[date] || [];
                    const rsi = rsiMap[date] || [];

                    return {
                        date,
                        buy_or_sell: item.buy_or_sell,
                        reason: reasonStr,
                        price: item.price,
                        open: weekly[1] ?? null,
                        high: weekly[2] ?? null,
                        low: weekly[3] ?? null,
                        close: weekly[4] ?? null,
                        volume: weekly[5] ?? null,
                        k: kdj[1] ?? null,
                        d: kdj[2] ?? null,
                        j: kdj[3] ?? null,
                        ma5: ma[1] ?? null,
                        ma10: ma[2] ?? null,
                        ma20: ma[3] ?? null,
                        rsi: rsi[1] ?? null,
                    };
                })
                .filter(Boolean); // 濾除 reason 為 latest 的

            // 匯出成 JSON 檔案
            const blob = new Blob([JSON.stringify(features, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.stockData.id}_features.json`;
            a.click();
            URL.revokeObjectURL(url);
        },
    },
};
// 父傳子參考 https://its201.com/article/weixin_49035434/119852222 方法1，的emit似乎 vue 3有改語法而不行了。但方法2沒用 emit仍正常
</script>

<style lang="sass">
.el-form-item
    margin-bottom: 0px
.el-select .el-input--small .el-input__inner
    padding: 0 17px 0 4px
.el-input-group__prepend
    padding: 0 2px !important
.el-input--small.el-date-editor .el-input__inner
    padding: 0 17px 0 35px
</style>
