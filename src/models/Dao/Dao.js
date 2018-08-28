const mysql = require('mysql');
const axios = require('axios');

module.exports = class Dao {

    constructor(db) {
        this.db = db;
    }

    init(sql) {
        Promise.all(sql.map(string => this.query(string)))
            .then(() =>  {
                console.log('Successfully created tables.')
            }).catch(err => console.log(err));
    }

    query(sql, args) {
        if(!Array.isArray(args)) args = [args];
        if(args) return this.db.query(sql, args);
        return this.db.query(sql);
    }

    getUrlId(url) {
        return this.query(`SELECT id FROM campaigns WHERE url = ?`, url)
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
            widget, show, delay, effect, location, \
            counters, initialWait \
            FROM formNames AS name \
            JOIN campaigns AS c ON name.urlId = c.id \
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
        return this.query(
            `INSERT INTO users (email, password, first, last) \
            VALUES (${values}); `
        );
    }

    getUserInfo(email) {
        let sql = `SELECT id, password, first, last FROM users WHERE email = '${email}'`;
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
