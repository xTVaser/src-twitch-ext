var assert = require('assert');
var sw = require('selenium-webdriver');
var chai = require('chai');
var chaiWebdriver = require('chai-webdriver');

const BROWSER = process.env.BROWSER || "firefox";

// TODO - also test chrome!
// TODO - https://opensource.zalando.com/zalenium/
var driver = new sw.Builder().withCapabilities(BROWSER === "firefox" ? sw.Capabilities.firefox() : sw.Capabilities.chrome()).build();
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