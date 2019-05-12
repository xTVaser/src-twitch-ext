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



var expectations = {};


describe('Initial Panel Setup', function() {
  before('Load Configuration Page', async function() {
    await driver.get('http://localhost:8080/config');
  });

  beforeEach('Slow things down a bit', async function() {
    await sleep(250);
  })

  it('Modify Panel Title', async function() {
    await driver.findElement({xpath: '//*[@data-test="panelTitle"]'}).clear();
    await driver.findElement({xpath: '//*[@data-test="panelTitle"]'}).sendKeys("Test Title");
    await chai.expect('[data-test=panelTitle]').dom.to.have.value("Test Title");
  });

  it('Set Speedrun.com Name', async function() {
    await driver.findElement({xpath: '//*[@data-test="srcName"]'}).clear();
    await driver.findElement({xpath: '//*[@data-test="srcName"]'}).sendKeys("xTVaser");
    await chai.expect('[data-test=srcName]').dom.to.have.value("xTVaser");
  });

  it('Verify Speedrun.com validity, search for games', async function() {
    await chai.expect('[data-test=saveBtn]').dom.to.be.disabled();
    await chai.expect('[data-test=saveBtn]').dom.to.have.htmlClass("btn-warning");
    await driver.findElement({xpath: '//*[@data-test="searchBtn"]'}).click();
    // TODO - check that games are populated that we expect
    await chai.expect('.gameTitleBox').dom.not.to.be.empty;
  });

  it('Attempt to Save', async function() {
    var elem = await driver.findElement({xpath: '//*[@data-test="saveBtn"]'});
    await driver.wait(sw.until.elementIsEnabled(elem));
    await driver.findElement({xpath: '//*[@data-test="saveBtn"]'}).click();
    await chai.expect('[data-test=errorDialog]').dom.to.contain.text("SUCCESS: Saved Successfully!");
  });

  it('Reload Page and Ensure Settings Saved', async function() {
    await driver.navigate().refresh();
    await chai.expect('[data-test=panelTitle]').dom.to.have.value("Test Title");
    await chai.expect('[data-test=srcName]').dom.to.have.value("xTVaser");
  });

  after("Quit", async function() {
    await driver.quit();
  });
});

describe('Verify Frontend Renders as Expected', function() {
  before('Load Frontend Page', async function() {
    await driver.get('http://localhost:8080/viewer');
  });
});


