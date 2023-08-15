import WellCache from 'well-cache';
import _ from 'lodash';

const wcache = new WellCache({ mode: 'IDB' });

export function saveStockListToDb(key, value) {
    // 儲存至 IndexedDB
    wcache.save(key, JSON.stringify(value));

    const filteredDateValue = _.map(value, (item) => {
        // 刪除 data
        return _.omit(item, ['data']);
    });
    // 儲存至 Localstorage
    localStorage.setItem(key, JSON.stringify(filteredDateValue));
}

export function loadStockListFromDb(key, callback) {
    wcache.get(key, (ret) => {
        if (callback) {
            callback(ret.isOk ? JSON.parse(ret.data) : JSON.parse(localStorage.getItem('stockList')) || []);
        }
    });
}
