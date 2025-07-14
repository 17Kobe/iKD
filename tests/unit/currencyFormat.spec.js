const _ = require('lodash');

// 直接複製前端 currencyFormat 實作
function currencyFormat(number) {
    return Number(number.toFixed(0)).toLocaleString('en-US');
}

describe('currencyFormat 單元測試', () => {
    it('應正確格式化整數', () => {
        expect(currencyFormat(123456)).toBe('123,456');
    });

    it('應正確格式化浮點數（四捨五入）', () => {
        expect(currencyFormat(123456.78)).toBe('123,457');
        expect(currencyFormat(123456.49)).toBe('123,456');
    });

    it('應正確格式化負數', () => {
        expect(currencyFormat(-9876.5)).toBe('-9,877');
    });

    it('應正確格式化 0', () => {
        expect(currencyFormat(0)).toBe('0');
    });

    it('應正確格式化大數字', () => {
        expect(currencyFormat(1000000)).toBe('1,000,000');
    });
});
