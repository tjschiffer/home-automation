'use strict';
const mysql = require('mysql');
const named = require('yesql').mysql;
const dbconfig = require('../config/database');

const connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);
const insertQuery = "INSERT INTO " + dbconfig.time_series_data_table + " (sensor_id, timestamp, value) values (:sensor_id, :timestamp, :value)";

module.exports = {
  insertData: (insertParameters, done) => {
    if (!insertParameters.sensor_id || !insertParameters.timestamp || !insertParameters.value) {
      return done('Missing required parameters');
    }
    
    connection.query(named(insertQuery)(insertParameters),function(err, rows) {
      if (err) {
        return done(err);
      }
      insertParameters.id = rows.insertId;
      return done(null, insertParameters);
    });
  }
};
