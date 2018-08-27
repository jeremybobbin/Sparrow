module.exports = class Leads {
    constructor(id, ip, first, last, urlId, email, city, region, country, time) {
        this.id = id;
        this.ip = ip;
        this.first = first;
        this.last = last;
        this.email = email;
        this.city = city;
        this.region = region;
        this.country = country;
        this.time = time;
    }

    set(k, v) {
        this[k] = v;
    }

    getValues() {
        return Object.keys(this)
            .filter(k => typeof k !== 'function')
            .map(k => this[k]);
    }
}