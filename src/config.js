require('dotenv').config();
let defaults = {
    'DB_NAME': 'sparrow',
    'DB_USER': 'root',
    'DB_PASSWORD': '',
    'PORT': 3001
};
const get = (prop) => defaults[prop] || process.env[prop];

const config = {};


config.ipstack = 'e33648ff142853941b239503f1e8996e';

config.mySql = {
    database: get('DB_NAME'),
    socketPath: get('DB_SOCKET_PATH'),
    user: get('DB_USER'),
    password: get('DB_PASSWORD'),
};

config.port = get('PORT');
config.saltRounds = get('SALT_ROUNDS');


module.exports = config;

