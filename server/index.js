var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();

// 使用cors原因：'Access-Control-Allow-Origin' when using axios connect express
// 參考：https://stackoverflow.com/questions/46656071/access-control-allow-origin-when-using-axios-and-express
app.use(cors());
app.use(express.json());

// 第一個參數是url路徑，第二個參數是檔案路徑，不用加js
app.use('/api/realtime', require('./routes/realtime'));

app.listen(5566, function () {
    console.log('app listening on port 5566!');
});
