const router = require('express').Router();

const drup = require('../models/DrupalServer');

router.use('/campaigns', (req, res, next) => {
    console.log(req.headers);
    const session = req.get('Session');
    const token = req.get('X-CSRF-Token');
    drup.verify(session, token)
        .then(r => {
            console.log(r);
            if(r) req.userId = r;
            else return res.sendStatus(401);
            next();
        });
}, require('./campaigns'));

module.exports = router;
