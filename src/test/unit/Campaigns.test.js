const Campaigns = require('../../models/Campaigns');
const Campaign = require('../../models/Campaign');

let campaign1 = new Campaign(null, 7, 'Jer Campaign', 'https://www.google.com');
let campaign2 = new Campaign(6, 7, 'My New Campaign', 'https://www.example.com',
    true, true, 'Has just signed up for test!', 6, 'fade', 'bottom-left', true, 3);
let campaign3 = new Campaign(7, 201, 'My New Campaign', 'https://www.example.com',
    true, true, 'Has just signed up for test!', 33, 'fade', 'bottom-left', true, 3);


describe("Campaigns", () => {
    it('should post into the database', () => {
        return Campaigns.post(campaign1)
            .then(r => expect(typeof r).toBe('number'));
    });

    it('should update the database', () => {
        let id;
        return Campaigns.post(campaign2)
            .then((r) => id = r)
            .then(() => {
                campaign2.set('id', id);
                campaign2.set('name', 'Person')
            })
            .then(() => Campaigns.put(campaign2))
            .then(() => Campaigns.getById(campaign2.id))
            .then(c => expect(c.name).toBe(campaign2.name))
    });

    it('should throw an error when inserting a non-campaign object', () => {
        return Campaigns.put('Bitches').catch(err => expect(err).toBeTruthy());
    });

    it('should throw an error when campaignID doesn\'t exist.', ()=>{
        return Campaigns.get(5829348239)
            .catch(e => expect(e).toBeTruthy());
    });

    it('deletes campaigns', () => {
        return Campaigns.put(campaign3)
            .then(() => Campaigns.delete([campaign3.id]))
            .then(() => Campaigns.getById(campaign3.id))
            .catch(e => expect(e).toBeTruthy());
    });
});