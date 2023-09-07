<template>
    <el-drawer :title="title" @closed="onClosed()" v-model="isShow" :show-close="true" direction="rtl" size="85%">
        <span style="font-size: 24px">&nbsp;&nbsp;&nbsp;&nbsp;備註</span>
        <el-form ref="formCommentRef" :model="form">
            <el-form-item>
                <el-row>
                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" style="padding-left: 3px">
                        <el-input v-model="form.comment" :autosize="{ minRows: 5, maxRows: 8 }" type="textarea" />
                    </el-col>
                </el-row>
            </el-form-item>
        </el-form>
    </el-drawer>
</template>

<script>
import _ from 'lodash';
// import moment from 'moment';
// import { ElMessageBox, ElMessage } from 'element-plus';

export default {
    name: 'component-form-comment',
    data() {
        return {
            stockId: null,
            isShow: false,
            title: '設定備註',
            stockData: {},

            form: {
                comment: '',
            },
        };
    },
    computed: {},
    mounted() {},
    methods: {
        onInit(stockId) {
            console.log('onInit');
            this.stockId = stockId;
            this.isShow = true;
            // getters 在 vuex 只有在全域，沒有在個別 module，所以不用加 stock
            this.stockData = this.$store.getters.getStock(stockId); // 因為 computed 是在網頁開啟時就跑了，那時還沒有id就會變成沒過濾全都取了。為了在點擊設定才去取，所以要這樣
            // eslint-disable-next-line prefer-destructuring
            this.title = `${this.stockData.name}(${this.stockData.id}) 設定備註`;
            // 一定要用 else，不然可能用到上個開的股票了

            this.form.comment = _.has(this.stockData, 'comment') ? this.stockData.comment : '';

            // this.$nextTick(() => {
            // this.$refs.cost0[0].focus();
            // });
        },
        onClosed() {
            // 因為無法解決手機無法輸入.小數點時轉float會連.都沒有，所以最後才轉
            this.$store.commit('SAVE_STOCK_COMMENT', {
                stockId: this.stockId,
                comment: this.form.comment,
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
    font-size: 24px
.i-form .el-form-item__content
    line-height: 28px
.el-drawer.rtl
    overflow: scroll
</style>
