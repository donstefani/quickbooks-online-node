/* eslint-disable no-unused-vars */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
/* eslint-disable no-unused-expressions */

'use strict';

const moment = require('moment');
const util = require('util');
const AWS = require('aws-sdk');
const {
  updateBillsBillsSql,
  getBillsReportSql
} = require('../../models/farmBillsModel');
const createFarmBill = require('./createFarmBill');
const simpleEmailSend = require('../../utils/simpleEmailSend');

AWS.config.logger = console;

const sendError = async (account, v) => {
  const errorSubject = `QBO ERROR: Missing ${account} QBO Vendor ID: ${v.farm_name}`;
  const errorMessage = `This Farm does not have a ${account} QBO vendor ID: 
          ID: ${v.farm_id} Name: ${v.farm_name} 
          The farm bill:
          Farm Bill ID: ${v.id}
          PO ID: ${v.po_id}
          Ship Date: ${v.farm_ship_date}`;
  console.log('ERROR - No QBO ID', `ID: ${v.farm_id} Name: ${v.farm_name}`);
  await simpleEmailSend(errorSubject, errorMessage);
};

const buildBillsReport = async (fromDate, toDate, account) => {
  const results = await getBillsReportSql(fromDate, toDate, account);
  let body = {};
  let dueDate;
  let rawDate;
  let billDate;
  const invoiceArr = [];
  // console.log('RESULTS', results);

  if (results.length > 0) {
    const invoiceMap = new Map();
    for (const invoice of results) {
      if (invoiceMap.has(invoice.farm_invoice)) { // check for duplicates
        const dupeInvoice = invoiceMap.get(invoice.farm_invoice);
        dupeInvoice.total_bill += invoice.total_bill;
        `${dupeInvoice.po_id}, ${invoice.po_id}`;
        `${dupeInvoice.po_product_id}, ${invoice.po_product_id}`;
      } else {
        invoiceMap.set(invoice.farm_invoice, invoice);
      }
    }

    for (const [key, value] of invoiceMap) {
      invoiceArr.push(value);
    }
    // console.log('ARRAY', invoiceArr);

    const farmMap = new Map();
    for (const farm of invoiceArr) {
      console.log('FARM', farm);
      const qboVendorIdCol = (account === 'fiftyflowers') ? farm.qbo_ff_id : farm.qbo_flrfx_id;
      console.log('ACCOUNT COL', qboVendorIdCol);
      if (qboVendorIdCol) {
        if (farmMap.has(qboVendorIdCol)) {
          const dupeFarm = farmMap.get(qboVendorIdCol);
          dupeFarm.total_bill += farm.total_bill;
          `${dupeFarm.farm_invoice}, ${farm.farm_invoice}`;
        } else {
          farmMap.set(qboVendorIdCol, farm);
        }
      } else {
        await sendError(account, farm);
      }
    }
    for (const [k, v] of farmMap) {
      // console.log('===================', v.vendor_code);
      console.log('FARM BILL DATA', util.inspect(v, false, null, true));
      const qboVendorId = (account === 'fiftyflowers') ? v.qbo_ff_id : v.qbo_flrfx_id;

      billDate = moment(v.farm_ship_date).format('YYYY-MM-DD');
      rawDate = moment(new Date()).format('YYYY-MM-DD');
      dueDate = moment(rawDate).add(1, 'month').set('date', 15).format('YYYY-MM-DD');
      body = {
        Line: [
          {
            DetailType: 'AccountBasedExpenseLineDetail',
            Amount: v.total_bill,
            Id: '1',
            AccountBasedExpenseLineDetail: {
              AccountRef: {
                value: process.env.QB_FARM_BILLS_ACCOUNT
              }
            },
          },
        ],
        VendorRef: {
          value: qboVendorId
        },
        DueDate: dueDate,
        TxnDate: billDate,
        SalesTermRef: {
          value: process.env.QB_TERM_OF_SALE_ID
        }
      };

      /*
       * sends each farm bill to QBO
       * ***************************
       */
      await createFarmBill(body, account);
    }
  } else {
    console.log('EMPTY RESULTS');
  }
  return 'Hello World!';
};

const farmBillsService = async (fromDate, toDate, account) => {
  let report;
  const updated = await updateBillsBillsSql(fromDate, toDate, account);

  if (updated) {
    report = await buildBillsReport(fromDate, toDate, account);
  } else {
    report = false;
  }

  return report;
};

module.exports = farmBillsService;
