'use strict';

require('dotenv').config();
const OAuthClient = require('intuit-oauth');
const { getOauthToken } = require('../../models/oauthTokenModel');

const getBaseClient = async () => {
  try {
    const oauthClient = new OAuthClient({
      clientId: process.env.QB_CLIENT_ID,
      clientSecret: process.env.QB_CLIENT_SECRET,
      environment: process.env.QB_ENV,
      redirectUri: process.env.QB_REDIRECT_URL,
    });

    return oauthClient;
  } catch (error) {
    console.log('NEW OAUTH CLIENT ERROR', error);
    throw new Error('GET NEW OAUTH CLIENT ERROR', error);
  }
};

const getStoredTokens = async (account) => {
  const tokenObj = await getOauthToken(account);
  // console.log('GET REFRESH TOKEN', tokenObj);
  return tokenObj;
};

const oauthService = async (account) => {
  const oauthClient = await getBaseClient();

  try {
    const tokenObj = await getStoredTokens(account);
    console.log('GET REFRESH TOKEN', tokenObj);
    oauthClient.token.refresh_token = tokenObj.refresh_token;
    oauthClient.token.access_token = tokenObj.access_token;

    return oauthClient;
  } catch (error) {
    console.log('REFRESH ERROR', error);
    throw new Error('REFRESH TOKEN ERROR', error);
  }
};

const getApiUrl = async () => {
  const oauthClient = await oauthService();
  const url =
    oauthClient.environment === 'sandbox'
      ? OAuthClient.environment.sandbox
      : OAuthClient.environment.production;

  return url;
};

module.exports = {
  oauthService,
  getApiUrl,
  getStoredTokens,
};
