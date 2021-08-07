'use strict';

const AWS = require('aws-sdk');
require('dotenv').config();

const farmBillsService = require('./services/farmBills/farmBillsServices');

AWS.config.update({ region: process.env.REGION });
AWS.config.logger = console;

exports.handler = async (event, context) => {
  // DEVELOPMENT QUERY TIMES
  const fromDate = '2021-01-25 00:00:00';
  const toDate = '2021-01-25 23:59:59';

  // PRODUCTION QUERY TIMES
  // const fromDate = moment().subtract(1, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss');
  // const toDate = moment().subtract(1, 'days').endOf('day').format('YYYY-MM-DD HH:mm:ss');

  await farmBillsService(fromDate, toDate, 'fiftyflowers');
  await farmBillsService(fromDate, toDate, 'flowerfix');
  context.done();
};
