const axios = require('axios');

class Drupal {


    constructor(url) {
        this.url = url;
        this.csrf;
    }

    getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if(this.csrf) headers['X-CSRF-Token'] = this.csrf;
        return headers;
    }

    request(path, data) {
        return axios({
            method: 'post', //you can set what request you want to be
            url: this.getUrl(path),
            data,
            headers: this.getHeaders()
        });
    }

    getUrl(path) {
        return this.url + path;
    }

    getCsrf() {
        return new Promise(resolve, reject => {
            if(this.token) resolve(this.token);
            else return this.genCsrf();
        });
    }

    genCsrf() {
        return this.request('user/token')
            .then(r => r.data.token);
    }
}


let Drupal = new Drupal('https://www.freshpeeps.com/drupal/api/')

module.exports = drupal;