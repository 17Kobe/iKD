<template>
    <el-drawer :title="title" @closed="onClosed()" v-model="isShow" :show-close="true" direction="rtl" size="85%">
        
        <el-form ref="formCommentRef" :model="form">
            <span style="font-size: 24px">&nbsp;&nbsp;&nbsp;&nbsp;備註</span>
            <el-form-item>
                <el-row>
                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" style="padding-left: 3px">
                        <el-input v-model="form.comment" :autosize="{ minRows: 5, maxRows: 8 }" type="textarea" />
                    </el-col>
                </el-row>
            </el-form-item>

            <br>
            <span style="font-size: 24px">&nbsp;&nbsp;&nbsp;&nbsp;手動新增EPS</span>
            <el-form-item>
                <el-row>
                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" style="padding-left: 3px">
                        <el-date-picker
                            v-model="newEps.date"
                            size="small"
                            type="date"
                            placeholder="選擇日期"
                            style="margin-bottom: 10px; width: 150px;"
                        />
                        <br>
                        
                        <el-input
                            v-model="newEps.value"
                            size="small"
                            placeholder="輸入 EPS 值"
                            type="number"
                            style="margin-bottom: 10px; width: 150px;"
                        />

                        <br>
                        <el-button type="primary" size="small" @click="addEps">新增 EPS</el-button>
                    </el-col>
                </el-row>
            </el-form-item>
        </el-form>
    </el-drawer>
</template>

<script>
import _ from 'lodash';
import moment from 'moment';
// import { ElMessageBox, ElMessage } from 'element-plus';
import { ElMessage } from 'element-plus';

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

            newEps: {
                date: '', // 預設下一個日期
                value: '', // EPS 值
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
            // 計算下一個 EPS 日期
            this.calculateNextEpsDate();
        },
        calculateNextEpsDate() {
            if (!this.stockData.data || !this.stockData.data.eps || this.stockData.data.eps.length === 0) {
                // 如果沒有 EPS 資料，預設為當年的 03-31
                this.newEps.date = moment().format('YYYY-03-31');
                return;
            }

            // 取出最後一個 EPS 的日期
            const lastEps = this.stockData.data.eps[this.stockData.data.eps.length - 1];
            const lastDate = moment(lastEps.date, 'YYYY-MM-DD');

            // 計算下一個季度的日期
            const nextQuarter = (lastDate.month() + 3) % 12; // 下一季度的月份
            const nextYear = lastDate.month() + 3 > 11 ? lastDate.year() + 1 : lastDate.year(); // 如果超過 12 月，年份加 1

            // 根據季度月份設定固定的日期
            const nextDate = moment({ year: nextYear, month: nextQuarter, day: 1 }).endOf('month');

            // 設定下一個日期
            this.newEps.date = nextDate.format('YYYY-MM-DD');
        },
        addEps() {
            if (!this.newEps.value || !this.newEps.date) {
                this.$message.error('請輸入 EPS 值');
                return;
            }

            // 新增 EPS 到資料庫或狀態管理
            this.$store.commit('SAVE_STOCK_EPS', {
                stockId: this.stockId,
                eps: [
                    {
                        date: this.newEps.date,
                        value: parseFloat(this.newEps.value),
                    },
                ],
            });

            // 顯示成功訊息
            ElMessage({
                type: 'success',
                message: `EPS 新增成功！日期：${this.newEps.date}，值：${this.newEps.value}`,
            });

            // 清空輸入框並重新計算下一個日期
            this.newEps.value = '';
            this.calculateNextEpsDate();
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
