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
            console.log(assetList);
            state.assetList = assetList;
            localStorage.setItem('assetList', JSON.stringify(state.assetList));
            console.log('SAVE_ASSET OVER');
        },
        // 一開始載入localstorage用的，不用再儲存至localstorage
        SAVE_HISTORY_ASSET_LIST(state, data) {
            console.log('SAVE_HISTORY_ASSET_LIST');
            state.historyAssetList = data;
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
    },
    getters: {
        getHistoryAssetList: (state) => () => {
            console.log('getHistoryAssetList');

            return state.historyAssetList.reduce((acc, array) => {
                acc.push({
                    x: array[0],
                    y: array[1],
                });
                return acc;
            }, []);
        },
    },
};

export default asset;
