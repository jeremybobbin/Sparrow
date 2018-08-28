const router = require('express').Router();

const drup = require('../models/DrupalServer');

const verify = (req, res, next) => {
    const session = req.get('Session');
    const token = req.get('X-CSRF-Token');
    console.log('SESSION:   ' +session);
    console.log(req.headers);
    drup.verify(session, token)
        .then(r => {
            if(r) req.userId = r;
            else return res.sendStatus(401);
            next();
        });
}

router.use('/campaigns', verify, require('./campaigns'));
router.use('/leads', verify, require('./leads'));
router.use('/user', require('./user'));

module.exports = router;
