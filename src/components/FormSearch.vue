<template>
    <el-drawer
        :title="title"
        @opened="onOpend()"
        @closed="onClosed()"
        v-model="isShow"
        :show-close="true"
        direction="rtl"
        size="85%"
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
                    @hook:mounted="cancelReadOnly"
                    @visible-change="cancelReadOnly"
                    ref="search"
                >
                    <el-option v-for="item in stockOptions" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
                &nbsp;&nbsp;<el-button type="primary" @click="onAdd" style="margin-top: 10px"
                    ><i class="el-icon-plus"></i
                ></el-button>
            </el-form-item>
        </el-form>
        <el-table
            :data="customStockList"
            :show-header="false"
            :stripe="true"
            :row-class-name="tableRowClassName"
            style="width: 100%; margin-top: 5px"
        >
            <el-table-column fixed label="名稱" width="200">
                <template #default="scope">
                    <span
                        style="font-size: 16px; font-weight: bold; margin-left: 5px"
                        @click="onChangeBackgroundColor(scope.row.id)"
                    >
                        {{ scope.row.name }}
                    </span>
                    <span style="color: #cccccc; margin-left: 2px" v-if="scope.row.type !== 'fund'">{{ scope.row.id }}</span>
                </template>
            </el-table-column>
            <el-table-column fixed label="功能">
                <template #default="scope">
                    <el-button size="small" type="danger" @click="onDel(scope.row.id, scope.row.name)"
                        ><i class="el-icon-minus"></i
                    ></el-button>
                    <el-button size="small" type="info" :disabled="scope.$index === 0" @click="onMove(scope.row.id, 'top')"
                        ><i class="el-icon-caret-top"></i
                    ></el-button>
                    <el-button
                        size="small"
                        type="info"
                        :disabled="scope.$index === customStockList.length - 1"
                        @click="onMove(scope.row.id, 'bottom')"
                        ><i class="el-icon-caret-bottom"></i
                    ></el-button>
                </template>
            </el-table-column>
        </el-table>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;總數量：{{ customStockList.length }}
        <span v-if="hasLocalChanges" style="color: #e6a23c; margin-left: 10px;">
            <i class="el-icon-warning"></i> 有未保存的順序變更，關閉視窗時將自動保存
        </span>
        <br />
        <br />
        <el-row>
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" style="padding-left: 3px">
                <div v-for="(link, index) in links" :key="index" style="line-height: 30px">
                    &nbsp;&nbsp;&nbsp;&nbsp;<i :class="link.icon" style="font-size: 16px; position: relative; top: 2px"></i
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
        <br />
        <el-collapse v-model="activeNames">
            <el-collapse-item name="1" title="&nbsp;&nbsp;&nbsp;&nbsp;進階設定">
                <el-select v-model="recordSelected" class="m-2" placeholder="選擇記錄" style="max-width: 110px">
                    <el-option v-for="item in recordOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>

                <el-button type="warning" @click="onUploadSync"><i class="el-icon-upload2"></i> 上傳</el-button>
                <el-button type="primary" @click="onDownloadSync"><i class="el-icon-download"></i> 下載</el-button>
                <br />
                <br />
                &nbsp;
                <el-tooltip class="box-item" effect="dark" content="使用在星期六也要補班的時候" placement="top">
                    <el-button type="success" @click="onForceRefresh"
                        ><i class="el-icon-refresh-right"></i> 立即更新股價</el-button
                    >
                </el-tooltip>
                <!-- <br />
                <br />
                &nbsp;
                <el-tooltip class="box-item" effect="dark" content="避免手機 localstorage 5M 限制" placement="top">
                    <el-button type="danger" @click="onDel10YearsOld"
                        ><i class="el-icon-refresh-right"></i> 刪除10年前舊資料</el-button
                    >
                </el-tooltip> -->
                <br />
                <br />
                <el-switch
                    v-model="realtimeStock"
                    class="ml-2"
                    inline-prompt
                    style="--el-switch-on-color: #13ce66"
                    active-text="開啟即時股價模式"
                    inactive-text="關閉"
                />
            </el-collapse-item>
        </el-collapse>
    </el-drawer>
</template>

<script>
import _ from 'lodash';
import { ElMessageBox, ElMessage } from 'element-plus';
import CryptoJS from 'crypto-js';
import axios from 'axios';

