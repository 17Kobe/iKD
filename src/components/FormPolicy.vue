<template>
    <el-drawer :title="title" @closed="onClosed()" v-model="isShow" :show-close="true" direction="rtl" size="70%">
        <el-form ref="formPolicyBuyRef" :model="form.buy" label-width="60px">
            <div style="font-size: 24px; margin: 0px 10px 10px">買進</div>

            <el-row v-for="(item, index) in form.buy" :key="index">
                <el-col :xs="3" :sm="6" :md="4" :lg="5" :xl="3">
                    <el-form-item label="策略">
                        <el-select v-model="item.method" @change="onChangeBuyMethod($event, index)">
                            <el-option v-for="item in buyOptions" :key="item.value" :label="item.label" :value="item.value">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :xs="4" :sm="6" :md="5" :lg="4" :xl="2">
                    <el-form-item label="限制">
                        <el-input v-model="item.limit" placeholder="ex: 33.43" :ref="`method_buy_${index}`" type="number" />
                    </el-form-item>
                </el-col>
                <el-col :xs="4" :sm="6" :md="5" :lg="5" :xl="3" style="margin: 9px 2px">
                    {{ item.limit_desc }}
                </el-col>
                <el-col :xs="1" :sm="6" :md="3" :lg="2" :xl="1">
                    &nbsp;&nbsp;<el-button type="danger" @click="onDelBuy(index)"><i class="el-icon-minus"></i></el-button
                ></el-col>
            </el-row>

            <el-form-item>
                <el-button type="primary" @click="onAddBuy"><i class="el-icon-plus"></i></el-button>
            </el-form-item>
        </el-form>

        <el-form ref="formPolicySellRef" :model="form.sell" label-width="60px">
            <div style="font-size: 24px; margin: 0px 10px 10px">賣出</div>

            <el-row v-for="(item, index) in form.sell" :key="index">
                <el-col :xs="3" :sm="6" :md="4" :lg="5" :xl="3">
                    <el-form-item label="策略">
                        <el-select v-model="item.method" @change="onChangeSellMethod($event, index)">
                            <el-option v-for="item in sellOptions" :key="item.value" :label="item.label" :value="item.value">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :xs="4" :sm="6" :md="5" :lg="4" :xl="2">
                    <el-form-item label="限制">
                        <el-input v-model="item.limit" placeholder="ex: 33.43" :ref="`method_buy_${index}`" type="number" />
                    </el-form-item>
                </el-col>
                <el-col :xs="4" :sm="6" :md="5" :lg="5" :xl="3" style="margin: 9px 2px">
                    {{ item.limit_desc }}
                </el-col>
                <el-col :xs="1" :sm="6" :md="3" :lg="2" :xl="1">
                    &nbsp;&nbsp;<el-button type="danger" @click="onDelSell(index)"><i class="el-icon-minus"></i></el-button
                ></el-col>
            </el-row>

            <el-form-item>
                <el-button type="primary" @click="onAddSell"><i class="el-icon-plus"></i></el-button>
            </el-form-item>
        </el-form>
    </el-drawer>
</template>

<script>
import _ from 'lodash';

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
                    value: 'ma_buy',
                    label: '搭配 MA 均線',
                    default_limit: 14,
                    default_limit_desc: '日之上', // 均線之下或均線之上，先做均線之上好了
                },
                {
                    value: 'cost_down',
                    label: '搭配 成本價跌超過',
                    default_limit: '10',
                    default_limit_desc: '% 以上',
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
                    value: 'ma_sell',
                    label: '搭配 MA 均線',
                    default_limit: 14,
                    default_limit_desc: '日之下', // 均線之下或均線之上，先做均線之上好了
                },
                {
                    value: 'earn',
                    label: '搭配 絕對正報酬',
                    default_limit: 0,
                    default_limit_desc: '% 以上',
                },
                // {
                //     value: 'Option5',
                //     label: '每年固定日期',
                //     default_limit: '2021-10-28',
                //     default_limit_desc: '',
                // },
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
                console.log(item.value);
                if (_.findLastIndex(form.buy, { method: item.value }) === -1) {
                    console.log(foundIndex);
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
            console.log(index);
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
                console.log(item.value);
                if (_.findLastIndex(form.sell, { method: item.value }) === -1) {
                    console.log(foundIndex);
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
            console.log(index);
            // nextTick()會在DOM已掛載、渲染完成後，執行nextTick()內的程式碼
            // https://stackoverflow.com/questions/59749325/vue-set-focus-to-dynamic-input-box
            // this.$nextTick(() => {
            //     this.$refs[`method_buy_${index - 1}`][0].focus();
            // });
        },
        onDelBuy(index) {
            this.form.buy.splice(index, 1);
        },
        onDelSell(index) {
            this.form.sell.splice(index, 1);
        },
        onChangeBuyMethod(selValue, index) {
            console.log(selValue);
            console.log(index);
            // 用選到的 method 先找到 value，再去看其它值設進去
            const found = _.find(this.buyOptions, ['value', selValue]);
            console.log(found);
            console.log(this.form.buy);
            this.form.buy[index].label = found.label;
            this.form.buy[index].limit = found.default_limit;
            this.form.buy[index].limit_desc = found.default_limit_desc;
        },
        onChangeSellMethod(selValue, index) {
            console.log(selValue);
            console.log(index);
            // 用選到的 method 先找到 value，再去看其它值設進去
            const found = _.find(this.sellOptions, ['value', selValue]);
            console.log(found);
            console.log(this.form.sell);
            this.form.sell[index].label = found.label;
            this.form.sell[index].limit = found.default_limit;
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

            console.log(this.stockData);

            if (_.has(this.stockData, 'policy.settings')) this.form = this.stockData.policy.settings;

            console.log(this.stockData);
            console.log(stockId);
            // this.$nextTick(() => {
            // this.$refs.cost0[0].focus();
            // });
        },
        onClosed() {
            console.log(this.form);
            this.$store.commit('SAVE_STOCK_POLICY', {
                stockId: this.stockId,
                policyList: this.form,
            });
        },
    },
};
// 父傳子參考 https://its201.com/article/weixin_49035434/119852222 方法1，的emit似乎 vue 3有改語法而不行了。但方法2沒用 emit仍正常
</script>
