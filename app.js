const port = 3001;
const saltRounds = 10;

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const pug = require('pug');

const drup = require('./models/DrupalServer');
const dao = require('./models/Dao');



const app = express();

app.set('view engine', 'pug')

app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    res.append('Access-Control-Allow-Headers', 'X-CSRF-Token');
    res.append('Access-Control-Allow-Headers', 'session');
    next();
});

app.use(require('./routes'));


app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});



app.post('/register', (req, res) => {
    const {username, email, password} = req.body,
        emailIsValid = validateEmail(email),
        passwordIsValid = validatePassword(password);

    if(!emailIsValid || !passwordIsValid) {
        return res.json({
            message: !emailIsValid && !passwordIsValid ? 'Username and password fields are invalid' :
                (passwordIsValid ? 'Email field is invalid.' : 'Password field is invalid.')
        });
    }

    drup.register(username, email, password)
        .then(r => res.json(r));
});




app.post('/login', (req, res) => {
    const {username, password} = req.body;
    drup.logIn(username, password)
        .then(r => res.json(r));
});

app.post('/logout', (req, res) => {
    let session = req.get('session');
    drup.logOut(session)
        .then(r => res.json(r));
});

app.get('/data', (req, res) => {
    verify(req, res)
        .then(r => dao.getData(decodeURIComponent(req.query.url))
            .then(r => res.json(r)));
});


app.post('/userinfo', (req, res) => {
    drup.getUserInfo(req.get('Session'), req.get('X-CSRF-Token'))
        .then(r => r ? res.json(r) : res.send('Dang'));
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

function validateEmail(email) {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return typeof email === 'string' && emailRegex.test(email.toLowerCase());
}

function validatePassword(password) {
    return typeof password === 'string' && password.length >= 8;
}

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




function verify(req, res) {
    let {session} = req.body;
    drup.verify(session)
        .then(r => {
            if(!r) return res.status(401).send('Unauthorized');
            return r;
        });
}




const divRound = (top, bot) => Math.round(top / bot);

app.listen(port, () => console.log('Example app listening on port: ' + port));