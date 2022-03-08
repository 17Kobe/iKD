import { createRouter, createWebHashHistory } from 'vue-router';
import ListStock from '../views/ListStock.vue';
import AssetAllocation from '../views/AssetAllocation.vue';
import ListDividend from '../views/ListDividend.vue';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: 'dashboard',
            components: {
                default: ListStock, // 預設第一頁是顯示 自訂股票
                asset: AssetAllocation, // 點到 tab 時，會顯示 router-view 的 name
                dividend: ListDividend, // 點到 tab 時，會顯示 router-view 的 name
            },
        },
    ],
});

// 因為 eslint 想用 export default，所以就不用 export const 方式
// 參考 https://book.vue.tw/CH4/4-1-vue-router-intro.html
export default router;
