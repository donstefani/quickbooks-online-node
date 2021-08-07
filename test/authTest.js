/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-vars */

'use strict';

const { expect } = require('chai');
const should = require('chai').should();
const {
  oauthService,
  getStoredTokens,
} = require('../services/auth/oauthService');
require('dotenv-flow').config();

describe('AUTH TESTS', async () => {
  let result;
  let refToken;
  let writeStatus;
  const event = new Date().toString();

  before(async function () {
    result = await oauthService();
    return result;
  });

  describe('get oauthClient', () => {
    it('shoud return oauthClient object', () => {
      expect(result).to.be.a('object');
    });
    describe('oauthClient access token', async () => {
      it('should contain an access_token string', () => {
        expect(result.token.access_token).to.be.a('string');
      });
    });
  });

  before(async function () {
    refToken = await getStoredTokens();
    return result;
  });

  describe('get stored refresh token', () => {
    it('should return a refresh token string', () => {
      expect(refToken).to.be.a('object');
    });
  });
});
