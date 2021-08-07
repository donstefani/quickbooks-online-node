'use strict';

const AWS = require('aws-sdk');
const util = require('util');
require('dotenv').config();

AWS.config.update({ region: process.env.REGION });
AWS.config.logger = console;

const getBusinessData = async (oauthClient, url, account) => {
  console.log('OAUTH CLIENT', oauthClient);

  let companyId = process.env.QB_COMPANY_ID;
  if (account === 'flowerfix') {
    companyId = process.env.QB_FLRFX_COMPANY_ID;
  }
  console.log('COMPANY ID', companyId);

  const sqlStmt = 'select%20*%20from%20Account MAXRESULTS 200';

  try {
    const authResponse = await oauthClient
      .makeApiCall({ url: `${url}v3/company/${companyId}/query?query=${sqlStmt}`, });
    const respObj = JSON.parse(JSON.stringify(authResponse));
    const companyInfo = JSON.parse(respObj.body);
    console.log(util.inspect(companyInfo, false, null, true));
    return companyInfo;
  } catch (error) {
    console.error(error);
    return false;
  }
};

module.exports = getBusinessData;
