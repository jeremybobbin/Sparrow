const router = require('express').Router();

const Leads = require('../models/Leads');


router.get('/', (req, res) => {
    Leads.get(req.query, req.userId || 3)
        .then(r => res.json(r))
        .catch(e => res.sendStatus(500));
});

router.post('/', (req, res) => {
    const lead = Leads.toLead(req.body);
    const ip = req.get('User-IP');
    lead.set('ip', ip === '::1' ? '67.204.145.178' : ip);
    Leads.post(lead, req.body.url)
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(500));
});

router.delete('/', (req, res) => Leads.delete()
    .then(r => res.sendStatus(200))
    .catch(r=> res.sendStatus(500)));

module.exports = router;
