<template>
    <el-drawer :title="title" @closed="onClosed()" v-model="isShow" :show-close="true" direction="rtl" size="70%">
        &nbsp;&nbsp;<el-button type="primary" @click="onExport"><i class="el-icon-download"></i> 匯出設定檔</el-button>
        <br />
        <br />
        <el-upload class="upload-demo" action="" :auto-upload="false" :on-change="openFile" :limit="1">
            &nbsp;&nbsp;<el-button type="primary"><i class="el-icon-upload2"></i> 匯入設定檔</el-button>
        </el-upload>
        <!-- <el-button type="primary" @click="onImport"><i class="el-icon-upload2"></i> 匯入設定檔</el-button> -->
    </el-drawer>
</template>

<script>
// import _ from 'lodash';
import { ElMessage } from 'element-plus';

export default {
    name: 'component-form-search',
    data() {
        return {
            isShow: false,
            title: '匯出/入 設定檔',
        };
    },
    computed: {},
    mounted() {},
    methods: {
        onInit() {
            console.log('onInit');
            this.isShow = true;
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
        onExport() {
            console.log('onExport');
            const a = document.createElement('a');
            const file = new Blob([localStorage.getItem('stockList')], { type: 'text/plain' });
            a.href = URL.createObjectURL(file);
            a.download = 'iKD.txt';
            a.click();
        },

        // 讀檔參考 https://blog.csdn.net/qq_40729514/article/details/109677411
        openFile(file) {
            const reader = new FileReader();
            const store = this.$store;
            reader.onload = function () {
                if (reader.result) {
                    localStorage.setItem('stockList', reader.result);
                    const localStockList = JSON.parse(reader.result) || [];
                    store.commit('SAVE_STOCK_LIST', localStockList); // 在這裡就不能用 this，所以寫在外頭
                    ElMessage({
                        type: 'success',
                        message: '完成匯入設定檔!',
                    });
                }
            };
            reader.readAsText(file.raw);
        },
    },
};
// 父傳子參考 https://its201.com/article/weixin_49035434/119852222 方法1，的emit似乎 vue 3有改語法而不行了。但方法2沒用 emit仍正常
</script>
