import { createRouter, createWebHashHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: 'dashboard',
            component: Dashboard,
        },
    ],
});

// 因為 eslint 想用 export default，所以就不用 export const 方式
// 參考 https://book.vue.tw/CH4/4-1-vue-router-intro.html
export default router;
