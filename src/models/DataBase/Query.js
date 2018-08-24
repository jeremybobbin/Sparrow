module.exports = class Query {
    constructor(callback, string) {
        this.string = string;
        this.values;
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
        const {string, values, timeout} = this;
        return {string, values, timeout};
    }
}

// ?? = KEY
// ? = VALUE