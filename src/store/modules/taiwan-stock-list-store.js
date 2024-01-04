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
                        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRlIjoiMjAyNC0wMS0wMiAxNTowODoyMyIsInVzZXJfaWQiOiIxN2tvYmUiLCJpcCI6IjIxMC43MS4yMTcuMjUxIn0.Dl5cEreMFOqT_4rrpwHwApyVn6vrEovKPMP3-zygpHk',
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
            state.taiwanStockList = [{ stock_id: 'USD', stock_name: '美金匯率', type: 'exchange' }];
            if (_.has(data, 'data') && data.data.length > 0) {
                state.taiwanStockList.push(...data.data);
            }
        },
    },
    getters: {},
};

export default taiwan;
