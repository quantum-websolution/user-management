const express = require('express');
const app = express();
const accountsController = require('./controllers/accountsController'); //dbクエリ
require('dotenv').config();

//ミドルウェアを設定する
const cors = require('cors'); //CORS(Cross-Origin Resource Sharing)を有効にする
const bodyParser = require('body-parser'); //レスポンスのフォーマットを変換する
const morgan = require('morgan'); //HTTPレクエストロガー
const helmet = require('helmet'); //Cross-Site-Scripting(XSS)のような攻撃を防ぐ、参考に：https://www.geeksforgeeks.org/node-js-securing-apps-with-helmet-js/

// knexを使ってdbに接続する
var db = require('knex')({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: '',
        password: '',
        database: 'test'
    }
});

//ミドルウェア
const whitelist = ['http://localhost:3001'];
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}
app.use(helmet());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(morgan('combined'));

//ルーター
app.get('/', (req, res) => res.send('サーバーが実行中です!'));
app.get('/crud', (req, res) => accountsController.getData(req, res, db));
app.post('/crud', (req, res) => accountsController.postData(req, res, db));
app.put('/crud', (req, res) => accountsController.putData(req, res, db));
app.delete('/crud', (req, res) => accountsController.delData(req, res, db));

//サーバ接続
app.listen(process.env.PORT || 3000, () => {
    console.log(`port ${process.env.PORT || 3000}`);
});