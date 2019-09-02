import { Selector } from "testcafe";

const base = "http://localhost:5000";

fixture`login`.page`${base}/index.html`;

test("correct credentials", async t => {
  await t
    .typeText("#username", "user1")
    .typeText("#password", "secret1")
    .click("#submit");
  await t.expect(Selector("#session_username").innerText).eql("user1");
  await t.expect(Selector("#session_validity").innerText).eql("valid");
  await t.expect(Selector("#session_entitlements").innerText).eql("a,b,c");
});

test("correct credentials + invalidate", async t => {
  await t
    .typeText("#username", "user1")
    .typeText("#password", "secret1")
    .click("#submit");
  await t.expect(Selector("#session_username").innerText).eql("user1");
  await t.expect(Selector("#session_validity").innerText).eql("valid");
  await t.expect(Selector("#session_entitlements").innerText).eql("a,b,c");
  await t.click("#logoff");
  await t.expect(Selector("#session_validity").innerText).eql("invalid");
});

test("correct credentials expiring", async t => {
  await t
    .typeText("#username", "user1")
    .typeText("#password", "secret1")
    .click("#submit");
  await t.expect(Selector("#session_username").innerText).eql("user1");
  await t.expect(Selector("#session_validity").innerText).eql("valid");
  await t.wait(17 * 1000);
  await t.expect(Selector("#session_validity").innerText).eql("invalid");
});

test("correct credentials delayed response", async t => {
  await t
    .typeText("#username", "userSlowLogin")
    .typeText("#password", "secret1")
    .click("#submit");
  await t.expect(Selector("#session_username").innerText).eql("userSlowLogin");
  await t.expect(Selector("#session_validity").innerText).eql("valid");
  await t.expect(Selector("#session_entitlements").innerText).eql("a,b,c");
});

test("wrong credentials", async t => {
  await t
    .typeText("#username", "user1")
    .typeText("#password", "something")
    .click("#submit");
  await t.expect(Selector("#session_username").innerText).eql("user1");
  await t.expect(Selector("#session_validity").innerText).eql("invalid");

  await t.expect(Selector("#message").innerText).contains("Unauthorized");
});

test("unknown user", async t => {
  await t
    .typeText("#username", "user")
    .typeText("#password", "something")
    .click("#submit");
  await t.expect(Selector("#session_username").innerText).eql("user");
  await t.expect(Selector("#session_validity").innerText).eql("invalid");

  await t.expect(Selector("#message").innerText).contains("Unauthorized");
});

test("server error 502", async t => {
  await t
    .typeText("#username", "error_502")
    .typeText("#password", "something")
    .click("#submit");
  await t.expect(Selector("#session_validity").innerText).eql("invalid");
  await t.expect(Selector("#message").innerText).contains("Bad Gateway");
});
