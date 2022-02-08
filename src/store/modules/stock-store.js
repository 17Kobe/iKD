import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';

const defaultState = {
    currStockObj: {},
    currStockDayData: [],
};

const stock = {
    // vue3 的 state 要用() 變是 func
    state() {
        return defaultState;
    },
    actions: {
        // 從 server 去取得該股票的淨值
        GET_STOCK_VALUE(context, id) {
            console.log('GET_STOCK_VALUE');
            console.log(`id=${id}`);
            context.commit('SAVE_STOCK_VALUE', []); // 必須先清除，失敗也不用再清除
            return (
                // 注意一下fullPath的大小寫，如此還可以帶query喔
                axios
                    .get(`http://localhost:2412/stock/${id}`)
                    // 成功
                    .then((res) => {
                        console.log('GET_STOCK_VALUE_OK');
                        context.commit('SAVE_STOCK_VALUE', res.data);
                        // context.commit('SAVE_CONTACT', res.data);
                    })
                    // 失敗
                    .catch((err) => {
                        console.log(err);
                    })
            );
        },
    },
    mutations: {
        // 將該股票的淨值儲存到 state 上
        SAVE_STOCK_VALUE(state, data) {
            console.log('SAVE_STOCK_VALUE');
            // console.log(data);
            state.currStockDayData = data;
            // console.log(state.currStockDayData);
        },
    },
    getters: {
        // 取得500淨值要顯示用
        currStockInfo(state) {
            if (state.currStockDayData.length === 0) return [];
            console.log('currStockInfo');
            // 先只顯示最後500筆，並且反轉
            const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
            const showSotckInfo = _.reverse(_.slice(state.currStockDayData, -201)); // 反轉後，第一筆是最新日期了

            // 塞報酬率進去，四捨五入到小數點第二位
            _.forEach(showSotckInfo, (v, index) => {
                // console.log(arr[index + 1][4]);
                const r =
                    index + 1 < showSotckInfo.length
                        ? (((v[4] - showSotckInfo[index + 1][4]) * 100) / showSotckInfo[index + 1][4]).toFixed(2)
                        : 0;
                showSotckInfo[index].push(`${r} %`);
            });
            // 移掉最後一個一定是0%報酬率，所以前面我用-501
            showSotckInfo.pop();

            // 二維陣列轉 一維陣列的object
            return _.map(showSotckInfo, (arr) =>
                _.zipObject(
                    ['date', 'close', 'return'],
                    [`${moment(arr[0]).format('YYYY-MM-DD')}(${dayOfWeek[moment(arr[0]).day()]})`, arr[4], arr[6]]
                )
            );
        },

        currStockWeekData(state) {
            return [];
            console.log('value');

            if (state.currStockDayData.length === 0) return []; // 如果沒有資料那就 return
            const firstStockDate = moment(_.first(state.currStockDayData)[0]); // [] 不可能 undefined。因為是二維陣列，還要取第二維[0]代表date
            const lastStockDate = moment(_.last(state.currStockDayData)[0]);

            console.log(firstStockDate.format('YYYY-MM-DD HH:mm:ss'));
            console.log(lastStockDate.format('YYYY-MM-DD HH:mm:ss'));
            // for moment 參考 https://stackoverflow.com/questions/52936352/javascript-for-loop-to-add-days-in-a-month-object-moment-js
            // lastStockDate.subtract(7, 'days') 因為我第一個要拿到就是減7天的值
            // 這裡要用 -6 才能最後面的資料也都算進去，不過可能實際因沒有資料而加上也沒到完整一週都有資料，
            const resData = [];
            let i = state.currStockDayData.length - 1;
            for (let m = lastStockDate.subtract(7, 'days'); m.diff(firstStockDate, 'days') >= -6; m.subtract(7, 'days')) {
                // console.log(`= ${m.format('YYYY-MM-DD')}`);
                // console.log(m.diff(firstStockDate, 'days'));
                // console.log(m.diff(moment(state.currStockDayData[i][0]), 'days'));
                // const n = moment(state.currStockDayData[i][0]);
                for (let n = i; n >= 0; n -= 1) {
                    // console.log(`==${moment(state.currStockDayData[n][0]).format('YYYY-MM-DD')}`);
                    // console.log(m.diff(moment(state.currStockDayData[n][0]), 'days'));

                    // 一開始 m 比較小, state.currStockDayData[i][0] 比較大，所以一定是負值，會從-7遞減
                    // ==0 也代表到下一個要算的日期了，要跳過，且index 不要-
                    if (m.diff(moment(state.currStockDayData[n][0]), 'days') >= 0) {
                        const startIndex = n + 1 > i ? i : n + 1;
                        const endIndex = i; // 因為外層array 是從日期最現在，往以前日期去掃。endIndex應該是最現在日期. i比n大
                        const range2dArray = _.slice(state.currStockDayData, startIndex, endIndex + 1);
                        const rangeHighArray = _.map(range2dArray, (v) => v[2]);
                        const rangeLowArray = _.map(range2dArray, (v) => v[3]);
                        const rangeVolumeArray = _.map(range2dArray, (v) => v[5]);

                        const date = state.currStockDayData[endIndex][0];
                        const open = state.currStockDayData[startIndex][1]; // 上一個n的意思， 也許有 bug n+1應該要<這迴圈數量，若只有1個就有問題
                        const close = state.currStockDayData[endIndex][4]; // 之前的i，還沒i=n是下一個
                        const low = _.min(rangeLowArray);
                        const high = _.max(rangeHighArray);
                        const volume = _.sum(rangeVolumeArray);

                        // console.log(moment(date).format('YYYY-MM-DD'));
                        // console.log(low);
                        // console.log(high);
                        resData.push([date, open, high, low, close, volume]);
                        // console.log(rangeArray);
                        // console.log(open);
                        // console.log(close);
                        // const dayData = [open];
                        i = n; // 在這裡變化 i 的值
                        break;
                    }
                }
            }
            console.log(resData);
            // 必需要反轉，最小的值在最前面，最大的值在最後面，否則highcharts會只畫1個點
            return _.reverse(resData);
            // forEach 是 array 前面跑，eachRight/forEachRigh 是 array 後面跑
            // const tmp = [];
            // _.eachRight(state.currStockDayData, (value, key) => {
            //     tmp.push(value);
            // });
            // console.log(tmp);
            // return tmp.slice(0, 20);
        },
    },
};

export default stock;
