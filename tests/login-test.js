import { Selector } from "testcafe";

const base = "http://localhost:5000";

fixture`login`.page`${base}/index.html`;

test("correct credentials", async t => {
  await t
    .typeText("#username", "user1")
    .typeText("#password", "secret1")
    .click("#submit");
  await t.expect(Selector("#session_username").innerText).eql("user1");
});


test("wrong credentials", async t => {
  await t
    .typeText("#username", "user1")
    .typeText("#password", "something")
    .click("#submit");
  await t.expect(Selector("#session_username").innerText).eql("user1");
  await t.expect(Selector("#session_validity").innerText).eql("invalid");
});

test("unknown user", async t => {
  await t
    .typeText("#username", "user")
    .typeText("#password", "something")
    .click("#submit");
    await t.expect(Selector("#session_username").innerText).eql("user");
    await t.expect(Selector("#session_validity").innerText).eql("invalid");
});
