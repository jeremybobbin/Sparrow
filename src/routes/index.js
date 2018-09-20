const router = require('express').Router();

const drup = require('../models/DrupalServer');

const verify = (req, res, next) => {
    const session = req.get('Session');
    const token = req.get('X-CSRF-Token');
    if(req.baseUrl === '/leads' && req.method == 'POST') return next();


    drup.verify(session, token)
        .then(r => {
            if(r) req.userId = r;
            else throw 'something';
            next();
        })
        .catch(() => res.sendStatus(401));
}

router.use('/campaigns', verify, require('./campaigns'));
router.use('/leads', verify, require('./leads'));
router.use('/user', require('./user'));

module.exports = router;


