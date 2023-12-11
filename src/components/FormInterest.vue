<template>
    <el-drawer :title="title" @closed="onClosed()" v-model="isShow" :show-close="true" direction="rtl" size="85%">
        <el-config-provider :locale="locale">
            <el-form ref="formInterestRef">
                <el-row v-for="(item, index) in form" :key="index">
                    <el-col :xs="10" :sm="12" :md="7" :lg="4" :xl="3" style="padding-left: 3px">
                        <el-form-item label="日期">
                            <el-date-picker
                                @change="onChangeDate($event, index)"
                                v-model="item.date"
                                type="date"
                                :clearable="false"
                                size="small"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="9" :sm="7" :md="7" :lg="5" :xl="4" style="padding-left: 16px">
                        <el-form-item label="利息">
                            <el-input
                                v-model="item.interest"
                                placeholder="ex: 1200"
                                size="small"
                                :ref="`interest${index}`"
                                @keyup="onChangeInterest($event, index)"
                                type="number"
                                inputmode="decimal"
                                style="margin-left: 2px"
                                @focus="$event.target.select()"
                            >
                                <template #suffix>元</template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :xs="5" :sm="5" :md="3" :lg="3" :xl="2" style="display: flex; align-items: center">
                        &nbsp;&nbsp;<el-button type="danger" size="small" @click="onDel(index)"
                            ><i class="el-icon-minus"></i></el-button
                    ></el-col>
                </el-row>
                <el-form-item>
                    <el-button type="primary" size="small" @click="onAdd" style="margin-left: 5px"
                        ><i class="el-icon-plus"></i>&nbsp;新增利息</el-button
                    >
                </el-form-item>
            </el-form>
        </el-config-provider>
    </el-drawer>
</template>

<script>
import _ from 'lodash';
import moment from 'moment';
import { ElMessageBox, ElMessage, ElConfigProvider } from 'element-plus';
import zhTw from 'element-plus/lib/locale/lang/zh-tw';

export default {
    name: 'component-form-interest',
    components: {
    ElConfigProvider,
    },
    data() {
        return {
            isShow: false,
            title: '利息列表',
            form: [
                // {
                //     date: '2023-12-10',
                //     interest: 1000,
                // },
            ],
        };
    },
    computed: {
        locale() {
            return zhTw; // 設置為繁中語言包
        },
    },
    mounted() {},
    methods: {
        onInit() {
            console.log('onInit');
            this.isShow = true;

            this.form = this.$store.state.asset.interestList;
        },
        onAdd() {
            console.log('onAdd');

            const index = this.form.push({
                date: moment().format('YYYY-MM-DD'),
                interest: 1000,
            });
            // nextTick()會在DOM已掛載、渲染完成後，執行nextTick()內的程式碼
            // https://stackoverflow.com/questions/59749325/vue-set-focus-to-dynamic-input-box
            this.$nextTick(() => {
                this.$refs[`interest${index - 1}`][0].focus();
            });
        },
        onDel(index) {
            ElMessageBox.confirm(`將要刪除 日期[${this.form[index].date}] 利息[${this.form[index].interest}] 的項目?`, '確定', {
                confirmButtonText: '確定',
                cancelButtonText: '取消',
                type: 'warning',
            })
                .then(() => {
                    this.form.splice(index, 1);
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
        onChangeDate(value, index) {
            console.log('onChangeDate');
            this.form[index].date = moment(value).format('YYYY-MM-DD');
        },
        onChangeInterest(e, index) {
            console.log('onChangeInterest');
            // 加 parseFloat就要是要把字串變float，存在 the.form裡面
            // 一定要搭配type="number"，否則小數點.手機會輸入不出來

            // 最終不能用 parseFloat 跟 parseInt 都會造成不能輸入小數點的問題，只好這裡是字串
            this.form[index].interest = Number(e.target.value);
        },
        onClosed() {
            this.$store.commit('SAVE_INTEREST', this.form);
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

@media only screen and (max-width: 767px)
    .el-input.el-date-editor--date
        width: 120px
@media only screen and (min-width: 1201px)
    .el-input.el-date-editor--date
        width: 180px
</style>
