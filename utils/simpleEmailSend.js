'use strict';

const AWS = require('aws-sdk');
const path = require('path');

AWS.config.update({ region: 'us-east-1' });
const dirPath = path.join(__dirname, '/../config/emailConfig.json');
AWS.config.loadFromPath(dirPath);

const SES = new AWS.SES({ apiVersion: '2010-12-01' });

const simpleEmailSend = async (subject, errorData) => {
  const sender = 'Sender Name <don@fiftyflowers.com>';
  const params = {
    Destination: {
      ToAddresses: [
        process.env.SES_RECEIVE_ERROR_ARRAY
      ]
    },
    Source: sender,
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: errorData
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    ReplyToAddresses: [
      process.env.SES_SENDER_EMAIL
    ],
  };
  return SES.sendEmail(params).promise();
};

module.exports = simpleEmailSend;
