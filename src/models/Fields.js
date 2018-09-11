const dao = require('./Dao');

module.exports = class Fields {
    static get(url) {

        if(url === null || url === undefined) throw 'Null URL';

        const sql = `SELECT \
                n.first AS firstName, \
                n.last AS lastName, \
                n.email AS emailName, \
                i.first AS firstId, \
                i.last as lastId, \
                i.email AS emailId, \
                enabled, \
                tracking, \
                message, \
                delay, \
                effect, \
                location, \
                counters, \
                initialWait \
                FROM formNames AS n \
            JOIN formIds AS i ON n.campaignId = i.campaignId \
            JOIN campaigns AS c ON i.campaignId = c.id \
            WHERE c.url = ?;`;
        return dao.query(sql, [url])
            .then(({results}) => results[0])
            .then(({
                firstName,
                lastName,
                emailName,
                firstId,
                lastId,
                emailId,
                enabled,
                tracking,
                message,
                delay,
                effect,
                location,
                counters,
                initialWait
            }) => ({
                enabled,
                tracking,
                message,
                delay,
                effect,
                location,
                counters,
                initialWait,
                fields: {
                    firstname: {
                        id: firstId,
                        name: firstName
                    },
                    lastname: {
                        id: lastId,
                        name: lastName
                    },
                    email: {
                        id: emailId,
                        name: emailName
                    }
                }
            }));
    }

    static set(url, firstName, lastName, emailName, firstId, lastId, emailId) {
        let cId;
        const getId = `SELECT id FROM campaigns WHERE url = ?;`;
        const setNames = `INSERT INTO formNames (campaignId, first, last, email) VALUES (?,?,?,?);`;
        const setIds = `INSERT INTO formIds (campaignId, first, last, email) VALUES (?,?,?,?);`;
        
        return dao.query(getId, [url])
            .then(({results}) => cId = results[0].id)
            .then(() => dao.query(setNames, [cId, firstName, lastName, emailName]))
            .then(() => dao.query(setIds, [cId, firstId, lastId, emailId]));
    }
}

// `enabled` BOOLEAN DEFAULT TRUE, \
// `tracking` BOOLEAN DEFAULT TRUE, \
// `message` VARCHAR(255), \
// `delay` TINYINT NOT NULL DEFAULT 3, \
// `effect` VARCHAR(255) DEFAULT "fade" , \
// `location` TINYINT NOT NULL DEFAULT 0, \
// `counters` BOOLEAN NOT NULL DEFAULT FALSE, \
// `initialWait` TINYINT DEFAULT 3, \
