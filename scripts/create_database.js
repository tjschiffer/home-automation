const mysql = require('mysql');
const dbconfig = require('../config/database');

async function create_database() {
  const connection = mysql.createConnection(dbconfig.connection);
  await new Promise(resolve => {
    connection.query('DROP DATABASE ' + dbconfig.connection.database + ' IF EXISTS', (err) => {
      if (err) {
        resolve(err);
      } else {
        resolve();
      }
    });
  });

  await new Promise(resolve => {
    connection.query('CREATE DATABASE ' + dbconfig.connection.database, (err) => {
      if (err) {
        resolve(err);
      } else {
        resolve();
      }
    });
  });

  await new Promise(resolve => {
    connection.query('CREATE TABLE `' + dbconfig.connection.database + '`.`' + dbconfig.users_table + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `username` VARCHAR(20) NOT NULL, \
    `password_hash` CHAR(95) NOT NULL, \
        PRIMARY KEY (`id`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC), \
    UNIQUE INDEX `username_UNIQUE` (`username` ASC))',
      (err) => {
        if (err) {
          resolve(err);
        } else {
          resolve();
        }
      });
  });

  await new Promise(resolve => {
    connection.query('INSERT INTO `' + dbconfig.connection.database + '`.`' + dbconfig.users_table + '` \
    (`username`, `password_hash`) \
    VALUES \
    (\'tj\', \'$argon2i$v=19$m=4096,t=3,p=1$sOr9QWi2qUsHG4nb0/13yQ$kRP8u3MHBRHzKtUmUIFXh01qZMVP+V1Nfdsts1xBWSM\'), \
    (\'api\', \'$argon2i$v=19$m=4096,t=3,p=1$gZv4zQqByDmPWwccHdanrA$IcN7WyV1TrkRPIeteKzK0cHNEUd6EDYC1MGEdwV+4lw\')',
      (err) => {
        if (err) {
          resolve(err);
        } else {
          resolve();
        }
      });
  });

  await new Promise(resolve => {
    connection.query('CREATE TABLE `' + dbconfig.connection.database + '`.`' + dbconfig.time_series_data_table + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `sensor_id` SMALLINT UNSIGNED NOT NULL, \
    `timestamp` TIMESTAMP NOT NULL, \
    `value` FLOAT NOT NULL, \
        PRIMARY KEY (`id`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC))',
      (err) => {
        if (err) {
          resolve(err);
        } else {
          resolve();
        }
      });
  });

  connection.end();
}

create_database().then(() => {
  console.log('Success!');
});
