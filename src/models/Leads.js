const metaphone = require('metaphone');
const axios = require('axios');

const config = require('../config');
const Lead = require('./Lead');
const Campaigns = require('./Campaigns');
const dao = require('./Dao');

module.exports = class Leads {
    static get(cId, limit = 10, offset = 0, userId = null) {
        if(limit > 100) throw new Error('Limit is too high.');
        let sql = cId ? `SELECT id, ip, first, last, email, city, region, country, time FROM leads \
                    WHERE campaignId = ? LIMIT ? OFFSET ?;`
                    :
                    `SELECT id, ip, first, last, email, city, region, country, \
                    time FROM leads AS l JOIN campaigns AS c ON l.campaignId = c.id \
                    WHERE c.userId = ? LIMIT ? OFFSET ?;`;
        cId = Number.parseInt(cId);
        limit = Number.parseInt(limit);
        offset = Number.parseInt(offset);
        return dao.query(sql, [cId || userId, limit, offset])
            .then(({results}) => results);
    }

    static toLead(obj) {
        const lead = new Lead();
        Object.keys(obj).forEach(k => lead.set(k, obj[k]));
        return lead;
    }

    //Takes a URL and random number and returns random lead message.
    static getOneFormatted(url, rand) {
        const sql = `SELECT first, last, city, time, message FROM leads AS l \
            JOIN campaigns AS c ON l.campaignId = c.id \
            WHERE c.url = ? ORDER BY time DESC LIMIT 20;`;
        return dao.query(sql, [url])
            .then(({results}) => results[Math.floor(results.length * rand)])
            .then(({first, last, city, time, message}) => {
                const leadString = Lead.genMessage(first, last, city);
                time = Lead.genTime(time);
                return {message, time, leadString};
            });
    }

    static post(lead, url) {
        let sql = `INSERT INTO leads (campaignId, ip, first, last, email, city, region, country) VALUES \
            (?, ?, ?, ?, ?, ?, ?, ?)`;
        return axios.get('http://api.ipstack.com/' + lead.getIp() + '?access_key=' + config.ipstack)
            .then(({data}) => {
                const {region_name, country_name, city} = data;
    
                lead.set('city', city);
                lead.set('region', region_name);
                lead.set('country', country_name);
            })
            .then(() => Campaigns.getIdByUrl(url))
            .then(id => lead.set('campaignId', id))
            .then(() => dao.query(sql, lead.getValues()))
            .then(({results}) => results);
    }

    static delete(ids) {
        if(!Array.isArray(ids)) ids = [ids];
        let sql = `DELETE FROM leads WHERE id IN (${ids.map(id => '?').join(', ')})`;
        return dao.query(sql, ids)
            .then(({results}) => results);
    }

    static count(url) {
        let sql = `SELECT COUNT(l.id) AS leads FROM leads AS l \
                JOIN campaigns AS c ON l.campaignId = c.id \
                WHERE c.url = ?;`;
        return dao.query(sql, url)
            .then(({results}) => results[0].leads);
    }

    static find(string) {
        const intSound = [
            'zero ', ' one ', ' two ', ' three ', ' four ',
            ' five ', ' six ', ' seven ', ' eight ', ' nine'
        ];

        string.replace(/[0-9.]/g, n => n === '.' ? 'dot' : intSound[parseInt(n)]);
            let sql = `SELECT l.id AS id, ip, first, last, email, city, region, country, time \
                    FROM leads AS l JOIN sound AS s ON l.soundId = s.id \
                    WHERE s.value LIKE '%?%'`;
            dao.query(sql, [string]);
    }
}