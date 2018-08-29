const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const pug = require('pug');

const conf = require('./config');
const drup = require('./models/DrupalServer');

const Campaigns = require('./models/Campaigns');
const Fields = require('./models/Fields');
const Leads = require('./models/Leads');
const Lead = require('./models/Lead');

const app = express();

app.set('view engine', 'pug');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization, X-CSRF-Token, Session");
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
});

app.use(express.static(__dirname + '/public'))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(require('./routes'));

app.get('/script', (req, res) => res.sendFile(__dirname + '/public/sparrow.js'));


// Route for posting data about form fields
app.post('/data', (req, res) => {
    if(!req.body.fields) return;

    const {firstname, lastname, email} = req.body.fields;

    Fields.set(firstname.name, lastname.name, email.name, firstname.id, lastname.id, email.id)
        .then(r => res.sendStatus(200))
        .catch(err => res.sendStatus(500));
});


// Route for posting data about the lead
app.post('/lead', (req, res) => {

    let {url, ip, firstname, lastname, email} = req.body;

    Campaigns.getIdByUrl(url)
        .then(campaignId => {
            const lead = new Lead(null, ip, firstname, lastname, campaignId);
            return Leads.putLead(lead);
        })
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(500));
});


// Route to render widget.
app.get('/widget', (req, res) => {

    const url = decodeURIComponent(req.query.url);

    Leads.getOneFormatted(url, req.ruery.r)
        .then(({msg, time}) => res.render('widget', {msg, time}))
        .catch(err => res.sendStatus(500));
});

app.get('/throw', (req, res) => {
    throwError();
});

function throwError() {
    let err= new Error('This is an error.');
    throw err;
}

module.exports = app;