var lib = require("../../common");

var browser = lib.driver;
var chai = lib.chai;
var selenium = lib.selenium;

var expectations = {
  games: []
};

// TODO - After Step to quit driver
// TODO - endpoint on mock server to reset data

describe('Initial Panel Setup', function() {
  before('Load Configuration Page', async function() {
    await browser.get('http://localhost:8080/config');
  });

  beforeEach('Deliberate delay between test actions', async function() {
    await lib.sleep(250);
  })

  it('Modify Panel Title', async function() {
    await browser.findElement({xpath: '//*[@data-test="panelTitle"]'}).clear();
    await browser.findElement({xpath: '//*[@data-test="panelTitle"]'}).sendKeys("Test Title");
    await chai.expect('[data-test=panelTitle]').dom.to.have.value("Test Title");
    expectations.panelTitle = "Test Title";
  });

  it('Set Speedrun.com Name', async function() {
    await browser.findElement({xpath: '//*[@data-test="srcName"]'}).clear();
    await browser.findElement({xpath: '//*[@data-test="srcName"]'}).sendKeys("xTVaser");
    await chai.expect('[data-test=srcName]').dom.to.have.value("xTVaser");
  });

  it('Verify Speedrun.com validity, search for games', async function() {
    await chai.expect('[data-test=saveBtn]').dom.to.be.disabled();
    await chai.expect('[data-test=saveBtn]').dom.to.have.htmlClass("btn-warning");
    await browser.findElement({xpath: '//*[@data-test="searchBtn"]'}).click();
    // TODO - check that games are populated that we expect
    await chai.expect('.gameTitleBox').dom.not.to.be.empty;
  });

  it('Attempt to Save', async function() {
    var elem = await browser.findElement({xpath: '//*[@data-test="saveBtn"]'});
    await browser.wait(selenium.until.elementIsEnabled(elem));
    await browser.findElement({xpath: '//*[@data-test="saveBtn"]'}).click();
    await chai.expect('[data-test=errorDialog]').dom.to.contain.text("SUCCESS: Saved Successfully!");

    // Save Expected Games / Categories / Etc for later testing
    var gameRows = await browser.findElements(lib.findByDataTestAttrib("gameContainer"));
    console.log(gameRows);
    gameRows.forEach(async function(elem) {
      var gameInfo = {
        gameName: await (await (elem.findElement(lib.findByDataTestAttrib("gameName")))).getAttribute("value"),
        categories: [],
        miscCategories: [],
        levels: []
      };
      var categoryElements = await elem.findElements(lib.findByDataTestAttrib("categoryName"));
      categoryElements.forEach(async function(categoryElem) {
        gameInfo.categories.push(await categoryElem.getText);
      });
      var miscCategoryElements = await elem.findElements(lib.findByDataTestAttrib("miscCategoryName"));
      miscCategoryElements.forEach(async function(miscCategoryElem) {
        gameInfo.miscCategories.push(await miscCategoryElem.getText);
      });
      var levelElements = await elem.findElements(lib.findByDataTestAttrib("levelName"));
      levelElements.forEach(async function(levelElem) {
        gameInfo.levels.push(await levelElem.getText);
      });
      expectations.games.push(gameInfo);
    });
    console.log(expectations);
  });

  it('Reload Page and Ensure Settings Saved', async function() {
    await browser.navigate().refresh();
    await chai.expect('[data-test=panelTitle]').dom.to.have.value("Test Title");
    await chai.expect('[data-test=srcName]').dom.to.have.value("xTVaser");
  });
});

describe('Verify Frontend Renders as Expected', function() {
  before('Load Frontend Page', async function() {
    await browser.get('http://localhost:8080/viewer');
  });

  it('Modify Panel Title', async function() {
    console.log(expectations);
    await browser.findElement({xpath: '//*[@data-test="panelTitle"]'}).clear();
    await browser.findElement({xpath: '//*[@data-test="panelTitle"]'}).sendKeys("Test Title");
    await chai.expect('[data-test=panelTitle]').dom.to.have.value("Test Title");
  });
});


