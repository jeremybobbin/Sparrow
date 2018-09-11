const mysql = require('mysql');
const {database, user, password, socketPath} = require('../../config').mySql;

const Connection = (database, user, password, socketPath) =>
    mysql.createConnection({database,socketPath,user,password});

const connection = Connection(database, user, password, socketPath);
module.exports = connection;

