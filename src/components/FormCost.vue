<template>
    <el-drawer :title="title" @closed="onClosed()" v-model="isShow" :show-close="true" direction="rtl" size="85%">
        <el-form ref="formCostRef" :model="form">
            <el-row v-for="(item, index) in form" :key="index">
                <el-col :xs="9" :sm="10" :md="7" :lg="4" :xl="3" style="padding-left: 3px">
                    <el-form-item label="成交價">
                        <el-input
                            v-model="item.cost"
                            placeholder="ex: 33.43"
                            size="small"
                            :ref="`cost${index}`"
                            @keyup="onChangeCost($event, index)"
                            type="number"
                            inputmode="decimal"
                            style="margin-left: 2px"
                            @focus="$event.target.select()"
                        >
                            <template #suffix>元</template>
                        </el-input>
                    </el-form-item>
                </el-col>
                <el-col :xs="11" :sm="10" :md="7" :lg="5" :xl="4" style="padding-left: 6px">
                    <el-form-item label="股數">
                        <el-input-number
                            type="number"
                            inputmode="decimal"
                            v-model="item.number"
                            :step="1000"
                            size="small"
                            @keyup="onChangeNumber($event, index)"
                            style="margin-left: 2px"
                            @focus="$event.target.select()"
                        />
                    </el-form-item>
                </el-col>
                <el-col :xs="4" :sm="4" :md="3" :lg="3" :xl="2" style="display: flex; align-items: center">
                    &nbsp;&nbsp;<el-button type="danger" size="small" @click="onDel(index)"
                        ><i class="el-icon-minus"></i></el-button
                ></el-col>
            </el-row>

            <el-form-item>
                <el-button type="primary" size="small" @click="onAdd" style="margin-left: 5px"
                    ><i class="el-icon-plus"></i>&nbsp;新增買進股票</el-button
                >
            </el-form-item>
        </el-form>
        買進平均成本價： {{ averageCost }} 元<br />
        買進股數：{{ totalOfShares }} 股 / {{ totalOf1000Shares }} 張 <br />
        買進金額： {{ sumCost.toLocaleString('en-US') }} 元<br /><br />
        <el-collapse v-if="form.length > 0">
            <el-collapse-item title="&nbsp;&nbsp;&nbsp;&nbsp;賣出股票">
                <el-form ref="formCostSellRef" :model="formSell" class="i-form">
                    <el-row>
                        <el-col :xs="9" :sm="10" :md="7" :lg="4" :xl="3" style="padding-left: 3px">
                            <el-form-item label="成交價">
                                <el-input
                                    v-model="sellPrice"
                                    placeholder="ex: 33.43"
                                    size="small"
                                    type="number"
                                    inputmode="decimal"
                                    style="margin-left: 2px"
                                    @focus="$event.target.select()"
                                >
                                    <template #suffix>元</template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :xs="11" :sm="10" :md="7" :lg="5" :xl="4" style="padding-left: 6px">
                            <el-form-item label="股數">
                                <el-input-number
                                    v-model="sellNumber"
                                    type="number"
                                    inputmode="decimal"
                                    :step="1000"
                                    :max="totalOfShares"
                                    size="small"
                                    style="margin-left: 2px"
                                    @focus="$event.target.select()"
                                />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :xs="24" :sm="10" :md="7" :lg="4" :xl="3" style="padding-left: 3px">
                            <el-form-item label="來源">
                                <el-checkbox-group v-model="checkedSellSrc" style="margin-left: 10px">
                                    <template v-for="sellSrc in sellSrcOptions" :key="sellSrc.index">
                                        <el-checkbox :label="sellSrc.label">{{ sellSrc.label }}</el-checkbox>
                                    </template>
                                </el-checkbox-group>
                                <!-- <el-select v-model="sellSelectValue" placeholder="請選擇賣出來源" size="small" multiple>
                                    <el-option
                                        v-for="item in sellSourceOptions"
                                        :key="item.index"
                                        :label="item.label"
                                        :value="item.index"
                                    />
                                </el-select> -->
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-form-item>
                        <el-button type="primary" size="small" @click="onAddSellHistory" style="margin-left: 5px"
                            ><i class="el-icon-plus"></i>&nbsp;送出歷史賣出股票</el-button
                        >
                    </el-form-item>
                </el-form>
                <span style="font-size: 16px">
                    賣出平均成本價： {{ sellAverageCost }} 元<br />
                    賣出成交價： {{ sellPrice }} 元<br />
                    賣出股數：{{ sellNumber }} 股 / {{ sellTotalOf1000Shares }} 張 <br />
                    賣出本金： {{ sellOriginSpend.toLocaleString('en-US') }} 元<br />
                    賣出金額： {{ sellSumPrice.toLocaleString('en-US') }} 元<br />
                    賣出報酬率：
                    <span :style="[sellRateOfReturn >= 0 ? { color: '#419eff' } : { color: '#f56c6c' }, {}]"
                        >{{ sellRateOfReturn.toFixed(1) }} %</span
                    ><br />
                    賣出價差：
                    <span :style="[sellSpread >= 0 ? { color: '#419eff' } : { color: '#f56c6c' }, {}]"
                        >{{ sellSpread.toLocaleString('en-US') }} 元</span
                    ><br />
                </span>
            </el-collapse-item>
        </el-collapse>
    </el-drawer>
