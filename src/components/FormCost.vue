<template>
    <el-drawer :title="title" v-model="isShow" :show-close="true" direction="rtl" size="70%">
        <el-form ref="form" :model="form" label-width="60px">
            <el-row v-for="(item, index) in form" :key="index">
                <el-col :span="10">
                    <el-form-item label="成交價">
                        <el-input v-model="item.cost" placeholder="ex: 33.43" :ref="`cost${index}`" @keyup="onChangeCost" />
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <el-form-item label="股數">
                        <el-input-number
                            v-model="item.numberOfShares"
                            :step="1000"
                            @keyup="onChangeNumberOfShares($event, index)"
                        />
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    &nbsp;&nbsp;<el-button type="danger" @click="onDel(index)" v-if="index >= 1"
                        ><i class="el-icon-minus"></i></el-button
                ></el-col>
            </el-row>

            <el-form-item>
                <el-button type="primary" @click="onAdd"><i class="el-icon-plus"></i></el-button>
            </el-form-item>
        </el-form>
        平均成交價： {{ averageCost }} 元<br />
        總股數：{{ totalNumberOfShares }} 股 / {{ total1kNumberOfShares }} 張
    </el-drawer>
</template>

<script>
export default {
    data() {
        return {
            isShow: false,
            title: '設定成本',
            stockData: {},
            costList: [],
            // totalNumberOfShares: 0,
            form: [
                {
                    cost: null,
                    numberOfShares: 1000,
                },
            ],
        };
    },
    computed: {
        totalNumberOfShares() {
            // https://stackoverflow.com/questions/50670204/sum-up-array-with-objects
            const sum = this.form.reduce((acc, { numberOfShares }) => acc + numberOfShares, 0);
            return sum;
        },
        total1kNumberOfShares() {
            // https://stackoverflow.com/questions/50670204/sum-up-array-with-objects
            return parseFloat((this.totalNumberOfShares / 1000).toFixed(2));
        },
        averageCost() {
            // 有可能cost 為 null，所以要變更為0
            const sum = this.form.reduce(
                (acc, { cost, numberOfShares }) => acc + (parseInt(cost, 10) || 0) * parseInt(numberOfShares, 10),
                0
            );
            // parseFloat 是為了去除小數點後面的0
            const avg = parseFloat((sum / this.totalNumberOfShares).toFixed(2));
            return avg;
        },
    },
    mounted() {},
    methods: {
        onAdd() {
            const index = this.form.push({
                cost: null,
                numberOfShares: 1000,
            });
            console.log(index);
            // nextTick()會在DOM已掛載、渲染完成後，執行nextTick()內的程式碼
            // https://stackoverflow.com/questions/59749325/vue-set-focus-to-dynamic-input-box
            this.$nextTick(() => {
                this.$refs[`cost${index - 1}`][0].focus();
            });
        },
        onChangeCost() {
            console.log('stockId');
        },
        onChangeNumberOfShares(e, index) {
            // 用 change 事件一樣會偵測不到，要用 keyup 事件才能在有按鍵輸入時即時反應值，
            //  e.target.value 是字串，要變整數。並且要給10才不會 eslint
            this.form[index].numberOfShares = parseInt(e.target.value, 10);
        },
        onDel(index) {
            this.form.splice(index, 1);
        },
        onInit(stockId) {
            this.isShow = true;
            // getters 在 vuex 只有在全域，沒有在個別 module，所以不用加 stock
            this.stockData = this.$store.getters.getStock(stockId); // 因為 computed 是在網頁開啟時就跑了，那時還沒有id就會變成沒過濾全都取了。為了在點擊設定才去取，所以要這樣
            this.title = `${this.stockData.name}(${this.stockData.id}) 設定成本`;
            console.log(this.data);
            console.log(stockId);
            // this.$nextTick(() => {
            // this.$refs.cost0[0].focus();
            // });
        },
    },
};
// 父傳子參考 https://its201.com/article/weixin_49035434/119852222 方法1，的emit似乎 vue 3有改語法而不行了。但方法2沒用 emit仍正常
</script>
