/* eslint-disable no-unused-vars */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
const chai = require('chai');

const { expect } = chai;
chai.use(require('chai-as-promised'));
const getBusinessData = require('../services/setupDemos/company');
const {
  oauthService,
  getApiUrl,
} = require('../services/auth/oauthService');

describe('COMPANY TESTS', async function () {
  let oauthClient;
  let url;

  before(async function () {
    oauthClient = await oauthService();
    return oauthClient;
  });

  before(async function () {
    url = await getApiUrl();
    return url;
  });

  describe('get company data', () => {
    it('shoud return true', function () {
      // const result = await getBusinessData(oauthClient, url);
      // result.should.equal(true);
      return expect(
        getBusinessData(oauthClient, url, 'flowerfix'),
      ).to.eventually.be.a('object');
    });
  });
});
