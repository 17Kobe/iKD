// import WellCache from 'well-cache';
import { openDB } from 'idb';
import _ from 'lodash';

// const wcache = new WellCache({ mode: 'IDB' });

// 創建 IndexedDB 資料庫
const dbPromise = openDB('ikd', 1, {
    // 'ikd'為資料庫名稱 第1版
    upgrade(db) {
        // 創建一個名為 "stockList" 的資料表
        db.createObjectStore('stockList', { keyPath: 'id', autoIncrement: true });
    },
});

export async function saveStockToDb(key, value) {
    console.log("saveStockToDb() stockId = ", value.id);
    try {
        // 儲存至 IndexedDB
        // wcache.save(key, JSON.parse(JSON.stringify(value)));

        // 開啟資料庫
        const db = await dbPromise;
        // 使用事務進行資料表的寫入
        const tx = db.transaction(key, 'readwrite');
        const stockListStore = tx.objectStore(key);

        // 先嘗試獲取記錄
        const existingItem = await stockListStore.get(value.id);

        // 將 value 對象序列化
        const serializableValue = JSON.parse(JSON.stringify(value));

        if (existingItem) {
            // 如果記錄存在，使用 put 進行更新
            await stockListStore.put(serializableValue);
        } else {
            // 如果記錄不存在，使用 add 進行添加
            await stockListStore.add(serializableValue);
        }

        // 完成事務
        await tx.done;

        // 儲存至 Localstorage
        // localStorage.setItem(key, JSON.stringify(filteredDateValue));
    } catch (error) {
        console.error('發生錯誤：', error);
    }
}

export async function delStockToDb(key, id) {
    try {
        // 開啟資料庫
        const db = await dbPromise;
        // 使用事務進行資料表的刪除
        const tx = db.transaction(key, 'readwrite');
        const stockListStore = tx.objectStore(key);

        // 使用 delete 方法刪除指定 id 的記錄
        await stockListStore.delete(id);

        // 完成事務
        await tx.done;

        console.log(`成功刪除 ${key} 中的 id 為 ${id} 的記錄`);
    } catch (error) {
        console.error('發生錯誤：', error);
    }
}

export async function delStockListToDb(key) {
    try {
        // 開啟資料庫
        const db = await dbPromise;
        // 使用事務進行資料表的清空
        const tx = db.transaction(key, 'readwrite');
        const stockListStore = tx.objectStore(key);

        // 使用 clear 方法清空資料表中的所有記錄
        await stockListStore.clear();

        // 完成事務
        await tx.done;

        console.log(`成功刪除 ${key} 中的所有記錄`);
    } catch (error) {
        console.error('發生錯誤：', error);
    }
}

export async function saveStockListToDb(key, value) {
    // key=stockList
    try {
        // 儲存至 IndexedDB
        // wcache.save(key, JSON.parse(JSON.stringify(value)));

        // 開啟資料庫
        const db = await dbPromise;
        // 使用事務進行資料表的寫入
        const tx = db.transaction(key, 'readwrite');
        const stockListStore = tx.objectStore(key);
        // 遍歷每個array元素
        for (const item of value) {
            const serializableItem = JSON.parse(JSON.stringify(item));

            // 先嘗試獲取記錄
            const existingItem = await stockListStore.get(serializableItem.id);

            if (existingItem) {
                // 如果記錄存在，使用 put 進行更新
                await stockListStore.put(serializableItem);
            } else {
                // 如果記錄不存在，使用 add 進行添加
                await stockListStore.add(serializableItem);
            }
        }
        // 完成事務
        await tx.done;

        // const filteredDateValue = _.map(value, (item) => {
        //     // 刪除 data
        //     return _.omit(item, ['data']);
        // });
        // 儲存至 Localstorage
        // localStorage.setItem(key, JSON.stringify(filteredDateValue));
    } catch (error) {
        console.error('發生錯誤：', error);
    }
}

export async function loadStockListFromDb(key, callback) {
    // wcache.get(key, (ret) => {
    //     if (callback) {
    //         callback(ret.isOk ? ret.data : JSON.parse(localStorage.getItem('stockList')) || []);
    //     }
    // });
    try {
        // 開啟資料庫
        const db = await dbPromise;
        // 使用事務進行資料表的讀取
        const tx = db.transaction(key, 'readonly');
        const stockListStore = tx.objectStore(key);

        // 使用 getAll 方法讀取所有資料
        const allData = await stockListStore.getAll();

        // 完成事務
        await tx.done;

        if (callback) {
            callback(allData || []);
        }
    } catch (error) {
        console.error('發生錯誤：', error);
    }
}
