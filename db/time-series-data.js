'use strict';
const mysql = require('mysql');
const named = require('yesql').mysql;
const dbconfig = require('../config/database');

const connection = mysql.createConnection(dbconfig.connection);
const insertQuery = "INSERT INTO " + dbconfig.time_series_data_table + " (sensor_id, timestamp, value) values (:sensor_id, :timestamp, :value)";

module.exports = {
  insertData: (insertRows, done) => {
    // Use async/await to insert all rows since yesql does not have batch insert
    // see: https://github.com/krisajenkins/yesql/pull/135
    // This runs sequential; not a performance concern at the moment, refactor for performance if necessary
    insertRows.reduce(async(previousPromise, insertParameters, index) => {
      const insertedRows = await previousPromise;

      if(!insertParameters.sensor_id || !insertParameters.timestamp || !insertParameters.value) {
        insertedRows.push(`Missing required parameters in row ${index}: ${JSON.stringify(insertParameters)}`);
        return insertedRows;
      }
      const insertedRow = await new Promise(resolve => {
        connection.query(named(insertQuery)(insertParameters), (err, result) => {
          if (err) {
            resolve(err);
          } else {
            resolve(Object.assign({}, insertParameters, {id: result.insertId}));
          }
        });
      });
      insertedRows.push(insertedRow);
      return insertedRows;
    }, Promise.resolve([])).then(insertedRows => {
      done(null, insertedRows);
    });
  }
};
