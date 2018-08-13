const axios = require('axios');

module.exports = class DrupalServer {
    
    constructor(url) {
        this.url = url;
        this.csrf;
    }

    init(callback) {
        return new Promise((resolve, reject) => {
            this.genCsrf()
                .then(() => resolve(this))
                .catch(() => reject(this));
        });
    }

    getHeaders(header) {
        const headers = { 'Content-Type': 'application/json' };
        for(let prop in header) {
            headers[prop] = header[prop];
        }
        if(this.csrf) headers["X-CSRF-Token"] = this.csrf;
        return headers;
    }

    request(path, data, header = null) {
        let headers = this.getHeaders(header);
        return axios({
            method: 'POST',
            url: this.getUrl(path),
            data,
            headers
        });
    }

    getUrl(path = '') {
        return this.url + path;
    }

    getCsrf() {
        return new Promise(resolve => {
            if(this.csrf) resolve(this.csrf);
            else return this.genCsrf();
        });
    }

    genCsrf() {
        return this.request('user/token')
            .then(r => {
                if(r.data && r.data.token) return this.csrf = r.data.token;
                else throw 'CSRF Token was not returned from: ' + this.getUrl();
            });
    }
 

    // If can register, returns sessionId, sessionName, uId ELSE returns Status Code
    register(name, mail, password) {
        return this.request('user/register', {name, mail, password})
            .then(r => {
                let cookieArray = r.headers['set-cookie'][0].split('; ');
                let sess = cookieArray[0].split('=');
                let sessId = sess[1];
                let sessName = sess[0];
                let id = r.data.uid;
                return {
                    id,
                    sessId,
                    sessName
                };
            })
            .catch(r => r.response.status);
    }


    // If Password is correct, returns sessionId, sessionName, uId and token, ELSE returns Status Code
    logIn(username, password) {
        return this.request('user/login', {username, password})
            .then(r => {
                this.csrf = r.data.token;
                console.log(r.status);
                if(r.data && r.data.user) return {
                    id: r.data.user.uid,
                    sessId: r.data.sessid,
                    sessName: r.data.session_name,
                };
                else throw 'Could not find user ID.';
            })
            .catch(r => r.response.status);
    }

    // IF LOGOUT SUCCESSFUL returns TRUE ELSE FALSE
    logOut(sessName, sessId) {
        return this.request('user/logout', null, {"Cookie": sessName + '=' + sessId})
            .then(r => r[0])
            .catch(r => false);
    }

    // If valid returns uId and SESSION ELSE FALSE
    verify(sessName, sessId) {
        return this.request('system/connect', null, {"Cookie": sessName + '=' + sessId})
            .then(r => {
                if(r.data && r.data.user) {
                    if(r.data.user.uid === 0) throw 'Invalid Session.';
                    else return {
                        id: r.data.user.uid,
                        sessId: r.data.sessid,
                        sessName: r.data.session_name,
                    };   
                }
            })
            .catch(e => false);
    }

}