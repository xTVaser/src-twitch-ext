
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
var chaiWebdriver = require('chai-webdriver');
chai.use(chaiWebdriver(driver));

// And you're good to go!
driver.get('http://stackoverflow.com');
chai.expect('#mainbar h1').dom.to.contain.text("Top Questions");

