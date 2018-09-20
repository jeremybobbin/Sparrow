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
            throw 'Need both page size, page number and need to be logged in.';
        }
        
        const possible = [
            'first', 'last', 'ip', 'email', 'city', 'region', 'country', 'time'
        ];

        const {pageSize, page} = params;

        if(pageSize > 50 || pageSize < 1) {
            throw 'Page size must be less than 50 and greater than 1';
        }

        // Column by which to sort mapped to isDescending
        const sortArray = [];

        for(let key in params) {
            if(possible.includes(key)) {
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
        const join = `INNER JOIN campaigns ON leads.campaignId = campaigns.id`;
        const limit = `LIMIT ${pageSize} OFFSET ${pageSize * page}`;


        const query = `SELECT ${possible.join(', ')} \
            AS pages FROM leads \
            ${join} ${where} ${order} ${limit};`

        console.log(query);
        
        const rows = dao.query(query);
        const pages = dao.query(`SELECT CEILING(COUNT(*) / ${pageSize}) AS pages FROM leads ${join} ${where};`);
            
        return Promise.all([rows, pages])
            .then(([rowQuery, pageQuery]) => ({
                rows: rowQuery.results,
                pages: pageQuery.results[0].pages
            }));

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