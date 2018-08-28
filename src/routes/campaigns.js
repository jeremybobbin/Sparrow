const router = require('express').Router();

const Campaigns = require('../models/Campaigns');
const Fields = require('../models/Fields');

router.get('/', (req, res) => Campaigns.get(req.userId)
    .then(r => res.json(r))
    .catch(() => res.sendStatus(500)));

router.get('/config', (req, res) => Fields.get(req.query.url)
    .then(r => res.json(r)));


router.put('/', (req, res) => {
    let campaign = Campaigns.toCampaign(req.body);
    campaign.set('userId', req.userId);
    console.log(campaign);
    Campaigns.put(campaign)
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(500));
});

router.post('/', (req, res) => {
    let campaign = Campaigns.toCampaign(req.body);
    campaign.set('userId', req.userId);
    console.log(campaign);
    Campaigns.post(campaign)
        .then(r => res.json(r))
        .catch(r => res.sendStatus(500));
});

router.delete('/', (req, res) => Campaigns.delete(req.body)
    .then(() => res.sendStatus(200))
    .catch(r => res.sendStatus(500)));

module.exports = router;