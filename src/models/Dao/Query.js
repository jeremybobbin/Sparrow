module.exports = class Query {
    constructor(sql, args) {
        this.sql = sql;
        this.values = args || [];
        this.timeout = 5000;
        this.isStream = false;
    }


    // Database.query will return a stream if this is called
    makeStream(highWaterMark) {
        this.isStream = true;
        return this;
    }

    setTimeout(timeout) {
        this.timeout = timeout;
        return this;
    }

    setValues(...args) {
        this.values = args;
        return this;
    }

    getValues() {
        const {sql, values, timeout} = this;
        return {sql, values, timeout};
    }
}

// ?? = KEY
// ? = VALUE