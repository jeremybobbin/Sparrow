const mysql = require('mysql');
const axios = require('axios');

const config = require('../../config');

module.exports = class Dao {

    constructor() {
        this.conn = require('./Connection');
        this.init();
    }

    init() {
        let sql = [
            'CREATE TABLE IF NOT EXISTS urls ( id INT NOT NULL AUTO_INCREMENT, userId INT NOT NULL, \
                `url` VARCHAR(512) NOT NULL, `showing` BOOLEAN DEFAULT TRUE, \
                `tracking` BOOLEAN DEFAULT TRUE, \
                `delay` TINYINT NOT NULL DEFAULT 3, `effect` VARCHAR(255) DEFAULT \'fade\' , \
                `location` VARCHAR(255) NOT NULL DEFAULT \'bottom-left\', \
                `counters` BOOLEAN NOT NULL DEFAULT FALSE, `initialWait` TINYINT DEFAULT 3, \
                PRIMARY KEY(id) ); ',
            `CREATE TABLE IF NOT EXISTS leads ( \
                urlId varchar(255) NOT NULL, \
                ip varchar(512) NOT NULL, \
                first varchar(512), \
                last varchar(512), \
                email varchar(512), \
                city varchar(255), \
                region varchar(255), \
                country varchar(255), \
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
            ); `,
        ];

        Promise.all(sql.map(string => this.query(string)))
            .then(() =>  {
                console.log('Successfully created tables.')
            })
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
                if(results && results[0] && results[0].id) {
                    return results[0].id;
                } else {
                    return false;
                }
            });
    }

    setFields(url, fId, fName, lId, lName, eId, eName) {
        return this.getUrlId(url)
            .then(urlId =>  {
                if(!urlId) return false;
                let ids = [urlId, fId, lId, eId];
                Promise.all([
                    this.query(`REPLACE INTO formNames (urlId, first, last, email) VALUES (${formatSql([urlId, fName, lName, eName])});`),
                    this.query(`REPLACE INTO formIds (urlId, first, last, email) VALUES (${formatSql([urlId, fId, lId, eId])});`)
                ]);
            });
    }

    getData(url) {
        return this.query(
            `SELECT name.first AS fName, name.last AS lName, name.email \
            AS eName,id.first AS fId, id.last AS lId, id.email AS eId, \
            urls.widget, urls.show, urls.delay, urls.effect, urls.location, \
            urls.show_counters, urls.initial_wait \
            FROM formNames AS name \
            JOIN urls ON name.urlId = urls.id \
            JOIN formIds AS id \
            ON urls.id = id.urlId \
            WHERE urls.url = '${url}'`
        )
        .then(r => r[0])
        .then(r => {
            return r ? {
                widget: r.widget,
                show: r.show,
                delay: r.delay,
                effect: r.effect,
                location: r.location,
                show_counters: r.show_counters,
                initial_wait: r.initial_wait,
                fields: {
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
                    }
                }
            } : {};
        });
    }

    putLead(url, ip, first, last, email) {
        let p1 = axios.get(`http://api.ipstack.com/${ip}?access_key=${config.ipstack}`)
            .then(r => r.data);
        let p2 = this.getUrlId(url);
        return Promise.all([p1, p2]).then(r => {
            const values = formatSql([r[1], ip, first, last, email, r[0].city, r[0].region_name, r[0].country_name]);
            return this.query(`INSERT INTO leads (urlId, ip, first, last, email, city, region, country) VALUES (${values});`);
        });
    }

    getWidgetInfo(url) {
        return this.query(
            `SELECT first, last, email, city, UNIX_TIMESTAMP(time) AS time FROM leads
            JOIN urls ON leads.urlId = urls.id
            WHERE url = '${url}'
            ORDER BY time DESC 
            LIMIT 15; `
        );
    }

    register(email, password, first, last) {
        const values = [email, password, first, last]
                    .map(val => val === null ? 'NULL' : "'" + val + "'")
                    .join(', ');
        console.log(values);
        return this.query(
            `INSERT INTO users (email, password, first, last) \
            VALUES (${values}); `
        );
    }

    getUserInfo(email) {
        let sql = `SELECT id, password, first, last FROM users WHERE email = '${email}'`;
        console.log(sql);
        return this.query(
            sql
        )
        .then(r => r[0])
        .catch(() => false);
    }

    emailIsUnique(email) {
        return this.query(`SELECT id FROM users WHERE email = '${email}'; `)
            .then(r => r.length === 0)
            .then(r => {
                if(r) return r;
                else throw 'That email is already in use.';
            });
    }
}

function formatSql(arr) {
    return arr
        .map(field => field ? (Number.isInteger(field) ? field : "'" + field + "'") : 'NULL')
        .join(', ');
}
