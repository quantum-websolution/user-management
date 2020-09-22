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
## 3. フロントエンド
