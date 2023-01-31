import test from "ava";
import { login } from "../src/login.mjs";
import { Session } from "../src/session.mjs";

globalThis.localStorage = {};
globalThis.fetch = async function () {
  return {
    ok: true,
    json: () => {
      return {};
    }
  };
};

test("login missing access_token", async t => {
  const session = new Session();
  const message = await login(session, "user", "secret");
  t.is(message, "missing access_token");
});
