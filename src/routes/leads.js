const router = require('express').Router();

const dao = require('../models/Leads');


router.get('/', (req, res) => dao.get(req.query.id, req.query.limit, req.query.offset)
    .then(r => res.json(r))
    .catch(() => res.sendStatus(500)));

router.put('/', (req, res) => dao.put()
    .then(r => res.sendStatus(200))
    .catch(r=> res.sendStatus(500)));

router.post('/', (req, res) => dao.post()
    .then(r => res.json(r))
    .catch(r=> res.sendStatus(500)));

router.delete('/', (req, res) => dao.delete()
    .then(r => res.sendStatus(200))
    .catch(r=> res.sendStatus(500)));

module.exports = router;