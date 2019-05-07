
// Start with a webdriver instance:
var sw = require('selenium-webdriver');
var driver = new sw.Builder()
  .withCapabilities(sw.Capabilities.firefox())
  .build()

var configDriver = new sw.Builder()
  .withCapabilities(sw.Capabilities.firefox())
  .build()

// And then...
var chai = require('chai');
var chai2 = require('chai');
var chaiWebdriver = require('chai-webdriver');
chai.use(chaiWebdriver(driver));
chai2.use(chaiWebdriver(configDriver));

// And you're good to go!
driver.get('http://stackoverflow.com');
configDriver.get('http://reddit.com');
chai.expect('#mainbar h1').dom.to.contain.text("Top Questions");
chai2.expect('#header-search-bar').dom.to.have.attribute('placeholder', 'Search Reddit');

