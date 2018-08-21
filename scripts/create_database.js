const mysql = require('mysql');
const dbconfig = require('../config/database');

const createDatabase = async() => {
  const connectionConfig = Object.assign({}, dbconfig.connection);
  // The database cannot be defined, since this script creates that database
  delete connectionConfig['database'];
  const connection = mysql.createConnection(connectionConfig);

  const queries = [
    'CREATE DATABASE IF NOT EXISTS `' + dbconfig.connection.database + '`',

    'CREATE TABLE `' + dbconfig.connection.database + '`.`' + dbconfig.users_table + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `username` VARCHAR(20) NOT NULL, \
    `password_hash` CHAR(95) NOT NULL, \
        PRIMARY KEY (`id`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC), \
    UNIQUE INDEX `username_UNIQUE` (`username` ASC))',

    'INSERT INTO `' + dbconfig.connection.database + '`.`' + dbconfig.users_table + '` \
    (`id`, `username`, `password_hash`) \
    VALUES \
    (1, \'tj\', \'$argon2i$v=19$m=4096,t=3,p=1$sOr9QWi2qUsHG4nb0/13yQ$kRP8u3MHBRHzKtUmUIFXh01qZMVP+V1Nfdsts1xBWSM\'), \
    (2, \'api\', \'$argon2i$v=19$m=4096,t=3,p=1$gZv4zQqByDmPWwccHdanrA$IcN7WyV1TrkRPIeteKzK0cHNEUd6EDYC1MGEdwV+4lw\')',

    'CREATE TABLE `' + dbconfig.connection.database + '`.`' + dbconfig.time_series_data_table + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `sensor_id` SMALLINT UNSIGNED NOT NULL, \
    `timestamp` TIMESTAMP NOT NULL, \
    `value` FLOAT NOT NULL, \
        PRIMARY KEY (`id`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC))',

    'CREATE TABLE `' + dbconfig.connection.database + '`.`' + dbconfig.sensors_table + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `location` VARCHAR(30) NOT NULL, \
    `measurement` VARCHAR(30) NOT NULL, \
    `units` VARCHAR(20), \
        PRIMARY KEY (`id`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC))',

    'INSERT INTO `' + dbconfig.connection.database + '`.`' + dbconfig.sensors_table + '` \
    (`id`, `location`, `measurement`, `units`) \
    VALUES \
    (1, \'Living Room\', \'Temperature\', \'°C\'), \
    (2, \'Living Room\', \'Humidity\', \'%\')'
  ];

  // Drop the database if the argument "--drop" is present
  if (process.argv.slice(2).indexOf('--drop') > -1) {
    queries.unshift('DROP DATABASE IF EXISTS `' + dbconfig.connection.database + '`' + '\n');
  }

  for (const query of queries) {
    console.log('Executing statement: ' + query);
    const executedQuery = await new Promise(resolve => {
      connection.query(query, err => {
        if (err) {
          resolve(err);
        } else {
          resolve('Success!');
        }
      });
    });
    console.log('Result: ' + executedQuery+ '\n');
  }

  connection.end();
  return 'Complete.';
};

createDatabase().then((result) => {
  console.log(result);
});
