import test from "ava";
import { login } from "../src/login.mjs";
import { Session } from "../src/session.mjs";

globalThis.localStorage = {};
globalThis.fetch = async function (url, options) {
  return {
    ok: true,
    json: () => {
      return options.body.length > 20 ? { access_token: "aaaa" } : {};
    }
  };
};

test("login missing access_token", async t => {
  const session = new Session();
  const message = await login(session, "user", "");
  t.is(message, "missing access_token");
  t.false(session.isValid);
});

test("login invalid token", async t => {
  const session = new Session();
  const message = await login(session, "user", "secret");
  t.false(session.isValid);
});
