const express = require('express');
const bodyParser = require('body-parser');

const conf = require('./config.js');
const Dao = require('./Dao.js');
const pug = require('pug');

const ms = conf.mySql;

const dao = new Dao(ms.database, ms.user, ms.password, ms.socketPath);


const app = express();

app.set('view engine', 'pug')

app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.sendFile(__dirname + '/views/test.html'));

app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

app.get('/data', (req, res) => {
    dao.getData(decodeURIComponent(req.query.url))
        .then(r => {
            res.json(r);
        });
});

app.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

});

app.post('/data', (req, res) => {
    let fields = req.body.fields;
    for(let prop in fields) {
        fields[prop].id = fields[prop].id || null;
        fields[prop].name = fields[prop].name || null;
    }
    dao.setFields(req.body.url, fields.firstname.id, fields.firstname.name, fields.lastname.id, fields.lastname.name, fields.email.id, fields.email.name)
        .then(r => {
            if (!r) return res.send('Nope.');
            res.send('Success');
        });
});


app.post('/lead', (req, res) => {
    console.log('POST on /lead');
    let r = req.body;
    console.log(r);
    let ip = req.ip === '::1' ? '67.204.145.178' : req.ip;
    dao.putLead(r.url, ip, r.firstname, r.lastname, r.email);
    res.send('Success.');
});

app.get('/widget', (req, res) => {
    let url = decodeURIComponent(req.query.url);
    dao.getWidgetInfo(url).then(r => {
        if(!r[0] || !req.query.r) return res.send('Something went wrong.');
        r = r[Math.floor(r.length * req.query.r)];
        res.render('widget', {msg: genMessage(r.first, r.last, r.city), time: genTime(r.time)});
    });
});

function genMessage(first, last, city) {
    let name;
    if(first && last) {
        name = first + ' ' + last[0].toUpperCase() + '.';
    } else if (first) {
        name = first;
    } else {
        name = 'Someone';
    }
    if(city) {
        return name + ' from ' + city;
    }
    return name + ' from ' + ' somewhere';
}

function genTime(time) {
    if(!time) return 'Some time ago';
    const dif = divRound(new Date().getTime(), 1000) - time;
    if (dif < 60) {
        return timeMsg(dif, 'second');
    }
    const min = divRound(dif, 60);
    if(min < 60) {
        return timeMsg(min, 'minute');
    }
    const hour = divRound(min, 60);
    if(hour < 24) {
        return timeMsg(hour, 'hour');
    }
    const day = divRound(hour, 24);
    return timeMsg(day, 'day')
}

function timeMsg(count, unit) {
    return count + ' ' + unit + (count > 1 ? 's' : '') + ' ago';
}

const divRound = (top, bot) => Math.round(top / bot);

app.listen(3000, () => console.log('Example app listening on port 3000!'));