const dao = require('./Dao');

module.exports = class Fields {
    static get(url) {
        const sql = `SELECT n.first AS firstName, n.last AS lastName, \
            n.email AS emailName, i.first AS firstId, i.last as lastId, \
            i.email AS emailId \
            FROM fields FROM formNames AS n \
            JOIN formIds AS i ON n.campaignId = i.campaignId \
            JOIN campaigns AS c ON i.campaignId = c.id
            WHERE c.url = ?;`;
        return dao.query(sql, [url]);
    }

    set(firstName, lastName, emailName, firstId, lastId, emailId) {
        const sql1 = `INSERT INTO formNames (first, last, email) VALUES (?,?,?);`;
        const sql2 = `INSERT INTO formIds (first, last, email) VALUES (?,?,?);`;
        return dao.query(sql1, [firstName, lastName, emailName])
            .then(dao.query(sql2, [firstId, lastId, emailId]))
            .then(({results})=> results);
    }
}