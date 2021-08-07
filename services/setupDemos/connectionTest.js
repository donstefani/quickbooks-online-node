'use strict';

const AWS = require('aws-sdk');
const { oauthService, getApiUrl } = require('../auth/oauthService');
const simpleEmailSend = require('../../utils/simpleEmailSend');
require('dotenv').config();

AWS.config.update({ region: process.env.REGION });
AWS.config.logger = console;

const companyId = process.env.QB_FLRFX_COMPANY_ID;

const connectionTest = async () => {
  const oauthClient = await oauthService();
  const url = await getApiUrl();

  try {
    const authResponse = await oauthClient
      .makeApiCall({ url: `${url}v3/company/${companyId}/companyinfo/${companyId}`, });
    if (authResponse) {
      console.log('GOOD OAUTH CONNECTION');
    }
  } catch (error) {
    console.error('OAUTH TEST CONNECTION ERROR', error);
    await simpleEmailSend('QBO OAUTH CONNECTION FAILED', error);
    throw new Error('OAUTH CONNECT FAILED', error);
  }
};

module.exports = connectionTest;
