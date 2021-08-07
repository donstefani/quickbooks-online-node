'use strict';

const { expect } = require('chai');
const simpleEmailSend = require('../utils/simpleEmailSend');

describe('SEND EMAIL TESTS', async () => {
  const subject = 'SES Error Email Test';
  const errorData = 'TEST ERROR - there has been a test error thrown';
  let data = {};

  before(async () => {
    data = await simpleEmailSend(subject, errorData);
    console.log('DATA ==============', data);
    return data;
  });

  describe('SEND SES EMAIL RESULT', () => {
    it('should return an result object', async () => {
      expect(data).to.be.a('object');
    });

    describe('email result details', async () => {
      it('should return a messageId', () => {
        expect(data.MessageId).to.be.a('string');
      });
    });
  });
});
