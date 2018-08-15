const router = require('express').Router();

const dao = require('../models/CampaignDao');


router.get('/', (req, res) => dao.get(req.userId)
    .then(r => res.json(r))
    .catch(() => res.sendStatus(500)));

router.put('/', (req, res) => dao.put(req.userId, req.body)
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500)));

router.post('/', (req, res) => dao.post(req.userId, req.body)
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500)));

router.delete('/', (req, res) => dao.delete(req.userId, req.body)
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500)));

module.exports = router;