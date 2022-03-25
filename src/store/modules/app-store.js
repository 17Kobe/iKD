const defaultState = {
    routerName: 'default',
};

const app = {
    // vue3 的 state 要用() 變是 func
    state() {
        return defaultState;
    },
    actions: {
    },
    mutations: {
        SAVE_ROUTER_NAME(state, data) {
            state.routerName = data;
        },
    },
    getters: {},
};

export default app;
