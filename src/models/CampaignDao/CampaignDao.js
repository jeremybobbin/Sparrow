const Dao = require('../Dao/Dao');

module.exports = class CampaignDao extends Dao {

    constructor() {
        super();
    }

    init() {
        let sql = 'CREATE TABLE IF NOT EXISTS campaigns ( \
            id INT NOT NULL AUTO_INCREMENT, userId INT NOT NULL, name VARCHAR(512) NOT NULL, \
            `url` VARCHAR(512) NOT NULL, `enabled` BOOLEAN DEFAULT TRUE, \
            `tracking` BOOLEAN DEFAULT TRUE, `message` VARCHAR(512), \
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
        let sql = `SELECT c.id AS id, name, url, enabled, tracking, delay, effect, position, \
        counters, message, initialWait, COUNT(l.id) AS leads \
        FROM campaigns AS c \
        LEFT JOIN leads AS l ON c.id = l.campaignId \
        WHERE c.userId = ${userId} \
        GROUP BY c.id;`;
        console.log(sql);
        return this.query(
            sql
        ).then(r => {
            console.log('USER ID:  ' + userId);
            console.log('GET() on cDao');
            console.log(r);
            return r;
        })
    }

    // CAMPAIGN: {}
    put(userId, campaign) {
        let id = campaign.id;
        campaign.userId = userId;
        let pairs = [];
        for(let k in campaign) {
            let v = campaign[k];
            v = v === true ? 1 : (v === false ? 0 : v);
            pairs.push(`${k} = ${Number.isInteger(parseInt(v)) ? v : "'" + v + "'"}`);
        }
        let sql = `UPDATE campaigns SET ${pairs.join(', ')} WHERE id = ${id};`;
        console.log(sql);
        return this.query(
            sql
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
        console.log('ID\'s:   ');
        console.log(ids);
        const values = ids.join(', ');
        let sql =`DELETE FROM campaigns WHERE id IN (${values}) AND userId = ${userId};`;
        return this.query(
            sql
        );
    }

    getConfig(url) {
        return this.query(
            `SELECT enabled, tracking, message, delay, effect, location, counters, initialWait, FROM campaigns WHERE url = '${url}';`
        )
        .then(r => r[0])
        .catch(r => false);
    }
}