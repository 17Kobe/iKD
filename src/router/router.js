import { createRouter, createWebHashHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import SingleStock from '../views/SingleStock.vue';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: 'dashboard',
            component: Dashboard,
        },
        {
            path: '/stock/:id',
            name: 'stock',
            // lazy-loaded 不行用，否則 npm run build，再去執行會從 console 看到 t.map is not a function
            component: SingleStock,
            // component: () => import('../views/SingleStock.vue'),
        },
        {
            path: '/axios',
            name: 'Axios',
            component: () => import('../views/Axios.vue'), // 懶加載組件
        },
    ],
});

// 因為 eslint 想用 export default，所以就不用 export const 方式
// 參考 https://book.vue.tw/CH4/4-1-vue-router-intro.html
export default router;