export default {
    name: 'component-form-search',
    data() {
        const validateDuplcate = (rule, value, callback) => {
            // console.log(value);

            if (_.some(this.localCustomStockList, { id: value })) {
                const selected = _.find(this.stockOptions, ['value', this.form.stockId]);
                callback(new Error(`${selected.label}(${value}) 已存在!`));
            } else {
                callback();
            }
        };
        return {
            isShow: false,
            title: '新增股票',
            realtimeStock: false,

            // 暫存的股票列表，用於快速移動操作
            localCustomStockList: [],
            hasLocalChanges: false, // 標記是否有未保存的變更

            activeNames: ['1'],

            loading: false,
            stockOptions: [],

            recordSelected: '1',
            recordOptions: [
                {
                    value: '1',
                    label: '記錄1',
                },
                {
                    value: '2',
                    label: '記錄2',
                },
                {
                    value: '3',
                    label: '記錄3',
                },
                {
                    value: '4',
                    label: '記錄4',
                },
                {
                    value: '5',
                    label: '記錄5',
                },
            ],

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
    computed: {
        taiwanStockList() {
            return this.$store.state.taiwan.taiwanStockList;
        },
        customStockList() {
            // 如果有本地變更，使用暫存列表；否則使用 store 中的資料
            return this.hasLocalChanges ? this.localCustomStockList : this.$store.getters.getStockNoDataSortedList();
        },
        // stockList() {
        //     return this.$store.state.price.stockList;
        // },
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
                    const type = item.type === 'exchange' ? 'exchange' : item.type === 'btc' ? 'btc' : 'stock';
                    optionList.push({ label: item.stock_name, value: item.stock_id, type });
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
        tableRowClassName(row) {
            if (row.row.background) {
                return 'color-row';
            }
            return '';
        },

        onAdd() {
            console.log('onAdd');
            // console.log(this.form.stockId);
            // console.log(this.stockOptions);

            this.$refs.formSearchRef.validate((valid) => {
                if (valid) {
                    // 需要判斷是不存在，不能是空的才能加入
                    // 選到的
                    const selected = _.find(this.stockOptions, ['value', this.form.stockId]);
                    this.$store.commit('SAVE_A_STOCK', { name: selected.label, id: selected.value, type: selected.type });
                    
                    // 如果有暫存變更，重置暫存狀態以重新從 store 獲取最新資料
                    if (this.hasLocalChanges) {
                        this.hasLocalChanges = false;
                        this.localCustomStockList = [];
                    }
                    
                    return true;
                }
                console.log('error submit!!');
                return false;
            });
        },
        onDel(stockId, stockName) {
            ElMessageBox.confirm(`將要刪除[${stockName}]?`, '刪除', {
                confirmButtonText: '刪除',
                cancelButtonText: '取消',
                type: 'warning',
            })
                .then(() => {
                    // console.log(stockId);
                    this.$store.commit('DEL_A_STOCK', stockId);
                    
                    // 如果有暫存變更，也從暫存列表中移除該項目
                    if (this.hasLocalChanges) {
                        _.remove(this.localCustomStockList, (item) => item.id === stockId);
                        // 重新調整順序
                        this.localCustomStockList.forEach((item, index) => {
                            item.order = index + 1;
                        });
                    }
                    
                    // this.$store.commit('DEL_A_STOCK_DIVIDENDLIST', stockId);
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
        onMove(stockId, direction) {
            // 使用暫存列表進行快速移動操作
            if (!this.hasLocalChanges) {
                // 首次移動時，初始化暫存列表
                this.localCustomStockList = JSON.parse(JSON.stringify(this.$store.getters.getStockNoDataSortedList()));
                this.hasLocalChanges = true;
            }

            // 在暫存列表中執行移動操作
            const currentIndex = this.localCustomStockList.findIndex(item => item.id === stockId);
            if (currentIndex === -1) return;

            let targetIndex;
            if (direction === 'top' && currentIndex > 0) {
                targetIndex = currentIndex - 1;
            } else if (direction === 'bottom' && currentIndex < this.localCustomStockList.length - 1) {
                targetIndex = currentIndex + 1;
            } else {
                return; // 無法移動
            }

            // 交換位置
            const temp = this.localCustomStockList[currentIndex];
            this.localCustomStockList[currentIndex] = this.localCustomStockList[targetIndex];
            this.localCustomStockList[targetIndex] = temp;

            // 更新 order 屬性
            this.localCustomStockList.forEach((item, index) => {
                item.order = index + 1;
            });
        },
        onChangeBackgroundColor(stockId) {
            this.$store.commit('SAVE_STOCK_BACKGROUND_COLOR', stockId);
        },
        onInit() {
            console.log('onInit');
            this.isShow = true;
            
            // 重置暫存狀態
            this.hasLocalChanges = false;
            this.localCustomStockList = [];
            
            // 讀取 localStorage 中的 'realtimeStock' 數據
            const realtimeStockValue = localStorage.getItem('realtimeStock');

            // 使用 JSON.parse 轉換為布爾值，如果無法解析，則使用預設值（這裡假設預設值為 false）
            const isRealtimeStock = JSON.parse(realtimeStockValue) || false;

            console.log(isRealtimeStock);

            this.realtimeStock = isRealtimeStock;
        },
        onOpend() {
            // set focus 要寫在這不能寫在 onInit，否則會影響動畫lag
            // this.$nextTick(() => {
            //     this.$refs.search.focus();
            // });
        },
        onClosed() {
            localStorage.setItem('realtimeStock', this.realtimeStock);
            
            // 如果有未保存的變更，批量保存到 store
            if (this.hasLocalChanges) {
                this.saveLocalChangesToStore();
            }
        },
        
        // 將暫存的變更批量保存到 store
        async saveLocalChangesToStore() {
            try {
                // 批量更新 store 中的股票順序
                this.$store.commit('BATCH_UPDATE_STOCK_ORDER', this.localCustomStockList);
                
                // 重置暫存狀態
                this.hasLocalChanges = false;
                this.localCustomStockList = [];
                
                ElMessage({
                    type: 'success',
                    message: '順序已保存！',
                });
            } catch (error) {
                console.error('保存順序失敗:', error);
                ElMessage({
                    type: 'error',
                    message: '保存順序失敗！',
                });
            }
        },
        cancelReadOnly(value) {
            this.$nextTick(() => {
                if (!value) {
                    const { search } = this.$refs;
                    const input = search.$el.querySelector('.el-input__inner');
                    input.removeAttribute('readonly');
                }
            });
        },
        createCathy() {
            let elva = '';

            return {
                getKobe: function () {
                    elva = '5KZ493uKLWlakctmu9NAzQ012VUgpZ1iwE4u';
                    return elva;
                },
            };
        },
        async onUploadSync() {
            console.log('onUploadSync');
            try {
                const cathy = this.createCathy();
                // 取得 localstorage 中的資料
                const GITHUB_ACCESS_TOKEN = CryptoJS.AES.decrypt(
                    'U2FsdGVkX1/f4v8wb4AfQPIrmo7wQJBv7EnT8VZ8qX1cbglnDPNZL9n87xZvyuPPifZLkkDBAIKf8wAnWaMXHQ==',
                    cathy.getKobe()
                ).toString(CryptoJS.enc.Utf8);

                // const dataString = JSON.stringify(window.localStorage); // 舊作法會在 value 時出現 /"，因為 value 都是字串，而非JSON物件
                // 正確應先 parse 好正確的 JSON 物件，其中 key==='crawlerDividendLastDate' 是字串
                const data = {};
                for (let key in window.localStorage) {
                    if (key === 'crawlerDividendLastDate') data[key] = localStorage.getItem(key);
                    // localStorage 會有這些key
                    else if (
                        key !== 'length' &&
                        key !== 'clear' &&
                        key !== 'getItem' &&
                        key !== 'key' &&
                        key !== 'removeItem' &&
                        key !== 'setItem'
                    )
                        data[key] = JSON.parse(localStorage.getItem(key));
                }
                // 因為 stockList 沒有儲存在 localstorage，只在 indexedDB 及 vuex
                data['stockList'] = this.$store.state.price.stockList; // 有包括 個股data
                const dataString = JSON.stringify(data);

                // console.log(dataString);
                //

                // 將資料轉換成 Blob 物件
                const blob = new Blob([dataString], { type: 'application/json' });

                // 讀取 Blob 內容，並使用 FileReader 轉換成 Base64 編碼
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = async () => {
                    // 取得現有檔案的 SHA 值
                    const url = `https://api.github.com/repos/17Kobe/iKD/contents/assets/data/my_localstorage${this.recordSelected}.json`;
                    const response = await axios.get(url, {
                        headers: {
                            Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
                        },
                        params: {
                            ref: 'gh-pages', // 指定分支為 gh-pages
                        },
                    });
                    // console.log(response);
                    const sha = response.data.sha;

                    // 在這裡上傳到 Github
                    const contentBase64 = reader.result.split(',')[1];
                    const uploadResponse = await axios.put(
                        `https://api.github.com/repos/17Kobe/iKD/contents/assets/data/my_localstorage${this.recordSelected}.json`,
                        {
                            message: 'Upload iKD localstorage data',
                            content: contentBase64,
                            sha: sha,
                            branch: 'gh-pages',
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
                            },
                        }
                    );
                    // console.log(uploadResponse);
                    ElMessage({
                        type: 'success',
                        message: '完成上傳同步資料至線上!',
                    });
                };
            } catch (error) {
                console.error(error);
            }
        },
        onDownloadSync() {
            console.log('onDownloadSync');
            ElMessageBox.confirm(`確認將要同步線上的所有資料，本地資料會消失?`, '同步', {
                confirmButtonText: '同步',
                cancelButtonText: '取消',
                type: 'warning',
            })
                .then(() => {
                    // 清除 localStorage 資料
                    localStorage.clear();

                    // 載入 JSON 資料，後面加日期是為了避免手機用快取下載，而非真正抓最新的資料
                    const url =
                        `https://17kobe.github.io/iKD/assets/data/my_localstorage${this.recordSelected}.json?` +
                        new Date().getTime();
                    fetch(url)
                        .then((response) => response.json())
                        .then((data) => {
                            // 將 JSON 資料存儲到 localStorage
                            try {
                                let downloadLocalSotrage = [];
                                for (const key in data) {
                                    if (key === 'crawlerDividendLastDate') localStorage.setItem(key, data[key]);
                                    else if (key === 'stockList') {
                                        // localStorage.setItem(key, JSON.stringify(data[key]));
                                        downloadLocalSotrage = data[key];
                                    } else localStorage.setItem(key, JSON.stringify(data[key]));
                                }
                                // console.log(downloadLocalSotrage);
                                // downloadLocalSotrage.forEach((obj) => {
                                //     const foundStock = this.stockList.find((v) => v.id === obj.id);
                                //     if (foundStock) {
                                //         // 跟 data 有關(last_price、last_price_date、last_price_spread)的也有跟 data一起改，否則data可能無更新時，會顯示錯的last_price
                                //         obj.last_price = foundStock.last_price;
                                //         obj.last_price_date = foundStock.last_price_date;
                                //         obj.last_price_spread = foundStock.last_price_spread;
                                //         obj.data = JSON.parse(JSON.stringify(foundStock.data)); //{ ...foundStock.data }; // 這種改法只有第一層 // 取值而已，不然會是 proxy(object)
                                //     }
                                // });
                                // console.log(downloadLocalSotrage);
                                this.$store.commit('SAVE_ALL_STOCK', downloadLocalSotrage);

                                ElMessage({
                                    type: 'success',
                                    message: '完成同步線上的所有資料!',
                                });

                                // saveStockListToDb('stockList', state.stockList);
                                window.setTimeout(() => location.reload(), 1000);

                                // const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
                                // indexedDB.deleteDatabase("wc");
                            } catch (e) {
                                console.log('localStorage 儲存失敗：', e);
                            }
                        })
                        .catch((error) => console.error(error));
                })
                .catch(() => {
                    ElMessage({
                        type: 'info',
                        message: '取消同步線上的所有資料!',
                    });
                });
        },
        onForceRefresh() {
            this.$store.dispatch('GET_STOCK_PRICE', true);

            ElMessage({
                type: 'success',
                message: '完成立即更新股價!',
            });
        },

        onDel10YearsOld() {
            this.$store.commit('DEL_10_YEARS_OLD');
            localStorage.removeItem('stockList');
            indexedDB.deleteDatabase('wc');
            // this.$cache.save('aaa', { id: 123, data: '1231' });
            // console.log('Value added to cache.');
            // this.$cache.get('aaa', (result) => {
            //     console.log(result);
            //     //     sendData(`get: ${JSON.stringify(result)}`);
            // });
            // console.log(this.$cache.get('aaa', { id: 123, data: '1231' }));

            ElMessage({
                type: 'success',
                message: '完成刪除10年前舊資料!',
            });
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
        },
    },
};
// 父傳子參考 https://its201.com/article/weixin_49035434/119852222 方法1，的emit似乎 vue 3有改語法而不行了。但方法2沒用 emit仍正常
</script>

<style lang="sass" scoped>
.el-button+.el-button
    margin-left: 5px

.el-input__inner
    pointer-events: auto
</style>
