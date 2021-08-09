const AWS = require('aws-sdk');

const env = process.env.NODE_ENV || 'development';
// const env = 'production';
const dbConf = require('../config/config.json')[env];

AWS.config.logger = console;
// eslint-disable-next-line import/order
const mysql = require('serverless-mysql')({
  backoff: 'decorrelated',
  base: 5,
  cap: 200,
  port: 3306,
  config: {
    host: dbConf.host,
    database: dbConf.database,
    user: dbConf.user,
    password: dbConf.password,
    multipleStatements: true,
  },
  onError: (e) => {
    console.log('DB ERROR ', e.code);
  },
  onConnectError: (e) => {
    console.log('Connect Error', e.code);
  },
});

module.exports = mysql;
