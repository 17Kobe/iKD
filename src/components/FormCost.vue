<template>
    <el-drawer :title="title" @closed="onClosed()" v-model="isShow" :show-close="true" direction="rtl" size="70%">
        <el-form ref="formCostRef" :model="form" label-width="60px">
            <el-row v-for="(item, index) in form" :key="index">
                <el-col :xs="3" :sm="6" :md="4" :lg="4" :xl="3">
                    <el-form-item label="成交價">
                        <el-input
                            clearable
                            v-model="item.cost"
                            placeholder="ex: 33.43"
                            :ref="`cost${index}`"
                            @keyup="onChangeCost($event, index)"
                            type="number"
                        />
                    </el-form-item>
                </el-col>
                <el-col :xs="4" :sm="6" :md="5" :lg="5" :xl="4">
                    <el-form-item label="股數">
                        <el-input-number
                            type="number"
                            v-model="item.number"
                            :step="1000"
                            @keyup="onChangeNumber($event, index)"
                        />
                    </el-form-item>
                </el-col>
                <el-col :xs="1" :sm="6" :md="3" :lg="3" :xl="2">
                    &nbsp;&nbsp;<el-button type="danger" @click="onDel(index)"><i class="el-icon-minus"></i></el-button
                ></el-col>
            </el-row>

            <el-form-item>
                <el-button type="primary" @click="onAdd"><i class="el-icon-plus"></i></el-button>
            </el-form-item>
        </el-form>
        總金額 {{ sumCost.toLocaleString('en-US') }} 元<br />
        平均成交價： {{ averageCost }} 元<br />
        總股數：{{ totalOfShares }} 股 / {{ totalOf1000Shares }} 張
    </el-drawer>
</template>

<script>
import _ from 'lodash';

export default {
    name: 'component-form-cost',
    data() {
        return {
            stockId: null,
            isShow: false,
            title: '設定成本',
            stockData: {},
            costList: [],
            defaultCost: 0, // 預設的股價，用代入的
            // totalNumber: 0,
            form: [
                // {
                //     cost: 0,
                //     number: 1000,
                // },
            ],
        };
    },
    computed: {
        totalOfShares() {
            // https://stackoverflow.com/questions/50670204/sum-up-array-with-objects
            const sum = this.form.reduce((acc, { number }) => acc + number, 0);
            return sum;
        },
        totalOf1000Shares() {
            console.log('totalOf1000Shares');

            // https://stackoverflow.com/questions/50670204/sum-up-array-with-objects
            return Number((this.totalOfShares / 1000).toFixed(2));
        },
        sumCost() {
            console.log('averageCost');
            // 有可能cost 為 null，所以要變更為0
            return this.form.reduce((acc, { cost, number }) => acc + (Number(cost) || 0) * parseInt(number, 10), 0);
        },
        averageCost() {
            // parseFloat 是為了去除小數點後面的0
            // div 0 結果會 NaN, 所以把它變 /1
            return Number((this.sumCost / (this.totalOfShares === 0 ? 1 : this.totalOfShares)).toFixed(2));
        },
    },
    mounted() {},
    methods: {
        onAdd() {
            console.log('onAdd');
            const index = this.form.push({
                cost: this.defaultCost,
                number: 1000,
            });
            // nextTick()會在DOM已掛載、渲染完成後，執行nextTick()內的程式碼
            // https://stackoverflow.com/questions/59749325/vue-set-focus-to-dynamic-input-box
            this.$nextTick(() => {
                this.$refs[`cost${index - 1}`][0].focus();
            });
        },
        onChangeCost(e, index) {
            console.log('onChangeCost');
            // 加 parseFloat就要是要把字串變float，存在 the.form裡面
            // 一定要搭配type="number"，否則小數點.會輸入不出來
            this.form[index].cost = Number(e.target.value);
        },
        onChangeNumber(e, index) {
            console.log('onChangeNumber');
            // 用 change 事件一樣會偵測不到，要用 keyup 事件才能在有按鍵輸入時即時反應值，
            //  e.target.value 是字串，要變整數。並且要給10才不會 eslint
            this.form[index].number = parseInt(e.target.value, 10);
        },
        onDel(index) {
            this.form.splice(index, 1);
        },
        onInit(stockId) {
            console.log('onInit');
            this.stockId = stockId;
            this.isShow = true;
            // getters 在 vuex 只有在全域，沒有在個別 module，所以不用加 stock
            this.stockData = this.$store.getters.getStock(stockId); // 因為 computed 是在網頁開啟時就跑了，那時還沒有id就會變成沒過濾全都取了。為了在點擊設定才去取，所以要這樣
            // eslint-disable-next-line prefer-destructuring
            this.defaultCost = this.stockData.data.daily[this.stockData.data.daily.length-1][4];
            this.title = `${this.stockData.name}(${this.stockData.id}) 設定成本`;

            if (_.has(this.stockData, 'cost.settings')) this.form = _.cloneDeep(this.stockData.cost.settings);
            else this.form = [];

            // this.$nextTick(() => {
            // this.$refs.cost0[0].focus();
            // });
        },
        onClosed() {
            this.$store.commit('SAVE_STOCK_COST', {
                stockId: this.stockId,
                costList: this.form,
                totalOfShares: this.totalOfShares,
                averageCost: this.averageCost,
                sumCost: this.sumCost,
            });
        },
    },
};
// 父傳子參考 https://its201.com/article/weixin_49035434/119852222 方法1，的emit似乎 vue 3有改語法而不行了。但方法2沒用 emit仍正常
</script>
