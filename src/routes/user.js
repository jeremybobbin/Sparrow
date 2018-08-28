const router = require('express').Router();
const drup = require('../models/DrupalServer');

router.post('/login', (req, res) => {
    console.log('PING');
    const {username, password} = req.body;
    drup.logIn(username, password)
        .then(r => res.json(r) && console.log(r));
});

router.post('/logout', (req, res) => {
    let session = req.get('session');
    drup.logOut(session)
        .then(r => res.json(r));
});

router.get('/data', (req, res) => {
    verify(req, res)
        .then(r => dao.getData(decodeURIComponent(req.query.url))
            .then(r => res.json(r)));
});


router.post('/userinfo', (req, res) => {
    drup.getUserInfo(req.get('Session'), req.get('X-CSRF-Token'))
        .then(r => r ? res.json(r) : res.send('Dang'))
        .catch(() => res.sendStatus(500));
});

router.post('/register', (req, res) => {
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

function verify(req, res) {
    let {session} = req.body;
    drup.verify(session)
        .then(r => {
            if(!r) return res.status(401).send('Unauthorized');
            return r;
        });
}

function validateEmail(email) {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return typeof email === 'string' && emailRegex.test(email.toLowerCase());
}

function validatePassword(password) {
    return typeof password === 'string' && password.length >= 8;
}

module.exports = router;
