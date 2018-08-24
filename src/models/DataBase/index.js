const DataBase = require('./DataBase');
const {database, user, password, socketPath} = require('../../config').mySql;
console.log('DataBase: ' + database);
console.log('User: ' + user);
console.log('Password: ' + password);

const db = new DataBase('localhost', user, password, database);

module.exports = db;