'use strict';

require('dotenv').config();
const OAuthClient = require('intuit-oauth');
const { updateOauthToken, getOauthToken } = require('../../models/oauthTokenModel');

const getBaseClient = async () => {
  const oauthClient = new OAuthClient({
    clientId: process.env.QB_CLIENT_ID,
    clientSecret: process.env.QB_CLIENT_SECRET,
    environment: process.env.QB_ENV,
    redirectUri: process.env.QB_REDIRECT_URL,
  });

  return oauthClient;
};

const getStoredTokens = async (account) => {
  const tokenObj = await getOauthToken(account);
  console.log('STORED TOKEN OBJ ---------------------------', tokenObj);
  return tokenObj;
};

const writeStoredRefreshToken = async (newRefreshToken, accessToken, account) => {
  try {
    // save refresh token to database
    await updateOauthToken(newRefreshToken, accessToken, account);
    return true;
  } catch (error) {
    console.log('WRITE TOKENS ERROR', error);
    return false;
  }
};

const oauthService = async (account) => {
  const oauthClient = await getBaseClient();

  try {
    const tokenObj = await getStoredTokens(account);
    const tokenResp = await oauthClient.refreshUsingToken(tokenObj.refresh_token);
    console.log('REFRESHED OAUTH TOKEN RESP --------------------------', account, tokenResp);
    const newRefreshToken = tokenResp.json.refresh_token;
    const accessToken = tokenResp.json.access_token;
    await writeStoredRefreshToken(newRefreshToken, accessToken, account);
    return oauthClient;
  } catch (error) {
    console.log('REFRESH ERROR', error);
    throw new Error('REFRESH TOKEN ERROR', error);
  }
};

module.exports = {
  oauthService, getStoredTokens, writeStoredRefreshToken
};
