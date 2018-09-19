const metaphone = require('metaphone');
const axios = require('axios');

const config = require('../config');
const Lead = require('./Lead');
const Campaigns = require('./Campaigns');
const dao = require('./Dao');

//     first: 'Jer',
//     last: 'Top',
//     ip: '6',
//     email: 'jerbob@gmail.cock',
//     city: 'Orlgnado',
//     region: 'Canda',
//     country: 'Candiadia', 
//     time: '6'

module.exports = class Leads {
    // returns {Pages: int, Leads: array}
    static get(params, userId) {
        if(!params.pageSize || !params.page || !userId) {
            throw 'Need both page size and page number';
        }
        
        const possible = [
            'first', 'last', 'ip', 'email', 'city', 'region', 'country', 'time'
        ];

        const {pageSize, page} = params;

        // Column by which to sort mapped to isDescending
        const sortArray = [];

        for(let key in params) {
            if(possible.includes(key)) {
                console.log(key, params[key]);
                sortArray.push(
                    key + (params[key] === 'desc' ? ' DESC' : ' ASC')
                );
            }
        }

        const whereArray = [
            `userId = ${userId}`
        ]
        if(params.campaignId) {
            whereArray.push(`campaignId = ${params.campaignId}`);
        }

        const order = sortArray.length ? 
            'ORDER BY ' + sortArray.join(', ')
            :
            '';
        
        const where = `WHERE ${whereArray.join(' AND ')}`; 

        const limit = `LIMIT ${pageSize} OFFSET ${pageSize * page}`;

        const query = `SELECT ${possible.join(', ')} FROM leads \
            ${where} ${order} ${limit};`

        console.log(query);
        return dao.query(query);


    }

    static toLead(obj) {
        const lead = new Lead();
        Object.keys(obj).forEach(k => lead.set(k, obj[k]));
        return lead;
    }

    //Takes a URL and random number and returns random lead message.
    static getOneFormatted(url, rand) {
        const sql = `SELECT first, last, city, time, message FROM leads AS l \
            JOIN campaigns AS c ON l.campaignId = c.id \
            WHERE c.url = ? ORDER BY time DESC LIMIT 20;`;
        return dao.query(sql, [url])
            .then(({results}) => results[Math.floor(results.length * rand)])
            .then(({first, last, city, time, message}) => {
                const leadString = Lead.genMessage(first, last, city);
                time = Lead.genTime(time);
                return {message, time, leadString};
            });
    }

    static post(lead, url) {
        let sql = `INSERT INTO leads (campaignId, ip, first, last, email, city, region, country) VALUES \
            (?, ?, ?, ?, ?, ?, ?, ?)`;
        return axios.get('http://api.ipstack.com/' + lead.getIp() + '?access_key=' + config.ipstack)
            .then(({data}) => {
                const {region_name, country_name, city} = data;
    
                lead.set('city', city);
                lead.set('region', region_name);
                lead.set('country', country_name);
            })
            .then(() => Campaigns.getIdByUrl(url))
            .then(id => lead.set('campaignId', id))
            .then(() => dao.query(sql, lead.getValues()))
            .then(({results}) => results);
    }

    static delete(ids) {
        if(!Array.isArray(ids)) ids = [ids];
        let sql = `DELETE FROM leads WHERE id IN (${ids.map(id => '?').join(', ')})`;
        return dao.query(sql, ids)
            .then(({results}) => results);
    }

    static count(url) {
        let sql = `SELECT COUNT(l.id) AS leads FROM leads AS l \
                JOIN campaigns AS c ON l.campaignId = c.id \
                WHERE c.url = ?;`;
        return dao.query(sql, url)
            .then(({results}) => results[0].leads);
    }

    static find(string) {
        const intSound = [
            'zero ', ' one ', ' two ', ' three ', ' four ',
            ' five ', ' six ', ' seven ', ' eight ', ' nine'
        ];

        string.replace(/[0-9.]/g, n => n === '.' ? 'dot' : intSound[parseInt(n)]);
            let sql = `SELECT l.id AS id, ip, first, last, email, city, region, country, time \
                    FROM leads AS l JOIN sound AS s ON l.soundId = s.id \
                    WHERE s.value LIKE '%?%'`;
            dao.query(sql, [string]);
    }
}




// id="leadid_tcpa_disclosure"

// <input id="leadid_token" name="universal_leadid" type="hidden" style="display: none;" value=""/>

// signup
// cm