'use strict';

const AWS = require('aws-sdk');
const util = require('util');
const moment = require('moment');

const { oauthService, getApiUrl } = require('../auth/oauthService');

AWS.config.update({ region: process.env.REGION });
AWS.config.logger = console;

/**
 * makePostApiCall
 * 2021-01-22 Don Stefani
 * make an POST API call to QBO
 * @param {object} body
 * @param {string} type // QBO namespace
 */
const makePostApiCall = async (body, type, account) => {
  let oauthClient;
  try {
    oauthClient = await oauthService(account);
  } catch (error) {
    console.log('FAILED TO GET OAUTH CLIENT', error);
  }

  // console.log('OAUTH CLIENT :::::::::::::::::::::::::::::::::::::');
  // console.log(util.inspect(oauthClient, { showHidden: true, depth: null, colors: true }));

  const url = await getApiUrl();
  console.log(util.inspect(body, { showHidden: true, depth: null }));
  let companyId = process.env.QB_COMPANY_ID;
  if (account === 'flowerfix') {
    companyId = process.env.QB_FLRFX_COMPANY_ID;
  }
  console.log('COMPANY ID', companyId);

  try {
    const response = await oauthClient.makeApiCall({
      url: `${url}v3/company/${companyId}/${type}?minorversion=55`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const respObj = JSON.parse(JSON.stringify(response));
    console.log(util.inspect(respObj, false, null, true));
    // console.log(util.inspect(response, { showHidden: true, depth: null }));
    return respObj;
  } catch (error) {
    console.log(
      'QB API CALL ERROR:::::::::::::::::::::::::::::::::::::::::',
    );
    console.log(
      util.inspect(error, {
        showHidden: true,
        depth: null,
        colors: true,
      }),
    );
    throw new Error('QB API CALL FAILED', JSON.stringify(error));
  }
};

/**
 * dailySalesService
 * 2021-01-11 Don Stefani
 * Makes two API calls to QBO
 * 1: to transfer total amount queried
 * 2: to transfer total taxes queried
 */
const dailySalesService = async (
  totalsObj,
  account,
  fromDate,
  toDate,
) => {
  const { data, uniId } = totalsObj;

  const from = moment(fromDate).format('YYYY-MM-DD');
  const to = moment(toDate).format('YYYY-MM-DD');

  if (data.adjusted_order_total) {
    let body;
    let type;
    console.log('DATA ADJ TOTAL', data.adjusted_order_total);
    console.log('DATA TAX', data.order_tax);
    const netTotal = data.adjusted_order_total;
    const taxesTotal = data.order_tax;
    const rawTotal = netTotal - taxesTotal;
    const afterTaxes = rawTotal.toFixed(2);
    console.log('AFTER TAXES', afterTaxes);
    let salesAccountName =
      process.env.QB_DAILY_NET_SALES_ACCOUNT_NAME;
    let salesAccountId = process.env.QB_DAILY_NET_SALES_ACCOUNT;
    let taxAccountName = process.env.QB_TAX_TO_ACC_NAME;
    let taxAccountId = process.env.QB_DAILY_TAX_ACCOUNT;
    let deferredAccountName = process.env.QB_DEFFERED_FUNDS_ACC_NAME;
    let deferredAccountId = process.env.QB_DEFFERED_FUNDS_ACC;

    const description = `Daily Sales ${from} thru ${to}`;

    if (account === 'flowerfix') {
      salesAccountName = process.env.QB_FLRFX_NET_SALES_ACCOUNT_NAME;
      salesAccountId = process.env.QB_FLRFX_NET_SALES_ACCOUNT;
      taxAccountName = process.env.QB_FLRFX_TAX_TO_ACC_NAME;
      taxAccountId = process.env.QB_FLRFX_DAILY_TAX_ACCOUNT;
      deferredAccountName =
        process.env.QB_FLRFX_DEFFERED_FUNDS_ACC_NAME;
      deferredAccountId = process.env.QB_FLRFX_DEFFERED_FUNDS_ACC;
    }

    /**
     * Daily Sales Minus Taxes
     */

    body = {
      TxnDate: `${from}`,
      Line: [
        {
          JournalEntryLineDetail: {
            PostingType: 'Debit',
            AccountRef: {
              name: deferredAccountName,
              value: deferredAccountId,
            },
          },
          DetailType: 'JournalEntryLineDetail',
          Amount: afterTaxes,
          Id: '0',
          Description: `${description}, Batch: ${uniId}`,
        },
        {
          JournalEntryLineDetail: {
            PostingType: 'Credit',
            AccountRef: {
              name: salesAccountName,
              value: salesAccountId,
            },
          },
          DetailType: 'JournalEntryLineDetail',
          Amount: afterTaxes,
          Description: `${description}, Batch: ${uniId}`,
        },
      ],
    };
    type = 'journalentry';
    await makePostApiCall(body, type, account);
    console.log(
      'SUB TOTAL DONE ------------------------------------------------------------',
    );

    /**
     * Daily Taxes > Accounts Payable
     */

    body = {
      TxnDate: `${from}`,
      Line: [
        {
          JournalEntryLineDetail: {
            PostingType: 'Debit',
            AccountRef: {
              name: deferredAccountName,
              value: deferredAccountId,
            },
          },
          DetailType: 'JournalEntryLineDetail',
          Amount: taxesTotal,
          Id: '0',
          Description: `${description}, Batch: ${uniId}`,
        },
        {
          JournalEntryLineDetail: {
            PostingType: 'Credit',
            AccountRef: {
              name: taxAccountName,
              value: taxAccountId,
            },
          },
          DetailType: 'JournalEntryLineDetail',
          Amount: taxesTotal,
          Description: `${description}, Batch: ${uniId}`,
        },
      ],
    };

    type = 'journalentry';
    await makePostApiCall(body, type, account);
    console.log(
      'TAXES DONE ------------------------------------------------------------',
    );
    return true;
  }
  console.log('NOTHING TO SYNC');
  return false;
};
module.exports = dailySalesService;
