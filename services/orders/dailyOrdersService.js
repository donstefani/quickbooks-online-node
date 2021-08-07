/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

'use strict';

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const {
  createBatchOrderRecordSql,
  getDailyOrdersForBatch,
  dailyTotalsModel,
  saveDailyTotals,
  updatePoStatus,
} = require('../../models/dailyTotalsModel');

AWS.config.update({ region: process.env.REGION });
AWS.config.logger = console;

const buildDailyOrdersAndTotals = async (
  account,
  startDate,
  endDate,
) => {
  // get the batch orders that meet status
  const dataArray = await getDailyOrdersForBatch(
    account,
    startDate,
    endDate,
  );
  console.log('FOR BATCH DATA', dataArray);
  const uniId = uuidv4();
  let totals;
  let savedId;

  if (dataArray.length < 1) return false;

  try {
    for (const order of dataArray) {
      const sendData = {
        batchId: uniId,
        orderId: order.order_id,
        account,
      };
      // write the order data to qb_batch_orders
      await createBatchOrderRecordSql(sendData);
    }
  } catch (error) {
    console.log('INSERT ORDER RECORDS FAILED', error);
    throw new Error('INSERT DAILY ORDERS FAILED', error);
  }

  try {
    // get the total sales and taxes from qb_batch_orders
    totals = await dailyTotalsModel(uniId);
  } catch (error) {
    console.log('GET ORDER TOTALS FAILED', error);
    throw new Error('GET DAILY TOTALS FAILED', error);
  }

  try {
    // save totals to qb_daily_batch_totals
    totals.account = account;
    savedId = await saveDailyTotals(totals, uniId);
  } catch (error) {
    console.log('SAVE ORDER TOTALS FAILED', error);
    throw new Error('SAVE DAILY TOTALS FAILED', error);
  }

  if (savedId) {
    try {
      await updatePoStatus(uniId);
      const transferData = { data: totals[0], uniId };
      return transferData;
    } catch (error) {
      console.log('UPDATE POS FAILED', error);
      throw new Error('UPDATE POS FAILED', error);
    }
  }
  return false;
};

module.exports = buildDailyOrdersAndTotals;
