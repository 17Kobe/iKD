// Vue 3.0 with Composition API Style
// 參考 https://book.vue.tw/CH1/1-1-introduction.html
// vite & plugin-vue & vite-plugin-singlefile should be listed in the project's dependencies, not devDependencies
import { createApp } from 'vue';

import ElementPlus from 'element-plus';

import App from './App.vue';
import router from './router/router';
import store from './store/store';

import 'element-plus/lib/theme-chalk/index.css';
import './index.css';

// 建立 vue 的實體物件並指定至 app
const app = createApp(App);
app.use(store);
app.use(router);
app.use(ElementPlus);

// 掛載 monut 至指定網頁(index.html) 中的 #app 節點上
app.mount('#app');
