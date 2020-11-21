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