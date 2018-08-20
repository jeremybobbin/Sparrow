const metaphone = require('metaphone');

const Dao = require('../Dao/Dao');

console.log('Metaphone test');
console.log(metaphone('Bob Martin Phillidelphia'));

module.exports = class LeadDao extends Dao {

    constructor() {
        super();
    }

    init() {
        const sql = [
            `CREATE TABLE IF NOT EXISTS leads ( \
                id int NOT NULL AUTO_INCREMENT PRIMARY KEY, \
                campaignId int NOT NULL, \
                ip varchar(512) NOT NULL, \
                first varchar(512), \
                last varchar(512), \
                email varchar(512), \
                city varchar(255), \
                region varchar(255), \
                country varchar(255), \
                time DATETIME DEFAULT CURRENT_TIMESTAMP, \
                soundId INT NOT NULL \
            ); `,
            `CREATE TABLE IF NOT EXISTS sound (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                value VARCHAR(512)
            )`
        ];
        Promise.all(sql.map(s => this.query(s)))
            .then(() => console.log('LeadDao has been instantiated.'))
            .catch(console.log);
    }

    get(cId, limit = 10, offset = 0) {
        if(limit > 100) throw 'Pls';
        let clause = `LIMIT ${limit} OFFSET ${offset}`;
        let sql = `SELECT id, ip, first, last, email, city, region, country, time FROM leads \
                    WHERE campaignId = ${cId} ${clause};`;
        console.log(sql);
        return this.query(sql)
            .then(r => {
                console.log(r);
                return r;
            });
    }

    put() {

    }

    post() {
        let sql = `INSERT INTO leads (campaignId, first, last, email, city, region, country)`;

    }

    delete() {

    }

    count(url) {
        let sql = `SELECT COUNT(l.leadId) AS leads FROM leads AS l \
                JOIN campaigns AS c ON l.campaignId = c.id \
                WHERE c.url = '${url}';`;
        return this.query(sql);
    }

    find(string) {
        const intSound = [
            'zero ', ' one ', ' two ', ' three ', ' four ',
            ' five ', ' six ', ' seven ', ' eight ', ' nine'
        ];

        string.replace(/[0-9.]/g, n => n === '.' ? 'dot' : intSound[parseInt(n)]);
        return this.query(
            `SELECT l.id AS id, ip, first, last, email, city, region, country, time \
                    FROM leads AS l JOIN sound AS s ON l.soundId = s.id \
                    WHERE s.value LIKE '%${metaphone(string)}%'`
        );
    }

}