</template>

<script>
import _ from 'lodash';
import moment from 'moment';
import { ElMessageBox, ElMessage } from 'element-plus';

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
            defaultExchange: 1,
            // totalNumber: 0,
            form: [
                // {
                //     cost: 0,
                //     number: 1000,
                // },
            ],
            formSell: [],
            sellPrice: 0,
            sellNumber: 0, //預設賣0股，給沒有買股票做為初始值，其它數字是動態給的
            sellSelectValue: [],

            // sellSrcOptions: ['上海', '北京', '广州', '深圳'],
            checkedSellSrc: [],
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
        sellTotalOf1000Shares() {
            console.log('sellTotalOf1000Shares');

            // https://stackoverflow.com/questions/50670204/sum-up-array-with-objects
            return Number((this.sellNumber / 1000).toFixed(2));
        },
        sumCost() {
            console.log('averageCost');
            // 有可能cost 為 null，所以要變更為0
            return Math.round(
                this.form.reduce((acc, { cost, number }) => acc + (cost || 0) * parseFloat(number, 10), 0) * this.defaultExchange
            );
        },
        averageCost() {
            // parseFloat 是為了去除小數點後面的0
            // div 0 結果會 NaN, 所以把它變 /1
            return Number((this.sumCost / (this.totalOfShares === 0 ? 1 : this.totalOfShares) / this.defaultExchange).toFixed(2));
        },
        sellSrcOptions() {
            let sellNumber = this.sellNumber; // 總共賣出的股數
            this.checkedSellSrc = [];
            // buy_date 是因為價格若一樣，則先買的日期要先賣
            return _.orderBy(this.form, ['cost', 'buy_date'], ['desc', 'asc']).reduce((acc, { cost, number }, index) => {
                // 該價格總共有的股數
                // 計算可以賣的股數
                // console.log('sellNumber =' + sellNumber);
                let availableSellNumber = 0;
                // 賣出總張出 >= 此價格的張數
                if (sellNumber >= number) availableSellNumber = number;
                else availableSellNumber = sellNumber; // 賣出總張出 < 此價格的張數
                // console.log('availableSellNumber =' + availableSellNumber);
                sellNumber = sellNumber - availableSellNumber; // 在此有可能減一減就變0
                // console.log('sellNumber =' + sellNumber);
                const label = cost + ' 元 ( 持有 ' + number + ' 股, 賣出 ' + availableSellNumber + ' 股)';
                acc.push({
                    index,
                    cost,
                    number,
                    label: label,
                });

                if (availableSellNumber > 0) this.checkedSellSrc.push(label);
                return acc;
            }, []);
        },
        sellSumPrice() {
            return Math.round(this.sellPrice * this.sellNumber * this.defaultExchange);
        },
        sellOriginSpend() {
            console.log('sellOriginSpend');
            // 有可能cost 為 null，所以要變更為0
            return Math.round(
                this.checkedSellSrc.reduce((acc, label) => {
                    var match = /(.*) 元 .*賣出 (.*) 股/.exec(label);
                    const sellPrice = match[1];
                    const sellNumber = match[2];

                    // console.log(match[1]);
                    // console.log(match[2]);
                    return acc + (sellPrice || 0) * parseFloat(sellNumber, 10);
                }, 0) * this.defaultExchange
            );
        },
        sellSpread() {
            return this.sellSumPrice - this.sellOriginSpend;
        },
        sellRateOfReturn() {
            return ((this.sellSumPrice - this.sellOriginSpend) * 100) / this.sellOriginSpend;
        },
        sellAverageCost() {
            return Number(
                (this.sellOriginSpend / (this.sellNumber === 0 ? 1 : this.sellNumber) / this.defaultExchange).toFixed(2)
            );
        },
    },
    mounted() {},
    methods: {
        onAdd() {
            console.log('onAdd');
            const index = this.form.push({
                cost: this.defaultCost,
                number: 1000,
                // buy_date: '2021-01-01',
                buy_date: moment().format('YYYY-MM-DD'),
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
            this.form[index].cost = e.target.value;
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
            this.defaultCost = this.stockData.last_price;
            this.sellPrice = this.defaultCost;
            this.title = `${this.stockData.name}(${this.stockData.id}) 設定成本`;
            // 一定要用 else，不然可能用到上個開的股票了
            if (this.stockData.buy_exchange) this.defaultExchange = this.stockData.buy_exchange;
            else this.defaultExchange = 1;

            if (_.has(this.stockData, 'cost.settings')) this.form = _.cloneDeep(this.stockData.cost.settings);
            else this.form = [];

            // this.$nextTick(() => {
            // this.$refs.cost0[0].focus();
            // });
            if (_.has(this.stockData, 'cost.settings')) {
                if (this.stockData.star === 3) this.sellNumber = Math.trunc(this.stockData.cost.total / 3);
                // 只賣3分之1，無條件捨去
                else this.sellNumber = this.stockData.cost.total;
            } else this.sellNumber = 0;
        },
        onAddSellHistory() {
            ElMessageBox.confirm(`將要送出 [${this.stockData.name}] 歷史賣出股票?`, '送出', {
                confirmButtonText: '送出',
                cancelButtonText: '取消',
                type: 'warning',
            })
                .then(() => {
                    // 賣出送出
                    // 本金、平均成本價、價差、報酬率
                    // 股票名稱、id、成本價、賣價、本金、報酬率、價差、賣出股數、賣出日期
                    //     成本價：賣出平均成本價
                    //     賣價：賣出成交價
                    //     本金：賣出本金
                    //     報酬率：賣出報酬率
                    //     賣出股數：賣出股數
                    //     賣出日期：今天日期
                    // { stockId, stockName, buyAverageCost, sellPrice, buySpend, sellRateOfReturn, sellSpread, sellNumber, sellDate }
                    // 賣出平均成本價： {{ Number(sellAverageCost.toFixed(2)) }} 元<br />
                    // 賣出成交價： {{ sellPrice }} 元<br />
                    // 賣出股數：{{ sellNumber }} 股 / {{ sellTotalOf1000Shares }} 張 <br />
                    // 賣出本金： {{ sellOriginSpend.toLocaleString('en-US') }} 元<br />
                    // 賣出金額： {{ sellSumPrice.toLocaleString('en-US') }} 元<br />
                    // 賣出報酬率：
                    // <span :style="[sellRateOfReturn >= 0 ? { color: '#419eff' } : { color: '#f56c6c' }, {}]"
                    //     >{{ sellRateOfReturn.toFixed(1) }} %</span
                    // ><br />
                    // 賣出價差：
                    // <span :style="[sellSpread >= 0 ? { color: '#419eff' } : { color: '#f56c6c' }, {}]"
                    //     >{{ sellSpread.toLocaleString('en-US') }} 元</span
                    // >

                    this.$store.commit('PUSH_HISTORY_DIVIDEND_LIST', {
                        name: this.stockData.name,
                        id: this.stockId,
                        buy_average_cost: this.sellAverageCost, // 成本價
                        sell_price: this.sellPrice, // 賣價
                        buy_spend: this.sellOriginSpend, // 本金
                        sell_rate_of_return: this.sellRateOfReturn, // 報酬率
                        sell_return: this.sellSpread, // 價差
                        sell_number: this.sellNumber, // 賣出股數
                        sell_date: moment().format('YYYY-MM-DD'), // 賣出日期
                    });

                    // 計算剩餘股數去更新

                    // this.$store.commit('SAVE_STOCK_COST', {
                    //     stockId: this.stockId,
                    //     costList: this.form,
                    //     totalOfShares: this.totalOfShares,
                    //     averageCost: this.averageCost,
                    //     sumCost: this.sumCost,
                    // });
                    ElMessage({
                        type: 'success',
                        message: '完成送出!',
                    });
                })
                .catch(() => {
                    ElMessage({
                        type: 'info',
                        message: '取消送出!',
                    });
                });
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

<style lang="sass">
.el-form-item
    margin-bottom: 0px
.el-form-item__label
    padding: 0
.el-input--small .el-input__inner
    padding: 0 17px 0 8px
// 設定折疊的title字型大小
.el-collapse-item__header
    font-size: 16px
.i-form .el-form-item__content
    line-height: 28px
.el-drawer.rtl
    overflow: scroll
</style>
