import axios from 'axios';
import _ from 'lodash';

const defaultState = {
    taiwanStockList: [],
};

const taiwan = {
    // vue3 的 state 要用() 變是 func
    state() {
        return defaultState;
    },
    actions: {
        GET_TAIWAN_STOCK(context) {
            console.log('GET_TAIWAN_STOCK');

            axios
                .get('https://api.finmindtrade.com/api/v4/data', {
                    params: {
                        dataset: 'TaiwanStockInfo',
                        token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRlIjoiMjAyMi0wMi0wOCAxMzoyODozOCIsInVzZXJfaWQiOiIxN2tvYmUiLCJpcCI6IjIxMC43MS4yMTcuMjQ2In0.QZraZM9320Ut0rkes4YsqtqHR38NitKO-52Sk4KhYHE',
                    },
                })
                // 成功
                .then((res) => {
                    context.commit('SAVE_TAIWAN_STOCK', res.data);
                    // 因為同一公司，可能屬不同產業，但同一個代碼，所以要過濾掉
                })
                // 失敗
                .catch((err) => {
                    console.log(err);
                });
        },
    },
    mutations: {
        SAVE_TAIWAN_STOCK(state, data) {
            state.taiwanStockList = [];
            if (_.has(data, 'data') && data.data.length > 0) {
                state.taiwanStockList.push(...data.data);
            }
        },
    },
    getters: {},
};

export default taiwan;
