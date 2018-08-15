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
        if(this.csrf) headers["X-CSRF-Token"] = this.csrf;
        for(let prop in header) {
            headers[prop] = header[prop];
        }
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
    register(name, mail, pass) {
        return this.request('user/register', {name, mail, pass})
            .then(r => {
                let cookieArray = r.headers['set-cookie'][0].split('; ');
                let session = cookieArray[0];
                return {session};
            })
            .catch(r => console.log(r.response.data.form_errors));
    }


    // If Password is correct, returns sessionId, sessionName, uId and token, ELSE returns Status Code
    logIn(username, password) {
        return this.request('user/login', {username, password})
            .then(r => {
                this.csrf = r.data.token;
                if(r.data && r.data.user) return {
                    token: r.data.token,
                    session: r.data.session_name + '=' + r.data.sessid,
                    email: r.data.user.mail,
                };
                else throw 'Could not find user ID.';
            })
            .catch(r => ({message: r.response.data[0]}));
    }

    // IF LOGOUT SUCCESSFUL returns TRUE ELSE FALSE
    logOut(session) {
        return this.request('user/logout', null, {"Cookie": session})
            .then(r => r[0])
            .catch(r => false);
    }

    // If valid returns uId and SESSION ELSE FALSE
    getUserInfo(session, token) {
        const headers = {"Cookie": session, "X-CSRF-Token": token};
        return this.request('system/connect', null, headers)
            .then(r => {
                if(r.data && r.data.user) {
                    if(r.data.user.uid === 0) throw 'Invalid Session.';
                    else return {
                        username: r.data.user.name,
                        email: r.data.user.mail,
                    };   
                }
            })
            .catch(e => false);
    }

    // Takes Session, if valid, returns uID ELSE FALSE.
    verify(session, token) {
        console.log('YOlo from here:  ' + token);
        const headers = {"Cookie": session, "X-CSRF-Token": token};
        return this.request('system/connect', null, headers)
            .then(r => {
                console.log(r.data);
                if(r.data && r.data.user) {
                    if(r.data.user.uid === 0) throw 'Invalid Session.';
                    else return r.data.user.uid;   
                }
            })
            .catch(e => false);
    }

}