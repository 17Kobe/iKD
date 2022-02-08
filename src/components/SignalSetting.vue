<template>
    <el-tabs id="signal-setting-tabs" type="border-card" class="bg-keep-blue mb-3">
        <el-tab-pane label="自訂策略">
            <el-form ref="form" label-width="80px">
                <el-form-item label="訊號" class="mb-0">
                    <el-radio-group v-model="isBuyOrSell" fill="#4ac3d9" size="mini">
                        <el-radio-button label="buy">買進</el-radio-button>
                        <el-radio-button label="sell">賣出</el-radio-button>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="採用公式" class="mb-0">
                    <el-radio-group v-model="formula" fill="#4ac3d9" size="mini">
                        <el-radio-button v-for="formulaItem in listBuyOrSell" :key="formulaItem.name" :label="formulaItem.name">
                            {{ formulaItem.name }}
                        </el-radio-button>
                        <!-- <el-radio-button label="rsi">RSI</el-radio-button>
                        <el-radio-button label="rsi">MACD</el-radio-button>
                        <el-radio-button label="rsi">絕對正報酬</el-radio-button>
                        <el-radio-button label="rsi">差值</el-radio-button>
                        <el-radio-button label="rsi">日期</el-radio-button> -->
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="參數" class="mb-0">
                    <template v-for="(paraItem, paraIndex) in listPara" :key="paraIndex">
                        <el-col :span="4">
                            <el-input size="mini" v-model="paramList[paraIndex]"></el-input>
                        </el-col>
                    </template>
                    <!-- <el-col :span="4">
                        <el-input size="mini"></el-input>
                    </el-col>
                    <el-col :span="4">
                        <el-input size="mini"></el-input>
                    </el-col> -->
                </el-form-item>
                <el-form-item label="限制" class="mb-0">
                    <el-col :span="7">
                        <el-input size="mini"></el-input>
                    </el-col>
                    <!-- <el-col :span="7">
                        <el-input v-model="input" size="mini"></el-input>
                    </el-col>
                    <el-col :span="7">
                        <el-input v-model="input" size="mini"></el-input>
                    </el-col> -->
                </el-form-item>
                <el-form-item class="mb-0">
                    <el-button type="primary" size="mini">新增</el-button>
                    <!-- <el-button>取消</el-button> -->
                </el-form-item>
            </el-form>
            <el-table style="width: 100%" size="mini" empty-text="無資料" stripe border>
                <el-table-column prop="date" label="買進"> </el-table-column>
                <el-table-column prop="name" label="賣出"> </el-table-column>
                <!-- <el-table-column prop="address" label="漲跌幅" width="56px"> </el-table-column> -->
            </el-table>
            <!-- <el-input type="textarea" :autosize="{ minRows: 6, maxRows: 20 }" class="p-3" v-model="textarea2"></el-input> -->
            <el-carousel indicator-position="outside" height="100px" :autoplay="false">
                <el-carousel-item v-for="item in 4" :key="item">
                    <h3>{{ item }}</h3>
                </el-carousel-item>
            </el-carousel></el-tab-pane
        >
        <el-tab-pane label="AI 策略">
            <el-button type="primary" size="mini">計算每年最佳買賣日期</el-button>
        </el-tab-pane>
    </el-tabs>
</template>
<script>
import _ from 'lodash';

export default {
    data() {
        return {
            // 設定有的公式全都在這設就後，後面全都動態產生
            form: {
                buy: [
                    { name: 'KD', param: [9, 9], limit: 20, limit_label: '以下出現黃金交叉' },
                    { name: 'MACD', param: [12, 26, 9], limit: 0, limit_label: '以下出現黃金交叉' },
                    { name: '定期定額', param: [15], param_label: ['日(每月)'] },
                    { name: '絕對淨值差', param: [10], param_label: ['% 以上'] },
                    { name: '日期', param: ['$date'], limit: '$checkbox', limit_label: '每年' },
                ],
                sell: [
                    { name: 'KD', param: [9, 9], limit: 20, limit_label: '以上出現死亡交叉' },
                    { name: 'MACD', param: [12, 26, 9], limit: 0, limit_label: '以上出現死亡交叉' },
                    { name: '停利', param: [10], param_label: '% 以上' },
                    { name: '停損', param: [-10], param_label: '% 以下' },
                    { name: '雙十停利', param: [10, 10], param_label: ['次 以上', '% 以上'] },
                    { name: '絕對正報酬', param: [0], param_label: '% 以上' },
                    { name: '日期', param: ['$date'], limit: '$checkbox', limit_label: '每年' },
                ],
            },
            isBuyOrSell: 'buy',
            formula: 'KD',
            paramList: [],
        };
    },
    computed: {
        listBuyOrSell() {
            return this.form[this.isBuyOrSell];
        },
        listPara() {
            // 找到 buy 或 sell 裡 object of array 中 name == 選擇的公式
            const obj = _.find(this.form[this.isBuyOrSell], ['name', this.formula]);
            return (obj && obj.param) || [];
        },
    },
    watch: {
        // listPara(val) {
        //     this.paramList = val;
        // },
        listPara: {
            immediate: true, // 須要立即，否則頁面重整就可能沒呼叫
            handler(newVal, oldVal) {
                console.log(newVal, oldVal);
                this.paramList = newVal;
            },
        },
    },
};
</script>

<style lang="sass">
/* 算是全域的設定 */
.el-tabs--border-card:hover
    box-shadow: 0 1px 2px 0 rgb(60 64 67 / 30%), 0 1px 3px 1px rgb(60 64 67 / 15%)

/* 內容padding縮小 */
.el-tabs--border-card > .el-tabs__content
    padding: 10px !important

.el-radio-button__inner
    padding: 8px !important

.el-input__inner
    padding: 4px !important

#signal-setting-tabs.el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active
    background-color: #cbf0f8 !important
</style>
