'use strict';

const moment = require('moment');
const mysql = require('./index');

const updateOauthToken = async (token, accessToken, account) => {
  const sqlStmt = `UPDATE qb_oauth_token 
  SET refresh_token = ?, 
  access_token = ?,
  updated_date = ?
  WHERE account = ?`;
  const event = moment().format('YYYY-MM-DD HH:mm:ss');
  try {
    await mysql.query({
      sql: sqlStmt,
      timeout: 100000,
      values: [token, accessToken, event, account],
    });
    await mysql.end();
  } catch (error) {
    await mysql.end();
    throw new Error('save refresh token failed', error);
  }
};

const getOauthToken = async (account) => {
  const sqlStmt = `SELECT refresh_token, access_token, account
  FROM qb_oauth_token WHERE account = ?`;
  try {
    const results = await mysql.query({
      sql: sqlStmt,
      timeout: 500000,
      values: [account],
    });
    // await mysql.end();
    return (results[0] || false);
  } catch (error) {
    console.log('GET DAILY TOTALS SQL FAIL', error);
    await mysql.end();
    throw new Error('Get daily totals sql failed', error);
  }
};

module.exports = { updateOauthToken, getOauthToken };
