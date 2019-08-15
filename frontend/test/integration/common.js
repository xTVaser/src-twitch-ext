var assert = require('assert');
var sw = require('selenium-webdriver');
var chai = require('chai');
var chaiWebdriver = require('chai-webdriver');

// TODO - also test chrome!
// TODO - https://opensource.zalando.com/zalenium/
// var driver = new sw.Builder()
//   .usingServer("http://localhost:4444/wd/hub")
//   .forBrowser("firefox")
//   .build()
var driver = new sw.Builder().withCapabilities(sw.Capabilities.firefox()).build();
sw.promise.USE_PROMISE_MANAGER = false;

chai.use(chaiWebdriver(driver));

exports.sleep = function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

exports.findByDataTestAttrib = function findByDataTestAttrib(dataTest) {
  return { xpath: `.//*[@data-test="${dataTest}"]` };
}

exports.driver = driver;
exports.chai = chai;
exports.selenium = sw;