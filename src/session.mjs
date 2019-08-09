import { writable } from "svelte/store";

export const session = writable(makeSession(window.localStorage));

function makeSession(data) {
  if (
    data &&
    data.access_token !== undefined &&
    data.access_token.length > 32 &&
    data.username !== undefined &&
    data.username !== "undefined"
  ) {
    window.localStorage.access_token = data.access_token;
    window.localStorage.username = data.username;
  } else {
    delete window.localStorage.access_token;
    delete window.localStorage.username;
  }

  const expirationDate = new Date(0);
  let entitlements = new Set();

  const decoded = decode(data.access_token);

  if (decoded) {
    entitlements = new Set(decoded.entitlements.split(/,/));
    expirationDate.setUTCSeconds(decoded.exp);
  }

  return {
    entitlements,
    username: data.username,
    access_token: data.access_token,
    hasEntitlement: name => entitlements.has(name),
    get isValid() {
      return expirationDate.valueOf() > new Date().valueOf();
    }
  };
}

export async function login(endpoint, username, password) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username,
      password
    })
  });

  const data = await response.json();

  session.set(makeSession({ username, access_token: data.access_token || data.token }));
}

function decode(token) {
  return token === undefined || token === "undefined"
    ? undefined
    : JSON.parse(atob(token.split(".")[1]));
}

export function hasEntitlements(...names) {
  return {
    enter: async (context) => { console.log("hasEntitlements",...names); }
  };
}