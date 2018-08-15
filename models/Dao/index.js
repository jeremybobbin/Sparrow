const conf = require('../../config');
const Dao = require('./Dao.js');

const ms = conf.mySql;

module.exports = new Dao(ms.database, ms.user, ms.password, ms.socketPath);
