<template>
    <el-drawer :title="title" v-model="isShow" :show-close="true" direction="rtl" size="85%">
        <el-form ref="formLinkRef">
            <el-form-item>
                <el-row>
                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" style="padding-left: 3px">
                        <div v-for="(link, index) in links" :key="index" style="line-height: 30px">
                            &nbsp;&nbsp;&nbsp;&nbsp;<i
                                :class="link.icon"
                                style="font-size: 16px; position: relative; top: 2px"
                            ></i
                            >&nbsp;&nbsp;<el-link
                                :href="link.url"
                                type="primary"
                                target="_blank"
                                :underline="true"
                                style="color: #409eff; font-size: 16px"
                                @click="copyToClipboard(link.url)"
                                >{{ link.text }}</el-link
                            >
                        </div>
                        <!-- <el-input v-model="form.link" :autosize="{ minRows: 5, maxRows: 8 }" type="textarea" /> -->
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
    name: 'component-form-link',
    data() {
        return {
            isShow: false,
            title: '參考連結',
            links: [
                {
                    text: 'StockQ',
                    url: 'http://www.stockq.org/',
                    icon: 'el-icon-coin',
                },
                {
                    text: 'VIX 恐慌指數',
                    url: 'https://www.macromicro.me/charts/17598/kong-huang-zhi-shu-yu-S-P-500',
                    icon: 'el-icon-lightning',
                },
                {
                    text: '美股 散戶投資人情緒指數',
                    url: 'https://www.macromicro.me/charts/20828/us-aaii-sentimentsurvey',
                    icon: 'el-icon-moon',
                },
                {
                    text: '美國 S&P500 科技類股',
                    url: 'https://www.macromicro.me/charts/35730/sp500-information-technology-eps',
                    icon: 'el-icon-apple',
                },
                {
                    text: '美元 基本面指數',
                    url: 'https://www.macromicro.me/collections/1767/us-dollar/14948/mm-dxy-expectation-index',
                    icon: 'el-icon-money',
                },
                {
                    text: '美債 20年期公債殖利率',
                    url: 'https://www.macromicro.me/charts/60802/mei-guo-20-nian-qi-gong-zhai-zhi-li-lyu-TLT',
                    icon: 'el-icon-knife-fork',
                },
                {
                    text: '美債 基本面指數',
                    url: 'https://www.macromicro.me/collections/51/us-treasury-bond/763/mm-us-bond-index',
                    icon: 'el-icon-knife-fork',
                },
                {
                    text: '黃金 基本面指數',
                    url: 'https://www.macromicro.me/collections/45/mm-gold-price/749/mm-gold',
                    icon: 'el-icon-trophy',
                },
                {
                    text: '台股 基本面指數',
                    url: 'https://www.macromicro.me/collections/46/tw-stock-relative/725/tw-mm-twse',
                    icon: 'el-icon-food',
                },
                {
                    text: '台灣 領先指標',
                    url: 'https://www.macromicro.me/collections/46/tw-stock-relative/696/tw-lagging-twse',
                    icon: 'el-icon-guide',
                },
                {
                    text: '台灣 景氣對策信號',
                    url: 'https://www.macromicro.me/collections/10/tw-monitoring-indicators-relative/90/tw-light-stock',
                    icon: 'el-icon-bicycle',
                },
                {
                    text: '台灣 信義房價指數',
                    url: 'https://www.macromicro.me/collections/15/tw-housing-relative/124/tw-housing-price-sinyi',
                    icon: 'el-icon-house',
                },
                {
                    text: '台積電(TSM) ADR',
                    url: 'https://www.wantgoo.com/global/tsm',
                    icon: 'el-icon-baseball',
                },
                {
                    text: '台積電(2330)',
                    url: 'https://www.macromicro.me/collections/1736/tsmc/14500/tw-tsmc-2330-monthly-revenue',
                    icon: 'el-icon-baseball',
                },
                {
                    text: '元大高股息(0056)',
                    url: 'https://www.macromicro.me/etf/tw/intro/0056',
                    icon: 'el-icon-baseball',
                },
            ],
        };
    },
    computed: {},
    mounted() {
    },
    methods: {
        onInit() {
            console.log('onInit');
            this.isShow = true;
            // getters 在 vuex 只有在全域，沒有在個別 module，所以不用加 stock
            // eslint-disable-next-line prefer-destructuring
            // 一定要用 else，不然可能用到上個開的股票了

            // this.form.comment = _.has(this.stockData, 'comment') ? this.stockData.comment : '';

            // this.$nextTick(() => {
            // this.$refs.cost0[0].focus();
            // });
        },
        copyToClipboard(url) {
            // 使用 Clipboard API 複製網址到剪貼簿
            const textField = document.createElement('textarea');
            textField.innerText = url;
            document.body.appendChild(textField);
            textField.select();
            document.execCommand('copy');
            textField.remove();

            // 這裡可以添加一個提示或反饋給用戶
            // alert('網址已複製到剪貼簿');
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
