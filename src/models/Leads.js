const metaphone = require('metaphone');

const dao = require('./Dao');

module.exports = class Leads {
    static get(cId, limit = 10, offset = 0) {
        if(limit > 100) throw new Error('Limit is too high.');
        let sql = `SELECT id, ip, first, last, email, city, region, country, time FROM leads \
                    WHERE campaignId = ? LIMIT ? OFFSET ?;`;
        return dao.query(sql, [cId, limit, offset])
            .then(({results}) => {

            });
    }

    static toLead(obj) {
        const lead = new Lead();
        Object.keys(obj).forEach(k => lead.set(k, obj[k]));
        return lead;
    }

    static post(lead) {
        let sql = `INSERT INTO leads (campaignId, first, last, email, city, region, country) VALUES \
            (?, ?, ?, ?, ?, ?, ?)`;
        return dao.query(sql, lead.getValues())
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