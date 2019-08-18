import { Selector } from "testcafe";

const base = "http://localhost:5000";

fixture`Getting Started`.page`${base}/index.html`;

test("login", async t => {
  await t
    .typeText("#username", "user1")
    .typeText("#password", "secret")
    .click("#submit");
  await t.expect(Selector("#session_username").innerText).eql("user1");
});
