'use strict';

const AWS = require('aws-sdk');
require('dotenv').config();
const { oauthService } = require('./services/auth/saveTokenService');

AWS.config.update({ region: process.env.REGION });
AWS.config.logger = console;

exports.handler = async (event, context) => {
  await oauthService('fiftyflowers');
  await oauthService('flowerfix');

  context.done();
};
