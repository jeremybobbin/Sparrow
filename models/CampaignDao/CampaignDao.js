const Dao = require('../Dao/Dao');

module.exports = class CampaignDao extends Dao {

    constructor() {
        super();
    }

    init() {
        let sql = 'CREATE TABLE IF NOT EXISTS campaigns ( \
            id INT NOT NULL AUTO_INCREMENT, userId INT NOT NULL, name VARCHAR(512) NOT NULL, \
            `url` VARCHAR(512) NOT NULL, `showing` BOOLEAN DEFAULT TRUE, \
            `tracking` BOOLEAN DEFAULT TRUE, \
            `delay` TINYINT NOT NULL DEFAULT 3, `effect` VARCHAR(255) DEFAULT \'fade\' , \
            `location` VARCHAR(255) NOT NULL DEFAULT \'bottom-left\', \
            `counters` BOOLEAN NOT NULL DEFAULT FALSE, `initialWait` TINYINT DEFAULT 3, \
            PRIMARY KEY(id) \
        ); ';
        
        this.query(sql)
            .then(() => console.log('CampaignDao has been instantiated.'))
            .catch(console.log);
    }

    get(userId) {
        return this.query(
            `SELECT id, name, url, showing, tracking, delay, effect, location, counters, initialWait \
            FROM campaigns AS c WHERE c.userId = ${userId}`
        );
    }

    // CAMPAIGN: {}
    put(userId, campaign) {
        let id = campaign.id;
        campaign.userId = userId;
        let pairs = [];
        for(let k in campaign) {
            let v = campaign[k];
            pairs.push(`${k} = ${Number.isInteger(parseInt(v)) ? v : "'" + v + "'"}`);
        }
        return this.query(
            `UPDATE campaigns SET ${pairs.join(', ')} WHERE id = ${id};`
        );
    }

    // CAMPAIGN: {url, name}
    post(userId, campaign) {
        if(!campaign.name || !campaign.url) throw 'Incomplete Campaigns';
        const values = `(${userId}, '${campaign.url}', '${campaign.name}')`;
        return this.query(
            `INSERT INTO campaigns (userId, url, name) VALUES ${values};`
        );
    }

    delete(userId, ids) {
        const values = ids.join(', ');
        let sql =`DELETE FROM campaigns WHERE id IN (${values}) AND userId = ${userId};`;
        return this.query(
            sql
        );
    }
}