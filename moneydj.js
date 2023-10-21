const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');

const url = 'https://www.moneydj.com/funddj/ya/yp010001.djhtm?a=SHZ18';

axios
    .get(url)
    .then((response) => {
        if (response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html);

            // 使用屬性選擇器選擇特定表格
            const targetTable = $('table[width="99%"]');
            const data = [];
            const today = moment();

            // 遍歷所選表格
            targetTable.find('tr').each((i, row) => {
                const td = $(row).find('td.t3n0c1, td.t3n1, td.t3n1_rev, td.t3n0c1, td.t3n0, td.t3n0_rev, td.t3n0c1_rev');
                const date = $(td[0]).text().trim();
                const value = $(td[1]).text().trim();

                // 如果日期和淨值都存在，則添加到array
                if (date && value) {
                    // const extractDate = moment(today.format('YYYY') + '/' + date, 'YYYY/MM/DD');
                    const extractDate = moment(today.format('YYYY') + '/' + date, 'YYYY/MM/DD');
                    if (extractDate.isAfter(today) || !extractDate.isValid()) {
                        extractDate.subtract(1, 'years');
                    }

                    data.push({ date: extractDate.format('YYYY-MM-DD'), value });
                }
            });

            console.log(data);
        }
    })
    .catch((error) => {
        console.error('发生错误:', error);
    });
