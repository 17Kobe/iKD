const axios = require('axios');

const imageName = process.argv[2];

const LINE_API_URL = 'https://api.line.me/v2/bot/message/push';

const config = {
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer GW2r4UtoAtIsU0XVCBUp33fmbVCy+F6l7oDRkKE+/kAYoU2OFt/EGLviboXIwnx4N8/7OA1KyN6X9GVUNB6zMzBoR6gjGPNUIAZkyZYTjIbs/qP9qprMw6iL+O9/+6ZAupUYB/5jkPwQbxGn9rKLUQdB04t89/1O/w1cDnyilFU=`,
    },
    proxy: {
        host: '10.160.3.88',
        port: '8080'
    }
};

const data = {
    to: 'Ue0b74720348c4831431c1a3dbd2ddb8a',
    messages: [
        {
            type: 'image',
            originalContentUrl: `https://17kobe.github.io/iKD/assets/images/${imageName}`,
            previewImageUrl: `https://17kobe.github.io/iKD/assets/images/${imageName}`,
        },
    ],
};

axios
    .post(LINE_API_URL, data, config)
    .then(() => {
        console.log('Image sent!');
    })
    .catch((err) => {
        console.log(err);
    });