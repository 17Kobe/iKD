<template>
    <el-drawer :title="title" @closed="onClosed()" v-model="isShow" :show-close="true" direction="rtl" size="70%">
        <el-form ref="form" :model="form" label-width="60px">
            <el-form-item>
                <el-select
                    v-model="stockId"
                    filterable
                    remote
                    reserve-keyword
                    placeholder="輸入股票代碼"
                    :remote-method="remoteMethod"
                    :loading="loading"
                >
                    <el-option v-for="item in stockList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onAdd"><i class="el-icon-plus"></i></el-button>
            </el-form-item>
        </el-form>
    </el-drawer>
</template>

<script>
import _ from 'lodash';

export default {
    name: 'component-form-search',
    data() {
        return {
            isShow: false,
            title: '設定自選股',

            stockId: '',
            loading: false,
            stockList: [],

            stockData: {},
            form: [
                // {
                //     cost: 0,
                //     number: 1000,
                // },
            ],
        };
    },
    computed: {
        taiwanStockList() {
            return this.$store.state.stock.taiwanStockList;
        },
    },
    mounted() {},
    methods: {
        remoteMethod(query) {
            if (query) {
                console.log(query);

                this.loading = true;
                // const found = _.filter(this.taiwanStockList, { stock_id: query }); // found 是 array
                const found = _.filter(this.taiwanStockList, (o) => o.stock_id.indexOf(query) > -1);

                this.loading = false;
                this.stockList = [];
                found.forEach((item) => {
                    console.log(item);
                    this.stockList.push({ label: item.stock_name, value: item.stock_id });
                });

                // this.stockList = [
                //     { label: 'aaa', value: 'aaa' },
                //     { label: 'aa', value: 'aa' },
                // ];
            } else {
                this.stockList = [];
            }
        },

        onAdd() {
            console.log('onAdd');
            console.log(this.stockId);
            console.log(this.stockList);
            const found = _.find(this.stockList, ['value', this.stockId]);
            // => object for 'fred'
            this.$store.commit('SAVE_A_STOCK', { name: found.label, id: found.value });
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
        onInit() {
            console.log('onInit');
            this.isShow = true;
            // // getters 在 vuex 只有在全域，沒有在個別 module，所以不用加 stock
            // this.stockData = this.$store.getters.getStock(stockId); // 因為 computed 是在網頁開啟時就跑了，那時還沒有id就會變成沒過濾全都取了。為了在點擊設定才去取，所以要這樣
            // // eslint-disable-next-line prefer-destructuring
            // this.defaultCost = this.stockData.data_daily.at(-1)[4];
            // this.title = `${this.stockData.name}(${this.stockData.id}) 設定成本`;

            // console.log(this.stockData.cost);
            // if (_.has(this.stockData, 'cost.settings')) this.form = this.stockData.cost.settings;

            // console.log(this.stockData);
            // console.log(stockId);
            // // this.$nextTick(() => {
            // // this.$refs.cost0[0].focus();
            // // });
        },
        onClosed() {
            // console.log(this.form);
            // this.$store.commit('SAVE_STOCK_COST', {
            //     stockId: this.stockId,
            //     costList: this.form,
            //     totalOfShares: this.totalOfShares,
            //     averageCost: this.averageCost,
            //     sumCost: this.sumCost,
            // });
        },
    },
};
// 父傳子參考 https://its201.com/article/weixin_49035434/119852222 方法1，的emit似乎 vue 3有改語法而不行了。但方法2沒用 emit仍正常
</script>
