/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

'use strict';

const util = require('util');
const AWS = require('aws-sdk');
require('dotenv').config();
const { oauthService, getApiUrl } = require('../auth/oauthService');
const { updateWarehouseQbId } = require('../../models/vendorsModel');

AWS.config.update({ region: process.env.REGION });
AWS.config.logger = console;

module.exports = {
  getAllQbVendors: async (account) => {
    const sqlStmt = 'select * from vendor MAXRESULTS 300';
    let companyId = process.env.QB_COMPANY_ID;
    if (account === 'flowerfix') {
      companyId = process.env.QB_FLRFX_COMPANY_ID;
    }
    console.log('COMPANY ID -------------------', companyId);
    const url = await getApiUrl();
    const oauthClient = await oauthService(account);

    try {
      const authResponse = await oauthClient
        .makeApiCall({ url: `${url}v3/company/${companyId}/query?query=${sqlStmt}`, });
      const respObj = JSON.parse(JSON.stringify(authResponse));
      const vendorInfo = JSON.parse(respObj.body);
      console.log('INFO LENGTH', vendorInfo.QueryResponse.Vendor.length);
      /**
       * using console.log this way shows all of the child objects as well
       * util is a built in Node.js class
       * https://nodejs.org/api/util.html#util_util_inspect_object_options
       */
      // console.log(util.inspect(vendorInfo.QueryResponse.Vendor, false, null, true));

      const vendorsMap = new Map();
      for (const vendor of vendorInfo.QueryResponse.Vendor) {
        vendorsMap.set(vendor.Id, vendor);
      }
      console.log('MAP SIZE', vendorsMap.size);

      for (const [key, value] of vendorsMap) {
        if (value.DisplayName) {
          console.log(`${value.Id},${value.DisplayName}`);

          // currently in prod, this field holds the 'V' code
          // console.log('VENDOR CODE: ', value.GivenName);

          // console.log('VENDOR CODE: ', value.DisplayName);
          // console.log('COMPANY NAME: ', value.CompanyName);
          // await updateWarehouseQbId(value.Id, value.DisplayName);
        }
      }

      return vendorInfo;
    } catch (error) {
      console.error('VENDOR ERROR', error);
      return false;
    }
  }
};
