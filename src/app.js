const pug = require('pug');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { URL } = require('url');

const Campaigns = require('./models/Campaigns');
const Fields = require('./models/Fields');
const Leads = require('./models/Leads');
const Lead = require('./models/Lead');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.enable('trust proxy');

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization, Session, X-CSRF-Token, User-IP");
    res.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
});

app.use((req, res, next) => {
    const {method, originalUrl} = req;
    console.log(method + ' request for: ' + originalUrl + ' from ' + req.get('User-IP'));
    next();
});

app.use((req, res, next) => {
    const toParsedUrl = (url) => {
        url = new URL(decodeURIComponent(url));
        let path = url.pathname;
        if(path[path.length - 1] == '/') path = path.slice(0, -1);

        return url.origin + path;
    }

    const {body, query} = req;

    if(body.hasOwnProperty('url')) {
        req.body.url = toParsedUrl(body.url);
    }
    if(query.hasOwnProperty('url')) {
        req.query.url = toParsedUrl(query.url);
    }
    
    next();
});



app.use(require('./routes'));

app.get('/script', (req, res) => res.sendFile(__dirname + '/public/sparrow.js'));



// Route for posting data about form fields
app.post('/data', (req, res) => {
    if(!req.body.fields) return;

    const {firstname, lastname, email} = req.body.fields;
    Fields.set(url, firstname.name, lastname.name, email.name, firstname.id, lastname.id, email.id)
        .then(r => res.json(r))
        .catch(err => res.json(err));
});


// Route for getting data about the form fields
app.get('/data', (req, res) => {
    Fields.get(req.query.url)
            .then(r => res.json(r))
            .catch(r => res.json(r));
});

// Route to render widget.
app.get('/widget', (req, res) => {
    Leads.getOneFormatted(req.query.url, req.query.r)
        .then(({leadString, time, message}) => {
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
