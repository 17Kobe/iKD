<template>
    <el-drawer :title="title" @closed="onClosed()" v-model="isShow" :show-close="true" direction="rtl" size="85%">
        <el-form ref="formPolicyBuyRef" :model="form.buy">
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
                    value: 'cost_down',
                    label: '搭配 成本價跌超過',
                    default_limit: 10,
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
