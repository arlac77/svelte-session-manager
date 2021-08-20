import test from "ava";
import jsonwebtoken from "jsonwebtoken";
import { readFile } from "fs/promises";
import { Session } from "../src/session.mjs";

const RT =
  "eyJhbGciOiJIUzUxMiJ9.ZjVhOThkYTMtNjkwZC00NTk4LWFmYzctODVkNzQ3NTFiYTI4.y0tlNveVhkHfI1KFgDJhW3PziuhnsWI14JBzEP6wyCCd0EAZRAr_7ndzxn46CyNA4yyLgNvvCPuAAfKmEhAttg";
const AT =
  "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbjEiLCJuYmYiOjE2MjkzMDEzMzgsInJvbGVzIjpbIlJPTEVfVVNFUiIsIlJPTEVfQURNSU4iXSwiaXNzIjoibW5hd2EiLCJleHAiOjE2MjkzMDQ5MzgsImlhdCI6MTYyOTMwMTMzOH0.e2fcSTusT6EmDJ1i3tImu0InS5G8ZWTjMoNvQWQ4463T4t12C2GwLhkk94KmJE94UPjL0G6qx_Ia4Iyy1a6WiA";

globalThis.localStorage = {};

test("session initiial", t => {
  const session = new Session();
  t.is(session.isValid, false);
});

test("session read/write store", t => {
  const store = { username: "emil", access_token: AT };

  const session = new Session(store);

  t.is(session.username, "emil");

  session.username = "hugo";
  t.is(store.username, "hugo");

  session.refresh_token = "RT";
  t.is(store.refresh_token, "RT");

  session.access_token = "AT";
  t.is(store.access_token, "AT");
});

test("session invalidate", t => {
  const store = { username: "emil", refresh_token: RT, access_token: AT };

  const session = new Session(store);

  session.invalidate();

  t.is(store.username, undefined);
  t.is(store.refresh_token, undefined);
  t.is(store.access_token, undefined);
});

test("session update", async t => {
  const store = {};

  const expires = 3;

  const data = {
    username: "emil",
    token_type: "bearer",
    expires_in: expires,
    scope: "a,b,c",
    access_token: jsonwebtoken.sign(
      { entitlements: "a,b,c" },
      await readFile(new URL("app/demo.rsa", import.meta.url).pathname),
      {
        algorithm: "RS256",
        expiresIn: `${expires}s`
      }
    )
  };

  const session = new Session(store);

  t.is(session.isValid, false);

  session.update(data);

  t.is(session.isValid, true);
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
