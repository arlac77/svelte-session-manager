import { writable } from "svelte/store";

export class Session {
  constructor(data) {
    let username = "";
    let entitlements = new Set();
    let expirationDate = new Date(0);

    if (data) {
      const decoded = decode(data.access_token);

      if (decoded) {
        entitlements = new Set(decoded.entitlements.split(/,/));
        expirationDate.setUTCSeconds(decoded.exp);

        const expiresInMilliSeconds = expirationDate.valueOf() - new Date().valueOf();
        
        if(sessionTimeoutId) {
          clearTimeout(sessionTimeoutId);
          sessionTimeoutId = undefined;
        }

        sessionTimeoutId = setTimeout( () => {
          sessionTimeoutId = undefined;
          session.set(this);
        }, expiresInMilliSeconds);
      }

      if (data.username !== undefined && data.username !== "undefined") {
        username = data.username;
      }
    }

    Object.defineProperties(this, {
      access_token: {
        value: data.access_token
      },
      entitlements: {
        value: entitlements
      },
      username: {
        value: username
      },
      expirationDate: {
        value: expirationDate
      }
    });
  }

  save() {
    if (this.username === undefined) {
      delete localStorage.access_token;
      delete localStorage.username;
    } else {
      localStorage.access_token = this.access_token;
      localStorage.username = this.username;
    }
  }

  get authorizationHeader()
  {
    return { Authorization: "Bearer " + this.access_token };
  }

  get isValid() {
    return this.expirationDate.valueOf() >= new Date().valueOf();
  }

  hasEntitlement(name) {
    return this.entitlements.has(name);
  }
}

let sessionTimeoutId;

export const session = writable(new Session(localStorage));

export async function login(endpoint, username, password) {
  try {
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
    if(response.ok) {
      const data = await response.json();
      const s = new Session({ username, access_token: data.access_token });
      s.save();
      session.set(s);  
    }
    else {
      session.set(new Session({ username }));
      throw new Error(response.statusText);
    }
  } catch (e) {
    session.set(new Session({ username }));
    throw e;
  }
}

function decode(token) {
  return token === undefined || token === "undefined"
    ? undefined
    : JSON.parse(atob(token.split(".")[1]));
}
