import { createStore } from 'vuex';
import star from './modules/star-store';
import stock from './modules/stock-store';

const defaultState = {};

// Create a new store instance.
export default createStore({
    modules: {
        star,
        // 底下是引用 modules 的寫法，實際應是 stock: stock, 寫成 a: stock也許會比較容易懂
        // .vue 檔案若要使用時，是用 name，即 a，在這裡就用 stock
        stock,
    },

    // vue3 的 state 要用() 變是 func
    state() {
        return defaultState;
    },
    actions: {},
    mutations: {},
    getters: {},
});
