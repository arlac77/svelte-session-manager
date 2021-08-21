import test from "ava";
import jsonwebtoken from "jsonwebtoken";
import { readFile } from "fs/promises";
import { Session } from "../src/session.mjs";

const RT =
  "eyJhbGciOiJIUzUxMiJ9.ZjVhOThkYTMtNjkwZC00NTk4LWFmYzctODVkNzQ3NTFiYTI4.y0tlNveVhkHfI1KFgDJhW3PziuhnsWI14JBzEP6wyCCd0EAZRAr_7ndzxn46CyNA4yyLgNvvCPuAAfKmEhAttg";

globalThis.localStorage = {};
globalThis.fetch = async function () { return { ok: false } };

const EXPIRES = 3;

test.before(async t => {
  t.context.access_token = jsonwebtoken.sign(
    { entitlements: "a,b,c" },
    await readFile(new URL("app/demo.rsa", import.meta.url).pathname),
    {
      algorithm: "RS256",
      expiresIn: `${EXPIRES}s`
    }
  );
});

test("session initiial", t => {
  const session = new Session();
  t.false(session.isValid);
});

test("session read/write store", t => {

  const store = { username: "emil", access_token: t.context.access_token };

  const session = new Session(store);

  t.true(session.isValid);
  t.is(session.username, "emil");
  t.truthy(session.access_token);

  session.username = "hugo";
  t.is(store.username, "hugo");

  session.refresh_token = "RT";
  t.is(store.refresh_token, "RT");

  session.access_token = t.context.access_token;
  t.is(store.access_token, t.context.access_token);
});

test("session invalidate", t => {
  const store = { username: "emil", refresh_token: RT, access_token: t.context.access_token };

  const session = new Session(store);

  session.invalidate();

  t.false(session.isValid);

  t.is(store.username, undefined);
  t.is(store.refresh_token, undefined);
  t.is(store.access_token, undefined);
});

test("session update", async t => {
  const store = {};

  const data = {
    username: "emil",
    token_type: "bearer",
    expires_in: EXPIRES,
    scope: "a,b,c",
    access_token: t.context.access_token
  };

  const session = new Session(store);

  t.is(session.isValid, false);

  session.update(data);

  t.true(session.isValid);
  t.true(session.authorizationHeader.Authorization.startsWith("Bearer "));
  t.true(session.hasEntitlement('a'));
  t.is(store.access_token, data.access_token);
  t.is(store.username, "emil");

  let valid = 77;

  const unsubscribe = session.subscribe(session => {
    valid = session.isValid;
  });

  await new Promise(resolve => setTimeout(resolve, 4000));

  t.is(session.isValid, false);
  t.is(valid, false);
});

test("session subsription", t => {
  const session = new Session();
  let username;

  const unsubscribe = session.subscribe(session => {
    username = session.username;
  });

  session.username = "hugo";

  t.is(username, "hugo");

  unsubscribe();

  session.username = "emit";
  t.is(username, "hugo");
});
