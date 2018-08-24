const {createPool} = require('mysql');
const events = ['aquire', 'connection', 'enqueue', 'release'];
const Query = require('./Query');

module.exports = class DataBase {
    constructor(host, username, password, database) {
        this.callbacks = new Map(events.map(e => [e, []]));
        this.pool = createPool({username, password, database, insecureAuth: true });
        this.queryObj;
        this.init();
    }

    init() {
        events.forEach(e => {
            this.pool.on(e, v => {
                this.callbacks.get(e).forEach(f => f(v))
            });
        });
    }

    on(event, callback) {
        this.callbacks.get(event).push(callback);
    }

    getConnection() {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, conn) => {
                err ? reject(err) : resolve(conn);
            });
        });
    }

    createQuery(string) {
        return this.queryObj = new Query(string);
    }

    queryCallback(error, results, fields) {
        return new Promise((resolve, reject) => 
            error ? reject(error) : resolve({results, fields}));
    }

    query(sql) {
        const values = this.queryObj ? thsi.queryObj.getValues() : {sql};
        return this.getConnection()
            .then(conn => this.queryObj.isStream
                ? conn.query(values).stream()
                : conn.query(values, this.queryCallback))
    }
}