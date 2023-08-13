import WellCache from 'well-cache';

export default {
    install(app) {
        const cache = new WellCache({ mode: 'IDB' });
        app.config.globalProperties.$cache = cache;
    },
};
