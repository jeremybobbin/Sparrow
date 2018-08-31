require('dotenv').config();

const get = (prop) => process.env[prop];

const config = {};


config.ipstack = get('IPSTACK_API_KEY');

config.mySql = {
    database: get('DB_NAME'),
    socketPath: get('DB_SOCKET_PATH'),
    user: get('DB_USER'),
    password: get('DB_PASSWORD'),
};

config.port = get('PORT');
config.saltRounds = get('SALT_ROUNDS');


module.exports = config;

