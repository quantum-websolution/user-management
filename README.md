# Reactユーザー管理アプリ
React.jsでフロントエンド、Express(Node.js)とPostgreSQLでバックエンドの基本的なCRUDアプリです。

課題は、以下の仕様を使ったアプリを作成します。\
・アプリのテーマとデザインは自由に決める\
・複数のDBテーブルを使う（3個〜）\
・ログイン画面を作成する\
・複数画面を作成する（3個〜）\
・データを表示、編集、削除ができる\
・データのインポートとエクスポートする機能を作る（CSVフォーマット）

## 1. 環境構築
#### Windows
##### GITをインストールします。
以下のURLから最新の64bitバージョンをダウンロードとインストールしてください。\
`https://git-scm.com/download/win`\
※GITをインストールしたら、Windowsでもbashが使えるようになります。VSCodeでDefault Shellをbashに変えてください。

##### Node.jsをインストールします。
以下のURLから最新のWindows Installerをダウンロードとインストールしてください。\
`https://nodejs.org/en/download/`

##### PostgreSQLをインストールします。
1.以下のURLから最新バージョンのWindows x86-64をダウンロードします。\
`https://www.enterprisedb.com/downloads/postgres-postgresql-downloads`\
2.インストール時にパスワード以外の設定を変える必要はないです。\
3.インストールが終わりましたら、PostgreSQLの追加ツールをインストールする画面が開きますが、インストールせずに閉じてください。

#### Mac
##### homebrewをインストールします。
1.`https://brew.sh`から`Install Homebrew`の下にあるコマンドをコピーしてください。\
2.ターミナルを開いて、コピーしたコマンドを実行してください。\
3.終わるまでに数回enterとパスワードを入力する必要があります。

##### Node.jsをインストールします。
`brew install node`をターミナルで実行してください。

##### PostgreSQLをインストールします。
`brew install postgres`をターミナルで実行してください。

## 2. データベース
#### PostgreSQLを起動します。(Mac)
`brew services start postgres`

#### PostgreSQLを起動します。(Windows)
SQL Shell (psql)を起動します。\
接続時に、パスワード以外、各質問に対して何も入力せずにenterキーを押してください。\
`postgres=#`が表示されたら、コマンドを入力することができます。

#### データベースを作成します。
`CREATE DATABASE test;`

#### データベースに接続します。
`\c test;`

#### テーブルを作成します。
```
CREATE TABLE accounts (
 id serial PRIMARY KEY,
 fullname VARCHAR(100),
 email text UNIQUE,
 phone VARCHAR(100),
 date TIMESTAMP NOT NULL
);
```

#### ダミーデータを作成します。
```
INSERT INTO accounts (fullname, email, phone, date)
VALUES('UEDA', 'test@mail.com', '00000000000', '2020-10-01 00:00');
```

#### 全テーブルを確認します。
`\d`

#### テーブルの内容を表示します。
`select * from accounts;`

#### postgresを閉じます。
`\q`

## 3. バックエンド
#### フォルダ構成です。
```
- user-management-氏名/
--- api/
----- server.js
----- controllers/
------- accountsController.js
```

#### NPMをインストールします。
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

#### package.jsonを修正します。
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

#### server.jsを修正します。
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

#### accountsController.jsを修正します。
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

## 4. フロントエンド
#### reactをインストールします。
```
cd user-management-氏名 (cd ..)
npx create-react-app fe
```

#### NPMをインストールします。
```
cd fe
npm install --save reactstrap react react-dom
npm install bootstrap 
npm install react-csv
```

#### 不要ファイルを削除します。
- App.css、logo.svgファイルを削除
- App.js、index.cssファイル内のソースを削除

#### フォルダ構成です。
```
- user-management-氏名/
--- api/
--- fe/
----- src/
------- components/
--------- Forms/
----------- AddEditForm.js
--------- Modals/
----------- AddEditModal.js
--------- Tables/
----------- AccountsTable.js
```

#### App.jsを修正します。
```
import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { CSVLink } from "react-csv";
import AccountsTable from './components/Tables/AccountsTable';
import AddEditModal from './components/Modals/AddEditModal';

class App extends Component {
  state = {
    items: []
  }

  getItems(){
    fetch('http://localhost:3000/crud')
      .then(response => response.json())
      .then(items => this.setState({items}))
      .catch(err => console.log(err))
  };

  addItemToState = (item) => {
    window.location.reload();
    this.setState(prevState => ({
      items: [...prevState.items, item]
    }));
  }

  updateState = (item) => {
    const itemIndex = this.state.items.findIndex(data => data.id === item.id);
    
    const newArray = [
      ...this.state.items.slice(0, itemIndex),
      item,
      ...this.state.items.slice(itemIndex + 1)
    ];
    this.setState({ items: newArray });
  }

  deleteItemFromState = (id) => {
    const updatedItems = this.state.items.filter(item => item.id !== id);
    this.setState({ items: updatedItems });
  }

  componentDidMount(){
    this.getItems();
  }

  render() {
    return (
      <Container className="App">
        <Row>
          <Col>
            <h1 style={{margin:"13px"}}>User management app</h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <AccountsTable items={this.state.items} updateState={this.updateState} deleteItemFromState={this.deleteItemFromState} />
          </Col>
        </Row>
        <Row>
          <Col>
            <AddEditModal buttonLabel="追加" addItemToState={this.addItemToState}/>
            { this.state.items.length > 0 &&
             <CSVLink
                className="btn btn-primary"
                filename={"accounts.csv"}
                data={this.state.items}>
                CSVエクスポート
             </CSVLink>
            }
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
```

