/* eslint-disable array-callback-return */

'use strict';

const moment = require('moment');
const AWS = require('aws-sdk');
require('dotenv').config();
const dailySalesService = require('./services/sales/dailySalesService');
const buildDailyOrdersAndTotals = require('./services/orders/dailyOrdersService');

AWS.config.update({ region: process.env.REGION });
AWS.config.logger = console;

const dailySales = async (toDate, fromDate) => {
  let totals = {};
  // Run the sync for FiftyFlowers ***********************
  totals = await buildDailyOrdersAndTotals(
    'fiftyflowers',
    fromDate,
    toDate,
  );
  console.log('FIFTYFLOWERS TOTALS =============', totals);
  if (totals) {
    await dailySalesService(totals, 'fiftyflowers', fromDate, toDate);
  }

  // Run the sync for FlowerFix ***************************
  totals = await buildDailyOrdersAndTotals(
    'flowerfix',
    fromDate,
    toDate,
  );
  console.log('FLOWERFIX TOTALS =============', totals);
  if (totals) {
    await dailySalesService(totals, 'flowerfix', fromDate, toDate);
  }
};

exports.handler = async (event, context) => {
  console.log('ENV:', process.env.NODE_ENV);
  // DEVELOPMENT QUERY TIMES
  // const fromDate = '2020-02-01 00:00:00';
  // const toDate = '2020-02-10 23:59:59';

  /*
    PRODUCTION QUERY TIMES *****
    The following code takes the dates within a 30 days range
    and separates them into an array by month, then it finds
    the date furthest in the past and the date furthest in the future
    within that month and gives us our start and end dates.
    It runs the sync for each month so that totals are registered
    per month in QBO.
  */

  const amtDays = 30;
  const month = moment().month();
  const monthArray = [month];
  const datesArray = [];
  const syncDates = [];

  for (let i = 0; i < amtDays; i += 1) {
    const thisDay = moment().subtract(i, 'days');
    const formatDate = moment(thisDay);
    datesArray.push(formatDate);
    if (moment(thisDay).month() !== month) {
      if (!monthArray.includes(moment(thisDay).month())) {
        const thisMonth = moment(thisDay).month();
        monthArray.push(thisMonth);
      }
    }
  }

  monthArray.map(async (m) => {
    syncDates.length = 0;
    datesArray.map((date) => {
      if (m === moment(date).month()) {
        // console.log(date);
        const thisDate = moment(date);
        syncDates.push(thisDate);
      }
    });
    const fromDate = new Date(Math.min.apply(null, syncDates));
    const toDate = new Date(Math.max.apply(null, syncDates));
    console.log('FROM:', moment(fromDate).format('YYYY-MM-DD'));
    console.log('TO:', moment(toDate).format('YYYY-MM-DD'));
    // run the sync
    await dailySales(toDate, fromDate);
  });

  context.done();
};
