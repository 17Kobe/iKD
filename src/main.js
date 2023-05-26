// Vue 3.0 with Composition API Style
// 參考 https://book.vue.tw/CH1/1-1-introduction.html
// vite & plugin-vue & vite-plugin-singlefile should be listed in the project's dependencies, not devDependencies
import { createApp } from 'vue';

import ElementPlus from 'element-plus';

import 'element-plus/lib/theme-chalk/index.css';
import '@/index.css';

// 這裡是用局部註冊，而非寫在 main.js 是全局註冊
import Highcharts from 'highcharts';
import loadStock from 'highcharts/modules/stock';
// 參考 https://github.com/weizhenye/vue-highcharts/issues/39
import loadIndicatorsAll from 'highcharts/indicators/indicators-all';
// 在這裡一定要用大括號，不然會錯，因為highcharts-vue.js中有命名為 Chart 的export

import VueNumber from 'vue-number-animation';
import store from '@/store/store';
import router from '@/router/router';

// import _ from 'lodash';
import App from '@/App.vue';
localStorage.clear();
// let localStockList = JSON.parse(localStorage.getItem('stockList')) || [];

// _.remove(localStockList, (obj) => obj.id === '2886');
// _.remove(localStockList, (obj) => obj.id === 'F0GBR04D20');
// _.remove(localStockList, (obj) => obj.id === 'F000001V09');
// _.remove(localStockList, (obj) => obj.id === 'F0GBR04K8F');
// _.remove(localStockList, (obj) => obj.id === 'F0GBR04AR8');
// localStorage.setItem('stockList', JSON.stringify(state.stockList));

// localStorage.setItem('stockList', JSON.stringify(localStockList));
// 因為 series 是股票圖，所以要導入 stock 模組，才能有 type: 'candlestick'
loadStock(Highcharts);
loadIndicatorsAll(Highcharts);

// highcharts 全域設定
Highcharts.setOptions({
    lang: { rangeSelectorZoom: '' }, // 不顯示 'zoom' 文字
    global: {
        useUTC: false,
    },
    credits: {
        // 將 highchart credit 圖最下方超連結隱藏
        enabled: false,
    },
});

// 建立 vue 的實體物件並指定至 app
const app = createApp(App);

app.use(store);
app.use(router);
app.use(ElementPlus);
app.use(VueNumber);

// 掛載 monut 至指定網頁(index.html) 中的 #app 節點上
app.mount('#app');
