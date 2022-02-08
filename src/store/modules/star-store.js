import axios from 'axios';
import moment from 'moment';

const defaultState = {
    starList: [
        {
            name: '元大高股息',
            id: '0056',
        },
        {
            name: '台積電',
            id: '2330',
        },
        // {
        //     name: '聯發科',
        //     id: '2454',
        // },
        // {
        //     name: '大立光',
        //     id: '3008',
        // },
        // {
        //     name: '台達電',
        //     id: '2308',
        // },
        // {
        //     name: '元大金',
        //     id: '2885',
        // },
        // {
        //     name: '玉山金',
        //     id: '2884',
        // },
        // {
        //     name: '卜蜂',
        //     id: '1215',
        // },
        // {
        //     name: '統一',
        //     id: '1216',
        // },
        // {
        //     name: '中華電',
        //     id: '2412',
        // },
        // {
        //     name: '統一FANG+',
        //     id: '00757',
        // },
        // {
        //     name: '期元大 S&P 黃金',
        //     id: '00635U',
        // },
    ],
};

const star = {
    // vue3 的 state 要用() 變是 func
    state() {
        return defaultState;
    },
    actions: {
        // 從 server 去取得該股票的淨值
        // GET_STAR(context) {
        //     return (
        //         // 注意一下fullPath的大小寫，如此還可以帶query喔
        //         axios
        //             .get(`http://localhost:2412/star`)
        //             // 成功
        //             .then((res) => {
        //                 console.log(res);
        //                 context.commit('SAVE_STAR', res.data);
        //                 // context.commit('SAVE_CONTACT', res.data);
        //             })
        //             // 失敗
        //             .catch((err) => {
        //                 console.log(err);
        //             })
        //     );
        // },
        // 從 server 去取得該股票的淨值
    },
    mutations: {
        // 將該股票的淨值儲存到 state 上
        SAVE_STAR(state, data) {
            console.log('SAVE_STAR');
            // console.log(data);
            state.starList = data;
            // console.log(state.currStockDayData);
        },
        SAVE_STOCK_PRICE(state) {
            console.log('SAVE_STOCK_PRICE');
            console.log(state.starList);
            // for starList
            state.starList.forEach((stcokInfo, index, theArray) => {
                // 為了修改，所以多加 index 及 theArray 參數
                console.log(stcokInfo);

                console.log(theArray[index]);

                const stockData = stcokInfo.data || []; // 有可能是 null 就變成 []
                // 判斷若是沒值(即 [] 空array)，若從資料庫取得日期要加1天喔
                const stockStartDate = moment(
                    stockData.length === 0 ? '2010-01-01' : moment(stockData.at(-1).date).add(1, 'days')
                ).format('YYYY-MM-DD');
                console.log(stockStartDate);

                axios
                    .get('https://api.finmindtrade.com/api/v4/data', {
                        params: {
                            dataset: 'TaiwanStockPrice',
                            data_id: stcokInfo.id,
                            start_date: stockStartDate,
                            token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRlIjoiMjAyMi0wMi0wOCAxMzoyODozOCIsInVzZXJfaWQiOiIxN2tvYmUiLCJpcCI6IjIxMC43MS4yMTcuMjQ2In0.QZraZM9320Ut0rkes4YsqtqHR38NitKO-52Sk4KhYHE',
                        },
                    })
                    // 成功
                    .then((res) => {
                        theArray[index].data = theArray[index].data || []; // 有可能是 null 就變成 []
                        console.log(res.data.data);
                        theArray[index].data.push(...res.data.data); // 塞入股價資料
                        // const values = [];
                        // res.data.data.forEach((element) => {
                        //     values.push([
                        //         element.date,
                        //         element.open,
                        //         element.max,
                        //         element.min,
                        //         element.close,
                        //         element.Trading_Volume,
                        //     ]);
                        // });
                        // theArray[index].data.push(...values); // 塞入股價資料

                        localStorage.setItem('starList', JSON.stringify(state.starList)); // 要放在 then後才能保證完成，放在最後面還可能
                        // console.log('GET_STOCK_VALUE_OK');
                        // context.commit('SAVE_STOCK_VALUE', res.data);
                        // context.commit('SAVE_CONTACT', res.data);
                    })
                    // 失敗
                    .catch((err) => {
                        console.log(err);
                    });
            });

            // 將淨值更新後再儲存至 localstorage

            // return (
            //     // 注意一下fullPath的大小寫，如此還可以帶query喔
            //     axios
            //         .get('https://api.finmindtrade.com/api/v4/data', {
            //             params: {
            //                 usr: this.state.account,
            //                 pwd: this.state.password,
            //                 dataset: 'TaiwanStockPrice',
            //                 data_id: '0056',
            //                 start_date: '2021-09-13',
            //                 token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRlIjoiMjAyMi0wMi0wOCAxMzoyODozOCIsInVzZXJfaWQiOiIxN2tvYmUiLCJpcCI6IjIxMC43MS4yMTcuMjQ2In0.QZraZM9320Ut0rkes4YsqtqHR38NitKO-52Sk4KhYHE',
            //             },
            //         })
            //         // 成功
            //         .then((res) => {
            //             // console.log('GET_STOCK_VALUE_OK');
            //             // context.commit('SAVE_STOCK_VALUE', res.data);
            //             // context.commit('SAVE_CONTACT', res.data);
            //         })
            //         // 失敗
            //         .catch((err) => {
            //             console.log(err);
            //         })
            // );
        },
    },
    getters: {},
};

export default star;
