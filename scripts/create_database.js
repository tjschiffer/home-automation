const mysql = require('mysql');
const dbconfig = require('../config/database');

const connection = mysql.createConnection(dbconfig.connection);

connection.query('DROP DATABASE ' + dbconfig.connection.database + ' IF EXISTS');
connection.query('CREATE DATABASE ' + dbconfig.connection.database);

connection.query('CREATE TABLE `' + dbconfig.connection.database + '`.`' + dbconfig.users_table + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `username` VARCHAR(20) NOT NULL, \
    `password_hash` CHAR(95) NOT NULL, \
        PRIMARY KEY (`id`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC), \
    UNIQUE INDEX `username_UNIQUE` (`username` ASC) \
)');

connection.query('INSERT INTO `' + dbconfig.connection.database + '`.`' + dbconfig.users_table + '` \
  (`username`, `password_hash`) \
  VALUES \
  (\'api\', \'$argon2i$v=19$m=4096,t=3,p=1$gZv4zQqByDmPWwccHdanrA$IcN7WyV1TrkRPIeteKzK0cHNEUd6EDYC1MGEdwV+4lw\')');


connection.query('CREATE TABLE `' + dbconfig.connection.database + '`.`' + dbconfig.time_series_data_table + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `sensor_id` SMALLINT UNSIGNED NOT NULL, \
    `timestamp` TIMESTAMP NOT NULL, \
    `value` FLOAT NOT NULL, \
        PRIMARY KEY (`id`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC) \
)');

console.log('Finished');

connection.end();
