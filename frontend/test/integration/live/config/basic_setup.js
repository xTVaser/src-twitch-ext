const request = require('request-promise');

var lib = require("../../common");

var browser = lib.driver;
var chai = lib.chai;
var selenium = lib.selenium;

var expectations = {
  panelTitle: "Test Title",
  srcName: "xTVaser",
  games: []
};

// TODO - After Step to quit driver
// TODO - endpoint on mock server to reset data

describe('Initial Panel Setup', function() {
  before('Load Configuration Page', async function() {
    await browser.get('http://localhost:8080/config');
    await request('http://localhost:8081/reset');
  });

  beforeEach('Deliberate delay between test actions', async function() {
    await lib.sleep(250);
  })

  it('Modify Panel Title', async function() {
    await browser.findElement({xpath: './/*[@data-test="panelTitle"]'}).clear();
    await browser.findElement({xpath: './/*[@data-test="panelTitle"]'}).sendKeys(expectations.panelTitle);
    await chai.expect('[data-test=panelTitle]').dom.to.have.value(expectations.panelTitle);
  });

  it('Set Speedrun.com Name', async function() {
    await browser.findElement({xpath: './/*[@data-test="srcName"]'}).clear();
    await browser.findElement({xpath: './/*[@data-test="srcName"]'}).sendKeys(expectations.srcName);
    await chai.expect('[data-test=srcName]').dom.to.have.value(expectations.srcName);
  });

  it('Verify Speedrun.com validity, search for games', async function() {
    await chai.expect('[data-test=saveBtn]').dom.to.be.disabled();
    await chai.expect('[data-test=saveBtn]').dom.to.have.htmlClass("btn-warning");
    await browser.findElement({xpath: './/*[@data-test="searchBtn"]'}).click();
    // TODO - check that games are populated that we expect
    await chai.expect('.gameTitleBox').dom.not.to.be.empty;
  });

  it('Attempt to Save', async function() {
    var elem = await browser.findElement(lib.findByDataTestAttrib("saveBtn"));
    await browser.wait(selenium.until.elementIsEnabled(elem));
    await browser.findElement({xpath: './/*[@data-test="saveBtn"]'}).click();
    await chai.expect('[data-test=errorDialog]').dom.to.contain.text("SUCCESS: Saved Successfully!");

    // Save Expected Games / Categories / Etc for later testing
    var gameRows = await browser.findElements(lib.findByDataTestAttrib("gameContainer"));
    gameRows.forEach(async function(elem) {
      var testInput = await elem.findElement({tagName: "input"});
      var testVal = await testInput.getAttribute("value");
      var gameInfo = {
        gameName: await (await (elem.findElement(lib.findByDataTestAttrib("gameName")))).getAttribute("value"),
        categories: [],
        miscCategories: [],
        levels: []
      };
      var categoryElements = await elem.findElements(lib.findByDataTestAttrib("categoryName"));
      categoryElements.forEach(async function(categoryElem) {
        var str = await categoryElem.getAttribute('textContent');
        gameInfo.categories.push(str);
      });
      var miscCategoryElements = await elem.findElements(lib.findByDataTestAttrib("miscCategoryName"));
      miscCategoryElements.forEach(async function(miscCategoryElem) {
        var str = await miscCategoryElem.getAttribute('textContent');
        gameInfo.miscCategories.push(str);
      });
      var levelElements = await elem.findElements(lib.findByDataTestAttrib("levelName"));
      levelElements.forEach(async function(levelElem) {
        var str = await levelElem.getAttribute('textContent');
        gameInfo.levels.push(str);
      });
      expectations.games.push(gameInfo);
    });
  });

  it('Reload Page and Ensure Settings Saved', async function() {
    await browser.navigate().refresh();
    await browser.wait(selenium.until.elementLocated(lib.findByDataTestAttrib("pageLoaded")));
    await chai.expect('[data-test=panelTitle]').dom.to.have.value(expectations.panelTitle);
    await chai.expect('[data-test=srcName]').dom.to.have.value(expectations.srcName);
  });
});

describe('Verify Frontend Renders as Expected', function() {
  before('Load Frontend Page', async function() {
    await browser.get('http://localhost:8080/viewer');
  });

  it('Modify Panel Title', async function() {
    var elem = await browser.wait(selenium.until.elementLocated(lib.findByDataTestAttrib("panelTitle")));
    await browser.wait(selenium.until.elementTextIs(elem, expectations.panelTitle));
  });

  it('Check Game Ordering and Titles', async function() {
    var gameRows = await browser.findElements(lib.findByDataTestAttrib("gameName"));
    var index = 0;
    gameRows.forEach(async function(elem) {
      var gameTitleText = await elem.getAttribute('textContent');
      await chai.expect(gameTitleText).to.equal(expectations.games[index].gameName);
      index++;
    });
  });
});
