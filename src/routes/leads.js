const router = require('express').Router();

const Leads = require('../models/Leads');


router.get('/', (req, res) => Leads.get(req.query.id, req.query.limit, req.query.offset)
    .then(r => res.json(r))
    .catch(() => res.sendStatus(500)));

    router.post('/', (req, res) => Leads.post(Leads.toLead(req.body))
    .then(r => res.json(r))
    .catch(r=> res.sendStatus(500)));

router.delete('/', (req, res) => Leads.delete()
    .then(r => res.sendStatus(200))
    .catch(r=> res.sendStatus(500)));

module.exports = router;