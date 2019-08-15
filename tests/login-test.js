const base = "http://localhost:5000";

describe("example", function() {
  it("login", browser => {
    browser
      .url(base)
      .setValue('input[type=text]', 'user1')
      .setValue('input[type=password]', 'secret')
      .click('button[type=submit]')
      .pause(1000)
      .assert.containsText('#session_username', 'user1')
      .end();
  });
});
