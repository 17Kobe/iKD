export function saveStockListToDb(cache) {
    // 儲存至 IndexedDB 及 Localstorage
    cache.save('aaa', { id: 123, data: '1231' });
    console.log('Value added to cache.');
    cache.get('aaa', (result) => {
        console.log(result);
        //     sendData(`get: ${JSON.stringify(result)}`);
    });
}
