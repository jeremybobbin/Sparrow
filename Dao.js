let mysql = require('mysql');

module.exports = class Dao {

    constructor(database = 'loanAction', user = 'root', password = 'pass',  socketPath = 'Insert Path Here') {
        this.conn = mysql.createConnection({database,socketPath,user,password});
        this.conn.connect();
        this.init();
    }

    init() {
        let sql = [
            `CREATE TABLE IF NOT EXISTS urls ( \
                id int NOT NULL AUTO_INCREMENT, \
                url varchar(512), \
                PRIMARY KEY (id) \
             ); `,
            `CREATE TABLE IF NOT EXISTS leads ( \
                id varchar(255) NOT NULL, \
                first varchar(512), \
                last varchar(512), \
                email varchar(512), \
                urlId varchar(255), \
                time DATETIME DEFAULT CURRENT_TIMESTAMP \
            ); `,
            `CREATE TABLE IF NOT EXISTS formNames ( \
                urlId varchar(255) NOT NULL PRIMARY KEY, \
                first varchar(512), \
                last varchar(512), \
                email varchar(512) \
            ); `,
            `CREATE TABLE IF NOT EXISTS formIds ( \
                urlId varchar(255) NOT NULL PRIMARY KEY, \
                first varchar(512), \
                last varchar(512), \
                email varchar(512) \
            ); `
        ];

        Promise.all(sql.map(string => this.query(string)))
            .then(() =>  { console.log('Successfully created tables.') })
            .catch(console.log);
    }

    query(sql) {
        return new Promise((resolve, reject) => {
            this.conn.query(sql, (err, res) =>{
                err ? reject(err) : resolve(res);
            });
        });
    }

    getUrlId(url) {
        return this.query(`SELECT id FROM urls WHERE url = '${url}'`)
            .then(results => {
                if (results[0]) {
                    return results[0].id
                } else {
                    return this.query(`INSERT INTO urls (url) VALUES ('${url}')`);
                }
            });
    }

    setFields(url, fId, fName, lId, lName, eId, eName) {
        return this.getUrlId(url)
            .then(urlId =>  Promise.all([
                    this.query(`REPLACE INTO formNames (urlId, first, last, email) VALUES (${urlId}, '${fName}', '${lName}', '${eName}');`),
                    this.query(`REPLACE INTO formIds (urlId, first, last, email) VALUES (${urlId}, '${fId}', '${lId}', '${eId}');`)
                ])
            );
    }

    getFields(url) {
        return this.query(
            `SELECT name.first AS fName, name.last AS lName, name.email \
            AS eName,id.first AS fId, id.last AS lId, id.email AS eId \
            FROM formNames AS name \
            JOIN urls ON name.urlId = urls.id \
            JOIN formIds AS id \
            ON urls.id = id.urlId \
            WHERE urls.url = '${url}'`
        )
        .then(r => r[0])
        .then(r => {
            return {
                firstname: {
                    id: r['fId'],
                    name: r['fName']
                },
                lastname: {
                    id: r['lId'],
                    name: r['lName']
                },
                email: {
                    id: r['eId'],
                    name: r['eName']
                },
            };
        });
    }
}
