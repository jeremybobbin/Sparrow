const router = require('express').Router();
const drup = require('../models/DrupalServer');

router.post('/login', (req, res) => { 
    const {username, password} = req.body;
    drup.logIn(username, password)
        .then(r => res.json(r))
	.catch((err) => res.sendStatus(401));
});

router.post('/logout', (req, res) => {
    drup.logOut(req.get('Session'), req.get('X-CSRF-Token'))
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(200));
});


router.post('/info', (req, res) => {
    drup.getUserInfo(req.get('Session'), req.get('X-CSRF-Token'))
        .then(r => res.json(r))
        .catch(() => res.sendStatus(500));
});

router.post('/register', (req, res) => {
    const {username, email, password} = req.body;
    drup.register(username, email, password)
        .then(sessionInfo => res.json(sessionInfo))
        .catch(err => res.status(500).send(err.response.statusText));
});


module.exports = router;
