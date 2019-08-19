import { Selector } from "testcafe";

const base = "http://localhost:5000";

fixture`login`.page`${base}/index.html`;

test("correct credentials", async t => {
  await t
    .typeText("#username", "user1")
    .typeText("#password", "secret")
    .click("#submit");
  await t.expect(Selector("#session_username").innerText).eql("user1");
});
