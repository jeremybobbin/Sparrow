const port = 3001;
const saltRounds = 10;


const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const pug = require('pug');

const conf = require('./config.js');
const Dao = require('./Dao.js');

const ms = conf.mySql;

const dao = new Dao(ms.database, ms.user, ms.password, ms.socketPath);


const app = express();

app.set('view engine', 'pug')

app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/', (req, res) => res.sendFile(__dirname + '/views/test.html'));

app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});



app.post('/register', (req, res) => {
    const email = req.body.email,
        password = req.body.password,
        first = req.body.first || null,
        last = req.body.last || null,
        emailIsValid = validateEmail(email),
        passwordIsValid = validatePassword(password);

    if(!emailIsValid || !passwordIsValid) {
        return res.json({
            error: true,
            message: !emailIsValid && !passwordIsValid ? 'Username and password fields are invalid' :
                (passwordIsValid ? 'Email field is invalid.' : 'Password field is invalid.')
        });
    }

    dao.emailIsUnique(email)
        .then(r => {
            if(r) return bcrypt.hash(password, saltRounds)
            else throw 'That email is already in use.';
        })
        .then(hash => dao.register(email, hash, first, last))
        .then(r => res.json({message: 'You have successfully registered.', email, first, last, id: r.insertId}))
        .catch(err => {
            res.json({
                error: true,
                message: typeof err === 'string' ? 
                    err
                    :
                    'An error has occurred. Please try again later'
            });
        });
});




app.post('/login', (req, res) => {
    const email = req.body.email,
        password = req.body.password;
    
    let first, last, id;
    
    dao.getUserInfo(email)
        .then(r => {
            first = r.first || null;
            last = r.last || null;
            id = r.id;
            if(r && r.id) return bcrypt.compare(password, r.password);
            else throw 'There is no account associated with that email.';
        })
        .then(r => {
            if(r) res.json({id, email, first, last, message: 'You have been successfully logged in.'})
            else throw 'Invalid username or password.';
        })
        .catch(message => res.json({
            message,
            error: true,
        }))
});

app.get('/data', (req, res) => {
    dao.getData(decodeURIComponent(req.query.url))
        .then(r => {
            res.json(r);
        });
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

const divRound = (top, bot) => Math.round(top / bot);

app.listen(port, () => console.log('Example app listening on port: ' + port));