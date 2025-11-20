<template>
    <el-drawer :title="title" @closed="onClosed()" v-model="isShow" :show-close="true" direction="rtl" size="85%">
        <el-form ref="formPolicyBuyRef" :model="form.buy">
            <div style="margin-bottom: 10px">
                <el-button type="success" size="small" @click="onOptimizePolicyStep3" style="margin-left: 10px">
                    <i class="el-icon-magic-stick"></i>&nbsp;參數+3(快速掃描)
                </el-button>

                <el-button type="success" size="small" @click="onOptimizePolicyStep1" style="margin-left: 10px">
                    <i class="el-icon-cpu"></i>&nbsp;參數+1(完美掃描；範圍是目前策略的±4)
                </el-button>

                <!-- 新增按鈕：每年固定日買賣最佳化 -->
                <el-button type="primary" size="small" @click="onOptimizeAnnualFixedDate" style="margin-left: 10px">
                    <i class="el-icon-date"></i>&nbsp;每年固定日買最佳化
                </el-button>
                <!-- 新增：每年固定日賣最佳化 -->
                <el-button type="primary" size="small" @click="onOptimizeAnnualFixedDateSell" style="margin-left: 10px">
                    <i class="el-icon-date"></i>&nbsp;每年固定日賣最佳化
                </el-button>
            </div>
            <div style="margin-bottom: 10px">
                <el-button type="warning" size="small" @click="onExportFeature" style="margin-left: 10px">
                    <i class="el-icon-download"></i>&nbsp;匯出訓練特徵檔
                </el-button>
            </div>

            <!-- 星星評級顯示 -->
            <div style="margin-bottom: 20px; margin-left: 10px">
                <span style="font-size: 16px; margin-right: 10px">星級評等：</span>
                <el-rate
                    :model-value="stockStar"
                    size="small"
                    :max="3"
                    disabled
                    style="display: inline-block; margin-right: 15px"
                />
                <span style="font-size: 14px; color: #666">
                    {{ starDescription }}
                </span>
            </div>

            <!-- 分批賣出設定 -->
            <div v-if="stockStar >= 1" style="margin-bottom: 20px; margin-left: 10px">
                <div style="font-size: 16px; margin-bottom: 10px">分批賣出設定：</div>
                <el-row :gutter="10">
                    <el-col :xs="12" :sm="8" :md="6" :lg="5" :xl="3" style="padding-left: 3px">
                        <el-form-item label="首次賣出比例">
                            <el-select v-model="form.sell1_ratio" size="small" style="width: 100%">
                                <el-option label="全部 (100%)" :value="1"></el-option>
                                <el-option label="1/2 (50%)" :value="2"></el-option>
                                <el-option label="1/3 (33%)" :value="3"></el-option>
                                <el-option label="1/4 (25%)" :value="4"></el-option>
                                <el-option label="1/5 (20%)" :value="5"></el-option>
                                <el-option label="1/6 (17%)" :value="6"></el-option>
                                <el-option label="1/7 (14%)" :value="7"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :xs="12" :sm="8" :md="6" :lg="5" :xl="3" style="padding-left: 3px">
                        <el-form-item label="再次賣出比例">
                            <el-select v-model="form.sell2_ratio" size="small" style="width: 100%">
                                <el-option label="全部 (100%)" :value="1"></el-option>
                                <el-option label="1/2 (50%)" :value="2"></el-option>
                                <el-option label="1/3 (33%)" :value="3"></el-option>
                                <el-option label="1/4 (25%)" :value="4"></el-option>
                                <el-option label="1/5 (20%)" :value="5"></el-option>
                                <el-option label="1/6 (17%)" :value="6"></el-option>
                                <el-option label="1/7 (14%)" :value="7"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
            </div>
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
            saveTimeout: null,
            // totalNumber: 0,
            form: { buy: [], sell: [], sell1_ratio: 3, sell2_ratio: 2 },
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
    computed: {
        currentStock() {
            return this.stockData || {};
        },
        stockStar() {
            return this.stockData && 'star' in this.stockData ? this.stockData.star : 3;
        },
        starDescription() {
            const star = this.stockStar;
            const starText = star === 3 ? '3顆星' : star === 2 ? '2顆星' : '1顆星';

            // 獲取當前的分批賣出設定
            const sell1_ratio = this.form.sell1_ratio || (star === 3 ? 3 : star === 2 ? 2 : 1);
            const sell2_ratio = this.form.sell2_ratio || (star === 3 ? 2 : star === 2 ? 1 : 1);

            const sell1_symbol = this.getUnitSymbol(1 / sell1_ratio);
            const sell2_symbol = this.getUnitSymbol(1 / sell2_ratio);

            // 根據新規則判斷存股類型
            let stockType;
            if (sell1_ratio === 1) {
                stockType = '不存股';
            } else if (sell1_ratio !== 1 && sell2_ratio === 1) {
                stockType = '半存股';
            } else {
                stockType = '存股';
            }

            if (sell1_ratio === 1 && sell2_ratio === 1) {
                return `${starText}：${stockType}，有賣時全賣`;
            } else {
                return `${starText}：${stockType}，有賣時先賣${sell1_symbol}，再有賣時再賣${sell2_symbol}`;
            }
        },
        // 根據星級獲取預設的分批賣出比例
        getDefaultSellRatios() {
            const star = this.stockStar;
            switch (star) {
                case 1:
                    return { sell1_ratio: 1, sell2_ratio: 1 }; // 1星：全部,全部
                case 2:
                    return { sell1_ratio: 2, sell2_ratio: 1 }; // 2星：1/2,全部
                case 3:
                    return { sell1_ratio: 3, sell2_ratio: 2 }; // 3星：1/3,1/2
                default:
                    return { sell1_ratio: 1, sell2_ratio: 1 };
            }
        },
    },
    watch: {
        // 已移除 selection 變更時的自動儲存，改為在 onClosed 統一儲存
    },
    mounted() {},
    beforeUnmount() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
    },
    methods: {
        getUnitSymbol(unit) {
            if (!unit || unit === 1) return '';

            // 處理常見的分數值，考慮浮點數精度問題
            if (Math.abs(unit - 0.5) < 0.01) return '½';
            if (Math.abs(unit - 1 / 3) < 0.01) return '⅓';
            if (Math.abs(unit - 0.25) < 0.01) return '¼';
            if (Math.abs(unit - 0.2) < 0.01) return '⅕';
            if (Math.abs(unit - 1 / 6) < 0.01) return '⅙';
            if (Math.abs(unit - 1 / 7) < 0.01) return '⅐';

            // 對於其他值，顯示百分比
            return `${Math.round(unit * 100)}%`;
        },
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

            // 取得預設比例
            const defaultRatios = this.getDefaultSellRatios;

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

                // 從資料庫讀取分批賣出設定，若無則使用預設值並保存
                let needSave = false;
                if (this.form.sell1_ratio === undefined || this.form.sell1_ratio === null) {
                    this.form.sell1_ratio = defaultRatios.sell1_ratio;
                    needSave = true;
                }
                if (this.form.sell2_ratio === undefined || this.form.sell2_ratio === null) {
                    this.form.sell2_ratio = defaultRatios.sell2_ratio;
                    needSave = true;
                }

                // 如果設定了新的預設值，立即保存到資料庫
                if (needSave) {
                    this.$nextTick(() => {
                        this.saveSellRatios();
                    });
                }
            } else {
                this.form = {
                    buy: [],
                    sell: [],
                    sell1_ratio: defaultRatios.sell1_ratio,
                    sell2_ratio: defaultRatios.sell2_ratio,
                };
                // 新建的策略設定，立即保存預設值到資料庫
                this.$nextTick(() => {
                    this.saveSellRatios();
                });
            }

            // this.$nextTick(() => {
            // this.$refs.cost0[0].focus();
            // });
        },

        async onOptimizePolicyStep1() {
            const stockId = this.stockId;
            let bestParams = null;
            let bestReturn = -Infinity;
            let bestPolicy = null;

            // 取得目前設定
            const buy = this.form.buy.find((item) => item.method === 'kd_gold');
            const sellKD = this.form.sell.find((item) => item.method === 'kd_dead');
            const sellRSI = this.form.sell.find((item) => item.method === 'rsi_over_bought');
            const kdGoldBase = buy ? Number(buy.limit) : 50;
            const kdDeadBase = sellKD ? Number(sellKD.limit) : 80;
            const rsiOverBoughtBase = sellRSI ? Number(sellRSI.limit) : 95;

            for (let kdGold = kdGoldBase + 4; kdGold >= kdGoldBase - 4; kdGold--) {
                for (let kdDead = kdDeadBase - 4; kdDead <= kdDeadBase + 4; kdDead++) {
                    for (let rsiOverBought = rsiOverBoughtBase - 3; rsiOverBought <= rsiOverBoughtBase + 3; rsiOverBought++) {
                        if (rsiOverBought > 97) break;
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

        async onOptimizePolicyStep2() {
            const stockId = this.stockId;
            let bestParams = null;
            let bestReturn = -Infinity;
            let bestPolicy = null;

            // 參數範圍
            const kdGoldStart = 60,
                kdGoldEnd = 30;
            const kdDeadStart = 63,
                kdDeadEnd = 90;
            const rsiStart = 85,
                rsiEnd = 97;

            // 計算總組合數（每2步一格）
            const total =
                (Math.floor((kdGoldStart - kdGoldEnd) / 2) + 1) *
                (Math.floor((kdDeadEnd - kdDeadStart) / 2) + 1) *
                (Math.floor((rsiEnd - rsiStart) / 2) + 1);
            let count = 0;

            for (let kdGold = kdGoldStart; kdGold >= kdGoldEnd; kdGold -= 2) {
                for (let kdDead = kdDeadStart; kdDead <= kdDeadEnd; kdDead += 2) {
                    for (let rsiOverBought = rsiStart; rsiOverBought <= rsiEnd; rsiOverBought += 2) {
                        count++;
                        const percent = ((count / total) * 100).toFixed(2);

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

                                        // 只存最佳解
                                        const best = {
                                            percent,
                                            params: bestParams,
                                            bestReturn,
                                        };
                                        localStorage.setItem('ikd_optimize_best', JSON.stringify(best));

                                        // console.log 顯示 percent
                                        console.log(
                                            `進度: ${percent}%｜目前最佳報酬率: ${bestReturn}（最佳參數: KD黃金交叉≤${
                                                bestParams?.kdGold ?? '-'
                                            }，KD死亡交叉≥${bestParams?.kdDead ?? '-'}，RSI超買≥${
                                                bestParams?.rsiOverBought ?? '-'
                                            }）`
                                        );

                                        // 回頭補算：只補主迴圈沒算過的鄰近點（±1）
                                        for (let g = kdGold + 1; g >= kdGold; g--) {
                                            // console.log(
                                            //     `細部搜尋1：KD黃金交叉≤${g}，KD死亡交叉≥${kdDead}，RSI超買≥${rsiOverBought}`
                                            // );
                                            // if (g < kdGoldEnd || g > kdGoldStart) continue;
                                            for (let d = kdDead - 1; d <= kdDead; d++) {
                                                // console.log(
                                                //     `細部搜尋2：KD黃金交叉≤${g}，KD死亡交叉≥${d}，RSI超買≥${rsiOverBought}`
                                                // );
                                                // if (d < kdDeadStart || d > kdDeadEnd) continue;
                                                for (let r = rsiOverBought - 1; r <= rsiOverBought; r++) {
                                                    // console.log(`細部搜尋3：KD黃金交叉≤${g}，KD死亡交叉≥${d}，RSI超買≥${r}`);
                                                    // if (r < rsiStart || r > rsiEnd) continue;
                                                    // 跳過主迴圈本身
                                                    if (g === kdGold && d === kdDead && r === rsiOverBought) continue;

                                                    // 跳過主迴圈已算過的（每2步一格）
                                                    // if (
                                                    //     (g - kdGoldEnd) % 2 === 0 &&
                                                    //     (d - kdDeadStart) % 2 === 0 &&
                                                    //     (r - rsiStart) % 2 === 0
                                                    // )
                                                    //     continue;
                                                    // console.log(`細部搜尋4：KD黃金交叉≤${g}，KD死亡交叉≥${d}，RSI超買≥${r}`);

                                                    await this.tryPolicy(
                                                        stockId,
                                                        g,
                                                        d,
                                                        r,
                                                        (
                                                            params2,
                                                            unitReturn2,
                                                            numberOfBuy2,
                                                            numberOfSell2,
                                                            minBuyCount2,
                                                            minSellCount2,
                                                            policyList2
                                                        ) => {
                                                            // 進入細部搜尋就印出
                                                            // console.log(
                                                            //     `【細部搜尋】KD黃金交叉≤${g}，KD死亡交叉≥${d}，RSI超買≥${r}，單位報酬率: ${unitReturn2}，買入次數: ${numberOfBuy2} (min: ${minBuyCount2})，賣出次數: ${numberOfSell2} (min: ${minSellCount2})`
                                                            // );
                                                            console.log(`【細部搜尋比較】`);
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
                                                                    `【細部搜尋最佳】進度: ${percent}%｜目前最佳報酬率: ${bestReturn}（最佳參數: KD黃金交叉≤${
                                                                        bestParams?.kdGold ?? '-'
                                                                    }，KD死亡交叉≥${bestParams?.kdDead ?? '-'}，RSI超買≥${
                                                                        bestParams?.rsiOverBought ?? '-'
                                                                    }）`
                                                                );
                                                                localStorage.setItem(
                                                                    'ikd_optimize_best',
                                                                    JSON.stringify({
                                                                        percent,
                                                                        params: bestParams,
                                                                        bestReturn,
                                                                    })
                                                                );
                                                            }
                                                        }
                                                    );
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

            console.log('完整窮舉算完囉');

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
                // 最終最佳也存一次
                localStorage.setItem(
                    'ikd_optimize_best',
                    JSON.stringify({
                        percent: 100,
                        params: bestParams,
                        bestReturn,
                    })
                );
            } else {
                this.$message.warning('找不到最佳參數組合');
            }
        },

        async onOptimizePolicyStep3() {
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
                sell1_ratio: this.form.sell1_ratio,
                sell2_ratio: this.form.sell2_ratio,
            };

            await this.$store.dispatch('APPLY_AND_WAIT_POLICY_RESULT', { stockId, policyList });
            const stock = this.$store.getters.getStock(stockId);
            const stats = stock?.policy?.stats;
            const unitReturn = stats?.unit_rate_of_return ?? -9999;
            const numberOfSell = stats?.number_of_sell ?? 0;
            const numberOfBuy = stats?.number_of_buy ?? 0;
            const duration = stats?.duration_from_first_weekly ?? 0; // 天數
            const star = stock?.star ?? 3; // 預設3星
            // const name = stock?.name ?? '';

            let buyPeriod = 547;
            let sellPeriod = 547;
            // 中華電及卜蜂要特別處理，因為他們是3星要存股，但允許久一點再買，|| (star === 3 && ['中華電', '卜蜂'].includes(name))
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

        // 保存分批賣出比例設定
        saveSellRatios() {
            if (!this.stockId) return;

            // 使用 debounce 避免頻繁保存
            if (this.saveTimeout) {
                clearTimeout(this.saveTimeout);
            }

            this.saveTimeout = setTimeout(() => {
                // 直接使用 this.form，因為它已經包含完整的設定
                this.$store.commit('SAVE_STOCK_POLICY', {
                    stockId: this.stockId,
                    policyList: this.form,
                });
                console.log(`已保存 ${this.stockData.name}(${this.stockId}) 分批賣出設定:`, {
                    星級: this.stockData.star,
                    sell1_ratio: this.form.sell1_ratio,
                    sell2_ratio: this.form.sell2_ratio,
                });
            }, 500); // 延遲 500ms 保存
        },

        onClosed() {
            console.log('FormPolicy onClosed - 開始儲存', {
                stockId: this.stockId,
                formBuy: this.form.buy.length,
                formSell: this.form.sell.length,
                sell1Ratio: this.form.sell1_ratio,
                sell2Ratio: this.form.sell2_ratio,
            });

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

            console.log('FormPolicy onClosed - 即將儲存的設定', this.form);

            // 直接使用 this.form，因為它已經包含完整的設定
            this.$store.commit('SAVE_STOCK_POLICY', {
                stockId: this.stockId,
                policyList: this.form,
            });
        },
        async onExportFeature() {
            console.log('onExportFeature1');
            try {
                const policyList = {
                    buy: [{ method: 'kd_gold', label: '週 KD 黃金交叉', limit: 50, limit_desc: '以下' }],
                    sell: [{ method: 'kd_dead', label: '週 KD 死亡交叉', limit: 50, limit_desc: '以上' }],
                    sell1_ratio: this.form.sell1_ratio,
                    sell2_ratio: this.form.sell2_ratio,
                };
                await this.$store.dispatch('APPLY_AND_WAIT_POLICY_RESULT', {
                    stockId: this.stockId,
                    policyList,
                });
                await this.$store.dispatch('APPLY_AND_WAIT_POLICY_RESULT', {
                    stockId: this.stockId,
                    policyList: this.form,
                });
            } catch (e) {
                console.error('APPLY_AND_WAIT_POLICY_RESULT error', e);
            }
            console.log('onExportFeature2');

            // 取得最新 stockData 與 tempStock
            this.stockData = this.$store.getters.getStock(this.stockId);
            const tempStock = this.$store.getters.getTempStock(this.stockId);
            if (!tempStock) {
                this.$message.error('找不到 tempStock 資料');
                return;
            }

            // 反轉歷史
            const history = _.cloneDeep(this.stockData.policy.history).reverse();

            // 日期對應表
            const toMap = (arr) => Object.fromEntries(arr.map((a) => [a[0], a]));
            const weeklyMap = toMap(tempStock.data.weekly);
            const kdjMap = toMap(tempStock.data.weekly_kdj);
            const maMap = toMap(tempStock.data.weekly_ma);
            const rsiMap = toMap(tempStock.data.weekly_rsi);

            const reasonPriority = ['kd_w', 'kd_gold', 'kd_dead', 'rsi_over_bought'];
            const dailyArr = this.stockData.data.daily;

            // 數值對照表
            const reasonMap = {
                kd_w: 1,
                kd_gold: 2,
                kd_dead: 3,
                rsi_over_bought: 4,
                rsi_over_sold: 5,
                kd_turn_up: 6,
                kd_turn_down: 7,
                rsi_turn_up: 8,
                rsi_turn_down: 9,
                previous_buy_down: 10,
                cost_down: 11,
                annual_fixed_date_buy: 12,
                earn: 13,
                take_profit: 14,
                previous_sell_up: 15,
                stop_loss: 16,
                annual_fixed_date_sell: 17,
            };
            const buyOrSellMap = { 買: 1, 賣: -1, 現在: 0 };

            // 組合特徵
            const features = history
                .map((item) => {
                    // reason 處理
                    let reasonStr = '';
                    if (Array.isArray(item.reason)) {
                        if (item.reason.length === 1) {
                            if (item.reason[0] === 'latest') return null;
                            reasonStr = item.reason[0];
                        } else if (item.reason.length > 1) {
                            reasonStr = reasonPriority.find((r) => item.reason.includes(r)) || item.reason[0];
                        }
                    } else {
                        reasonStr = item.reason || '';
                    }

                    const date = item.date;
                    const weekly = weeklyMap[date] || [];
                    const kdj = kdjMap[date] || [];
                    const ma = maMap[date] || [];
                    const rsi = rsiMap[date] || [];

                    // 目標日期 = 當前日期 + 56天
                    const targetDate = moment(date, 'YYYY-MM-DD').add(56, 'days');
                    // 找到 dailyArr 中最接近 targetDate 的 index
                    let minDiff = Infinity,
                        targetIdx = -1;
                    for (let i = 0; i < dailyArr.length; i++) {
                        const d = moment(dailyArr[i][0], 'YYYY-MM-DD');
                        const diff = Math.abs(d.diff(targetDate, 'days'));
                        if (diff < minDiff) {
                            minDiff = diff;
                            targetIdx = i;
                        }
                    }
                    if (targetIdx === -1) return null;

                    const targetClose = dailyArr[targetIdx][4]; // close
                    const nowPrice = item.price;
                    let success = null;
                    if (item.buy_or_sell === '買') success = targetClose > nowPrice ? 1 : 0;
                    else if (item.buy_or_sell === '賣') success = targetClose < nowPrice ? 1 : 0;

                    // 數值化
                    const reasonNum = reasonMap[reasonStr] ?? 0;
                    const buyOrSellNum = buyOrSellMap[item.buy_or_sell] ?? 0;

                    return {
                        date,
                        buy_or_sell_num: buyOrSellNum,
                        reason_num: reasonNum,
                        price: item.price,
                        open: weekly[1] ?? '',
                        high: weekly[2] ?? '',
                        low: weekly[3] ?? '',
                        close: weekly[4] ?? '',
                        volume: weekly[5] ?? '',
                        k: kdj[1] ?? '',
                        d: kdj[2] ?? '',
                        j: kdj[3] ?? '',
                        ma5: ma[1] ?? '',
                        ma10: ma[2] ?? '',
                        ma20: ma[3] ?? '',
                        rsi: rsi[1] ?? '',
                        success,
                    };
                })
                .filter(Boolean);

            // 匯出成 CSV 檔案（只輸出數值特徵）
            if (features.length > 0) {
                const csvFields = [
                    'date',
                    'buy_or_sell_num',
                    'reason_num',
                    'price',
                    'open',
                    'high',
                    'low',
                    'close',
                    'volume',
                    'k',
                    'd',
                    'j',
                    'ma5',
                    'ma10',
                    'ma20',
                    'rsi',
                    'success',
                ];
                const csvRows = [
                    csvFields.join(','), // 標題
                    ...features.map((obj) => csvFields.map((k) => obj[k] ?? '').join(',')),
                ];
                const csv = csvRows.join('\n');
                const csvBlob = new Blob([csv], { type: 'text/csv' });
                const csvUrl = URL.createObjectURL(csvBlob);
                const csvA = document.createElement('a');
                csvA.href = csvUrl;
                csvA.download = `${this.stockData.id}_features.csv`;
                csvA.click();
                URL.revokeObjectURL(csvUrl);
            } else {
                this.$message.warning('沒有可匯出的特徵資料');
            }
        },
        async onOptimizeAnnualFixedDate() {
            // 掃描每年固定日買/賣的最佳組合
            const stockId = this.stockId;
            let bestReturn = -Infinity;
            let bestBuyDate = '';
            let bestPolicy = null;
            const allResults = []; // 收集所有日期的報酬率，用於評估關聯度

            // 掃描 1/1 ~ 12/31
            for (let buyMonth = 1; buyMonth <= 12; buyMonth++) {
                // 取得該月天數
                const daysInMonth = moment(`${moment().year()}-${buyMonth}`, 'YYYY-M').daysInMonth();
                console.log(`掃描 ${moment().year()}/${buyMonth}`);

                for (let buyDay = 1; buyDay <= daysInMonth; buyDay++) {
                    const buyDate = `${buyMonth}/${buyDay}`;
                    console.log(`掃描 ${buyDate}`);

                    const policyList = {
                        buy: [{ method: 'annual_fixed_date_buy', label: '每年固定日買', limit: buyDate, limit_desc: '買' }],
                        sell: _.cloneDeep(this.form.sell), // 直接取用目前設定的 sell
                        sell1_ratio: this.form.sell1_ratio,
                        sell2_ratio: this.form.sell2_ratio,
                    };
                    await this.$store.dispatch('APPLY_AND_WAIT_POLICY_RESULT', { stockId, policyList });
                    const stock = this.$store.getters.getStock(stockId);
                    const stats = stock?.policy?.stats;
                    const unitReturn = stats?.unit_rate_of_return ?? -9999;

                    // 收集所有日期的報酬率
                    allResults.push({
                        buyDate,
                        unitReturn,
                        numberOfBuy: stats?.number_of_buy ?? 0,
                        numberOfSell: stats?.number_of_sell ?? 0,
                    });

                    console.log(`買進日期: ${buyDate}, 單位報酬率: ${unitReturn}`);
                    if (unitReturn > bestReturn) {
                        bestReturn = unitReturn;
                        bestBuyDate = buyDate;
                        bestPolicy = _.cloneDeep(policyList);
                    }
                }
            }

            // 評估固定日期買進的關聯度
            if (allResults.length > 0) {
                const returns = allResults.map((r) => r.unitReturn).filter((r) => r > -9000); // 過濾無效值

                // 計算統計量
                const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
                const max = Math.max(...returns);
                const min = Math.min(...returns);
                const std = Math.sqrt(returns.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / returns.length);
                const range = max - min;
                const cv = (std / Math.abs(avg)) * 100; // 變異係數 (%)

                // 找出前3名和後3名日期
                const topDates = allResults
                    .slice()
                    .sort((a, b) => b.unitReturn - a.unitReturn)
                    .slice(0, 3)
                    .map((r) => `${r.buyDate}(${r.unitReturn.toFixed(2)}%)`)
                    .join('，');

                const worstDates = allResults
                    .slice()
                    .sort((a, b) => a.unitReturn - b.unitReturn)
                    .slice(0, 3)
                    .map((r) => `${r.buyDate}(${r.unitReturn.toFixed(2)}%)`)
                    .join('，');

                // 評估關聯度
                let relationLevel = '';
                let relationMsg = '';
                let recommendMsg = '';

                if (std > 5 && range > 20) {
                    relationLevel = '極高';
                    relationMsg = '不同日期的報酬率差異非常顯著';
                    recommendMsg = '強烈建議使用固定日期買進';
                } else if (std > 3 && range > 10) {
                    relationLevel = '高';
                    relationMsg = '不同日期的報酬率有明顯差異';
                    recommendMsg = '建議使用固定日期買進';
                } else if (std > 2 && range > 5) {
                    relationLevel = '中等';
                    relationMsg = '不同日期的報酬率有一定差異';
                    recommendMsg = '可考慮使用固定日期買進';
                } else {
                    relationLevel = '低';
                    relationMsg = '不同日期的報酬率差異較小';
                    recommendMsg = '固定日期買進優勢不明顯，可以考慮其他策略';
                }

                // 顯示評估結果
                this.$message.info(
                    `固定日期買進關聯度分析：\n
                    關聯度：${relationLevel} (標準差=${std.toFixed(2)}, 區間=${range.toFixed(2)}%, 變異係數=${cv.toFixed(2)}%)\n
                    ${relationMsg}，${recommendMsg}\n
                    平均報酬率：${avg.toFixed(2)}%，最高：${max.toFixed(2)}%，最低：${min.toFixed(2)}%\n
                    最佳3日：${topDates}\n
                    最差3日：${worstDates}`
                );

                console.log('固定日期買進關聯度分析', {
                    relationLevel,
                    std,
                    range,
                    cv,
                    avg,
                    max,
                    min,
                    topDates,
                    worstDates,
                    allResultsCount: allResults.length,
                });
            }

            if (bestPolicy) {
                this.form = bestPolicy;
                this.$message.success(`最佳固定日：買進${bestBuyDate}，單位報酬率${bestReturn.toFixed(2)}%`);
                console.log('※最佳固定日', bestBuyDate);
                console.log('※最佳單位報酬率', bestReturn);
            } else {
                this.$message.warning('找不到最佳固定日組合');
            }
        },
        async onOptimizeAnnualFixedDateSell() {
            // 掃描每年固定日賣的最佳組合
            const stockId = this.stockId;
            let bestReturn = -Infinity;
            let bestSellDate = '';
            let bestPolicy = null;
            const allResults = [];

            // 掃描 1/1 ~ 12/31
            for (let sellMonth = 1; sellMonth <= 12; sellMonth++) {
                // 取得該月天數
                const daysInMonth = moment(`${moment().year()}-${sellMonth}`, 'YYYY-M').daysInMonth();
                console.log(`掃描 ${moment().year()}/${sellMonth}`);

                for (let sellDay = 1; sellDay <= daysInMonth; sellDay++) {
                    const sellDate = `${sellMonth}/${sellDay}`;
                    console.log(`掃描 ${sellDate}`);

                    const policyList = {
                        buy: _.cloneDeep(this.form.buy), // 用目前設定的 buy
                        sell: [{ method: 'annual_fixed_date_sell', label: '每年固定日賣', limit: sellDate, limit_desc: '賣' }],
                        sell1_ratio: this.form.sell1_ratio,
                        sell2_ratio: this.form.sell2_ratio,
                    };
                    await this.$store.dispatch('APPLY_AND_WAIT_POLICY_RESULT', { stockId, policyList });
                    const stock = this.$store.getters.getStock(stockId);
                    const stats = stock?.policy?.stats;
                    const unitReturn = stats?.unit_rate_of_return ?? -9999;

                    // 收集所有日期的報酬率
                    allResults.push({
                        sellDate,
                        unitReturn,
                        numberOfBuy: stats?.number_of_buy ?? 0,
                        numberOfSell: stats?.number_of_sell ?? 0,
                    });

                    if (unitReturn > bestReturn) {
                        bestReturn = unitReturn;
                        bestSellDate = sellDate;
                        bestPolicy = _.cloneDeep(policyList);
                    }
                }
            }

            // 評估固定日期賣出的關聯度
            if (allResults.length > 0) {
                const returns = allResults.map((r) => r.unitReturn).filter((r) => r > -9000);
                const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
                const max = Math.max(...returns);
                const min = Math.min(...returns);
                const std = Math.sqrt(returns.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / returns.length);
                const range = max - min;
                const cv = (std / Math.abs(avg)) * 100;

                const topDates = allResults
                    .slice()
                    .sort((a, b) => b.unitReturn - a.unitReturn)
                    .slice(0, 3)
                    .map((r) => `${r.sellDate}(${r.unitReturn.toFixed(2)}%)`)
                    .join('，');
                const worstDates = allResults
                    .slice()
                    .sort((a, b) => a.unitReturn - b.unitReturn)
                    .slice(0, 3)
                    .map((r) => `${r.sellDate}(${r.unitReturn.toFixed(2)}%)`)
                    .join('，');

                let relationLevel = '';
                let relationMsg = '';
                let recommendMsg = '';
                if (std > 5 && range > 20) {
                    relationLevel = '極高';
                    relationMsg = '不同日期的報酬率差異非常顯著';
                    recommendMsg = '強烈建議使用固定日期賣出';
                } else if (std > 3 && range > 10) {
                    relationLevel = '高';
                    relationMsg = '不同日期的報酬率有明顯差異';
                    recommendMsg = '建議使用固定日期賣出';
                } else if (std > 2 && range > 5) {
                    relationLevel = '中等';
                    relationMsg = '不同日期的報酬率有一定差異';
                    recommendMsg = '可考慮使用固定日期賣出';
                } else {
                    relationLevel = '低';
                    relationMsg = '不同日期的報酬率差異較小';
                    recommendMsg = '固定日期賣出優勢不明顯，可以考慮其他策略';
                }

                this.$message.info(
                    `固定日期賣出關聯度分析：\n
                    關聯度：${relationLevel} (標準差=${std.toFixed(2)}, 區間=${range.toFixed(2)}%, 變異係數=${cv.toFixed(2)}%)\n
                    ${relationMsg}，${recommendMsg}\n
                    平均報酬率：${avg.toFixed(2)}%，最高：${max.toFixed(2)}%，最低：${min.toFixed(2)}%\n
                    最佳3日：${topDates}\n
                    最差3日：${worstDates}`
                );
                console.log('固定日期賣出關聯度分析', {
                    relationLevel,
                    std,
                    range,
                    cv,
                    avg,
                    max,
                    min,
                    topDates,
                    worstDates,
                    allResultsCount: allResults.length,
                });
            }

            if (bestPolicy) {
                this.form = bestPolicy;
                this.$message.success(`最佳固定日：賣出${bestSellDate}，單位報酬率${bestReturn.toFixed(2)}%`);
                console.log('※最佳固定日(賣)', bestSellDate);
                console.log('※最佳單位報酬率(賣)', bestReturn);
            } else {
                this.$message.warning('找不到最佳固定日組合');
            }
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
