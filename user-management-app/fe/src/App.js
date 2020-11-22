import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { CSVLink } from "react-csv";
import AccountsTable from './components/Tables/AccountsTable';
import AddEditModal from './components/Modals/AddEditModal';

class App extends Component {
  state = {
    items: []
  }

  getItems() {
    fetch('http://localhost:3000/crud')
      .then(response => response.json())
      .then(items => this.setState({ items }))
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

  componentDidMount() {
    this.getItems();
  }

  render() {
    return (
      <Container className="App">
        <Row>
          <Col>
            <h1 style={{ margin: "13px" }}>User management app</h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <AccountsTable items={this.state.items} updateState={this.updateState} deleteItemFromState={this.deleteItemFromState} />
          </Col>
        </Row>
        <Row>
          <Col>
            <AddEditModal buttonLabel="追加" addItemToState={this.addItemToState} />
            {this.state.items.length > 0 &&
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