<template>
    <el-drawer :title="title" @closed="onClosed()" v-model="isShow" :show-close="true" direction="rtl" size="45%">
        <GoogleLogin :callback="callback" popup-type="TOKEN" prompt />
        &nbsp;&nbsp;<el-button type="primary" @click="onUploadSync"><i class="el-icon-upload2"></i> 上傳同步資料</el-button>
        <br />
        <br />
        &nbsp;&nbsp;<el-button type="primary" @click="onDownloadSync"><i class="el-icon-download"></i> 下載同步資料</el-button>
        <br />
        <br />
        &nbsp;&nbsp;<el-button type="primary" @click="onExport"><i class="el-icon-download"></i> 匯出設定檔</el-button>
        <br />
        <br />
        <el-upload class="upload-demo" action="" :auto-upload="false" :on-change="openFile" :limit="1">
            &nbsp;&nbsp;<el-button type="primary"><i class="el-icon-upload2"></i> 匯入設定檔</el-button>
        </el-upload>
        <br />
        &nbsp;&nbsp;<el-button type="danger" @click="onClear"><i class="el-icon-download"></i> 清除設定檔</el-button><br /><br />
        &nbsp;&nbsp;<el-button type="success" @click="onForceDividendRefresh"
            ><i class="el-icon-refresh-right"></i> 立即更新配息</el-button
        ><br /><br />
        &nbsp;
        <el-tooltip class="box-item" effect="dark" content="使用在星期六也要補班的時候" placement="top">
            <el-button type="success" @click="onForceRefresh"><i class="el-icon-refresh-right"></i> 立即更新股價</el-button>
        </el-tooltip>
        <br /><br />
        &nbsp;
        <el-tooltip class="box-item" effect="dark" content="當網站的預設基金有增加時，可以執行更新後增加自選股" placement="top">
            <el-button type="success" @click="onUpdateDefaultStockList"
                ><i class="el-icon-refresh-right"></i> 更新預設自選股</el-button
            >
        </el-tooltip>
        <!-- <el-button type="primary" @click="onImport"><i class="el-icon-upload2"></i> 匯入設定檔</el-button> -->
    </el-drawer>
</template>

<script>
// import _ from 'lodash';
import _ from 'lodash';
import { ElMessageBox, ElMessage } from 'element-plus';
import DefaultStockList from '../store/data/default-stock-list.json';

export default {
    name: 'component-form-search',
    data() {
        return {
            isShow: false,
            title: '匯出/入 設定檔',
        };
    },
    computed: {
        stockList() {
            return this.$store.state.price.stockList;
        },
    },
    mounted() {
        console.log(this.$gapi);
    },
    methods: {
        callback(response) {
            console.log('Handle the response', response);
        },
        async uploadToDrive() {
            // try {
            //     const { currentUser, gapi, hasGrantedScopes } = await this.$gapi.login();
            //     // console.log({ currentUser, gapi, hasGrantedScopes });
            //     console.log(this.$gapi);
            //     const data = JSON.stringify(localStorage); // 打包 localstorage 為 JSON 字串
            //     const file = new Blob([data], { type: 'application/json' }); // 建立 Blob 物件
            //     const metadata = { name: 'iKD.json' }; // 檔案名稱
            //     const res = await this.$gapi.client.drive.files.create({
            //         resource: metadata,
            //         media: {
            //             mimeType: 'application/json',
            //             body: file,
            //         },
            //         fields: 'id',
            //     });
            //     console.log(res);
            // } catch (error) {
            //     console.error(error);
            // }
        },

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
        onUploadSync() {
            console.log('onUploadSync');
            this.uploadToDrive();
        },
        onDownloadSync() {
            console.log('onDownloadSync');
        },
        onExport() {
            console.log('onExport');
            const data = JSON.stringify(localStorage);
            const blob = new Blob([data], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'iKD.json';
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        },
        onClear() {
            ElMessageBox.confirm(`將要刪除所有自行設定內容，包括成本及買賣策略?`, '刪除', {
                confirmButtonText: '刪除',
                cancelButtonText: '取消',
                type: 'warning',
            })
                .then(() => {
                    localStorage.removeItem('stockList');
                    localStorage.removeItem('assetList');
                    localStorage.removeItem('dividendList');
                    ElMessage({
                        type: 'success',
                        message: '完成刪除設定檔!',
                    });
                })
                .catch(() => {
                    ElMessage({
                        type: 'info',
                        message: '取消刪除設定檔!',
                    });
                });
        },

        onForceDividendRefresh() {
            this.$store.commit('SAVE_STOCK_DIVIDEND_LAST_DATE');
            this.$store.commit('DELETE_DUPLICATE_HISTORY_DIVIDEND_DATA');
            ElMessage({
                type: 'success',
                message: '完成立即更新股價!',
            });
        },

        onForceRefresh() {
            this.$store.dispatch('GET_STOCK_PRICE', true);

            ElMessage({
                type: 'success',
                message: '完成立即更新股價!',
            });
        },

        onUpdateDefaultStockList() {
            console.log(DefaultStockList);
            const storeStockList = this.stockList;

            // 找出儲存有缺少的key
            storeStockList.forEach((obj) => {
                const foundStock = DefaultStockList.find((v) => v.id === obj.id);
                if (foundStock && foundStock.is_dividend && !obj.is_dividend)
                    // 加 foundStock 是因為有可能是後來自己加的股票
                    this.$store.commit('ADD_A_STOCK_KEY', {
                        stockId: obj.id,
                        isDvidend: foundStock.is_dividend,
                    });
            });

            // 找出預設清單有但儲存是沒有id的新增加的清單
            const newStockList = _.filter(DefaultStockList, function (obj) {
                return !_.find(storeStockList, { id: obj.id });
            });
            console.log(newStockList);
            newStockList.forEach((obj) => {
                this.$store.commit('SAVE_A_STOCK', obj);
            });
        },
        // 讀檔參考 https://blog.csdn.net/qq_40729514/article/details/109677411
        openFile(file) {
            const reader = new FileReader();
            const store = this.$store;
            reader.onload = function () {
                if (reader.result) {
                    const obj = JSON.parse(reader.result);

                    if (obj.stockList) {
                        localStorage.setItem('stockList', JSON.stringify(obj.stockList));
                        const localStockList = obj.stockList || [];
                        store.commit('SAVE_STOCK_LIST', localStockList);
                    }
                    if (obj.assetList) {
                        localStorage.setItem('assetList', JSON.stringify(obj.assetList));
                        const localAssetList = obj.assetList || [];
                        store.commit('SAVE_ASSET', localAssetList);
                    }
                    if (obj.dividendList) {
                        localStorage.setItem('dividendList', JSON.stringify(obj.dividendList));
                        const localDividendList = obj.dividendList || [];
                        store.commit('SAVE_DIVIDEND_LIST', localDividendList);
                    }
                    // if (obj.historyDividendList) {
                    //     localStorage.setItem('historyDividendList', JSON.stringify(obj.historyDividendList));
                    //     const localHistoryDividendList = obj.historyDividendList || [];
                    //     store.commit('SAVE_HISTORY_DIVIDEND_LIST', localHistoryDividendList);
                    // }
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
