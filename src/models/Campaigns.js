const dao = require('./Dao');
const Campaign = require('./Campaign');
const {URL} = require('url');

module.exports = class Campaigns {

    static get(userId) {
        const sql = `SELECT c.id AS id, name, url, isEnabled, tracking, delay, effect, location, \
            counters, message, initialWait, COUNT(l.id) AS leads \
            FROM campaigns AS c \
            LEFT JOIN leads AS l ON c.id = l.campaignId \
            WHERE c.userId = ? \
            GROUP BY c.id;`;
        return new Promise((resolve, reject) => {
            dao.query(sql, [userId])
                .then(({results, fields}) => resolve(results))
                .catch((err) => reject(err));
        });
    }

    static getIdByUrl(url) {
        const sql = `SELECT id FROM campaigns WHERE url = ?;`;
        return dao.query(sql, [url])
            .then(({results}) => results[0].id);
    }

    static toCampaign(obj) {
        if(obj === undefined || obj === null) return;
        let c = new Campaign();
        Object.keys(obj).forEach(k => {
            c.set(k, obj[k]);
        });
        return c;
    }

    static getById(id) {
        return dao.query(`SELECT * FROM campaigns WHERE id = ?;`, [id])
            .then(({results}) => this.toCampaign(results[0]));
    }

    // CAMPAIGN: {}
    static put(campaign) {
        return new Promise((resolve, reject) => {
            if(!(campaign instanceof Campaign)) reject(new Error('Not a Campaign Object.'));
            const {string, values} = campaign.getUpdateQuery();
            dao.query(string, values).then(resolve).catch(reject);
        })
        .then(({results}) => results);
    }

    // CAMPAIGN: {url, name}
    static post(campaign) {
        return new Promise((resolve, reject) => {
            if(!campaign.name || !campaign.url) reject(new Error('Incomplete Campaign Object.'));
            const {string, values} = campaign.getInsertQuery();
            dao.query(string, values)
                .then(({results}) => resolve(results.insertId))
                .catch(reject);
        });
    }

    static delete(ids) {
        if(!Array.isArray(ids)) ids = [ids];
        return new Promise((resolve, reject) => {
            let sql = `DELETE FROM campaigns WHERE id IN (${ids.map(v => '?').join(', ')});`;
            dao.query(sql, ids)
                .then(resolve)
                .catch(reject);
        });
    }

    static getConfig(url) {
        return this.query(
            `SELECT isEnabled, tracking, message, delay, effect, location, counters, initialWait, FROM campaigns WHERE url = '${url}';`
        )
        .then(r => r[0])
        .catch(r => false);
    }
}

