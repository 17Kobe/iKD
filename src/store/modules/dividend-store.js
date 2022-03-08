import axios from 'axios';
import _ from 'lodash';

const defaultState = {
    dividendList: [],
};

const dividend = {
    // vue3 的 state 要用() 變是 func
    state() {
        return defaultState;
    },
    actions: {
        GET_DIVIDEND(context) {
            console.log('GET_DIVIDEND');
            console.log(context);
            console.log(context.rootState.price.stockList);

            context.rootState.price.stockList.forEach((stcokObj) => {
                // 必須是有買的才要去抓未來配息
                if (_.has(stcokObj, 'cost.settings')) {
                    // 為了只下一次API，但還要抓二年的資料回來算平均
                    axios
                        .get('https://api.finmindtrade.com/api/v4/data', {
                            params: {
                                dataset: 'TaiwanStockDividend',
                                data_id: stcokObj.id,
                                start_date: '2021-01-13',
                                token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRlIjoiMjAyMi0wMi0wOCAxMzoyODozOCIsInVzZXJfaWQiOiIxN2tvYmUiLCJpcCI6IjIxMC43MS4yMTcuMjQ2In0.QZraZM9320Ut0rkes4YsqtqHR38NitKO-52Sk4KhYHE',
                            },
                        })
                        // 成功
                        .then((res) => {
                            context.commit('SAVE_DIVIDEND', res.data);
                            // 因為同一公司，可能屬不同產業，但同一個代碼，所以要過濾掉
                        })
                        // 失敗
                        .catch((err) => {
                            console.log(err);
                        });
                }
            });
        },
    },
    mutations: {
        SAVE_DIVIDEND(state, data) {
            state.taiwanStockList = [];
            if (_.has(data, 'data') && data.data.length > 0) {
                state.dividendList.push(...data.data);
            }
        },
    },
    getters: {},
};

export default dividend;
