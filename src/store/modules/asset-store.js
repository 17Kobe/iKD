import moment from 'moment';

const defaultState = {
    assetList: [
        {
            account: '渣打銀行活存',
            amount: 200000,
        },
        {
            account: '玉山銀行活存',
            amount: 150000,
        },
        {
            account: '台灣銀行活存',
            amount: 50000,
        },
        {
            account: '台灣銀行定存',
            amount: 250000,
        },
        {
            account: '彰化銀行房貸',
            amount: -2000000,
        },
    ],
    historyAssetList: [],
    historyLiabilityList: [],
    interestList: [],
};

const asset = {
    // vue3 的 state 要用() 變是 func
    state() {
        return defaultState;
    },
    actions: {},
    mutations: {
        SAVE_ASSET(state, assetList) {
            console.log('SAVE_ASSET');
            // console.log(assetList);
            state.assetList = assetList;
            localStorage.setItem('assetList', JSON.stringify(state.assetList));
            console.log('SAVE_ASSET OVER');
        },
        // 一開始載入localstorage用的，不用再儲存至localstorage
        SAVE_HISTORY_ASSET_LIST(state, data) {
            console.log('SAVE_HISTORY_ASSET_LIST');
            state.historyAssetList = data;
        },
        // 一開始載入localstorage用的，不用再儲存至localstorage
        SAVE_HISTORY_LIABILITY_LIST(state, data) {
            console.log('SAVE_HISTORY_LIABILITY_LIST');
            state.historyLiabilityList = data;
        },
        ADD_OR_UPDATE_HISTORY_ASSET_LIST(state, data) {
            // { stockId, stockName, buyAverageCost, sellPrice, buySpend, sellRateOfReturn, sellSpread, sellNumber, sellDate }
            // id、股票名稱、成本價、賣價、本金、報酬率、價差、賣出股數、賣出日期
            console.log('ADD_OR_UPDATE_HISTORY_ASSET_LIST');

            const foundHistoryAsset = state.historyAssetList.find((array) => array[0] === data[0]); // 沒找到會undefined

            // 有找到日期就用更新，沒找到日期就push
            if (foundHistoryAsset) foundHistoryAsset[1] = data[1];
            else state.historyAssetList.push(data);
            localStorage.setItem('historyAssetList', JSON.stringify(state.historyAssetList));
        },
        ADD_OR_UPDATE_HISTORY_LIABILITY_LIST(state, data) {
            console.log('ADD_OR_UPDATE_HISTORY_LIABILITY_LIST');

            const foundHistoryLiability = state.historyLiabilityList.find((array) => array[0] === data[0]); // 沒找到會undefined

            // 有找到日期就用更新，沒找到日期就push
            if (foundHistoryLiability) foundHistoryLiability[1] = data[1];
            else state.historyLiabilityList.push(data);
            localStorage.setItem('historyLiabilityList', JSON.stringify(state.historyLiabilityList));
        },
        SAVE_INTEREST(state, interestList) {
            console.log('SAVE_INTEREST');
            // console.log(interestList);
            state.interestList = interestList;
            localStorage.setItem('interestList', JSON.stringify(state.interestList));
            console.log('SAVE_INTEREST OVER');
        },
    },
    getters: {
        getHistoryAssetList: (state) => () => {
            console.log('getHistoryAssetList');
            const sixMonthAgo = moment().subtract(6, 'months');
            let prevY = 0; // 紀錄前一個元素的y值
            return state.historyAssetList.reduce((acc, array) => {
                if (moment(array[0]).isSameOrAfter(sixMonthAgo)) {
                    const y = array[1];
                    const diff = y - prevY; // 計算diff
                    acc.push({
                        x: moment(array[0]),
                        y: y,
                        diff: prevY === 0 ? 0 : diff, // 若前一個元素為0則diff為0
                    });
                    prevY = y; // 更新prevY
                }
                return acc;
            }, []);
        },
        getHistoryLiabilityList: (state) => () => {
            console.log('getHistoryLiabilityList');
            const sixMonthAgo = moment().subtract(6, 'months');
            let prevY = 0; // 紀錄前一個元素的y值
            return state.historyLiabilityList.reduce((acc, array) => {
                if (moment(array[0]).isSameOrAfter(sixMonthAgo)) {
                    const y = array[1];
                    const diff = y - prevY; // 計算diff
                    acc.push({
                        x: moment(array[0]),
                        y: y,
                        diff: prevY === 0 ? 0 : diff, // 若前一個元素為0則diff為0
                    });
                    prevY = y; // 更新prevY
                }
                return acc;
            }, []);
        },
    },
};

export default asset;
