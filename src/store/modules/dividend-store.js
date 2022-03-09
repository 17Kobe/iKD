import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';

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

            const theYearBeforeLast = moment().subtract(2, 'year').format('YYYY'); // 前年的日期

            // TODO: 一天應該只要呼叫一次API就好了
            context.rootState.price.stockList.forEach((stcokObj) => {
                // 必須是有買的才要去抓未來配息
                if (_.has(stcokObj, 'cost.settings')) {
                    // 為了只下一次API，但還要抓二年的資料回來算平均
                    axios
                        .get('https://api.finmindtrade.com/api/v4/data', {
                            params: {
                                dataset: 'TaiwanStockDividend',
                                data_id: stcokObj.id,
                                start_date: `${theYearBeforeLast}-01-01`,
                                token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRlIjoiMjAyMi0wMi0wOCAxMzoyODozOCIsInVzZXJfaWQiOiIxN2tvYmUiLCJpcCI6IjIxMC43MS4yMTcuMjQ2In0.QZraZM9320Ut0rkes4YsqtqHR38NitKO-52Sk4KhYHE',
                            },
                        })
                        // 成功
                        .then((res) => {
                            // 要傳那麼多主要是因為 stockList是rootState
                            context.commit('SAVE_DIVIDEND', {
                                stockId: stcokObj.id,
                                stockName: stcokObj.name,
                                numberOfShares: stcokObj.cost.total,
                                data: res.data,
                            });
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
        SAVE_DIVIDEND(state, { stockId, stockName, numberOfShares, data }) {
            // 會清掉再全部重加
            _.remove(state.dividendList, (obj) => obj.id === stockId);

            const today = moment().startOf('day');
            if (_.has(data, 'data') && data.data.length > 0) {
                const filterSureDividend = _.filter(data.data, (o) => moment(o.CashDividendPaymentDate).isSameOrAfter(today));
                filterSureDividend.forEach((dividendObj) => {
                    state.dividendList.push({
                        id: stockId,
                        name: stockName,
                        number_of_shares: numberOfShares,
                        payment_date: dividendObj.CashDividendPaymentDate,
                        trading_date: dividendObj.CashExDividendTradingDate,
                        earnings_distribution: dividendObj.CashEarningsDistribution,
                        isSure: true,
                    });
                });
            }
        },
    },
    getters: {},
};

export default dividend;
