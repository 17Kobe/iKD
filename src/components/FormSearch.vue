<template>
    <el-drawer
        :title="title"
        @opened="onOpend()"
        @closed="onClosed()"
        v-model="isShow"
        :show-close="true"
        direction="rtl"
        size="70%"
    >
        <el-form ref="form" :model="form" label-width="60px">
            <el-form-item>
                <el-select
                    v-model="stockId"
                    filterable
                    remote
                    reserve-keyword
                    placeholder="輸入股票名稱 或 代號"
                    :remote-method="remoteMethod"
                    :loading="loading"
                    ref="search"
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
            title: '新增自選股',

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
                const found = _.filter(
                    this.taiwanStockList,
                    (o) => o.stock_id.indexOf(query) > -1 || o.stock_name.indexOf(query) > -1
                );

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

            // 需要判斷是不存在，不能是空的才能加入
            // 選到的
            const selected = _.find(this.stockList, ['value', this.stockId]);
            this.$store.commit('SAVE_A_STOCK', { name: selected.label, id: selected.value });
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
        },
        onOpend() {
            // set focus 要寫在這不能寫在 onInit，否則會影響動畫lag
            this.$nextTick(() => {
                this.$refs.search.focus();
            });
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
