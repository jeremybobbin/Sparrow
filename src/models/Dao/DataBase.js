const {createPool} = require('mysql');
const events = ['aquire', 'connection', 'enqueue', 'release'];
const Query = require('./Query');

module.exports = class DataBase {
    constructor(user, password, database) {
        this.callbacks = new Map(events.map(e => [e, []]));
        this.pool = createPool({user, password, database, insecureAuth: true });
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

    createQuery(string, ...args) {
        this.queryObj = new Query(string, ...args);
        return args
            ? this.query()
            : this.queryObj;
    }

    queryPromise(conn, values) {
        return new Promise((resolve, reject) => {
            conn.query(values, (err, results, fields) => {
                if(err) return reject(err);
                resolve({results, fields});
            })
        })
    }

    query(sql, args) {
        let connection;
        this.queryObj = new Query(sql, args);
        const values = this.queryObj ? this.queryObj.getValues() : {sql};
        return this.getConnection()
            .then(c => connection = c)
            .then(() => this.queryObj && this.queryObj.isStream
                ? connection.query(values).stream()
                : new Promise((resolve, reject) => {
                    connection.query(values, (err, results, fields) => 
                        err
                            ? reject(err)
                            : resolve({results, fields})
                    )})
            )
            .then(r => {
                connection.release();
                return r;
            });
    }
}