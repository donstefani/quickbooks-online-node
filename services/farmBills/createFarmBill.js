'use strict';

const util = require('util');
const AWS = require('aws-sdk');
const { oauthService, getApiUrl } = require('../auth/oauthService');

AWS.config.update({ region: process.env.REGION });
AWS.config.logger = console;

const createFarmBill = async (body, account) => {
  const url = await getApiUrl();
  let companyId = process.env.QB_COMPANY_ID;
  if (account === 'flowerfix') {
    companyId = process.env.QB_FLRFX_COMPANY_ID;
  }

  console.log('BODY', util.inspect(body, false, null, true));

  const oauthClient = await oauthService(account);

  try {
    const response = await oauthClient
      .makeApiCall({
        url: `${url}v3/company/${companyId}/bill?minorversion=55`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
      });
    console.log(util.inspect(response, false, null, true));
    const respObj = JSON.parse(JSON.stringify(response));
    console.log('RESPONSE', respObj.response.status, respObj.json.Bill.DocNumber, respObj.json.Bill.TxnDate);
    // console.log(util.inspect(respObj.json, false, null, true));
  } catch (error) {
    console.log('CREATE FARM BILL ERROR:: ========================================');
    console.log(util.inspect(error, false, null, true));
    // throw new Error('create bill failed', JSON.stringify(error));
  }
};

module.exports = createFarmBill;
