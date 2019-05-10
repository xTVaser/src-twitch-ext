var assert = require('assert');
// Start with a webdriver instance:
// TODO - also test chrome!
var sw = require('selenium-webdriver');
var driver = new sw.Builder()
  .withCapabilities(sw.Capabilities.firefox())
  .build()

sw.promise.USE_PROMISE_MANAGER = false;

var chai = require('chai');
var chaiWebdriver = require('chai-webdriver');
chai.use(chaiWebdriver(driver));

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('my suite', function() {
  before("Wait for Browser", async function() {
    await driver.get('http://localhost:8080/config');
  });

  // Tests
  it('Modify Panel Title', async function() {
    this.timeout(10000);
    await driver.findElement({xpath: '//*[@data-test="panelTitle"]'}).sendKeys("Test Title");
    await chai.expect('[data-test=panelTitle]').dom.to.have.value("Test Title");
  });

  after("Quit", async function() {
    await driver.quit();
  });
});


