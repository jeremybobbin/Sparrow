const Dao = require('./Dao');
const DataBase = require('./DataBase');
const {database, user, password, socketPath} = require('../../config').mySql;


const db = new DataBase(user, password, database);

const init = [
    'CREATE TABLE IF NOT EXISTS formNames ( \
        `campaignId` varchar(255) NOT NULL PRIMARY KEY, \
        `first` varchar(255), \
        `last` varchar(255), \
        `email` varchar(255) \
    ); ',
    'CREATE TABLE IF NOT EXISTS formIds ( \
        `campaignId` varchar(255) NOT NULL PRIMARY KEY, \
        `first` varchar(255), \
        `last` varchar(255), \
        `email` varchar(255) \
    ); ',
    'CREATE TABLE IF NOT EXISTS campaigns ( \
        `id` INT NOT NULL AUTO_INCREMENT, \
        `userId` INT NOT NULL, \
        `name` VARCHAR(255) NOT NULL, \
        `url` VARCHAR(255) NOT NULL, \
        `isEnabled` BOOLEAN DEFAULT TRUE, \
        `tracking` BOOLEAN DEFAULT TRUE, \
        `message` VARCHAR(255), \
        `delay` TINYINT NOT NULL DEFAULT 3, \
        `effect` VARCHAR(255) DEFAULT "fade" , \
        `location` TINYINT NOT NULL DEFAULT 0, \
        `counters` BOOLEAN NOT NULL DEFAULT FALSE, \
        `initialWait` TINYINT DEFAULT 3, \
        PRIMARY KEY(id) \
    ); ',
    'CREATE TABLE IF NOT EXISTS leads ( \
        `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY, \
        `campaignId` int NOT NULL, \
        `ip` varchar(255) NOT NULL, \
        `first` varchar(255), \
        `last` varchar(255), \
        `email` varchar(255), \
        `city` varchar(255), \
        `region` varchar(255), \
        `country` varchar(255), \
        `time` DATETIME DEFAULT CURRENT_TIMESTAMP, \
        `soundId` INT NOT NULL \
    ); ',
    'CREATE TABLE IF NOT EXISTS sound ( \
        `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY, \
        `value` VARCHAR(255) \
    );'
];
const dao = new Dao(db);

dao.init(init);

module.exports = dao; 