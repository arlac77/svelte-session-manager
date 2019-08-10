const assert = require("assert");

const base = "http://localhost:5000";

const sg = (t, name = "xxx") =>
  `test-results/${t.test.fullTitle().replace(/\s+/, "-", "g")}-${name}.png`;


describe("session",  function() {
  this.slow(2000);
  this.timeout(3000);

  it("renders-on-the-page", async browser => {
    browser
      .url(base)
      .expect.element("body")
      .to.be.present.before(1000);

    browser
      .waitForElementVisible("h1")
      .assert.containsText(
        "h1",
        "Example"
      );

    browser.end();
  });
});