#### AccountsTable.jsを修正します。
```
import React, { Component } from 'react';
import { Table, Button } from 'reactstrap';
import AddEditModal from '../Modals/AddEditModal';

class AccountsTable extends Component {

  deleteItem = id => {
    let confirmDelete = window.confirm('削除しますか？');
    if(confirmDelete){
      fetch('http://localhost:3000/crud', {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id
      })
    })
      .then(response => response.json())
      .then(item => {
        this.props.deleteItemFromState(id)
      })
      .catch(err => console.log(err));
    }

  }

  render() {
    let items;
    if (this.props.items.length > 0) {
      items = this.props.items.map(item => {
        return (
          <tr key={item.id}>
            <th scope="row">{item.id}</th>
            <td>{item.fullname}</td>
            <td>{item.email}</td>
            <td>{item.phone}</td>
            <td>
              <div style={{margin:"auto"}}>
                <AddEditModal buttonLabel="編集" item={item} updateState={this.props.updateState}/>
                {' '}
                <Button color="danger" onClick={() => this.deleteItem(item.id)}>削除</Button>
              </div>
            </td>
          </tr>
          );
        })
    } else {
      items = '';
    }

    return (
      <Table responsive hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>氏名</th>
            <th>Email</th>
            <th>電話番号</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items}
        </tbody>
      </Table>
    )
  }
}

export default AccountsTable;
```

#### AddEditModal.jsを修正します。
```
import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import AddEditForm from '../Forms/AddEditForm';

class AddEditModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false
    }
  }

  toggle = () => {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  render() {
      const closeBtn = <button className="close" onClick={this.toggle}>&times;</button>
      const label = this.props.buttonLabel;
      let button = '';
      let title = '';

      if(label === '編集'){
        button = <Button
                  color="warning"
                  onClick={this.toggle}
                  style={{float: "left", marginRight:"13px"}}>{label}
                </Button>
        title = '編集';
      } else {
        button = <Button
                  color="success"
                  onClick={this.toggle}
                  style={{float: "left", marginRight:"13px"}}>{label}
                </Button>
        title = '追加';
      }

      return (
      <div>
        {button}
        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle} close={closeBtn}>{title}</ModalHeader>
          <ModalBody>
            <AddEditForm
              addItemToState={this.props.addItemToState}
              updateState={this.props.updateState}
              toggle={this.toggle}
              item={this.props.item} />
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default AddEditModal;
```

#### AddEditForm.jsを修正します。
```
import React from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';

class AddEditForm extends React.Component {
  state = {
    id: 0,
    fullname: '',
    email: '',
    phone: ''
  }

  onChange = e => {
    this.setState({[e.target.name]: e.target.value});
  }

  submitFormAdd = e => {
    e.preventDefault();
    fetch('http://localhost:3000/crud', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullname: this.state.fullname,
        email: this.state.email,
        phone: this.state.phone
      })
    })
      .then(response => response.json())
      .then(item => {
        if(Array.isArray(item)) {
          this.props.addItemToState(item[0]);
          this.props.toggle();
        } else {
          console.log('failure');
        }
      })
      .catch(err => console.log(err));
  }

  submitFormEdit = e => {
    e.preventDefault();
    fetch('http://localhost:3000/crud', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: this.state.id,
        fullname: this.state.fullname,
        email: this.state.email,
        phone: this.state.phone
      })
    })
      .then(response => response.json())
      .then(item => {
        if(Array.isArray(item)) {
          this.props.updateState(item[0]);
          this.props.toggle();
        } else {
          console.log('failure');
        }
      })
      .catch(err => console.log(err));
  }

  componentDidMount(){
    if(this.props.item){
      const { id, fullname, email, phone } = this.props.item;
      this.setState({ id, fullname, email, phone });
    };
  }

  render() {
    return (
      <Form onSubmit={this.props.item ? this.submitFormEdit : this.submitFormAdd}>
        <FormGroup>
          <Label for="fullname">氏名</Label>
          <Input type="text" name="fullname" id="fullname" onChange={this.onChange} value={this.state.fullname === null ? '' : this.state.fullname} />
        </FormGroup>
        <FormGroup>
          <Label for="email">Email</Label>
          <Input type="email" name="email" id="email" onChange={this.onChange} value={this.state.email === null ? '' : this.state.email}  />
        </FormGroup>
        <FormGroup>
          <Label for="phone">電話番号</Label>
          <Input type="text" name="phone" id="phone" onChange={this.onChange} value={this.state.phone === null ? '' : this.state.phone} />
        </FormGroup>
        <Button>確定</Button>
      </Form>
    );
  }
}

export default AddEditForm;
```

#### index.cssを修正します。
```
table {
    width: 100%;
    border-collapse: collapse;
    white-space: nowrap;
    table-layout: fixed;
}

th:first-child {
    width: 60px;
}

tr:nth-of-type(odd) {
    background: #00dee0;
}

th {
    background: #005454;
    color: white;
    font-weight: bold;
}

td, th {
    padding: 5px;
    border: 1px solid #00c2c2;
    text-align: left;
}
```

#### index.jsを修正します。
bootstrapを追加します。\
`import 'bootstrap/dist/css/bootstrap.min.css';`

## 5. 実行
#### バックエンド側
以下のコマンドを実行します。
```
cd api
npm start
```
問題なければポート3000で実行されます。\
`http://localhost:3000`

#### フロントエンド側
バックエンドが実行されたままもう一つターミナルを開いて、以下のコマンドを実行します。
```
cd fe
npm start
```
問題なければポート3001で実行されます。\
`http://localhost:3001`
