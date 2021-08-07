/* eslint-disable operator-linebreak */

'use strict';

const fs = require('fs');
const path = require('path');
const moment = require('moment');
const mysql = require('./index');

const fiftyflowersSqlFile = path.join(
  __dirname,
  'sql/fiftyflowersDailyOrders.sql',
);
const flowerfixSqlFile = path.join(
  __dirname,
  'sql/flowerfixDailyOrders.sql',
);

const saveDailyTotals = async (data, batchId) => {
  // console.log('DATA SAVE TOTALS', data);

  try {
    const netTotal = data[0].adjusted_order_total;
    const taxesTotal = data[0].order_tax;
    const rawTotal = netTotal - taxesTotal;
    const afterTaxes = rawTotal.toFixed(2);
    const batchDate = moment().format('YYYY-MM-DD HH:mm:ss');

    const queryData = {
      batch_id: batchId,
      batch_date: batchDate,
      account: data.account,
      sales_amount: afterTaxes,
      tax_amount: taxesTotal,
    };

    const results = await mysql
      .query('INSERT INTO qb_daily_batch_totals SET ?', queryData)
      .catch((err) => {
        throw new Error('INSERT into daily totals failed', err);
      });
    await mysql.end();
    // console.log('RESULTS', results[3][0]);
    return results.insertId;
  } catch (error) {
    console.log('SAVE DAILY TOTALS SQL FAIL', error);
    throw new Error('SAVE daily totals sql failed', error);
  }
};

const createBatchOrderRecordSql = async (data) => {
  const batchDate = moment().format('YYYY-MM-DD HH:mm:ss');
  const queryData = {
    batch_id: data.batchId,
    order_id: data.orderId,
    account: data.account,
    created_on: batchDate,
  };

  try {
    const results = await mysql
      .query('INSERT INTO qb_batch_orders SET ?', queryData)
      .catch((err) => {
        throw new Error('INSERT into daily batch failed', err);
      });
    await mysql.end();
    // console.log('RESULTS', results[3][0]);
    return results.insertId;
  } catch (error) {
    console.log('SAVE DAILY BATCH SQL FAIL', error);
    throw new Error('SAVE daily batch sql failed', error);
  }
};

const updatePoStatus = async (uniqueId) => {
  try {
    await mysql.query({
      sql: `UPDATE cart_purchase_orders cpo
      SET invoice_status = 'Invoiced'
      WHERE cpo.parent_order_id IN (
        SELECT qbo.order_id FROM qb_batch_orders qbo
        WHERE qbo.batch_id = ?
      )`,
      timeout: 1000000,
      values: [uniqueId],
    });
    await mysql.end();
    return true;
  } catch (error) {
    console.log('UPDATE PO STATUS FAIL', error);
    throw new Error('Update PO Status sql failed', error);
  }
};

const getDailyOrdersForBatch = async (
  account,
  startDate,
  endDate,
) => {
  const sqlFile =
    account === 'fiftyflowers'
      ? fiftyflowersSqlFile
      : flowerfixSqlFile;
  try {
    const sqlStmt = fs.readFileSync(sqlFile);
    const results = await mysql.query({
      sql: sqlStmt,
      timeout: 1000000,
      values: [
        startDate,
        endDate,
        startDate,
        endDate,
        startDate,
        endDate,
        startDate,
        endDate,
      ],
    });
    console.log('DAILY ORDERS RESULTS =======', results[2]);
    await mysql.end();
    return results[2] || false;
  } catch (error) {
    console.log('GET DAILY ORDERS SQL FAIL', error);
    throw new Error('Get daily orders sql failed', error);
  }
};

const dailyTotalsModel = async (uniqueId) => {
  try {
    const results = await mysql.query({
      sql: `SELECT
      SUM(co.order_total) as 'order_total', 
      SUM(co.sub_total)-SUM(co.total_discount) as 'adjusted_order_total', 
      if( co.total_discount = NULL, 0, SUM(co.total_discount) ) as 'order_discounts',
      if( co.tax_cost = NULL, 0, SUM(co.tax_cost) ) as 'order_tax'
      FROM cart_orders co, qb_batch_orders qbo
      WHERE qbo.batch_id = ?
      AND co.order_id = qbo.order_id`,
      timeout: 1000000,
      values: [uniqueId],
    });
    console.log('DAILY RESULTS =======', results);
    await mysql.end();
    return results || false;
  } catch (error) {
    console.log('GET DAILY TOTALS SQL FAIL', error);
    throw new Error('Get daily totals sql failed', error);
  }
};

module.exports = {
  dailyTotalsModel,
  saveDailyTotals,
  updatePoStatus,
  createBatchOrderRecordSql,
  getDailyOrdersForBatch,
};
