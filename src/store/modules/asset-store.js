const defaultState = {
    assetList: [],
};

const asset = {
    // vue3 的 state 要用() 變是 func
    state() {
        return defaultState;
    },
    actions: {},
    mutations: {
        SAVE_ASSET(state, assetList) {
            state.assetList = assetList;
            localStorage.setItem('assetList', JSON.stringify(state.assetList));
        },
    },
    getters: {},
};

export default asset;
