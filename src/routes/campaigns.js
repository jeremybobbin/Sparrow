const router = require('express').Router();

const dao = require('../models/Campaigns');


router.get('/', (req, res) => dao.get(req.userId)
    .then(r => res.json(r))
    .catch(r=> {
        res.sendStatus(500);
        console.log(r);
    }));

router.get('/config', (req, res) => dao.getConfig(req.query.url)
    .then(r => {
        console.log('/Campaigns/Config has been accessed.')
        return res.json(r);
    }));


router.put('/', (req, res) => dao.put(req.userId, req.body)
    .then(() => res.sendStatus(200))
    .catch(r => {
        console.log('Error: ');
        console.log(r);
        res.sendStatus(500);
    }));

router.post('/', (req, res) => dao.post(req.userId, req.body)
    .then(r => res.json(r.insertId))
    .catch(r => console.log(r)));


router.delete('/', (req, res) => dao.delete(req.userId, req.body)
    .then(() => res.sendStatus(200))
    .catch(r => {
        console.log('Req.body:   ');
        console.log(req.body);
        res.sendStatus(500);
    }));

module.exports = router;