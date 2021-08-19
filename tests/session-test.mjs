import test from "ava";
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

test("session update", t => {
  const store = { };

  const session = new Session(store);

  session.update({ username: "emil", access_token: AT, refresh_token: RT });

  t.is(store.username, "emil");
  t.is(store.refresh_token, RT);
  t.is(store.access_token, AT);
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
