module.exports = class Campaign {
    constructor(id, userId, name, url, isEnabled, tracking, message, delay, effect, location, counters, initialWait) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.url = url;
        this.isEnabled = isEnabled;
        this.tracking = tracking;
        this.message = message;
        this.delay = delay;
        this.effect = effect;
        this.location = location;
        this.counters = counters;
        this.initialWait = initialWait;
    }

    getValues() {
        const {id, userId, name, url, isEnabled, tracking, message, delay, effect, location, counters, initialWait} = this;
        return {id, userId, name, url, isEnabled, tracking, message, delay, effect, location, counters, initialWait};
    }

    set(k, v) {
        this[k] = v;
    }

    get(k) {
        return this[k];
    }

    getId() {
        return this.id;
    }

    getSetValues() {
        let values = this.getValues();
        let obj = {};
        Object.keys(values)
            .filter(k => this[k] !== null && this[k] !== undefined && k !== 'id')
            .forEach(k => obj[k] = this[k]);
        return obj;
    }

    //Should return something like UPDATE campaigns SET doo = ?, dahh = ?, 
    getUpdateQuery() {
        const obj = this.getSetValues();
        let values = [];
        let keys = Object.keys(obj)
            .map(k => {
                values.push(obj[k]);
                return k + ' = ?';
            })
            .join(', ');
        let string = `UPDATE campaigns SET ${keys} WHERE id = ${this.getId()};`;
        return {string, values};
    }

    //Should return somethign like INSERT INTO campaigns VALUES (id, userId, Name)
    getInsertQuery() {
        const obj = this.getSetValues();
        const keys = Object.keys(obj);
        const values = keys.map(k => obj[k]);
        const marks = keys.map(k => '?').join(', ');
        const string = `INSERT INTO campaigns (${keys}) VALUES (${marks});`
        return {string, values};
    }
}

// `id` INT NOT NULL AUTO_INCREMENT, userId INT NOT NULL, \
// `name` VARCHAR(512) NOT NULL, \
// `url` VARCHAR(512) NOT NULL, \
// `isEnabled` BOOLEAN DEFAULT TRUE, \
// `tracking` BOOLEAN DEFAULT TRUE, \
// `message` VARCHAR(512), \
// `delay` TINYINT NOT NULL DEFAULT 3, \
// `effect` VARCHAR(255) DEFAULT "fade" , \
// `location` VARCHAR(255) NOT NULL DEFAULT "bottom-left", \
// `counters` BOOLEAN NOT NULL DEFAULT FALSE, \
// `initialWait` TINYINT DEFAULT 3, \
// PRIMARY KEY(id) \