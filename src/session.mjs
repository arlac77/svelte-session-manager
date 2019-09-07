export class Session {
  constructor(data) {
    let sessionTimeoutId;

    Object.defineProperties(this, {
      subscriptions: {
        value: new Set()
      },
      expirationDate: {
        value: new Date(0)
      },
      sessionTimeoutId: {
        get: () => sessionTimeoutId,
        set: v => (sessionTimeoutId = v)
      }
    });

    this.update(data);
  }

  update(data = {}) {
    let username = "";
    let entitlements = new Set();

    const decoded = decode(data.access_token);

    if (decoded) {
      entitlements = new Set(decoded.entitlements.split(/,/));
      this.expirationDate.setUTCSeconds(decoded.exp);

      const expiresInMilliSeconds =
        this.expirationDate.valueOf() - new Date().valueOf();

      if (this.sessionTimeoutId) {
        clearTimeout(this.sessionTimeoutId);
        this.sessionTimeoutId = undefined;
      }

      this.sessionTimeoutId = setTimeout(() => {
        this.sessionTimeoutId = undefined;
        this.fire();
      }, expiresInMilliSeconds);
    } else {
      this.expirationDate.setTime(0);
    }

    if (data.username !== undefined && data.username !== "undefined") {
      username = data.username;
    }

    this.access_token = data.access_token;
    this.entitlements = entitlements;
    this.username = username;

    this.fire();
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

  get authorizationHeader() {
    return { Authorization: "Bearer " + this.access_token };
  }

  get isValid() {
    return this.expirationDate.valueOf() >= new Date().valueOf();
  }

  invalidate() {
    this.update();
  }

  hasEntitlement(name) {
    return this.entitlements.has(name);
  }

  fire() {
    this.subscriptions.forEach(subscription => subscription(this));
  }

  /**
   * Fired when the session changes
   * @param {Function} subscription
   */
  subscribe(subscription) {
    subscription(this);
    this.subscriptions.add(subscription);
    return () => this.subscriptions.delete(subscription);
  }
}

export const session = new Session(localStorage);

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
    if (response.ok) {
      const data = await response.json();
      session.update({ username, access_token: data.access_token });
      session.save();
    } else {
      session.update({ username });

      let message = response.statusText;

      const ct = response.headers.get("Content-Type");

      switch (ct) {
        /*
        case 'text/html':
          break; */

        case "text/plain":
          message += "\n" + (await response.text());
      }

      throw new Error(message);
    }
  } catch (e) {
    session.update({ username });
    throw e;
  }
}

function decode(token) {
  return token === undefined || token === "undefined"
    ? undefined
    : JSON.parse(atob(token.split(".")[1]));
}
