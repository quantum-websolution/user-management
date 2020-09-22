# Reactユーザー管理アプリ
React.jsでフロントエンド、Express(Node.js)とPostgreSQLでバックエンドの基本的なCRUDアプリです。

課題は、以下の仕様を使ったアプリを作成します。\
・アプリのテーマとデザインは自由に決める\
・複数のDBテーブルを使う（3個〜）\
・ログイン画面を作成する\
・複数画面を作成する（3個〜）\
・データを表示、編集、削除ができる\
・データのインポートとエクスポートする機能を作る（CSVフォーマット）

## 1. データベース
PostgreSQLをインストールします。\
`brew install postgres`

PostgreSQLを起動します。\
`brew services start postgres`

データベースを作成します。\
`CREATE DATABASE test;`

データベースに接続します。\
`\c test;`

テーブルを作成します。
```
CREATE TABLE accounts (
 id serial PRIMARY KEY,
 fullname VARCHAR(100),
 email text UNIQUE,
 phone VARCHAR(100),
 date TIMESTAMP NOT NULL
);
```

ダミーデータを作成します。
```
INSERT INTO accounts (fullname, email, phone, date)
VALUES('UEDA', 'test@mail.com', '00000000000', '2020-10-01 00:00');
```

全テーブルを確認します。\
`\d`

テーブルの内容を表示します。\
`select * from accounts;`

postgresを閉じます。\
`\q`

## 2. バックエンド
フォルダ構成です。
```
- user-management-氏名/
--- api/
----- server.js
----- controllers/
------- accountsController.js
```

NPMをインストールします。
```
cd api
npm init -y
npm install express
npm install pg
npm install body-parser
npm install cors
npm install knex
npm install dotenv
npm install helmet
npm install morgan
npm install nodemon --save-dev
```

package.jsonを修正します。\
`"main": "index.js",`\
↓\
`"main": "server.js",`
```
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```
↓\
`"start": "nodemon server.js",`

server.jsを修正します。
```
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
```

accountsController.jsを修正します。
```
const getData = (req, res, db) => {
  db.select('*').from('accounts')
    .then(items => {
      if (items.length) {
        res.json(items);
      } else {
        res.json({
          dataExists: 'false'
        });
      }
    })
    .catch(err => res.status(400).json({
      dbError: 'error'
    }));
}

const postData = (req, res, db) => {
  const {
    fullname,
    email,
    phone
  } = req.body;
  const date = new Date();
  db('accounts').insert({
      fullname,
      email,
      phone,
      date
    })
    .returning('*')
    .then(item => {
      res.json(item);
    })
    .catch(err => res.status(400).json({
      dbError: 'error'
    }));
}

const putData = (req, res, db) => {
  const {
    id,
    fullname,
    email,
    phone
  } = req.body;
  db('accounts').where({
      id
    }).update({
      fullname,
      email,
      phone
    })
    .returning('*')
    .then(item => {
      res.json(item);
    })
    .catch(err => res.status(400).json({
      dbError: 'error'
    }));
}

const delData = (req, res, db) => {
  const {
    id
  } = req.body;
  db('accounts').where({
      id
    }).del()
    .then(() => {
      res.json({
        delete: 'true'
      });
    })
    .catch(err => res.status(400).json({
      dbError: 'error'
    }));
}

module.exports = {
  getData,
  postData,
  putData,
  delData
}
```

## 3. フロントエンド
