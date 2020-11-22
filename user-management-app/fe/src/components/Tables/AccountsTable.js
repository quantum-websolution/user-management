import React, { Component } from 'react';
import { Table, Button } from 'reactstrap';
import AddEditModal from '../Modals/AddEditModal';

class AccountsTable extends Component {

    deleteItem = id => {
        let confirmDelete = window.confirm('削除しますか？');
        if (confirmDelete) {
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
                            <div style={{ margin: "auto" }}>
                                <AddEditModal buttonLabel="編集" item={item} updateState={this.props.updateState} />
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