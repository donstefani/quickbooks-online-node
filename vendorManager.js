'use strict';

const AWS = require('aws-sdk');
require('dotenv').config();

const { getAllQbVendors } = require('./services/vendors/vendorsService');

AWS.config.update({ region: process.env.REGION });
AWS.config.logger = console;

exports.handler = async (event, context) => {
  await getAllQbVendors('fiftyflowers');
  context.done();
};
