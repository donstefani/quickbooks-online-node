/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
const LambdaTester = require('lambda-tester');
const { handler } = require('../refreshAouthToken');

describe('REFRESH OAUTH TOKEN TEST', function () {
  const event = {};

  describe('refresh test one', function () {
    it('test one success', async function () {
      await LambdaTester(handler)
        .event(event)
        .timeout(20000)
        .expectResult();
    });
  });
});
