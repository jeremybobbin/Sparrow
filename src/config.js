require('dotenv').config();

const get = (prop) => process.env[prop];

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


// PassengerBaseURI    /
// PassengerAppRoot    /home/freshpeeps/test/sparrow

// PassengerAppType    node
// PassengerStartupFile    app.js

// )#{s[M_dRIp?

// RewriteRule "!^/?drupal" - [L,NC]

// "^/((login|dashboard|register|leads)(/.*)?)?$"