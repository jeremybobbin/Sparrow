const express = require('express');
const bodyParser = require('body-parser');

const conf = require('./config.js');
const Dao = require('./Dao.js');

const ms = conf.mySql;

const dao = new Dao(ms.database, ms.user, ms.password, ms.socketPath);


const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('Hello World!'));

app.post('/data', (req, res) => {
    console.log('Requesting /data');
    let url = req.body.url;
    dao.getFields(url)
        .then(r => {
            res.json(r);
        });
});

app.post('/fields', (req, res) => {
    console.log('Requesting /fields');
    let fields = req.body.fields;
    console.log(req.body);
    dao.setFields(req.body.url, fields.firstname.id, fields.firstname.name, fields.lastname.id, fields.lastname.name, fields.email.id, fields.email.name)
        .then(() => {
            res.send('Success');
        });
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));