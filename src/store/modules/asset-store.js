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
    },
    getters: {},
};

export default asset;
