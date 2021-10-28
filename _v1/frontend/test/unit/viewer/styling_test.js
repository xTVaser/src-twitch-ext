var myCode = require('../../../js/viewer/styling')

var assert = require('assert');

describe('Test!', function() {
  describe('addFontFamily', function() {
    it('test', function() {
      assert.equal("Roboto Condensed", myCode.addFontFamily(null));
    });
  });
});