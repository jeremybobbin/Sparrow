const pug = require('pug');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const Campaigns = require('./models/Campaigns');
const Fields = require('./models/Fields');
const Leads = require('./models/Leads');
const Lead = require('./models/Lead');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


app.use((req, res, next) => {

    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization, X-CSRF-Token, Session");
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
});

app.enable('trust proxy');

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(require('./routes'));

app.get('/script', (req, res) => res.sendFile(__dirname + '/public/sparrow.js'));


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



// Route for posting data about form fields
app.post('/data', (req, res) => {
    if(!req.body.fields) return;

    const {firstname, lastname, email} = req.body.fields;

    Fields.set(req.body.url, firstname.name, lastname.name, email.name, firstname.id, lastname.id, email.id)
        .then(r => res.json(r))
        .catch(err => res.json(err));
});


// Route for getting data about the form fields
app.get('/data', (req, res) => {
    Fields.get(decodeURIComponent(req.query.url))
            .then(r => res.json(r))
            .catch(r => res.json(r));
});

// Route to render widget.
app.get('/widget', (req, res) => {

    const url = decodeURIComponent(req.query.url);

    Leads.getOneFormatted(url, req.query.r)
        .then(({leadString, time, message}) => {
            console.log('Rendering');
            res.render('widget.pug', {leadString, message, time});
        })
        .catch(err => console.log(err));
});

app.get('/throw', (req, res) => {
    throwError();
});

function throwError() {
    let err= new Error('This is an error.');
    throw err;
}

module.exports = app;