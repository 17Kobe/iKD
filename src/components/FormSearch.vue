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
        <el-form ref="formSearchRef" :rules="rules" :model="form" label-width="60px">
            <el-form-item prop="stockId">
                <el-select
                    v-model="form.stockId"
                    filterable
                    remote
                    reserve-keyword
                    placeholder="輸入股票名稱 或 代號"
                    :remote-method="remoteMethod"
                    :loading="loading"
                    ref="search"
                >
                    <el-option v-for="item in stockOptions" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onAdd"><i class="el-icon-plus"></i></el-button>
            </el-form-item>
        </el-form>
        <el-table :data="customStockList" :show-header="false" :stripe="true" style="width: 100%">
            <el-table-column fixed label="名稱">
                <template #default="scope">
                    <span style="font-size: 16px; font-weight: bold"> {{ scope.row.name }} </span>&nbsp;
                    <span style="color: #cccccc">{{ scope.row.id }}</span>
                </template>
            </el-table-column>
            <el-table-column fixed label="名稱">
                <template #default="scope">
                    <el-button type="danger" size="small" @click="onDel(scope.row.id)"><i class="el-icon-minus"></i></el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-drawer>
</template>

<script>
import _ from 'lodash';

export default {
    name: 'component-form-search',
    data() {
        const validateDuplcate = (rule, value, callback) => {
            console.log(value);

            if (_.some(this.customStockList, { id: value })) {
                const selected = _.find(this.stockOptions, ['value', this.form.stockId]);
                callback(new Error(`${selected.label}(${value}) 已存在!`));
            } else {
                callback();
            }
        };
        return {
            isShow: false,
            title: '新增自選股',

            loading: false,
            stockOptions: [],

            stockData: {},
            form: {
                stockId: '',
                // {
                //     cost: 0,
                //     number: 1000,
                // },
            },
            rules: {
                stockId: [
                    { required: true, message: '輸入股票名稱 或 代號', trigger: 'change' },
                    { validator: validateDuplcate, trigger: 'change' },
                ],
            },
        };
    },
    computed: {
        taiwanStockList() {
            return this.$store.state.stock.taiwanStockList;
        },
        customStockList() {
            return this.$store.state.stock.stockList;
        },
    },
    mounted() {},
    methods: {
        remoteMethod(query) {
            if (query) {
                // console.log(query);

                this.loading = true;
                // const found = _.filter(this.taiwanStockList, { stock_id: query }); // found 是 array
                const found = _.filter(
                    this.taiwanStockList,
                    (o) => o.stock_id.indexOf(query) > -1 || o.stock_name.indexOf(query) > -1
                );

                this.loading = false;
                const optionList = [];
                found.forEach((item) => {
                    // console.log(item);
                    optionList.push({ label: item.stock_name, value: item.stock_id });
                });
                // 因為同一公司，可能屬不同產業，但同一個代碼，所以要過濾掉
                this.stockOptions = _.uniqBy(optionList, 'value');

                // console.log(this.stockList);
                // this.stockList = [
                //     { label: 'aaa', value: 'aaa' },
                //     { label: 'aa', value: 'aa' },
                // ];
            } else {
                this.stockOptions = [];
            }
        },

        onAdd() {
            console.log('onAdd');
            console.log(this.form.stockId);
            console.log(this.stockOptions);

            this.$refs.formSearchRef.validate((valid) => {
                if (valid) {
                    // 需要判斷是不存在，不能是空的才能加入
                    // 選到的
                    const selected = _.find(this.stockOptions, ['value', this.form.stockId]);
                    this.$store.commit('SAVE_A_STOCK', { name: selected.label, id: selected.value });
                    return true;
                }
                console.log('error submit!!');
                return false;
            });
        },
        onDel(stockId) {
            console.log(stockId);
            this.$store.commit('DEL_A_STOCK', stockId);
        },
        onInit() {
            console.log('onInit');
            this.isShow = true;
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
