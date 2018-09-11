module.exports = class Leads {
    constructor(id, ip, first, last, campaignId, email, city, region, country, time) {
        this.id = id;
        this.ip = ip;
        this.firstname = first;
        this.lastname = last;
        this.email = email;
        this.city = city;
        this.region = region;
        this.country = country;
        this.time = time;
        this.campaignId = campaignId;
    }

    set(k, v) {
        this[k] = v;
        return this;
    }

    getIp () {
        return this.ip;
    }

    getValues() {
        return [
            this.campaignId,
            this.ip,
            this.firstname,
            this.lastname,
            this.email,
            this.city,
            this.region,
            this.country
        ];
    }

    static genMessage(first, last, city) {
        let name;
        if(first && last) {
            name = first + ' ' + last[0].toUpperCase() + '.';
        } else if (first) {
            name = first;
        } else {
            name = 'Someone';
        }
        if(city) {
            return name + ' from ' + city;
        }
        return name + ' from ' + ' somewhere';
    }
    
    static genTime(time) {

        if(!time) return 'Some time ago';
        const dif = divRound((new Date().getTime() - time), 1000) ;
        if (dif < 60) {
            return timeMsg(dif, 'second');
        }
        const min = divRound(dif, 60);
        if(min < 60) {
            return timeMsg(min, 'minute');
        }
        const hour = divRound(min, 60);
        if(hour < 24) {
            return timeMsg(hour, 'hour');
        }
        const day = divRound(hour, 24);
        return timeMsg(day, 'day')
    }
}

function timeMsg(count, unit) {
    return count + ' ' + unit + (count > 1 ? 's' : '') + ' ago';
}

function divRound(top, bot) {
    return Math.round(top / bot);
}
